import { Link } from 'react-router-dom';

const fallbackImage =
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80';

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

function ArticleCard({ article }) {
  const cover = article.image || fallbackImage;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={cover}
          alt={article.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {article.date && (
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {formatDate(article.date)}
            </span>
          )}
          {article.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-50 px-3 py-1 text-brand-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold leading-snug text-slate-900 line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        {article.author && (
          <p className="text-xs font-semibold text-slate-500">
            著者: {article.author}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between text-sm font-semibold text-brand-700">
          <span>続きを読む</span>
          <Link
            to={`/articles/${article.id}`}
            className="rounded-full bg-slate-900 px-3 py-1 text-white transition hover:bg-brand-700"
          >
            開く
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ArticleCard;

