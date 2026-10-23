import {
  Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceDot, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { OrderRecord, PricePoint, TradeRecord } from '../../../shared/api/types';
import { formatCurrency } from '../../../shared/utils/format';
import { gradient } from '../../../shared/design-system/surfaces';

export type ChartRange = '1D' | '5D' | '1M' | '1A';
export type ChartInterval = 'tick' | '1m' | '5m' | '15m' | '1h' | '1d';

interface MarketChartProps {
  data: PricePoint[];
  symbol: string;
  currency: 'CLP' | 'USD';
  sourceCurrency: 'CLP' | 'USD';
  rate: number;
  range: ChartRange;
  interval: ChartInterval;
  averageCost?: number;
  orders?: OrderRecord[];
  trades?: TradeRecord[];
}

interface CandlePoint {
  createdAt: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandleShapeProps {
  cx?: number;
  cy?: number;
  payload?: CandlePoint;
  pixelsPerValue: number;
  candleWidth: number;
  active?: boolean;
}

interface CandleTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ payload?: CandlePoint }>;
  currency: 'CLP' | 'USD';
  sourceCurrency: 'CLP' | 'USD';
  rate: number;
  symbol: string;
}

const intervalMs: Record<ChartInterval, number> = {
  'tick': 1_000,
  '1m': 60_000,
  '5m': 5 * 60_000,
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
  '1d': 24 * 60 * 60_000,
};

const rangeMs: Record<ChartRange, number> = {
  '1D': 24 * 60 * 60_000,
  '5D': 5 * 24 * 60 * 60_000,
  '1M': 31 * 24 * 60 * 60_000,
  '1A': 366 * 24 * 60 * 60_000,
};

function CandleShape({ cx, cy, payload, pixelsPerValue, candleWidth, active = false }: CandleShapeProps) {
  if (cx == null || cy == null || !payload) return null;
  const rising = payload.close >= payload.open;
  const color = rising ? '#45D66F' : '#EF4557';
  const openY = cy - (payload.open - payload.close) * pixelsPerValue;
  const highY = cy - (payload.high - payload.close) * pixelsPerValue;
  const lowY = cy - (payload.low - payload.close) * pixelsPerValue;
  const bodyTop = Math.min(openY, cy);
  const bodyHeight = Math.max(Math.abs(openY - cy), 2.5);
  const bodyWidth = active ? candleWidth + 2 : candleWidth;

  return <g>
    <line x1={cx} x2={cx} y1={highY} y2={lowY} stroke={color} strokeWidth={active ? 1.8 : 1.1} />
    <rect x={cx - bodyWidth / 2} y={bodyTop} width={bodyWidth} height={bodyHeight} rx={0.5} fill={color} />
  </g>;
}

function CandleTooltip({ active, label, payload, currency, sourceCurrency, rate, symbol }: CandleTooltipProps) {
  const candle = payload?.find((entry) => entry.payload)?.payload;
  if (!active || !candle) return null;
  const money = (value: number) => formatCurrency(value, { currency, sourceCurrency, rate });
  const change = candle.open ? ((candle.close - candle.open) / candle.open) * 100 : 0;

  return <div className="quill-candle-tooltip">
    <div><strong>{symbol}</strong><span>{new Date(String(label)).toLocaleString('es-CL')}</span></div>
    <dl>
      <dt>Apertura</dt><dd>{money(candle.open)}</dd>
      <dt>Máximo</dt><dd className="positive">{money(candle.high)}</dd>
      <dt>Mínimo</dt><dd className="negative">{money(candle.low)}</dd>
      <dt>Cierre</dt><dd>{money(candle.close)}</dd>
      <dt>Variación</dt><dd className={change >= 0 ? 'positive' : 'negative'}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</dd>
      {candle.volume != null ? <><dt>Volumen</dt><dd>{new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 }).format(candle.volume)}</dd></> : null}
    </dl>
  </div>;
}

