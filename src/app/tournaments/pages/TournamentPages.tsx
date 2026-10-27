import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { OrderForm } from '../../orders/components/OrderForm';
import { MarketTable } from '../../dashboard/components/MarketTable';
import {
  useCancelTournamentOrderMutation,
  useCreateTournamentMutation,
  useJoinTournamentMutation,
  useMarketStatus,
  useMarketStocks,
  useManagedTournamentOrders,
  useManagedTournamentPortfolio,
  useManagedTournamentTrades,
  useRemoveTournamentParticipantMutation,
  useRotateTournamentCodeMutation,
  useTournament,
  useTournamentActionMutation,
  useTournamentLeaderboard,
  useTournamentOrders,
  useTournamentParticipants,
  useTournamentPortfolio,
  useTournaments,
  useTournamentTrades,
  useUpdateTournamentMutation,
} from '../../../shared/api/hooks';
import type {
  LeaderboardParams,
  LeaderboardRow,
  Tournament,
  TournamentParticipant,
  TournamentStatus,
} from '../../../shared/api/validators';
import { getApiErrorMessage } from '../../../shared/api/get-api-error-message';
import { QueryErrorState } from '../../../shared/components/QueryErrorState';
import { AppShell } from '../../../shared/layout/AppShell';
import { useAppSelector } from '../../../store/hooks';
import { formatCurrency, formatDateTime, formatPercentage } from '../../../shared/utils/format';
import { useTournamentMode } from '../context/TournamentModeContext';

const panel = 'rounded-xl border border-[var(--main-page-border)] bg-[#0e1d26] p-5';
const input = 'w-full rounded-lg border border-[var(--main-page-border)] bg-[#09151d] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]';
const primaryButton = 'rounded-lg bg-[var(--color-accent)] px-4 py-2.5 font-semibold text-[#071318] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40';
const secondaryButton = 'rounded-lg border border-[var(--main-page-border)] px-4 py-2.5 text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40';

const statusLabels: Record<TournamentStatus, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Inscripciones abiertas',
  ACTIVE: 'En curso',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

function StatusBadge({ status }: { status: TournamentStatus }) {
  const active = status === 'ACTIVE' || status === 'OPEN';
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-400/10 text-slate-300'}`}>{statusLabels[status]}</span>;
}

function TournamentCard({ tournament, joined = false }: { tournament: Tournament; joined?: boolean }) {
  const navigate = useNavigate();
  const { enterTournament } = useTournamentMode();
  const joinMutation = useJoinTournamentMutation();
  const [error, setError] = useState('');

  const joinPublic = async () => {
    setError('');
    try {
      await joinMutation.mutateAsync({ id: tournament._id });
      enterTournament(tournament);
      void navigate(`/tournaments/${tournament._id}`);
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'No fue posible inscribirte.'));
    }
  };

  return (
    <article className={`${panel} flex min-h-[230px] flex-col gap-4`}>
      <header className="flex items-start justify-between gap-3"><div><p className="mb-1 text-[11px] uppercase tracking-[.16em] text-[var(--color-accent)]">{tournament.visibility === 'PUBLIC' ? 'Publico' : 'Privado'}</p><h3 className="m-0 text-xl text-[var(--color-text)]">{tournament.name}</h3></div><StatusBadge status={tournament.status} /></header>
      <p className="m-0 flex-1 text-sm leading-6 text-[var(--main-page-text-soft)]">{tournament.description || 'Competencia de inversion sin descripcion.'}</p>
      <div className="grid grid-cols-2 gap-3 text-xs text-[var(--main-page-text-soft)]"><span>Capital<br /><strong className="text-[var(--color-text)]">{formatCurrency(tournament.initialBalance)}</strong></span><span>Participantes<br /><strong className="text-[var(--color-text)]">{tournament.participantCount}{tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ''}</strong></span><span>Inicio<br /><strong className="text-[var(--color-text)]">{formatDateTime(tournament.startAt)}</strong></span><span>Termino<br /><strong className="text-[var(--color-text)]">{formatDateTime(tournament.endAt)}</strong></span></div>
      {error ? <p className="m-0 text-xs text-red-400">{error}</p> : null}
      {joined ? <button className={primaryButton} type="button" onClick={() => { if (!['FINISHED', 'CANCELLED'].includes(tournament.status)) enterTournament(tournament); void navigate(`/tournaments/${tournament._id}`); }}>{['FINISHED', 'CANCELLED'].includes(tournament.status) ? 'Ver historial y ranking' : 'Seleccionar este torneo'}</button> : tournament.status === 'ACTIVE' ? <button type="button" className={secondaryButton} onClick={() => void navigate(`/tournaments/${tournament._id}`)}>Ver torneo en vivo</button> : <button type="button" className={primaryButton} disabled={joinMutation.isPending} onClick={() => void joinPublic()}>{joinMutation.isPending ? 'Inscribiendo...' : 'Inscribirme'}</button>}
    </article>
  );
}

