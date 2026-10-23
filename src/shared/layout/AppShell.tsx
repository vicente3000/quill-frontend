import type { PropsWithChildren, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/auth/hooks/use-auth';
import { CurrencySelector } from '../components';
import '../../app/dashboard/DashboardPage.css';

interface AppShellProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

type IconName = 'home' | 'market' | 'portfolio' | 'activity' | 'star' | 'friends';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/></>,
    market: <><path d="M4 19V5M4 19h16m-13-4 4-5 3 3 5-7"/></>,
    portfolio: <><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5h8v2"/></>,
    activity: <><path d="M4 6h16M4 12h10M4 18h13"/><circle cx="18" cy="12" r="2"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>,
    friends: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M15 15c3 0 5 1.7 5.5 5"/></>,
  };
  return <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const railNav: Array<[string, string, IconName]> = [
  ['/dashboard', 'Inicio', 'home'],
  ['/market', 'Mercado', 'market'],
  ['/portfolio', 'Cartera', 'portfolio'],
  ['/activity', 'Actividad', 'activity'],
  ['/watchlist', 'Favoritos', 'star'],
  ['/friends', 'Amigos', 'friends'],
];

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const isMarket = pathname === '/market';

  return (
    <div className="quill-shell m-1 min-h-[calc(100vh-.5rem)] overflow-hidden rounded-xl border border-[#304652] bg-[var(--color-background)] text-[12px] shadow-[0_16px_55px_#0004] max-[620px]:m-0 max-[620px]:min-h-screen max-[620px]:rounded-none max-[620px]:border-0">
      <header className="quill-topbar flex min-h-[72px] items-center gap-6 border-b border-[var(--main-page-border)] bg-[#0b171f] px-5">
        <NavLink to="/dashboard" className="flex items-center gap-2 text-[23px] font-bold tracking-[-.8px] text-[var(--color-text)]" aria-label="Quill, inicio">
          <svg className="h-[23px] w-[23px] text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 4c-7 0-12 3-14 10l-2 6 6-2c7-2 10-7 10-14Z"/><path d="M6 18 16 8"/></svg>
          <span>quill<span className="text-[var(--color-accent)]">.</span></span>
        </NavLink>
        <details className="quill-user-menu ml-auto">
          <summary aria-label="Abrir menú de cuenta">•••</summary>
          <div>
            <span>{user?.fullName}</span>
            <CurrencySelector />
            <NavLink to="/settings">Configuración</NavLink>
            <button type="button" onClick={logout}>Salir</button>
          </div>
        </details>
      </header>

      <div className="grid min-h-[calc(100vh-90px)] grid-cols-[72px_minmax(0,1fr)] max-[620px]:grid-cols-1">
        <nav className="flex flex-col gap-3 border-r border-[var(--main-page-border)] bg-[#0c1921] px-[7px] py-[14px] max-[620px]:fixed max-[620px]:inset-x-0 max-[620px]:bottom-0 max-[620px]:z-50 max-[620px]:grid max-[620px]:grid-cols-6 max-[620px]:gap-0 max-[620px]:border-r-0 max-[620px]:border-t max-[620px]:px-1 max-[620px]:py-1" aria-label="Navegación de Quill">
          {railNav.map(([to, label, icon]) => <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-[7px] rounded-r-md py-[11px] text-[10px] transition-colors max-[620px]:gap-1 max-[620px]:rounded-md max-[620px]:py-2 ${isActive ? 'border-l-2 border-[var(--color-accent)] bg-[#163239] text-[var(--color-accent)] max-[620px]:border-l-0' : 'text-[var(--main-page-text-soft)] hover:text-[var(--color-text)]'}`}><Icon name={icon} /><span>{label}</span></NavLink>)}
        </nav>

        <main className={`min-w-0 ${isMarket ? '' : 'p-8 max-[620px]:p-4 max-[620px]:pb-24'}`}>
          <h1 className="sr-only">{title}</h1>
          <p className="sr-only">{subtitle}</p>
          {children}
        </main>
      </div>
      <footer className="quill-shell-status"><span>●</span> Entorno de práctica</footer>
    </div>
  );
}