function buildCandles(data: PricePoint[], interval: ChartInterval, range: ChartRange): CandlePoint[] {
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const latestTimestamp = Date.parse(sorted.at(-1)!.createdAt);
  const cutoff = latestTimestamp - rangeMs[range];
  const duration = intervalMs[interval];
  const buckets = new Map<number, PricePoint[]>();

  for (const point of sorted) {
    const timestamp = Date.parse(point.createdAt);
    if (!Number.isFinite(timestamp) || timestamp < cutoff) continue;
    const bucket = Math.floor(timestamp / duration) * duration;
    const group = buckets.get(bucket) ?? [];
    group.push(point);
    buckets.set(bucket, group);
  }

  return [...buckets.entries()].flatMap(([bucket, group]) => {
    const first = group[0];
    const last = group.at(-1)!;
    const hasCompleteOhlc = group.every((point) =>
      [point.open, point.high, point.low, point.close].every(
        (value) => typeof value === 'number' && Number.isFinite(value),
      ),
    );
    if (!hasCompleteOhlc) return [];

    const open = first.open as number;
    const close = last.close as number;
    const highs = group.map((point) => point.high as number);
    const lows = group.map((point) => point.low as number);
    const hasCompleteVolume = group.every(
      (point) => typeof point.volume === 'number' && Number.isFinite(point.volume),
    );

    return [{
      createdAt: new Date(bucket).toISOString(),
      open,
      high: Math.max(...highs),
      low: Math.min(...lows),
      close,
      volume: hasCompleteVolume
        ? group.reduce((sum, point) => sum + (point.volume as number), 0)
        : undefined,
    }];
  });
}

function nearestCandle(candles: CandlePoint[], date: string) {
  const target = Date.parse(date);
  return candles.reduce<CandlePoint | undefined>((nearest, candle) => {
    if (!nearest) return candle;
    return Math.abs(Date.parse(candle.createdAt) - target) < Math.abs(Date.parse(nearest.createdAt) - target) ? candle : nearest;
  }, undefined);
}

