import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { apiClient } from '../lib/apiClient';
import LoadingModal from '../components/LoadingModal';

const fallbackImage =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

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

function pickAuthor(details) {
  const candidates = [
    details?.author_name,
    details?.author,
    details?.writer,
    details?.creator,
    details?.create_user_name,
    details?.create_user_nm,
    details?.inst_member_name,
    details?.user_name,
    details?.member_name,
    details?.posted_by,
    details?.author_info,
    details?.author_profile,
    details?.member,
    details?.user,
    details?.auther, // APIのフィールド誤記・別名対応
    details?.auther?.label
  ];
  return (
    candidates
      .map((v) => resolveName(v))
      .find((v) => typeof v === 'string' && v.trim()) || ''
  );
}

function normalizeDetail(payload) {
  const details = payload?.details || payload?.data || payload;
  if (!details) return null;

  // content フィールドが ``` で囲まれているケースを整形
  const rawBody =
    details.content ||
    details.contents ||
    details.body ||
    '';
  const cleanedBody = (() => {
    if (typeof rawBody !== 'string') return '';
    const trimmed = rawBody.trim();
    if (trimmed.startsWith('```')) {
      // 先頭の ```lang を除去し末尾 ``` を削除
      return trimmed
        .replace(/^```[a-zA-Z0-9_-]*\s*/, '')
        .replace(/```$/, '')
        .trim();
    }
    return trimmed;
  })();

  const tagsOrder = [
    parseTags(details?.tag_list),
    parseTags(details?.tags),
    parseTags(details?.tag)
  ];
  const tags = tagsOrder.find((arr) => arr.length) || [];

  return {
    id: details.topics_id ?? details.id,
    title: details.subject || details.title || 'タイトル未設定',
    body: cleanedBody,
    date: details.ymd || details.inst_ymd || details.upd_ymd,
    author: pickAuthor(details),
    image:
      details?.ext_1?.url ||
      details?.main_image?.url ||
      details?.eyecatch?.url ||
      details?.thumbnail?.url ||
      details?.image_url ||
      fallbackImage,
    tags
  };
}

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/rcms-api/4/articles/${id}`);
        const parsed = normalizeDetail(res.data);
        if (!cancelled) {
          setArticle(parsed);
        }
      } catch (err) {
        if (!cancelled) {
          setError('記事の読み込みに失敗しました。');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mt-8">
      <LoadingModal open={loading} text="記事詳細を読み込んでいます" />
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200 transition hover:-translate-x-0.5 hover:bg-slate-100"
        >
          ← 記事一覧へ戻る
        </Link>
        {article?.date && (
          <span className="rounded-full bg-slate-200 px-3 py-1">
            {formatDate(article.date)}
          </span>
        )}
        {article?.author && (
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              {article.author.slice(0, 1).toUpperCase()}
            </span>
            <span>著者: {article.author}</span>
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && article && (
        <article className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="relative h-72 w-full overflow-hidden bg-slate-100 sm:h-96">
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent" />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800">
              Note inspired
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              {article.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {article.title}
            </h1>

            <div
              className="prose prose-slate mt-6 max-w-none text-base leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(article.body || article.content || '')
              }}
            />
          </div>
        </article>
      )}
    </div>
  );
}

export default ArticleDetail;