export function TournamentsPage() {
  const [tab, setTab] = useState<'current' | 'history' | 'available'>('current');
  const [page, setPage] = useState(1);
  const [inviteId, setInviteId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState('');
  const navigate = useNavigate();
  const { leaveTournamentMode } = useTournamentMode();
  const listQuery = useTournaments({ scope: tab, page, limit: 20 });
  const joinMutation = useJoinTournamentMutation();

  const joinPrivate = async (event: FormEvent) => {
    event.preventDefault();
    setInviteError('');
    try {
      await joinMutation.mutateAsync({ id: inviteId.trim(), joinCode: inviteCode.trim().toUpperCase() });
      void navigate(`/tournaments/${inviteId.trim()}`);
    } catch (caught) {
      setInviteError(getApiErrorMessage(caught, 'Revisa el identificador y el codigo del torneo.'));
    }
  };

  return (
    <AppShell title="Torneos" subtitle="Compite con capital ficticio y precios reales.">
      <div className="mx-auto grid max-w-6xl gap-7">
        <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-[.18em] text-[var(--color-accent)]">Modo competencia</p><h2 className="m-0 text-3xl text-[var(--color-text)]">Torneos de inversion</h2><p className="mt-2 text-[var(--main-page-text-soft)]">Puedes participar en varios torneos y elegir cual controla tu mercado, cartera y actividad.</p></div><button type="button" className={secondaryButton} onClick={() => { leaveTournamentMode(); void navigate('/market'); }}>Ir al modo practica</button></header>

        <section className={`${panel} grid gap-4 md:grid-cols-[1fr_auto] md:items-end`}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => void joinPrivate(event)}><label className="grid gap-1.5 text-xs text-[var(--main-page-text-soft)]">ID del torneo<input className={input} value={inviteId} onChange={(event) => setInviteId(event.target.value)} required /></label><label className="grid gap-1.5 text-xs text-[var(--main-page-text-soft)]">Codigo de acceso<input className={input} value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} required maxLength={20} /></label><div className="sm:col-span-2 flex flex-wrap items-center gap-3"><button className={primaryButton} disabled={joinMutation.isPending} type="submit">Unirme a torneo privado</button>{inviteError ? <span className="text-xs text-red-400">{inviteError}</span> : null}</div></form><p className="m-0 max-w-xs text-xs leading-5 text-[var(--main-page-text-soft)]">El profesor comparte ambos datos. El codigo nunca se publica en el listado.</p>
        </section>

        <div className="flex flex-wrap gap-2"><button className={tab === 'current' ? primaryButton : secondaryButton} onClick={() => { setTab('current'); setPage(1); }} type="button">Mis torneos activos</button><button className={tab === 'history' ? primaryButton : secondaryButton} onClick={() => { setTab('history'); setPage(1); }} type="button">Mi historial</button><button className={tab === 'available' ? primaryButton : secondaryButton} onClick={() => { setTab('available'); setPage(1); }} type="button">Explorar torneos</button></div>
        {listQuery.isLoading ? <p>Cargando torneos...</p> : null}
        {listQuery.isError ? <QueryErrorState message="No fue posible cargar los torneos." onRetry={() => void listQuery.refetch()} /> : null}
        {listQuery.data?.data.length === 0 ? <div className={panel}><h3 className="mt-0">No hay torneos en esta vista</h3><p className="mb-0 text-[var(--main-page-text-soft)]">Puedes practicar en el mercado libre mientras el profesor publica una competencia.</p></div> : null}
        <div className="grid gap-4 lg:grid-cols-2">{listQuery.data?.data.map((tournament) => <TournamentCard key={tournament._id} tournament={tournament} joined={tab !== 'available'} />)}</div>
        {(listQuery.data?.meta.totalPages ?? 0) > 1 ? <div className="flex items-center justify-center gap-3"><button className={secondaryButton} disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">Anterior</button><span>Pagina {page} de {listQuery.data?.meta.totalPages}</span><button className={secondaryButton} disabled={page >= (listQuery.data?.meta.totalPages ?? 1)} onClick={() => setPage((value) => value + 1)} type="button">Siguiente</button></div> : null}
      </div>
    </AppShell>
  );
}

function Leaderboard({ rows, page = 1, totalPages = 1, total = rows.length, onPageChange }: { rows: LeaderboardRow[]; page?: number; totalPages?: number; total?: number; onPageChange?: (page: number) => void }) {
  return <div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase text-[var(--main-page-text-soft)]"><tr><th className="p-3">Puesto</th><th className="p-3">Participante</th><th className="p-3">Tipo</th><th className="p-3">Patrimonio</th><th className="p-3">Rendimiento</th><th className="p-3">Acciones</th><th className="p-3">Operaciones</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[var(--main-page-border)]" key={row.participantId}><td className="p-3 font-bold text-[var(--color-accent)]">#{row.rank}</td><td className="p-3"><strong>{row.fullName}</strong><small className="block text-[var(--main-page-text-soft)]">{row.username ? `@${row.username}` : row.userId}</small></td><td className="p-3 uppercase">{row.accountType}</td><td className="p-3">{formatCurrency(row.totalEquity)}</td><td className={`p-3 font-semibold ${row.returnPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPercentage(row.returnPercentage)}</td><td className="p-3">{row.totalShares}</td><td className="p-3">{row.tradeCount}</td></tr>)}</tbody></table>{rows.length === 0 ? <p className="p-4 text-[var(--main-page-text-soft)]">Todavia no hay participantes para mostrar.</p> : null}</div>{onPageChange ? <footer className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-[var(--main-page-text-soft)]">{total} participantes · pagina {page} de {Math.max(1, totalPages)}</span><div className="flex gap-2"><button className={secondaryButton} disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">Anterior</button><button className={secondaryButton} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} type="button">Siguiente</button></div></footer> : null}</div>;
}

