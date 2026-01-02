import { Link, useLocation } from 'react-router-dom';

function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
            W
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Wakuhel</p>
            <p className="text-xs text-slate-500">Articles</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          {!isHome && (
            <Link
              to="/"
              className="rounded-full px-3 py-1 transition hover:bg-slate-100"
            >
              記事一覧
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

