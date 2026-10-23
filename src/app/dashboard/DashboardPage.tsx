import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { OrderForm } from '../orders/components/OrderForm';
import { OrdersTable } from '../orders/components/OrdersTable';
import { PortfolioTable } from '../portfolio/components/PortfolioTable';
import { TradesTable } from '../trades/components/TradesTable';
import {
  usePortfolioSummary,
  useMarketStocks,
  useMarketStatus,
  usePendingOrders,
  useRecentTrades,
  useStockHistory,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
} from '../../shared/api/hooks';
import { useAuth } from '../auth/hooks/use-auth';
import type { OrderRecord, PricePoint, StockQuote, TradeRecord } from '../../shared/api/validators';
import { QueryErrorState } from '../../shared/components/QueryErrorState';
import { AppShell } from '../../shared/layout/AppShell';
import { loadingScreen } from '../../shared/design-system/layout';
import { textNegative, textPositive } from '../../shared/design-system/typography';
import { AnimatedCurrency } from '../../shared/components/AnimatedCurrency';
import { formatCurrency, formatDateTime, formatPercentage } from '../../shared/utils/format';
import { MarketChart } from './components/MarketChart';
import type { ChartInterval, ChartRange } from './components/MarketChart';
import { MarketTable } from './components/MarketTable';
import { isStubMode } from '@/shared/api/stub-mode';
import type { PortfolioSummary } from '@/shared/api/types';
import { useForexDispatch } from '@/shared/hooks/useForexRate';
import { useAppSelector } from '@/store/hooks';
import './DashboardPage.css';

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';

interface MarketPriceUpdate {
  symbol: string;
  price: number;
  close?: number;
  dayChangePercentage?: number;
}

function isMarketPriceUpdate(value: unknown): value is MarketPriceUpdate {
  return typeof value === 'object' && value !== null && 'symbol' in value && 'price' in value && typeof value.symbol === 'string' && typeof value.price === 'number';
}

const pageCopy = {
  dashboard: { title: 'Inicio', subtitle: 'Tu patrimonio y posiciones de un vistazo.' },
  market: { title: 'Mercado', subtitle: 'Analiza activos y crea órdenes limitadas.' },
  portfolio: { title: 'Cartera', subtitle: 'Tus posiciones, capital invertido y resultados.' },
  activity: { title: 'Actividad', subtitle: 'Órdenes abiertas y operaciones ejecutadas.' },
} as const;

type PageView = keyof typeof pageCopy;