function RankingPanel({ tournamentId, title = 'Ranking completo' }: { tournamentId: string; title?: string }) {
  const [params, setParams] = useState<LeaderboardParams>({ sortBy: 'RETURN_PERCENTAGE', direction: 'desc', page: 1, limit: 25 });
  const rankingQuery = useTournamentLeaderboard(tournamentId, params);
  const update = (values: Partial<LeaderboardParams>) => setParams((current) => ({ ...current, ...values, page: values.page ?? 1 }));
  return <section className={panel}><h3 className="mt-0">{title}</h3><div className="mb-4 grid gap-3 sm:grid-cols-3"><Field label="Ordenar por"><select className={input} value={params.sortBy} onChange={(event) => update({ sortBy: event.target.value as LeaderboardParams['sortBy'] })}><option value="RETURN_PERCENTAGE">Rendimiento</option><option value="TOTAL_EQUITY">Patrimonio</option><option value="TOTAL_SHARES">Cantidad de acciones</option><option value="TRADE_COUNT">Operaciones</option><option value="INVESTED_VALUE">Capital invertido</option><option value="AVAILABLE_BALANCE">Efectivo disponible</option></select></Field><Field label="Tipo de cuenta"><select className={input} value={params.accountType ?? ''} onChange={(event) => update({ accountType: (event.target.value || undefined) as LeaderboardParams['accountType'] })}><option value="">Todas las personas</option><option value="ucn">UCN</option><option value="external">Externos</option></select></Field><Field label="Buscar persona"><input className={input} value={params.search ?? ''} onChange={(event) => update({ search: event.target.value })} placeholder="Nombre o usuario" /></Field></div>{rankingQuery.isLoading ? <p>Cargando ranking...</p> : <Leaderboard rows={rankingQuery.data?.data ?? []} page={rankingQuery.data?.meta.page} totalPages={rankingQuery.data?.meta.totalPages} total={rankingQuery.data?.meta.total} onPageChange={(page) => update({ page })} />}</section>;
}

