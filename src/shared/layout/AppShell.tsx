import type { PropsWithChildren, ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth/hooks/use-auth';
import { useTournamentMode } from '../../app/tournaments/context/TournamentModeContext';
import { CurrencySelector } from '../components';
import '../../app/dashboard/DashboardPage.css';

interface AppShellProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

type IconName = 'home' | 'market' | 'portfolio' | 'activity' | 'star' | 'friends' | 'trophy' | 'flag' | 'manage';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/></>,
    market: <><path d="M4 19V5M4 19h16m-13-4 4-5 3 3 5-7"/></>,
    portfolio: <><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5h8v2"/></>,
    activity: <><path d="M4 6h16M4 12h10M4 18h13"/><circle cx="18" cy="12" r="2"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>,
    friends: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M15 15c3 0 5 1.7 5.5 5"/></>,
    trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v2a3 3 0 0 0 3 3m8-5h3v2a3 3 0 0 1-3 3M12 13v4m-4 3h8"/></>,
    flag: <><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></>,
    manage: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></>,
  };
  return <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const railNav: Array<[string, string, IconName]> = [
  ['/dashboard', 'Inicio', 'home'],
  ['/market', 'Mercado', 'market'],
  ['/portfolio', 'Cartera', 'portfolio'],
  ['/activity', 'Actividad', 'activity'],
  ['/tournaments', 'Torneos', 'trophy'],
  ['/contests', 'Concursos', 'flag'],
  ['/watchlist', 'Favoritos', 'star'],
  ['/friends', 'Amigos', 'friends'],
];

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeTournament, leaveTournamentMode } = useTournamentMode();
  const isMarket = pathname === '/market';
  const isTournament = pathname.startsWith('/tournaments') || pathname.startsWith('/teacher/tournaments');
  const workspaceNav = activeTournament
    ? railNav.map(([to, label, icon]) => {
        const mapped = to === '/dashboard'
          ? `/tournaments/${activeTournament.id}`
          : ['/market', '/portfolio', '/activity'].includes(to)
            ? `/tournaments/${activeTournament.id}${to}`
            : to;
        return [mapped, label, icon] as [string, string, IconName];
      })
    : railNav;
  const navigation = user && ['teacher', 'admin'].includes(user.role)
    ? [...workspaceNav, ['/teacher/tournaments', 'Gestion', 'manage'] as [string, string, IconName]]
    : workspaceNav;

  return (
    <div className="quill-shell m-1 min-h-[calc(100vh-.5rem)] overflow-hidden rounded-xl border border-[#304652] bg-[var(--color-background)] text-[12px] shadow-[0_16px_55px_#0004] max-[620px]:m-0 max-[620px]:min-h-screen max-[620px]:rounded-none max-[620px]:border-0">
      <header className="quill-topbar flex min-h-[72px] items-center gap-6 border-b border-[var(--main-page-border)] bg-[#0b171f] px-5">
        <NavLink to="/dashboard" className="flex items-center gap-2 text-[23px] font-bold tracking-[-.8px] text-[var(--color-text)]" aria-label="Quill, inicio">
          <svg className="h-[23px] w-[23px] text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 4c-7 0-12 3-14 10l-2 6 6-2c7-2 10-7 10-14Z"/><path d="M6 18 16 8"/></svg>
          <span>quill<span className="text-[var(--color-accent)]">.</span></span>
        </NavLink>
        {activeTournament ? <div className="ml-auto flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-cyan-200"><span className="max-w-[220px] truncate">Torneo: {activeTournament.name}</span><button type="button" className="underline" onClick={() => { leaveTournamentMode(); void navigate('/dashboard'); }}>Salir a práctica</button></div> : null}
        <details className={`quill-user-menu ${activeTournament ? '' : 'ml-auto'}`}>
          <summary aria-label="Abrir menú de cuenta">•••</summary>
          <div>
            <span>{user?.fullName}</span>
            <CurrencySelector />
            <NavLink to="/settings">Configuración</NavLink>
            {user?.role === 'admin' ? <NavLink to="/admin/config">Admin</NavLink> : null}
            <button type="button" onClick={logout}>Salir</button>
          </div>
        </details>
      </header>

      <div className="grid min-h-[calc(100vh-90px)] grid-cols-[72px_minmax(0,1fr)] max-[620px]:grid-cols-1">
        <nav className="flex flex-col gap-3 border-r border-[var(--main-page-border)] bg-[#0c1921] px-[7px] py-[14px] max-[620px]:fixed max-[620px]:inset-x-0 max-[620px]:bottom-0 max-[620px]:z-50 max-[620px]:flex-row max-[620px]:overflow-x-auto max-[620px]:gap-0 max-[620px]:border-r-0 max-[620px]:border-t max-[620px]:px-1 max-[620px]:py-1" aria-label="Navegación de Quill">
          {navigation.map(([to, label, icon]) => <NavLink end={label === 'Inicio' || to === '/tournaments'} key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-[7px] rounded-r-md py-[11px] text-[10px] transition-colors max-[620px]:min-w-[68px] max-[620px]:flex-1 max-[620px]:gap-1 max-[620px]:rounded-md max-[620px]:py-2 ${isActive ? 'border-l-2 border-[var(--color-accent)] bg-[#163239] text-[var(--color-accent)] max-[620px]:border-l-0' : 'text-[var(--main-page-text-soft)] hover:text-[var(--color-text)]'}`}><Icon name={icon} /><span>{label}</span></NavLink>)}
        </nav>

        <main className={`min-w-0 ${isMarket ? '' : 'p-8 max-[620px]:p-4 max-[620px]:pb-24'}`}>
          <h1 className="sr-only">{title}</h1>
          <p className="sr-only">{subtitle}</p>
          {children}
        </main>
      </div>
      <footer className="quill-shell-status"><span>●</span> {activeTournament || isTournament ? `Modo torneo${activeTournament ? ` · ${activeTournament.name}` : ''}` : 'Entorno de práctica'}</footer>
    </div>
  );
}
