import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { PAGE_SIZE, TOPICS_GROUP_ID } from '../config';
import ArticleCard from '../components/ArticleCard';

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((t) => {
        if (typeof t === 'string') return t;
        if (typeof t === 'object') return t.tag_name || t.name || t.label;
        return null;
      })
      .filter(Boolean);
  }
  return [];
}

function resolveName(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    return (
      value.name ||
      value.display_name ||
      value.full_name ||
      value.nickname ||
      value.screen_name ||
      value.user_name ||
      value.member_name ||
      ''
    ).trim();
  }
  return '';
}

function pickAuthor(item) {
  const candidates = [
    item?.author_name,
    item?.author,
    item?.writer,
    item?.creator,
    item?.create_user_name,
    item?.create_user_nm,
    item?.inst_member_name,
    item?.user_name,
    item?.member_name,
    item?.posted_by,
    item?.author_info,
    item?.author_profile,
    item?.member,
    item?.user,
    item?.auther, // APIのフィールド誤記・別名対応
    item?.auther?.label
  ];
  return (
    candidates
      .map((v) => resolveName(v))
      .find((v) => typeof v === 'string' && v.trim()) || ''
  );
}

function normalizeListItem(item) {
  const cleanText = (value) =>
    value ? value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';

  const image =
    item?.ext_1?.url ||
    item?.main_image?.url ||
    item?.eyecatch?.url ||
    item?.thumbnail?.url ||
    item?.image_url;

  const tagsOrder = [
    parseTags(item?.tag_list),
    parseTags(item?.tags),
    parseTags(item?.tag)
  ];
  const tags = tagsOrder.find((arr) => arr.length) || [];

  return {
    id: item.topics_id ?? item.id ?? item.slug,
    title: item.subject || item.title || 'タイトル未設定',
    excerpt: cleanText(item.contents || item.description || ''),
    date: item.ymd || item.inst_ymd || item.upd_ymd,
    image,
    tags,
    author: pickAuthor(item)
  };
}

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchArticles = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/rcms-api/4/articles');
        const list = res.data?.list || res.data?.data || [];
        const parsed = list
          .map(normalizeListItem)
          .filter((item) => item.id !== undefined);
        if (!cancelled) {
          setArticles(parsed);
        }
      } catch (err) {
        if (!cancelled) {
          setError('記事の取得に失敗しました。しばらくしてから再度お試しください。');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchArticles();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredArticles = useMemo(() => {
    if (!keyword) return articles;
    const lower = keyword.toLowerCase();
    return articles.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.excerpt.toLowerCase().includes(lower)
    );
  }, [articles, keyword]);

  return (
    <div className="mt-8 space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-800 px-6 py-10 text-white shadow-lg">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-100">
              STORIES
            </p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              いま読みたい記事をピックアップ
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-brand-100 md:text-base">
              Kuroco API から配信される最新記事を Note 風のシンプルな UI で閲覧できます。
              ログイン不要で、軽快に読み進められる体験を目指しました。
            </p>
          </div>
          <div className="w-full max-w-sm rounded-2xl bg-white/10 p-4 backdrop-blur">
            <label className="text-xs text-brand-100">キーワード検索</label>
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="タイトルや本文で探す"
              className="mt-2 w-full rounded-xl border border-white/20 bg-white/20 px-3 py-2 text-white placeholder:text-brand-100 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-80 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {!filteredArticles.length && (
            <p className="col-span-full rounded-2xl bg-white px-6 py-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
              該当する記事がありませんでした。
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ArticleList;

