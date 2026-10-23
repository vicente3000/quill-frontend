import { EmptyState } from '../../../shared/components/EmptyState';
import type { PortfolioPosition } from '../../../shared/api/types';
import { AnimatedCurrency } from '../../../shared/components/AnimatedCurrency';
import { surface } from '../../../shared/design-system/surfaces';
import { textPositive, textNegative } from '../../../shared/design-system/typography';
import { table } from '../../../shared/design-system';
import { formatPercentage } from '../../../shared/utils/format';
import '../../../shared/design-system/table.css';

interface PortfolioTableProps {
  positions: PortfolioPosition[];
  currency: 'CLP' | 'USD';
  rate: number;
  onSelect?: (symbol: string) => void;
  names?: Record<string, string>;
}

export function PortfolioTable({ positions, currency, rate, onSelect, names = {} }: PortfolioTableProps) {
  if (!positions.length) {
    return (
      <EmptyState
        description="Cuando compres una accion ejecutada, Quill mostrara aqui tu cantidad, costo promedio y resultado no realizado."
        title="Tu portafolio todavia esta vacio"
      />
    );
  }

  return (
    <div className={`${surface.tableWrapper} responsive-table`}>
      <table className="w-full min-w-[640px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className={table.header}>Activo</th>
            <th className={table.header}>Cantidad</th>
            <th className={table.header}>Costo medio</th>
            <th className={table.header}>Precio actual</th>
            <th className={table.header}>Valor actual</th>
            <th className={table.header}>Resultado</th>
            {onSelect ? <th className={table.header}></th> : null}
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <tr key={position.symbol} className={`${table.rowBorder} transition-colors duration-[var(--main-page-transition)]`}>
              <td className={table.cell} data-label="Activo"><strong>{position.symbol}</strong><small>{names[position.symbol] ?? position.symbol}</small></td>
              <td className={table.cell} data-label="Cantidad">{position.quantity}</td>
              <td className={table.cell} data-label="Costo medio">
                <AnimatedCurrency value={position.averageCost} currency={currency} rate={rate} />
              </td>
              <td className={table.cell} data-label="Precio actual">
                <AnimatedCurrency value={position.marketPrice} currency={currency} rate={rate} />
              </td>
              <td className={table.cell} data-label="Valor actual"><AnimatedCurrency value={position.marketValue} currency={currency} rate={rate} /></td>
              <td
                className={`${table.cell} ${position.unrealizedProfitLoss >= 0 ? textPositive : textNegative}`}
                data-label="Resultado"
              >
                <AnimatedCurrency value={position.unrealizedProfitLoss} currency={currency} rate={rate} />
                <small>{formatPercentage(position.averageCost > 0 ? ((position.marketPrice - position.averageCost) / position.averageCost) * 100 : 0)}</small>
              </td>
              {onSelect ? (
                <td className={table.cell} data-label="">
                  <button type="button" className="whitespace-nowrap text-sm text-[var(--color-accent)] hover:underline" onClick={() => onSelect(position.symbol)}>
                    Ver en Mercado ↗
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