export function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (location.pathname.slice(1) || 'dashboard') as PageView;
  const page = pageCopy[view] ?? pageCopy.dashboard;
  const queryClient = useQueryClient();
  const { token, user, updateUser } = useAuth();
  const addWatchlistMutation = useAddToWatchlistMutation();
  const removeWatchlistMutation = useRemoveFromWatchlistMutation();
  const previousPricesRef = useRef<Record<string, number>>({});
  const [movementBySymbol, setMovementBySymbol] = useState<Record<string, 'up' | 'down' | 'steady'>>({});
  const [selectedSymbol, setSelectedSymbol] = useState(searchParams.get('symbol')?.toUpperCase() ?? '');
  const [activityTab, setActivityTab] = useState<'orders' | 'trades'>('trades');
  const [marketTab, setMarketTab] = useState<'orders' | 'portfolio' | 'trades'>('orders');
  const [chartRange, setChartRange] = useState<ChartRange>('1D');
  const [chartInterval, setChartInterval] = useState<ChartInterval>('tick');
  const { handleForexUpdate } = useForexDispatch();
  const { preferredCurrency: currency, usdclpRate: rate } = useAppSelector((state) => state.currency);

  const portfolioQuery = usePortfolioSummary();
  const marketQuery = useMarketStocks();
  const marketStatusQuery = useMarketStatus();
  const ordersQuery = usePendingOrders();
  const tradesQuery = useRecentTrades(30);
  const confirmedMarketStatus = marketStatusQuery.isSuccess && !marketStatusQuery.isFetching ? marketStatusQuery.data : undefined;

  const quotes = useMemo<StockQuote[]>(() => marketQuery.data ?? [], [marketQuery.data]);
  const quoteNames = useMemo(() => Object.fromEntries(quotes.map((quote) => [quote.symbol, quote.name])), [quotes]);
  const quoteSymbols = useMemo(() => quotes.map((quote) => quote.symbol).join(','), [quotes]);
  const activeSymbol = quotes.some((quote) => quote.symbol === selectedSymbol) ? selectedSymbol : (quotes[0]?.symbol ?? '');
  const selectedQuote = quotes.find((quote) => quote.symbol === activeSymbol);
  const historyLimit = chartRange === '1D' ? 300 : chartRange === '5D' ? 600 : 1000;
  const historyQuery = useStockHistory(activeSymbol, historyLimit);
  useEffect(() => {
    for (const quote of quotes) {
      if (previousPricesRef.current[quote.symbol] === undefined) previousPricesRef.current[quote.symbol] = quote.close;
    }
  }, [quotes]);

  useEffect(() => {
    if (isStubMode() || quoteSymbols.length === 0) return;
    const socket = io(`${socketUrl}/realtime`, { transports: ['websocket'], auth: { token: token || undefined } });
    socket.on('connect', () => {
      for (const symbol of quoteSymbols.split(',')) socket.emit('subscribe', { topic: symbol });
      socket.emit('subscribe', { topic: 'USDCLP', type: 'forex' });
    });
    socket.on('price_update', (update: unknown) => {
      if (!isMarketPriceUpdate(update)) return;
      const { symbol, price, dayChangePercentage } = update;
      if (symbol === 'USDCLP') {
        handleForexUpdate({ symbol, close: update.close ?? price });
        return;
      }
      const previousPrice = previousPricesRef.current[symbol];
      setMovementBySymbol((current) => ({ ...current, [symbol]: previousPrice === undefined || previousPrice === price ? 'steady' : price > previousPrice ? 'up' : 'down' }));
      previousPricesRef.current[symbol] = price;
      queryClient.setQueryData<StockQuote[]>(['market', 'stocks'], (current) => current?.map((quote) => quote.symbol === symbol ? { ...quote, close: price, dayChangePercentage: dayChangePercentage ?? quote.dayChangePercentage } : quote));
    });
    socket.on('connect_error', () => console.error('[Quill] WebSocket no disponible; se conserva la última cotización.'));
    return () => { socket.disconnect(); };
  }, [handleForexUpdate, queryClient, quoteSymbols, token]);

  const portfolio = portfolioQuery.data as PortfolioSummary;
  const openOrders = (ordersQuery.data as OrderRecord[]) ?? [];
  const recentTrades: TradeRecord[] = tradesQuery.data ?? [];
  const activePosition = portfolio?.positions.find((position) => position.symbol === activeSymbol);
  const activeOrders = openOrders.filter((order) => order.symbol === activeSymbol);
  const absoluteChange = selectedQuote ? selectedQuote.close - selectedQuote.previousClose : 0;
  const portfolioCost = Math.max(0, (portfolio?.investedValue ?? 0) - (portfolio?.unrealizedProfitLoss ?? 0));
  const portfolioReturn = portfolioCost > 0 ? ((portfolio?.unrealizedProfitLoss ?? 0) / portfolioCost) * 100 : 0;
  const cashWeight = (portfolio?.totalEquity ?? 0) > 0 ? ((portfolio?.availableBalance ?? 0) / portfolio.totalEquity) * 100 : 100;
  const marketMovers = [...quotes].sort((a, b) => Math.abs(b.dayChangePercentage) - Math.abs(a.dayChangePercentage)).slice(0, 3);
  const selectMarketSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    if (view === 'market') setSearchParams({ symbol }, { replace: true });
  };

  const goToMarket = (symbol?: string) => void navigate(symbol ? `/market?symbol=${encodeURIComponent(symbol)}` : '/market');

  const handleToggleWatchlist = async (symbol: string) => {
    const inWatchlist = user?.watchlist?.includes(symbol) ?? false;
    const result = inWatchlist
      ? await removeWatchlistMutation.mutateAsync(symbol)
      : await addWatchlistMutation.mutateAsync({ symbols: [symbol] });
    updateUser({ watchlist: result.watchlist });
  };

  if (portfolioQuery.isLoading || marketQuery.isLoading || ordersQuery.isLoading || tradesQuery.isLoading) {
    return <div className={loadingScreen}>Cargando datos de Quill...</div>;
  }

  if (portfolioQuery.isError || marketQuery.isError || ordersQuery.isError) {
    return <AppShell title={page.title} subtitle={page.subtitle}><QueryErrorState message="No fue posible cargar los datos financieros." onRetry={() => { void portfolioQuery.refetch(); void marketQuery.refetch(); void ordersQuery.refetch(); }} /></AppShell>;
  }

  return (
    <AppShell title={page.title} subtitle={page.subtitle}>
      {view === 'dashboard' ? (
        <section className="quill-home">
          <header className="quill-page-heading"><div><span>Tu espacio de inversión</span><h2>Una mirada a tu cartera.</h2><p>Tu capital, tus posiciones y tus próximos movimientos.</p></div><span className="quill-practice">Cuenta de práctica</span></header>
          <div className="quill-overview">
            <div className="quill-equity"><span>Patrimonio total</span><div><AnimatedCurrency value={portfolio?.totalEquity ?? 0} currency={currency} rate={rate} /></div><p className={portfolio?.unrealizedProfitLoss >= 0 ? textPositive : textNegative}><AnimatedCurrency value={portfolio?.unrealizedProfitLoss ?? 0} currency={currency} rate={rate} /> de resultado no realizado</p><button type="button" onClick={() => goToMarket()}>Explorar el mercado ↗</button></div>
            <div className="quill-summary"><div><span>Saldo disponible</span><strong><AnimatedCurrency value={portfolio?.availableBalance ?? 0} currency={currency} rate={rate} /></strong></div><div><span>Capital invertido</span><strong><AnimatedCurrency value={portfolio?.investedValue ?? 0} currency={currency} rate={rate} /></strong></div><div><span>Órdenes abiertas</span><strong>{openOrders.length}</strong></div></div>
          </div>
          <div className="quill-home-insights">
            <section className="quill-insight-card">
              <header><span>Rendimiento de cartera</span><strong className={portfolioReturn >= 0 ? textPositive : textNegative}>{formatPercentage(portfolioReturn)}</strong></header>
              <div className="quill-balance-composition"><span style={{ width: `${Math.min(100, Math.max(0, cashWeight))}%` }} /></div>
              <dl><div><dt>Efectivo</dt><dd>{cashWeight.toFixed(1)}%</dd></div><div><dt>Invertido</dt><dd>{(100 - cashWeight).toFixed(1)}%</dd></div><div><dt>Resultado sin realizar</dt><dd className={portfolio?.unrealizedProfitLoss >= 0 ? textPositive : textNegative}><AnimatedCurrency value={portfolio?.unrealizedProfitLoss ?? 0} currency={currency} rate={rate} /></dd></div></dl>
            </section>
            <section className="quill-insight-card">
              <header><span>Movimiento del mercado</span><button type="button" onClick={() => goToMarket()}>Ver mercado</button></header>
              <div className="quill-movers">{marketMovers.map((quote) => <button key={quote.symbol} type="button" onClick={() => goToMarket(quote.symbol)}><span><strong>{quote.symbol}</strong><small>{quote.name}</small></span><span><b className={quote.dayChangePercentage >= 0 ? textPositive : textNegative}>{formatPercentage(quote.dayChangePercentage)}</b><small><AnimatedCurrency value={quote.close} currency={currency} sourceCurrency={quote.currency} rate={rate} /></small></span></button>)}</div>
            </section>
            <section className="quill-insight-card quill-recent-card">
              <header><span>Actividad reciente</span><button type="button" onClick={() => navigate('/activity')}>Ver historial</button></header>
              <div className="quill-recent-list">{recentTrades.slice(0, 3).map((trade) => <div key={trade._id}><span className={trade.side === 'BUY' ? 'trade-buy' : 'trade-sell'}>{trade.side === 'BUY' ? 'C' : 'V'}</span><span><strong>{trade.side === 'BUY' ? 'Compra' : 'Venta'} · {trade.symbol}</strong><small>{formatDateTime(trade.executedAt)}</small></span><strong><AnimatedCurrency value={trade.netAmount} currency={currency} rate={rate} /></strong></div>)}{recentTrades.length === 0 ? <p>Aún no tienes operaciones ejecutadas.</p> : null}</div>
            </section>
          </div>
          <div className="quill-section-title"><h3>Tus inversiones</h3><span>Valores en {currency}</span></div>
          <div className="quill-home-table"><table><thead><tr><th>Activo</th><th>Cantidad</th><th>Costo medio</th><th>Valor actual</th><th>Resultado</th></tr></thead><tbody>{portfolio?.positions.map((position) => <tr key={position.symbol}><td><strong>{quotes.find((quote) => quote.symbol === position.symbol)?.name ?? position.symbol}</strong><span>{position.symbol}</span></td><td>{position.quantity}</td><td><AnimatedCurrency value={position.averageCost} currency={currency} rate={rate} /></td><td><AnimatedCurrency value={position.marketValue} currency={currency} rate={rate} /></td><td className={position.unrealizedProfitLoss >= 0 ? textPositive : textNegative}><AnimatedCurrency value={position.unrealizedProfitLoss} currency={currency} rate={rate} /></td></tr>)}</tbody></table></div>
          <footer className="quill-home-foot"><span>Continúa explorando el mercado y revisa tus órdenes desde la terminal.</span><button type="button" onClick={() => goToMarket()}>Ir a Mercado →</button></footer>
        </section>
      ) : null}

      {view === 'market' ? (
        <section className="quill-terminal">
          <div className="quill-ticker">
            <div className="quill-asset"><span>{selectedQuote?.symbol.slice(0, 1)}</span><div><strong>{selectedQuote?.symbol} / {selectedQuote?.currency}</strong><small>{selectedQuote?.name}</small></div></div>
            <div><small>Último precio</small><strong>{selectedQuote ? <AnimatedCurrency value={selectedQuote.close} currency={currency} sourceCurrency={selectedQuote.currency} rate={rate} /> : '—'}</strong></div>
            <div><small>Variación · sesión</small><strong className={absoluteChange >= 0 ? textPositive : textNegative}>{selectedQuote ? <><AnimatedCurrency value={absoluteChange} currency={currency} sourceCurrency={selectedQuote.currency} rate={rate} /> · {formatPercentage(selectedQuote.dayChangePercentage)}</> : '—'}</strong></div>
            <div className="secondary"><small>Apertura</small><strong>{selectedQuote?.open != null ? <AnimatedCurrency value={selectedQuote.open} currency={currency} sourceCurrency={selectedQuote.currency} rate={rate} /> : '—'}</strong></div>
            <div className="secondary"><small>Máximo / Mínimo</small><strong>{selectedQuote?.high != null && selectedQuote.low != null ? <><AnimatedCurrency value={selectedQuote.high} currency={currency} sourceCurrency={selectedQuote.currency} rate={rate} /> / <AnimatedCurrency value={selectedQuote.low} currency={currency} sourceCurrency={selectedQuote.currency} rate={rate} /></> : '—'}</strong></div>
            <div className="secondary"><small>Volumen</small><strong>{selectedQuote?.volume != null ? new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 }).format(selectedQuote.volume) : '—'}</strong></div>
            <div className="quill-market-status"><span className={confirmedMarketStatus?.open ? 'is-open' : ''}>{confirmedMarketStatus?.open ? 'Mercado abierto' : 'Mercado cerrado'}</span><small>{selectedQuote?.source === 'mock' ? 'Datos simulados' : 'Datos indicativos'} · {selectedQuote?.lastMarketDate ? formatDateTime(selectedQuote.lastMarketDate) : 'ahora'}</small></div>
          </div>
          <div className="quill-quote-strip">
            <span>Cierre anterior <strong>{selectedQuote ? <AnimatedCurrency value={selectedQuote.previousClose} currency={currency} sourceCurrency={selectedQuote.currency} rate={rate} /> : '—'}</strong></span>
            {activePosition ? <span>Tu posición <strong>{activePosition.quantity} acciones · costo <AnimatedCurrency value={activePosition.averageCost} currency={currency} sourceCurrency={selectedQuote?.currency ?? 'CLP'} rate={rate} /></strong></span> : null}
          </div>
          <div className="quill-workspace">
            <aside className="quill-order-panel"><div className="quill-panel-title">Tu operación <span>{selectedQuote?.currency}</span></div><OrderForm compact availableBalance={portfolio?.availableBalance} quotes={quotes} rate={rate} selectedSymbol={activeSymbol} marketOpen={confirmedMarketStatus?.open} onSymbolChange={selectMarketSymbol} /></aside>
            <section className="quill-chart-panel">
              <div className="quill-chartbar">
                <strong>Velas</strong>
                <div className="quill-chart-ranges" aria-label="Periodo del gráfico">{(['1D', '5D', '1M', '1A'] as ChartRange[]).map((item) => <button key={item} type="button" aria-pressed={chartRange === item} onClick={() => setChartRange(item)}>{item}</button>)}</div>
                <select aria-label="Intervalo de las velas" value={chartInterval} onChange={(event) => setChartInterval(event.target.value as ChartInterval)}><option value="tick">Tiempo real</option><option value="1m">1 min</option><option value="5m">5 min</option><option value="15m">15 min</option><option value="1h">1 hora</option><option value="1d">1 día</option></select>
                <span>OHLCV · {currency}</span>
              </div>
              <div className="quill-chart-head"><strong>{activeSymbol} · precio y volumen</strong><span>Las líneas muestran tu costo medio y órdenes pendientes</span></div>
              <div className="quill-chart-wrap"><MarketChart averageCost={activePosition?.averageCost} currency={currency} data={(historyQuery.data as PricePoint[]) ?? []} interval={chartInterval} orders={activeOrders} range={chartRange} rate={rate} sourceCurrency={selectedQuote?.currency ?? 'USD'} symbol={activeSymbol} trades={recentTrades} /></div>
              <div className="quill-chart-foot"><span>QUILL · ENTORNO EDUCATIVO</span><span>Solo se muestran datos almacenados</span></div>
            </section>
            <aside className="quill-assets-panel"><div className="quill-panel-title">Mercado</div><MarketTable compact currency={currency} movementBySymbol={movementBySymbol} onSelect={selectMarketSymbol} quotes={quotes} rate={rate} selectedSymbol={activeSymbol} watchlist={user?.watchlist} onToggleWatchlist={(symbol) => void handleToggleWatchlist(symbol)} /></aside>
          </div>
          <section className="quill-account-panel"><div className="quill-account-tabs"><button type="button" aria-pressed={marketTab === 'orders'} onClick={() => setMarketTab('orders')}>Órdenes abiertas <span>{openOrders.length}</span></button><button type="button" aria-pressed={marketTab === 'portfolio'} onClick={() => setMarketTab('portfolio')}>Mi cartera</button><button type="button" aria-pressed={marketTab === 'trades'} onClick={() => setMarketTab('trades')}>Historial</button></div>{marketTab === 'orders' ? <OrdersTable currency={currency} orders={openOrders} rate={rate} /> : marketTab === 'portfolio' ? <PortfolioTable positions={portfolio?.positions ?? []} currency={currency} rate={rate} names={quoteNames} onSelect={goToMarket} /> : <TradesTable currency={currency} hasError={tradesQuery.isError} rate={rate} trades={recentTrades} />}</section>
          <footer className="quill-status"><span>USD/CLP {formatCurrency(rate, { currency: 'CLP' })}</span></footer>
        </section>
      ) : null}

      {view === 'portfolio' ? (
        <section className="quill-portfolio-page">
          <span className="quill-eyebrow">Tus inversiones</span>
          <header className="quill-page-header">
            <div><h2>Mi cartera</h2><p>Lo que tienes invertido y cómo va cada posición.</p></div>
            <button type="button" className="quill-primary-action" onClick={() => goToMarket()}>Invertir en Mercado ↗</button>
          </header>
          <section className="quill-overview quill-portfolio-overview">
            <div className="quill-equity"><span>Valor actual de tus inversiones</span><div><AnimatedCurrency value={portfolio?.investedValue ?? 0} currency={currency} rate={rate} /></div><p className={portfolio?.unrealizedProfitLoss >= 0 ? textPositive : textNegative}><AnimatedCurrency value={portfolio?.unrealizedProfitLoss ?? 0} currency={currency} rate={rate} /> · {formatPercentage(portfolio?.investedValue ? (portfolio.unrealizedProfitLoss / Math.max(1, portfolio.investedValue - portfolio.unrealizedProfitLoss)) * 100 : 0)} sin realizar</p></div>
            <div className="quill-summary">{[['Capital invertido', portfolio?.investedValue ?? 0], ['Saldo disponible', portfolio?.availableBalance ?? 0], ['Patrimonio total', portfolio?.totalEquity ?? 0]].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong><AnimatedCurrency value={Number(value)} currency={currency} rate={rate} /></strong></div>)}</div>
          </section>
          <div className="quill-section-title"><h3>Tus posiciones <span>{portfolio?.positions.length ?? 0}</span></h3><span>Valores en {currency}</span></div>
          <div className="quill-portfolio-table"><PortfolioTable positions={portfolio?.positions ?? []} currency={currency} rate={rate} names={quoteNames} onSelect={goToMarket} /></div>
          {portfolio?.positions.length ? <section className="quill-allocation"><h3>Distribución de tus inversiones</h3><div className="quill-allocation-bar">{portfolio.positions.map((position, index) => <span key={position.symbol} className={index % 2 === 0 ? 'first' : 'second'} style={{ width: `${portfolio.investedValue > 0 ? position.marketValue / portfolio.investedValue * 100 : 0}%` }} />)}</div><div className="quill-allocation-legend">{portfolio.positions.map((position) => <span key={position.symbol}><strong>{position.symbol}</strong> · {portfolio.investedValue > 0 ? (position.marketValue / portfolio.investedValue * 100).toFixed(2) : '0'}%</span>)}</div></section> : null}
          <p className="quill-page-note">El resultado no realizado muestra cuánto ganarías o perderías al precio actual, antes de vender. El saldo disponible queda fuera de la distribución de inversiones.</p>
        </section>
      ) : null}

      {view === 'activity' ? (
        <section className="quill-activity-page">
          <span className="quill-eyebrow">Tus movimientos</span>
          <header className="quill-page-header"><div><h2>Actividad</h2><p>Revisa tus órdenes pendientes y las operaciones que ya realizaste.</p></div></header>
          <div className="quill-page-tabs" role="tablist" aria-label="Tipo de actividad"><button type="button" role="tab" aria-selected={activityTab === 'orders'} onClick={() => setActivityTab('orders')}>Órdenes abiertas {openOrders.length}</button><button type="button" role="tab" aria-selected={activityTab === 'trades'} onClick={() => setActivityTab('trades')}>Historial de operaciones</button></div>
          <div className="quill-records">
            {activityTab === 'orders' ? <OrdersTable currency={currency} orders={openOrders} rate={rate} /> : recentTrades.length ? <div className="responsive-table"><table><thead><tr><th>Activo</th><th>Operación</th><th>Precio ejecutado</th><th>Cantidad</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{recentTrades.map((trade) => <tr key={trade._id}><td><strong>{trade.symbol}</strong><small>{quotes.find((quote) => quote.symbol === trade.symbol)?.name ?? trade.symbol}</small></td><td className={trade.side === 'BUY' ? textPositive : textNegative}>{trade.side === 'BUY' ? 'Compra' : 'Venta'}</td><td><AnimatedCurrency value={trade.executionPrice} currency={currency} rate={rate} /></td><td>{trade.quantity}</td><td><AnimatedCurrency value={trade.netAmount} currency={currency} rate={rate} /></td><td>{formatDateTime(trade.executedAt)}</td><td><span className="quill-state">Ejecutada</span></td></tr>)}</tbody></table></div> : <TradesTable currency={currency} hasError={tradesQuery.isError} rate={rate} trades={recentTrades} />}
          </div>
          <footer className="quill-records-foot"><span>{activityTab === 'orders' ? 'Órdenes que todavía están pendientes.' : 'Compras y ventas que ya se ejecutaron.'}</span><span>Montos en {currency}</span></footer>
        </section>
      ) : null}
    </AppShell>
  );
}
