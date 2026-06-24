import { Outlet, useLocation } from 'react-router-dom';
import { FooterNav } from '../components/FooterNav';
import { Header } from '../components/Header';
import { PAGE_SUBTITLES, ROUTES, type AppRoute } from '../routes/paths';

function resolveSubtitle(pathname: string): string {
  const match = (Object.values(ROUTES) as AppRoute[]).find((route) => route === pathname);
  return match ? PAGE_SUBTITLES[match] : PAGE_SUBTITLES[ROUTES.DASHBOARD];
}

export function AppLayout() {
  const { pathname } = useLocation();
  const isWideLayout = pathname === ROUTES.CAJA;

  return (
    <div className={`app-shell${isWideLayout ? ' app-shell--wide' : ''}`}>
      <Header subtitle={resolveSubtitle(pathname)} />
      <main className="app-main">
        <Outlet />
      </main>
      <FooterNav wide={isWideLayout} />
    </div>
  );
}
