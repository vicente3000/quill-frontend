import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/use-auth';
import { useWatchlist, useMarketStocks, useRemoveFromWatchlistMutation } from '../../../shared/api/hooks';
import { AppShell } from '../../../shared/layout/AppShell';
import { EmptyState } from '../../../shared/components/EmptyState';
import { QueryErrorState } from '../../../shared/components/QueryErrorState';
import { loadingScreen } from '../../../shared/design-system/layout';
import { formatPercentage } from '../../../shared/utils/format';
import { AnimatedCurrency } from '../../../shared/components/AnimatedCurrency';
import { textPositive, textNegative } from '../../../shared/design-system/typography';
import { useAppSelector } from '../../../store/hooks';
import type { StockQuote } from '../../../shared/api/validators';
import '../../dashboard/DashboardPage.css';

export function WatchlistPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const watchlistQuery = useWatchlist();
  const marketQuery = useMarketStocks();
  const removeMutation = useRemoveFromWatchlistMutation();
  const { preferredCurrency: currency, usdclpRate: rate } = useAppSelector((state) => state.currency);

  if (watchlistQuery.isLoading || marketQuery.isLoading) {
    return <AppShell title="Favoritos" subtitle="Tus acciones favoritas."><div className={loadingScreen}>Cargando lista de seguimiento...</div></AppShell>;
  }

  if (watchlistQuery.isError || marketQuery.isError) {
    return <AppShell title="Favoritos" subtitle="Tus acciones favoritas."><QueryErrorState message="No fue posible cargar la lista de seguimiento." onRetry={() => { void watchlistQuery.refetch(); void marketQuery.refetch(); }} /></AppShell>;
  }

  const stocks = (watchlistQuery.data ?? []) as StockQuote[];
  const handleRemove = async (symbol: string) => {
    const result = await removeMutation.mutateAsync(symbol);
    updateUser({ watchlist: result.watchlist });
  };

  return (
    <AppShell title="Favoritos" subtitle="Las acciones que te interesan, en un solo lugar.">
      <section className="quill-watchlist-page">
        <span className="quill-eyebrow">Tu lista de seguimiento</span>
        <header className="quill-page-header">
          <div><h2>Favoritos</h2><p>Las acciones que te interesan, en un solo lugar.</p></div>
          <button type="button" className="quill-outline-action" onClick={() => void navigate('/market')}>Explorar mercado ↗</button>
        </header>
        {stocks.length === 0 ? <EmptyState title="Sin acciones favoritas" description="Marca una estrella en Mercado para comenzar tu lista." /> : (
          <div className="quill-watch-table responsive-table">
            <table><thead><tr><th>Activo</th><th>Precio · {currency}</th><th>Variación de la sesión</th><th>Seguimiento</th><th></th></tr></thead><tbody>
              {stocks.map((stock) => <tr key={stock.symbol}><td><span className="quill-asset-avatar">{stock.symbol[0]}</span><span><strong>{stock.symbol}</strong><small>{stock.name}</small></span></td><td><strong><AnimatedCurrency value={stock.close} currency={currency} sourceCurrency={stock.currency} rate={rate} /></strong></td><td className={stock.dayChangePercentage >= 0 ? textPositive : textNegative}>{formatPercentage(stock.dayChangePercentage)}</td><td><button type="button" className="quill-star-button" aria-label={`Quitar ${stock.symbol} de favoritos`} onClick={() => void handleRemove(stock.symbol)} disabled={removeMutation.isPending}>★</button></td><td><button type="button" className="quill-row-action" onClick={() => void navigate(`/market?symbol=${encodeURIComponent(stock.symbol)}`)}>Ver en Mercado ↗</button></td></tr>)}
            </tbody></table>
          </div>
        )}
        <footer className="quill-records-foot"><span>{stocks.length} acciones en seguimiento</span><span>Seguir una acción no realiza una compra.</span></footer>
      </section>
    </AppShell>
  );
}
