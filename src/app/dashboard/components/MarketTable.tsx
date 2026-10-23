import { useMemo, useState } from 'react';
import type { StockQuote } from '../../../shared/api/types';
import { formatPercentage } from '../../../shared/utils/format';
import { AnimatedCurrency } from '../../../shared/components/AnimatedCurrency';
import { surface } from '../../../shared/design-system/surfaces';
import { textPositive, textNegative } from '../../../shared/design-system/typography';
import '../../../shared/design-system/table.css';

interface MarketTableProps {
  quotes: StockQuote[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  movementBySymbol: Record<string, 'up' | 'down' | 'steady'>;
  currency: 'CLP' | 'USD';
  rate: number;
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string) => void;
  compact?: boolean;
}

const movementColor: Record<string, string> = {
  up: 'text-[var(--color-accent)]',
  down: 'text-[var(--main-page-danger)]',
  steady: '',
}

export function MarketTable({
  quotes,
  selectedSymbol,
  onSelect,
  movementBySymbol,
  currency,
  rate,
  watchlist,
  onToggleWatchlist,
  compact = false,
}: MarketTableProps) {
  const [search, setSearch] = useState('');
  const displayQuotes = useMemo(
    () => {
      return search
        ? quotes.filter(
            (q) =>
              q.symbol.toLowerCase().includes(search.toLowerCase()) ||
              q.name.toLowerCase().includes(search.toLowerCase()),
          )
        : quotes;
    },
    [quotes, search],
  );

  const marketTableText1 = "p-[0.5rem_0.6rem] text-left text-[0.78rem] font-semibold text-[var(--main-page-text-soft)] bg-[color-mix(in_srgb,var(--color-text)_2.5%,_transparent)]";
  if (compact) {
    return (
      <div className="terminal-market-list">
        <input placeholder="Buscar activo…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar activo" />
        <div className="terminal-market-list-head"><span>Activo</span><span>Precio</span></div>
        {displayQuotes.map((quote) => {
          const isSelected = quote.symbol === selectedSymbol;
          const isWatched = watchlist?.includes(quote.symbol) ?? false;
          return (
            <div key={quote.symbol} className={`terminal-market-row ${isSelected ? 'is-selected' : ''}`}>
              <button type="button" className="terminal-star" onClick={() => onToggleWatchlist?.(quote.symbol)} aria-label={isWatched ? `Quitar ${quote.symbol} de favoritos` : `Agregar ${quote.symbol} a favoritos`}>{isWatched ? '★' : '☆'}</button>
              <button type="button" className="terminal-market-asset" onClick={() => onSelect(quote.symbol)}><strong>{quote.symbol}</strong><small>{quote.name}</small></button>
              <button type="button" className="terminal-market-price" onClick={() => onSelect(quote.symbol)}><strong className={movementColor[movementBySymbol[quote.symbol] ?? 'steady']}><AnimatedCurrency value={quote.close} currency={currency} sourceCurrency={quote.currency} rate={rate} /></strong><small className={quote.dayChangePercentage >= 0 ? textPositive : textNegative}>{formatPercentage(quote.dayChangePercentage)}</small></button>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className={`${surface.tableWrapper} max-h-[13.5rem] responsive-table`}>
      <div className="sticky top-0 z-10 border-b border-[var(--main-page-border)] bg-[var(--main-page-surface-strong)]">
        <input
          className="w-full bg-transparent px-3 py-2 text-[0.85rem] text-[var(--color-text)] outline-none placeholder:text-[var(--main-page-text-muted)]"
          placeholder="Buscar accion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            {watchlist !== undefined ? (
              <th className="w-8 p-[0.5rem_0.6rem] text-left text-[0.78rem] font-semibold text-[var(--main-page-text-soft)] bg-[color-mix(in_srgb,var(--color-text)_2.5%,_transparent)]"></th>
            ) : null}
            <th className={marketTableText1}>Simbolo</th>
            <th className={marketTableText1}>Empresa</th>
            <th className={marketTableText1}>Precio</th>
            <th className={marketTableText1}>Variacion</th>
          </tr>
        </thead>
        <tbody>
          {displayQuotes.map((quote) => {
            const isSelected = quote.symbol === selectedSymbol;
            const isWatched = watchlist?.includes(quote.symbol) ?? false;
            const marketTableBodyText1 = "p-[0.5rem_0.6rem] text-left border-b border-[var(--main-page-border)]";

            return (
            <tr
              key={quote.symbol}
              onClick={() => onSelect(quote.symbol)}
              aria-selected={isSelected}
              className={`border border-[var(--main-page-border)] transition-colors duration-[var(--main-page-transition)] hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,_transparent)] ${isSelected ? 'bg-[color-mix(in_srgb,var(--color-accent)_10%,_transparent)] shadow-[inset_4px_0_0_var(--color-accent)]' : ''}`}
            >
              {watchlist !== undefined ? (
                <td className={marketTableBodyText1}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist?.(quote.symbol);
                    }}
                    className={`text-base leading-none transition-colors ${
                      isWatched
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--main-page-text-muted)] hover:text-[var(--color-accent)]'
                    }`}
                    aria-label={isWatched ? `Quitar ${quote.symbol} de seguimiento` : `Agregar ${quote.symbol} a seguimiento`}
                  >
                    {isWatched ? '\u2605' : '\u2606'}
                  </button>
                </td>
              ) : null}
              <td className={`${marketTableBodyText1} ${isSelected ? 'font-semibold text-[var(--color-accent)]' : ''}`} data-label="Simbolo">{quote.symbol}</td>
              <td className={`${marketTableBodyText1} ${isSelected ? 'font-semibold' : ''}`} data-label="Empresa">{quote.name}</td>
              <td
                className={`${marketTableBodyText1} transition-all duration-[var(--main-page-transition)] ${movementColor[movementBySymbol[quote.symbol] ?? 'steady']}`}
                data-label="Precio"
              >
                <AnimatedCurrency value={quote.close} currency={currency} sourceCurrency={quote.currency} rate={rate} />
              </td>
              <td
                className={`p-[0.5rem_0.6rem] text-left border-b border-[var(--main-page-border)] ${quote.dayChangePercentage >= 0 ? textPositive : textNegative}`}
                data-label="Variacion"
              >
                {formatPercentage(quote.dayChangePercentage)}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