export function TournamentDetailPage() {
  const { id = '' } = useParams();
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [activity, setActivity] = useState<'orders' | 'trades'>('orders');
  const tournamentQuery = useTournament(id);
  const portfolioQuery = useTournamentPortfolio(id);
  const ordersQuery = useTournamentOrders(id);
  const tradesQuery = useTournamentTrades(id);
  const rankingQuery = useTournamentLeaderboard(id);
  const marketQuery = useMarketStocks();
  const marketStatusQuery = useMarketStatus();
  const cancelOrder = useCancelTournamentOrderMutation(id);
  const { preferredCurrency, usdclpRate } = useAppSelector((state) => state.currency);
  const tournament = tournamentQuery.data;
  const quotes = marketQuery.data ?? [];
  const activeSymbol = quotes.some((quote) => quote.symbol === selectedSymbol) ? selectedSymbol : (quotes[0]?.symbol ?? '');

  if (tournamentQuery.isLoading || portfolioQuery.isLoading || marketQuery.isLoading) return <div className="p-10">Cargando torneo...</div>;
  if (!tournament || tournamentQuery.isError) return <AppShell title="Torneo" subtitle=""><QueryErrorState message="No fue posible abrir este torneo." onRetry={() => void tournamentQuery.refetch()} /></AppShell>;
  if (portfolioQuery.isError || !portfolioQuery.data) return <AppShell title={tournament.name} subtitle=""><div className={panel}><h2>No estas inscrito en este torneo</h2><p className="text-[var(--main-page-text-soft)]">Vuelve al listado para inscribirte o usa la invitacion entregada por el profesor.</p><Link className={primaryButton} to="/tournaments">Volver a torneos</Link></div></AppShell>;
  const portfolio = portfolioQuery.data;

  return (
    <AppShell title={tournament.name} subtitle="Cuenta aislada del torneo">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><StatusBadge status={tournament.status} /><span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300">Saldo exclusivo del torneo</span></div><h2 className="m-0 text-3xl">{tournament.name}</h2><p className="text-[var(--main-page-text-soft)]">{tournament.description}</p></div><Link className={secondaryButton} to="/tournaments">Todos mis torneos</Link></header>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Patrimonio" value={formatCurrency(portfolio.totalEquity, { currency: preferredCurrency, rate: usdclpRate })} /><Metric label="Disponible" value={formatCurrency(portfolio.availableBalance, { currency: preferredCurrency, rate: usdclpRate })} /><Metric label="Invertido" value={formatCurrency(portfolio.investedValue, { currency: preferredCurrency, rate: usdclpRate })} /><Metric label="Rendimiento" value={formatPercentage(portfolio.returnPercentage)} tone={portfolio.returnPercentage >= 0 ? 'positive' : 'negative'} /></section>
        <div className="grid gap-5 xl:grid-cols-[350px_1fr]"><section className={panel}><h3 className="mt-0">Operar en el torneo</h3><p className="text-xs leading-5 text-[var(--main-page-text-soft)]">Estas operaciones afectan solo esta competencia. Comision: {(tournament.commissionRate * 100).toFixed(3)}%.</p>{tournament.status === 'ACTIVE' ? <OrderForm compact tournamentId={id} commissionRate={tournament.commissionRate} availableBalance={portfolio.availableBalance} quotes={quotes} rate={usdclpRate} selectedSymbol={activeSymbol} marketOpen={marketStatusQuery.data?.open} onSymbolChange={setSelectedSymbol} /> : <p className="rounded-lg bg-amber-400/10 p-3 text-amber-300">Las operaciones se habilitan cuando el torneo esta en curso.</p>}</section><section className={panel}><h3 className="mt-0">Mi cartera del torneo</h3><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs uppercase text-[var(--main-page-text-soft)]"><tr><th className="p-3">Accion</th><th className="p-3">Cantidad</th><th className="p-3">Costo medio</th><th className="p-3">Precio</th><th className="p-3">Valor</th><th className="p-3">Resultado</th></tr></thead><tbody>{portfolio.positions.map((position) => { const quote = quotes.find((item) => item.symbol === position.symbol); return <tr className="border-t border-[var(--main-page-border)]" key={position.symbol}><td className="p-3 font-semibold">{position.symbol}</td><td className="p-3">{position.quantity}</td><td className="p-3">{formatCurrency(position.averageCost, { currency: preferredCurrency, sourceCurrency: quote?.currency ?? 'CLP', rate: usdclpRate })}</td><td className="p-3">{formatCurrency(position.marketPrice, { currency: preferredCurrency, sourceCurrency: quote?.currency ?? 'CLP', rate: usdclpRate })}</td><td className="p-3">{formatCurrency(position.marketValue, { currency: preferredCurrency, sourceCurrency: quote?.currency ?? 'CLP', rate: usdclpRate })}</td><td className={`p-3 ${position.unrealizedProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(position.unrealizedProfitLoss, { currency: preferredCurrency, sourceCurrency: quote?.currency ?? 'CLP', rate: usdclpRate })}</td></tr>; })}</tbody></table>{portfolio.positions.length === 0 ? <p className="p-3 text-[var(--main-page-text-soft)]">Tu cartera del torneo todavia esta vacia.</p> : null}</div></section></div>
        <section className={panel}><div className="mb-4 flex gap-2"><button className={activity === 'orders' ? primaryButton : secondaryButton} onClick={() => setActivity('orders')} type="button">Ordenes</button><button className={activity === 'trades' ? primaryButton : secondaryButton} onClick={() => setActivity('trades')} type="button">Operaciones</button></div>{activity === 'orders' ? <div className="grid gap-2">{ordersQuery.data?.map((order) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--main-page-border)] p-3" key={order._id}><span><strong>{order.side === 'BUY' ? 'Compra' : 'Venta'} {order.symbol}</strong><small className="block text-[var(--main-page-text-soft)]">{order.quantity} acciones · {order.status}</small></span>{order.status === 'PENDING' ? <button className={secondaryButton} disabled={cancelOrder.isPending} onClick={() => cancelOrder.mutate(order._id)} type="button">Cancelar</button> : null}</div>)}{ordersQuery.data?.length === 0 ? <p>Sin ordenes.</p> : null}</div> : <div className="grid gap-2">{tradesQuery.data?.map((trade) => <div className="flex items-center justify-between rounded-lg border border-[var(--main-page-border)] p-3" key={trade._id}><span><strong>{trade.side === 'BUY' ? 'Compra' : 'Venta'} {trade.symbol}</strong><small className="block text-[var(--main-page-text-soft)]">{formatDateTime(trade.executedAt)} · {trade.quantity} acciones</small></span><strong>{formatCurrency(trade.netAmount, { currency: preferredCurrency, sourceCurrency: quotes.find((quote) => quote.symbol === trade.symbol)?.currency ?? 'CLP', rate: usdclpRate })}</strong></div>)}{tradesQuery.data?.length === 0 ? <p>Sin operaciones ejecutadas.</p> : null}</div>}</section>
        <section className={panel}><h3 className="mt-0">Ranking en vivo</h3><Leaderboard rows={rankingQuery.data?.data ?? []} /></section>
      </div>
    </AppShell>
  );
}

export function TournamentWorkspacePage() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { enterTournament } = useTournamentMode();
  const view = pathname.endsWith('/market') ? 'market' : pathname.endsWith('/portfolio') ? 'portfolio' : pathname.endsWith('/activity') ? 'activity' : 'overview';
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [activityTab, setActivityTab] = useState<'orders' | 'trades'>('orders');
  const tournamentQuery = useTournament(id);
  const portfolioQuery = useTournamentPortfolio(id);
  const marketQuery = useMarketStocks();
  const marketStatusQuery = useMarketStatus();
  const isParticipant = portfolioQuery.isSuccess;
  const ordersQuery = useTournamentOrders(id, isParticipant);
  const tradesQuery = useTournamentTrades(id, 50, isParticipant);
  const cancelOrder = useCancelTournamentOrderMutation(id);
  const { preferredCurrency, usdclpRate } = useAppSelector((state) => state.currency);
  const tournament = tournamentQuery.data;
  const portfolio = portfolioQuery.data;
  const quotes = marketQuery.data ?? [];
  const activeSymbol = quotes.some((quote) => quote.symbol === selectedSymbol) ? selectedSymbol : (quotes[0]?.symbol ?? '');

  useEffect(() => {
    if (tournament && portfolio && !['FINISHED', 'CANCELLED'].includes(tournament.status)) enterTournament(tournament);
  }, [portfolio, tournament?._id, tournament?.name, tournament?.status]);

  if (tournamentQuery.isLoading || portfolioQuery.isLoading || marketQuery.isLoading) return <div className="p-10">Cargando torneo...</div>;
  if (!tournament || tournamentQuery.isError) return <AppShell title="Torneo" subtitle=""><QueryErrorState message="No fue posible abrir este torneo." onRetry={() => void tournamentQuery.refetch()} /></AppShell>;

  if (!portfolio) {
    return <AppShell title={tournament.name} subtitle="Vista publica del torneo"><div className="mx-auto grid max-w-6xl gap-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><StatusBadge status={tournament.status} /><span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-200">Vista publica</span></div><h2 className="m-0 text-3xl">{tournament.name}</h2><p className="text-[var(--main-page-text-soft)]">Puedes seguir la competencia y su ranking, pero un torneo iniciado ya no acepta nuevos participantes.</p></div><button className={secondaryButton} onClick={() => void navigate('/tournaments')} type="button">Volver a torneos</button></header><section className={panel}><h3 className="mt-0">Mercado utilizado por la competencia</h3><MarketTable quotes={quotes} selectedSymbol={activeSymbol} onSelect={setSelectedSymbol} movementBySymbol={{}} currency={preferredCurrency} rate={usdclpRate} /></section><RankingPanel tournamentId={id} title="Ranking en vivo · todos los participantes" /></div></AppShell>;
  }

  const summary = <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Patrimonio" value={formatCurrency(portfolio.totalEquity, { currency: preferredCurrency, rate: usdclpRate })} /><Metric label="Disponible" value={formatCurrency(portfolio.availableBalance, { currency: preferredCurrency, rate: usdclpRate })} /><Metric label="Invertido" value={formatCurrency(portfolio.investedValue, { currency: preferredCurrency, rate: usdclpRate })} /><Metric label="Rendimiento" value={formatPercentage(portfolio.returnPercentage)} tone={portfolio.returnPercentage >= 0 ? 'positive' : 'negative'} /></section>;
  const positions = <section className={panel}><h3 className="mt-0">Mi cartera del torneo</h3><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs uppercase text-[var(--main-page-text-soft)]"><tr><th className="p-3">Accion</th><th className="p-3">Cantidad</th><th className="p-3">Costo medio</th><th className="p-3">Precio</th><th className="p-3">Valor</th><th className="p-3">Resultado</th></tr></thead><tbody>{portfolio.positions.map((position) => { const quote = quotes.find((item) => item.symbol === position.symbol); const sourceCurrency = quote?.currency ?? 'CLP'; return <tr className="border-t border-[var(--main-page-border)]" key={position.symbol}><td className="p-3 font-semibold">{position.symbol}</td><td className="p-3">{position.quantity}</td><td className="p-3">{formatCurrency(position.averageCost, { currency: preferredCurrency, sourceCurrency, rate: usdclpRate })}</td><td className="p-3">{formatCurrency(position.marketPrice, { currency: preferredCurrency, sourceCurrency, rate: usdclpRate })}</td><td className="p-3">{formatCurrency(position.marketValue, { currency: preferredCurrency, sourceCurrency, rate: usdclpRate })}</td><td className={position.unrealizedProfitLoss >= 0 ? 'p-3 text-emerald-400' : 'p-3 text-red-400'}>{formatCurrency(position.unrealizedProfitLoss, { currency: preferredCurrency, sourceCurrency, rate: usdclpRate })}</td></tr>; })}</tbody></table>{portfolio.positions.length === 0 ? <p className="p-3 text-[var(--main-page-text-soft)]">Tu cartera todavia esta vacia.</p> : null}</div></section>;
  const activity = <section className={panel}><div className="mb-4 flex gap-2"><button className={activityTab === 'orders' ? primaryButton : secondaryButton} onClick={() => setActivityTab('orders')} type="button">Ordenes</button><button className={activityTab === 'trades' ? primaryButton : secondaryButton} onClick={() => setActivityTab('trades')} type="button">Operaciones</button></div>{activityTab === 'orders' ? <div className="grid gap-2">{ordersQuery.data?.map((order) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--main-page-border)] p-3" key={order._id}><span><strong>{order.side === 'BUY' ? 'Compra' : 'Venta'} {order.symbol}</strong><small className="block text-[var(--main-page-text-soft)]">{order.quantity} acciones · {order.status}</small></span>{order.status === 'PENDING' ? <button className={secondaryButton} disabled={cancelOrder.isPending} onClick={() => cancelOrder.mutate(order._id)} type="button">Cancelar</button> : null}</div>)}{ordersQuery.data?.length === 0 ? <p>Sin ordenes.</p> : null}</div> : <div className="grid gap-2">{tradesQuery.data?.map((trade) => <div className="flex items-center justify-between rounded-lg border border-[var(--main-page-border)] p-3" key={trade._id}><span><strong>{trade.side === 'BUY' ? 'Compra' : 'Venta'} {trade.symbol}</strong><small className="block text-[var(--main-page-text-soft)]">{formatDateTime(trade.executedAt)} · {trade.quantity} acciones</small></span><strong>{formatCurrency(trade.netAmount, { currency: preferredCurrency, sourceCurrency: quotes.find((quote) => quote.symbol === trade.symbol)?.currency ?? 'CLP', rate: usdclpRate })}</strong></div>)}{tradesQuery.data?.length === 0 ? <p>Sin operaciones ejecutadas.</p> : null}</div>}</section>;

  return <AppShell title={tournament.name} subtitle="Cuenta aislada del torneo"><div className="mx-auto grid max-w-7xl gap-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><StatusBadge status={tournament.status} /><span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300">Torneo seleccionado</span></div><h2 className="m-0 text-3xl">{tournament.name}</h2><p className="text-[var(--main-page-text-soft)]">Mercado, cartera y actividad ahora pertenecen a esta competencia.</p></div><Link className={secondaryButton} to="/tournaments">Cambiar de torneo</Link></header>{summary}{view === 'overview' ? <RankingPanel tournamentId={id} title={tournament.status === 'FINISHED' ? 'Ranking final' : 'Ranking en vivo'} /> : null}{view === 'market' ? <div className="grid gap-5 xl:grid-cols-[350px_1fr]"><section className={panel}><h3 className="mt-0">Operar en el torneo</h3><p className="text-xs text-[var(--main-page-text-soft)]">Comision: {(tournament.commissionRate * 100).toFixed(3)}%.</p>{tournament.status === 'ACTIVE' ? <OrderForm compact tournamentId={id} commissionRate={tournament.commissionRate} availableBalance={portfolio.availableBalance} quotes={quotes} rate={usdclpRate} selectedSymbol={activeSymbol} marketOpen={marketStatusQuery.data?.open} onSymbolChange={setSelectedSymbol} /> : <p className="rounded-lg bg-amber-400/10 p-3 text-amber-300">Las operaciones se habilitan al iniciar el torneo.</p>}</section><section className={panel}><h3 className="mt-0">Mercado del torneo</h3><MarketTable quotes={quotes} selectedSymbol={activeSymbol} onSelect={setSelectedSymbol} movementBySymbol={{}} currency={preferredCurrency} rate={usdclpRate} /></section></div> : null}{view === 'portfolio' ? positions : null}{view === 'activity' ? activity : null}</div></AppShell>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'positive' | 'negative' }) {
  return <div className={panel}><span className="text-xs text-[var(--main-page-text-soft)]">{label}</span><strong className={`mt-2 block text-2xl ${tone === 'positive' ? 'text-emerald-400' : tone === 'negative' ? 'text-red-400' : ''}`}>{value}</strong></div>;
}

