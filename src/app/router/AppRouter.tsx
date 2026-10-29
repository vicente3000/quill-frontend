import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { useAuth } from '../auth/hooks/use-auth';
import { auth } from '../../shared/content/strings';
import { loadingScreen } from '../../shared/design-system/layout';
import { AdminLayout } from '../admin/layout/AdminLayout';
import { useProfile } from '../../shared/api/hooks';
import { useTournamentMode } from '../tournaments/context/TournamentModeContext';
const AuthPage = lazy(() =>
  import('../auth/pages/AuthPage').then((module) => ({ default: module.AuthPage })),
);
const DashboardPage = lazy(() =>
  import('../dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const SettingsPage = lazy(() =>
  import('../settings/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const WatchlistPage = lazy(() =>
  import('../watchlist/pages/WatchlistPage').then((module) => ({ default: module.WatchlistPage })),
);
const FriendsPage = lazy(() =>
  import('../friends/pages/FriendsPage').then((module) => ({ default: module.FriendsPage })),
);
const ContestsPage = lazy(() =>
  import('../contests/pages/ContestsPage').then((module) => ({ default: module.ContestsPage })),
);
const AdminConfigPage = lazy(() =>
  import('../admin/pages/AdminConfigPage').then((module) => ({ default: module.AdminConfigPage })),
);
const AdminSnapshotsPage = lazy(() =>
  import('../admin/pages/AdminSnapshotsPage').then((module) => ({ default: module.AdminSnapshotsPage })),
);
const AdminStocksPage = lazy(() =>
  import('../admin/pages/AdminStocksPage').then((module) => ({ default: module.AdminStocksPage })),
);
const TournamentsPage = lazy(() =>
  import('../tournaments/pages/TournamentPages').then((module) => ({ default: module.TournamentsPage })),
);
const TournamentDetailPage = lazy(() =>
  import('../tournaments/pages/TournamentPages').then((module) => ({ default: module.TournamentDetailPage })),
);
const TeacherTournamentsPage = lazy(() =>
  import('../tournaments/pages/TournamentPages').then((module) => ({ default: module.TeacherTournamentsPage })),
);
const TeacherTournamentDetailPage = lazy(() =>
  import('../tournaments/pages/TournamentPages').then((module) => ({ default: module.TeacherTournamentDetailPage })),
);
const AdminContestsPage = lazy(() =>
  import('../admin/pages/AdminContestsPage').then((module) => ({ default: module.AdminContestsPage })),
);
const NotFound = lazy(() => import('../not-found/NotFound'));

function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return element;
}

function TradingWorkspace({ practicePath }: { practicePath: '/dashboard' | '/market' | '/portfolio' | '/activity' }) {
  const { activeTournament } = useTournamentMode();
  if (!activeTournament) return <DashboardPage />;
  const tournamentPath = practicePath === '/dashboard'
    ? `/tournaments/${activeTournament.id}`
    : `/tournaments/${activeTournament.id}${practicePath}`;
  return <Navigate to={tournamentPath} replace />;
}

function AdminAuthorization({ element }: { element: React.ReactNode }) {
  const profileQuery = useProfile();

  if (profileQuery.isLoading) {
    return <div className={loadingScreen}>{auth.loading}</div>;
  }

  if (profileQuery.data?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
}

function AdminRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? <AdminAuthorization element={element} />
    : <Navigate to="/auth" replace />;
}

function TeacherAuthorization({ element }: { element: React.ReactNode }) {
  const profileQuery = useProfile();
  if (profileQuery.isLoading) return <div className={loadingScreen}>{auth.loading}</div>;
  return profileQuery.data && ['teacher', 'admin'].includes(profileQuery.data.role)
    ? element
    : <Navigate to="/tournaments" replace />;
}

function TeacherRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <TeacherAuthorization element={element} /> : <Navigate to="/auth" replace />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<div className={loadingScreen}>{auth.loading}</div>}>
      {useRoutes([
        { path: '/auth', element: <AuthPage /> },
        { path: '/home', element: <Navigate to="/auth" replace /> },
        { path: '/test', element: <Navigate to="/auth" replace /> },
        {
          path: '/dashboard',
          element: <ProtectedRoute element={<TradingWorkspace practicePath="/dashboard" />} />,
        },
        {
          path: '/market',
          element: <ProtectedRoute element={<TradingWorkspace practicePath="/market" />} />,
        },
        {
          path: '/portfolio',
          element: <ProtectedRoute element={<TradingWorkspace practicePath="/portfolio" />} />,
        },
        {
          path: '/activity',
          element: <ProtectedRoute element={<TradingWorkspace practicePath="/activity" />} />,
        },
        {
          path: '/settings',
          element: <ProtectedRoute element={<SettingsPage />} />,
        },
        {
          path: '/watchlist',
          element: <ProtectedRoute element={<WatchlistPage />} />,
        },
        {
          path: '/friends',
          element: <ProtectedRoute element={<FriendsPage />} />,
        },
        { path: '/tournaments', element: <ProtectedRoute element={<TournamentsPage />} /> },
        { path: '/tournaments/:id', element: <ProtectedRoute element={<TournamentDetailPage />} /> },
        { path: '/tournaments/:id/market', element: <ProtectedRoute element={<TournamentDetailPage />} /> },
        { path: '/tournaments/:id/portfolio', element: <ProtectedRoute element={<TournamentDetailPage />} /> },
        { path: '/tournaments/:id/activity', element: <ProtectedRoute element={<TournamentDetailPage />} /> },
        { path: '/teacher/tournaments', element: <TeacherRoute element={<TeacherTournamentsPage />} /> },
        { path: '/teacher/tournaments/:id', element: <TeacherRoute element={<TeacherTournamentDetailPage />} /> },
        {
          path: '/contests',
          element: <ProtectedRoute element={<ContestsPage />} />,
        },
        {
          path: '/admin',
          element: <AdminRoute element={<AdminLayout><Outlet /></AdminLayout>} />,
          children: [
            { path: 'config', element: <AdminConfigPage /> },
            { path: 'snapshots', element: <AdminSnapshotsPage /> },
            { path: 'stocks', element: <AdminStocksPage /> },
            { path: 'contests', element: <AdminContestsPage /> },
          ],
        },
        { path: '/', element: <Navigate to="/auth" replace /> },
        { path: '*', element: <NotFound /> },
      ])}
    </Suspense>
  );
}