export function MarketChart({ data, symbol, currency, sourceCurrency, rate, range, interval, averageCost, orders = [], trades = [] }: MarketChartProps) {
  const styles = getComputedStyle(document.documentElement);
  const chartGrid = styles.getPropertyValue('--chart-grid').trim() || 'rgba(155, 175, 184, 0.15)';
  const chartAxis = styles.getPropertyValue('--chart-axis').trim() || '#9BAFB8';
  const candles = buildCandles(data, interval, range);
  const referencePrices = [averageCost, ...orders.map((order) => order.limitPrice)].filter((value): value is number => Boolean(value));
  const minimum = Math.min(...(candles.length ? candles.map((candle) => candle.low) : [0]), ...(referencePrices.length ? referencePrices : [Infinity]));
  const maximum = Math.max(...(candles.length ? candles.map((candle) => candle.high) : [1]), ...(referencePrices.length ? referencePrices : [-Infinity]));
  const rawRange = Math.max(maximum - minimum, Math.abs(maximum) * 0.002, 1);
  const domainMinimum = minimum - rawRange * 0.12;
  const domainMaximum = maximum + rawRange * 0.12;
  const pixelsPerValue = 225 / Math.max(domainMaximum - domainMinimum, 1);
  const latest = candles.at(-1);
  const first = candles[0];
  const change = latest && first && first.open !== 0 ? ((latest.close - first.open) / first.open) * 100 : 0;
  const latestPrice = latest ? formatCurrency(latest.close, { currency, sourceCurrency, rate }) : '—';
  const candleWidth = Math.min(9, Math.max(2.5, 760 / Math.max(candles.length, 1)));
  const visibleTrades = trades.filter((trade) => trade.symbol === symbol).slice(0, 12);
  const hasVolume = candles.some((candle) => candle.volume != null);

  return <div className={`quill-professional-chart ${gradient.chart}`}>
    <div className="quill-chart-legend">
      <span><strong>{latestPrice}</strong><b className={change >= 0 ? 'positive' : 'negative'}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</b></span>
      <span><i className="candle-up" /> Alcista <i className="candle-down" /> Bajista {hasVolume ? <><i className="volume" /> Volumen</> : null}</span>
    </div>
    {candles.length ? <ResponsiveContainer height="100%" width="100%">
      <ComposedChart data={candles} margin={{ top: 30, right: 10, bottom: 2, left: 0 }}>
        <CartesianGrid stroke={chartGrid} vertical />
        <XAxis axisLine={{ stroke: chartGrid }} dataKey="createdAt" minTickGap={58} tick={{ fill: chartAxis, fontSize: 10 }} tickFormatter={(value) => new Intl.DateTimeFormat('es-CL', interval === 'tick' ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : range === '1D' ? { hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short' }).format(new Date(String(value)))} tickLine={false} />
        <YAxis axisLine={false} domain={[domainMinimum, domainMaximum]} orientation="right" tick={{ fill: chartAxis, fontSize: 10 }} tickFormatter={(value) => formatCurrency(Number(value), { currency, sourceCurrency, rate })} tickLine={false} width={78} yAxisId="price" />
        {hasVolume ? <YAxis domain={[0, (maximumVolume: number) => Math.max(maximumVolume * 4, 1)]} hide yAxisId="volume" /> : null}
        <Tooltip content={<CandleTooltip currency={currency} sourceCurrency={sourceCurrency} rate={rate} symbol={symbol} />} cursor={{ stroke: '#60717a', strokeDasharray: '3 3' }} />
        {hasVolume ? <Bar dataKey="volume" isAnimationActive={false} maxBarSize={10} opacity={0.3} yAxisId="volume">
          {candles.map((candle) => <Cell key={candle.createdAt} fill={candle.close >= candle.open ? '#45D66F' : '#EF4557'} />)}
        </Bar> : null}
        {latest ? <ReferenceLine y={latest.close} yAxisId="price" stroke="#63C9C1" strokeDasharray="4 4" strokeOpacity={0.7} /> : null}
        {averageCost ? <ReferenceLine y={averageCost} yAxisId="price" stroke="#F0B35A" strokeDasharray="6 4" label={{ value: 'Costo medio', fill: '#F0B35A', fontSize: 9, position: 'insideTopLeft' }} /> : null}
        {orders.filter((order) => order.limitPrice).map((order) => <ReferenceLine key={order._id} y={order.limitPrice} yAxisId="price" stroke={order.side === 'BUY' ? '#45D66F' : '#EF4557'} strokeDasharray="2 4" strokeOpacity={0.75} label={{ value: order.side === 'BUY' ? 'Compra pendiente' : 'Venta pendiente', fill: order.side === 'BUY' ? '#45D66F' : '#EF4557', fontSize: 9, position: 'insideBottomLeft' }} />)}
        {visibleTrades.map((trade) => {
          const candle = nearestCandle(candles, trade.executedAt);
          return candle ? <ReferenceDot key={trade._id} x={candle.createdAt} y={trade.executionPrice} yAxisId="price" r={4} fill={trade.side === 'BUY' ? '#45D66F' : '#EF4557'} stroke="#071116" label={{ value: trade.side === 'BUY' ? 'B' : 'V', fill: '#E7F0F2', fontSize: 8, position: 'top' }} /> : null;
        })}
        <Line activeDot={<CandleShape pixelsPerValue={pixelsPerValue} candleWidth={candleWidth} active />} dataKey="close" dot={<CandleShape pixelsPerValue={pixelsPerValue} candleWidth={candleWidth} />} isAnimationActive={false} stroke="transparent" strokeWidth={0} yAxisId="price" />
      </ComposedChart>
    </ResponsiveContainer> : <div className="quill-chart-empty">Todavía no hay datos suficientes para este periodo.</div>}
  </div>;
}