function defaultLocalDate(days: number) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function toLocalDateTime(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function TeacherTournamentsPage() {
  const ownedQuery = useTournaments({ scope: 'owned', limit: 100 });
  const createMutation = useCreateTournamentMutation();
  const [created, setCreated] = useState<{ id: string; code: string } | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', startAt: defaultLocalDate(1), endAt: defaultLocalDate(31), initialBalance: '1000000', commissionPercent: '0.5', visibility: 'PRIVATE', maxParticipants: '100' });
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const createTournament = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const result = await createMutation.mutateAsync({
        name: form.name,
        description: form.description,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        initialBalance: Number(form.initialBalance),
        commissionRate: Number(form.commissionPercent) / 100,
        visibility: form.visibility as 'PUBLIC' | 'PRIVATE',
        maxParticipants: Number(form.maxParticipants),
      });
      setCreated({ id: result.tournament._id, code: result.joinCode });
      update('name', '');
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'No fue posible crear el torneo.'));
    }
  };

  return (
    <AppShell title="Gestion de torneos" subtitle="Crea y administra competencias.">
      <div className="mx-auto grid max-w-7xl gap-7">
        <header><p className="mb-2 text-xs uppercase tracking-[.18em] text-[var(--color-accent)]">Panel del profesor</p><h2 className="m-0 text-3xl">Gestion de torneos</h2><p className="text-[var(--main-page-text-soft)]">Define las reglas y supervisa el avance sin intervenir en las cuentas personales.</p></header>
        {created ? <aside className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-5"><strong>Torneo creado. Guarda estos datos ahora:</strong><p className="mb-1">ID: <code>{created.id}</code></p><p>Codigo: <code className="text-lg text-emerald-300">{created.code}</code></p><Link className={primaryButton} to={`/teacher/tournaments/${created.id}`}>Administrar torneo</Link></aside> : null}
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form className={`${panel} grid gap-4`} onSubmit={(event) => void createTournament(event)}>
            <h3 className="m-0">Crear competencia</h3>
            <Field label="Nombre"><input className={input} minLength={3} required value={form.name} onChange={(event) => update('name', event.target.value)} /></Field>
            <Field label="Descripcion"><textarea className={input} rows={3} value={form.description} onChange={(event) => update('description', event.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Inicio"><input className={input} type="datetime-local" required value={form.startAt} onChange={(event) => update('startAt', event.target.value)} /></Field><Field label="Termino"><input className={input} type="datetime-local" required value={form.endAt} onChange={(event) => update('endAt', event.target.value)} /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Capital inicial (CLP)"><input className={input} type="number" min="1" step="1" required value={form.initialBalance} onChange={(event) => update('initialBalance', event.target.value)} /></Field><Field label="Comision (%)"><input className={input} type="number" min="0" max="100" step="0.001" required value={form.commissionPercent} onChange={(event) => update('commissionPercent', event.target.value)} /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Visibilidad"><select className={input} value={form.visibility} onChange={(event) => update('visibility', event.target.value)}><option value="PRIVATE">Privado</option><option value="PUBLIC">Publico</option></select></Field><Field label="Max. participantes"><input className={input} type="number" min="2" max="10000" required value={form.maxParticipants} onChange={(event) => update('maxParticipants', event.target.value)} /></Field></div>
            <p className="m-0 rounded-lg bg-cyan-400/10 p-3 text-xs leading-5 text-cyan-200">Las acciones disponibles se toman automaticamente del mercado configurado por la plataforma.</p>
            {error ? <p className="m-0 text-sm text-red-400">{error}</p> : null}<button className={primaryButton} disabled={createMutation.isPending} type="submit">{createMutation.isPending ? 'Creando...' : 'Crear borrador'}</button>
          </form>
          <section className="grid content-start gap-3"><h3 className="m-0">Mis torneos</h3>{ownedQuery.data?.data.map((tournament) => <Link className={`${panel} flex flex-wrap items-center justify-between gap-3 transition-colors hover:border-[var(--color-accent)]`} key={tournament._id} to={`/teacher/tournaments/${tournament._id}`}><span><strong className="text-base">{tournament.name}</strong><small className="mt-1 block text-[var(--main-page-text-soft)]">{tournament.participantCount} participantes · termina {formatDateTime(tournament.endAt)}</small></span><StatusBadge status={tournament.status} /></Link>)}{ownedQuery.data?.data.length === 0 ? <div className={panel}>Todavia no has creado torneos.</div> : null}</section>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-xs text-[var(--main-page-text-soft)]">{label}{children}</label>;
}

function TournamentRulesEditor({ tournament }: { tournament: Tournament }) {
  const updateMutation = useUpdateTournamentMutation();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: tournament.name,
    description: tournament.description,
    startAt: toLocalDateTime(tournament.startAt),
    endAt: toLocalDateTime(tournament.endAt),
    initialBalance: String(tournament.initialBalance),
    commissionPercent: String(tournament.commissionRate * 100),
    visibility: tournament.visibility,
    maxParticipants: tournament.maxParticipants ? String(tournament.maxParticipants) : '',
  });
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSaved(false);
    try {
      await updateMutation.mutateAsync({ id: tournament._id, data: {
        name: form.name,
        description: form.description,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        initialBalance: Number(form.initialBalance),
        commissionRate: Number(form.commissionPercent) / 100,
        visibility: form.visibility,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      } });
      setSaved(true);
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'No fue posible actualizar las reglas.'));
    }
  };

  return (
    <form className={`${panel} grid gap-4`} onSubmit={(event) => void save(event)}>
      <div><h3 className="m-0">Reglas del torneo</h3><p className="mb-0 text-xs text-[var(--main-page-text-soft)]">Solo pueden cambiarse antes de iniciar. El capital inicial se bloquea al inscribir al primer participante.</p></div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Field label="Nombre"><input className={input} required minLength={3} value={form.name} onChange={(event) => update('name', event.target.value)} /></Field>
        <Field label="Visibilidad"><select className={input} value={form.visibility} onChange={(event) => update('visibility', event.target.value as 'PUBLIC' | 'PRIVATE')}><option value="PRIVATE">Privado</option><option value="PUBLIC">Publico</option></select></Field>
        <Field label="Inicio"><input className={input} type="datetime-local" required value={form.startAt} onChange={(event) => update('startAt', event.target.value)} /></Field>
        <Field label="Termino"><input className={input} type="datetime-local" required value={form.endAt} onChange={(event) => update('endAt', event.target.value)} /></Field>
        <Field label="Capital inicial (CLP)"><input className={input} type="number" min="1" required value={form.initialBalance} onChange={(event) => update('initialBalance', event.target.value)} /></Field>
        <Field label="Comision (%)"><input className={input} type="number" min="0" max="100" step="0.001" required value={form.commissionPercent} onChange={(event) => update('commissionPercent', event.target.value)} /></Field>
        <Field label="Max. participantes (opcional)"><input className={input} type="number" min="2" max="10000" value={form.maxParticipants} onChange={(event) => update('maxParticipants', event.target.value)} /></Field>
      </div>
      <p className="m-0 rounded-lg bg-cyan-400/10 p-3 text-xs text-cyan-200">El catalogo de acciones se actualiza automaticamente desde la base de datos o el proveedor de mercado.</p>
      <Field label="Descripcion"><textarea className={input} rows={3} value={form.description} onChange={(event) => update('description', event.target.value)} /></Field>
      <div className="flex flex-wrap items-center gap-3"><button className={primaryButton} disabled={updateMutation.isPending} type="submit">Guardar reglas</button>{saved ? <span className="text-emerald-400">Cambios guardados.</span> : null}{error ? <span className="text-red-400">{error}</span> : null}</div>
    </form>
  );
}

function ParticipantInspection({ tournamentId, userId, onClose }: { tournamentId: string; userId: string; onClose: () => void }) {
  const portfolioQuery = useManagedTournamentPortfolio(tournamentId, userId);
  const ordersQuery = useManagedTournamentOrders(tournamentId, userId);
  const tradesQuery = useManagedTournamentTrades(tournamentId, userId);
  const portfolio = portfolioQuery.data;
  return <section className={`${panel} grid gap-4`}><header className="flex items-center justify-between gap-3"><div><h3 className="m-0">Detalle del participante</h3><small className="text-[var(--main-page-text-soft)]">{userId}</small></div><button className={secondaryButton} onClick={onClose} type="button">Cerrar</button></header>{portfolioQuery.isLoading ? <p>Cargando detalle...</p> : null}{portfolio ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Patrimonio" value={formatCurrency(portfolio.totalEquity)} /><Metric label="Disponible" value={formatCurrency(portfolio.availableBalance)} /><Metric label="Rendimiento" value={formatPercentage(portfolio.returnPercentage)} tone={portfolio.returnPercentage >= 0 ? 'positive' : 'negative'} /><Metric label="Posiciones" value={String(portfolio.positions.length)} /></div> : null}<div className="grid gap-4 lg:grid-cols-3"><div><h4>Posiciones</h4>{portfolio?.positions.map((position) => <p className="flex justify-between border-b border-[var(--main-page-border)] pb-2" key={position.symbol}><span>{position.symbol}</span><strong>{position.quantity}</strong></p>)}{portfolio?.positions.length === 0 ? <p className="text-[var(--main-page-text-soft)]">Sin posiciones.</p> : null}</div><div><h4>Ordenes</h4>{ordersQuery.data?.slice(0, 8).map((order) => <p className="flex justify-between border-b border-[var(--main-page-border)] pb-2" key={order._id}><span>{order.side} {order.symbol}</span><strong>{order.status}</strong></p>)}{ordersQuery.data?.length === 0 ? <p className="text-[var(--main-page-text-soft)]">Sin ordenes.</p> : null}</div><div><h4>Operaciones</h4>{tradesQuery.data?.slice(0, 8).map((trade) => <p className="flex justify-between border-b border-[var(--main-page-border)] pb-2" key={trade._id}><span>{trade.side} {trade.symbol}</span><strong>{trade.quantity}</strong></p>)}{tradesQuery.data?.length === 0 ? <p className="text-[var(--main-page-text-soft)]">Sin operaciones.</p> : null}</div></div></section>;
}

export function TeacherTournamentDetailPage() {
  const { id = '' } = useParams();
  const [filters, setFilters] = useState<LeaderboardParams>({ sortBy: 'RETURN_PERCENTAGE', direction: 'desc', limit: 100 });
  const [newCode, setNewCode] = useState('');
  const [inspectedUserId, setInspectedUserId] = useState('');
  const [actionError, setActionError] = useState('');
  const tournamentQuery = useTournament(id);
  const participantsQuery = useTournamentParticipants(id);
  const rankingQuery = useTournamentLeaderboard(id, filters);
  const publish = useTournamentActionMutation('publish');
  const start = useTournamentActionMutation('start');
  const finish = useTournamentActionMutation('finish');
  const cancel = useTournamentActionMutation('cancel');
  const rotateCode = useRotateTournamentCodeMutation();
  const removeParticipant = useRemoveTournamentParticipantMutation();
  const tournament = tournamentQuery.data;

  const runAction = async (mutation: { mutateAsync: (id: string) => Promise<unknown> }) => {
    setActionError('');
    try { await mutation.mutateAsync(id); } catch (caught) { setActionError(getApiErrorMessage(caught, 'No fue posible cambiar el estado.')); }
  };

  if (!tournament) return <AppShell title="Administrar torneo" subtitle=""><p>Cargando torneo...</p></AppShell>;
  const editable = ['DRAFT', 'OPEN'].includes(tournament.status);

  return (
    <AppShell title={tournament.name} subtitle="Administracion del torneo">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="mb-2"><StatusBadge status={tournament.status} /></div><h2 className="m-0 text-3xl">{tournament.name}</h2><p className="text-[var(--main-page-text-soft)]">ID para invitaciones: <code>{tournament._id}</code></p></div>
          <Link className={secondaryButton} to="/teacher/tournaments">Volver a gestion</Link>
        </header>
        <section className={`${panel} grid gap-4`}>
          <div className="flex flex-wrap gap-2">
            {tournament.status === 'DRAFT' ? <button className={primaryButton} onClick={() => void runAction(publish)} type="button">Publicar</button> : null}
            {editable ? <button className={secondaryButton} onClick={() => void runAction(start)} type="button">Iniciar ahora</button> : null}
            {tournament.status === 'ACTIVE' ? <button className={secondaryButton} onClick={() => void runAction(finish)} type="button">Finalizar y congelar ranking</button> : null}
            {!['FINISHED', 'CANCELLED'].includes(tournament.status) ? <button className="rounded-lg border border-red-500/50 px-4 py-2.5 text-red-300" onClick={() => void runAction(cancel)} type="button">Cancelar torneo</button> : null}
            {!['FINISHED', 'CANCELLED'].includes(tournament.status) ? <button className={secondaryButton} onClick={() => { void rotateCode.mutateAsync(id).then((result) => setNewCode(result.joinCode)); }} type="button">Generar nuevo codigo</button> : null}
          </div>
          {newCode ? <p className="m-0 rounded-lg bg-amber-400/10 p-3 text-amber-200">Nuevo codigo (se muestra una sola vez): <strong>{newCode}</strong></p> : null}
          {actionError ? <p className="m-0 text-red-400">{actionError}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Participantes" value={String(tournament.participantCount)} /><Metric label="Capital inicial" value={formatCurrency(tournament.initialBalance)} /><Metric label="Comision" value={`${(tournament.commissionRate * 100).toFixed(3)}%`} /><Metric label="Termino" value={formatDateTime(tournament.endAt)} /></div>
        </section>
        {editable ? <TournamentRulesEditor key={tournament.updatedAt ?? tournament._id} tournament={tournament} /> : null}
        <section className={panel}>
          <div className="mb-4 flex flex-wrap items-end gap-3"><Field label="Ordenar por"><select className={input} value={filters.sortBy} onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value as LeaderboardParams['sortBy'] }))}><option value="RETURN_PERCENTAGE">Rendimiento</option><option value="TOTAL_EQUITY">Patrimonio</option><option value="TOTAL_SHARES">Cantidad de acciones</option><option value="TRADE_COUNT">Operaciones</option><option value="INVESTED_VALUE">Capital invertido</option><option value="AVAILABLE_BALANCE">Efectivo disponible</option></select></Field><Field label="Tipo de cuenta"><select className={input} value={filters.accountType ?? ''} onChange={(event) => setFilters((current) => ({ ...current, accountType: (event.target.value || undefined) as LeaderboardParams['accountType'] }))}><option value="">Todos</option><option value="ucn">UCN</option><option value="external">Externos</option></select></Field><Field label="Buscar"><input className={input} value={filters.search ?? ''} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Nombre o usuario" /></Field></div>
          <h3>Ranking</h3><Leaderboard rows={rankingQuery.data?.data ?? []} />
        </section>
        <section className={panel}>
          <h3 className="mt-0">Participantes inscritos</h3>
          <div className="grid gap-2">{participantsQuery.data?.map((participant) => <ParticipantRow key={participant._id} participant={participant} canRemove={editable} onInspect={setInspectedUserId} onRemove={(userId) => removeParticipant.mutate({ id, userId })} />)}{participantsQuery.data?.length === 0 ? <p className="text-[var(--main-page-text-soft)]">No hay participantes inscritos.</p> : null}</div>
        </section>
        {inspectedUserId ? <ParticipantInspection tournamentId={id} userId={inspectedUserId} onClose={() => setInspectedUserId('')} /> : null}
      </div>
    </AppShell>
  );
}

function ParticipantRow({ participant, canRemove, onInspect, onRemove }: { participant: TournamentParticipant; canRemove: boolean; onInspect: (userId: string) => void; onRemove: (userId: string) => void }) {
  const user = typeof participant.userId === 'string' ? null : participant.userId;
  const userId = typeof participant.userId === 'string' ? participant.userId : participant.userId._id;
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--main-page-border)] p-3"><span><strong>{user?.fullName ?? userId}</strong><small className="block text-[var(--main-page-text-soft)]">{user?.email ?? ''} {user?.accountType ? `· ${user.accountType.toUpperCase()}` : ''}</small></span><span className="flex items-center gap-3"><small>{formatDateTime(participant.joinedAt)}</small><button className="text-[var(--color-accent)] hover:underline" onClick={() => onInspect(userId)} type="button">Ver detalle</button>{canRemove ? <button className="text-red-300 hover:underline" onClick={() => onRemove(userId)} type="button">Retirar</button> : null}</span></div>;
}
