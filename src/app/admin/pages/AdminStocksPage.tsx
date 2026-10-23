import { useState } from 'react';
import { useAdminStocks, useDeleteAdminStock } from '../../../shared/api/hooks';
import { admin } from '../../../shared/content/strings';
import { button, surface } from '../../../shared/design-system/surfaces';
import { loadingScreen } from '../../../shared/design-system/layout';
import { table } from '../../../shared/design-system';
import { textSoft, textMuted } from '../../../shared/design-system/typography';
import { SectionCard } from '../../../shared/components/SectionCard';
import { AdminStockCreateModal } from '../components/AdminStockCreateModal';
import { AdminStockPriceModal } from '../components/AdminStockPriceModal';
import type { AdminStock } from '../../../shared/api/validators';

const SOURCES = ['all', 'admin', 'mock', 'eodhd', 'yahoo'] as const;

export function AdminStocksPage() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [priceTarget, setPriceTarget] = useState<AdminStock | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminStock | null>(null);

  const { data, isLoading } = useAdminStocks({
    search: search || undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
    page,
    limit: 50,
  });

  const deleteMutation = useDeleteAdminStock();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.symbol);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return <div className={loadingScreen}>Cargando acciones...</div>;
  }

  const stocks = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <SectionCard
        title={admin.stocks.title}
        description={admin.stocks.description}
        actions={
          <button
            type="button"
            className={`${button.base} ${button.primary}`}
            onClick={() => setShowCreate(true)}
          >
            {admin.stocks.create}
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            className="min-w-[220px] rounded-[var(--main-page-radius-md)] border border-[var(--main-page-border)] bg-[var(--main-page-surface-strong)] px-3 py-2 text-[0.88rem] text-text outline-none transition-colors focus:border-[var(--color-accent)]"
            placeholder="Buscar por símbolo o nombre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />

          <div className="flex flex-wrap items-center gap-1">
            {SOURCES.map((s) => (
              <button
                key={s}
                type="button"
                className={`rounded-full px-3 py-1 text-[0.78rem] font-medium transition-colors ${
                  sourceFilter === s
                    ? 'bg-[var(--main-page-accent-soft)] text-[var(--main-page-accent-strong)]'
                    : `bg-[var(--main-page-surface-muted)] ${textSoft} hover:bg-[var(--main-page-accent-soft)]`
                }`}
                onClick={() => { setSourceFilter(s); setPage(1); }}
              >
                {s === 'all' ? 'Todas' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={`${surface.tableWrapper}`}>
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={`${table.header}`}>{admin.stocks.fields.symbol}</th>
                <th className={`${table.header}`}>{admin.stocks.fields.name}</th>
                <th className={`${table.header}`}>{admin.stocks.fields.price}</th>
                <th className={`${table.header}`}>{admin.stocks.fields.dayChange}</th>
                <th className={`${table.header}`}>{admin.stocks.fields.source}</th>
                <th className={`p-[0.85rem_0.75rem] text-right text-[0.86rem] font-semibold ${textSoft}`}>{admin.config.fields.actions}</th>
              </tr>
            </thead>
            <tbody>
              {!stocks.length ? (
                <tr>
                  <td colSpan={6} className={`p-[0.85rem_0.75rem] text-center ${textSoft}`}>{admin.stocks.empty}</td>
                </tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-[var(--main-page-border)] transition-colors">
                    <td className="p-[0.85rem_0.75rem] font-mono text-[0.88rem] font-semibold text-text">{stock.symbol}</td>
                    <td className="p-[0.85rem_0.75rem] text-text">{stock.name}</td>
                    <td className="p-[0.85rem_0.75rem] font-mono text-[0.88rem] text-text">
                      {stock.currency === 'CLP'
                        ? `$${stock.close.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                        : `$${stock.close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </td>
                    <td className="p-[0.85rem_0.75rem]">
                      <span className={`font-mono text-[0.88rem] ${
                        stock.dayChangePercentage >= 0 ? 'text-[var(--color-accent)]' : 'text-[var(--main-page-danger)]'
                      }`}>
                        {stock.dayChangePercentage >= 0 ? '+' : ''}{stock.dayChangePercentage.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-[0.85rem_0.75rem]">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.78rem] font-medium ${
                        stock.source === 'admin'
                          ? 'bg-green-500/15 text-green-600'
                          : stock.source === 'mock'
                            ? 'bg-blue-500/15 text-blue-600'
                            : 'bg-amber-500/15 text-amber-600'
                      }`}>
                        {admin.stocks.sources[stock.source as keyof typeof admin.stocks.sources] ?? stock.source}
                      </span>
                    </td>
                    <td className="p-[0.85rem_0.75rem] text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-[var(--main-page-radius-md)] px-3 py-1.5 text-[0.82rem] font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--main-page-accent-soft)]"
                          onClick={() => setPriceTarget(stock)}
                        >
                          {admin.stocks.editPrice}
                        </button>
                        <button
                          type="button"
                          className={`rounded-[var(--main-page-radius-md)] px-3 py-1.5 text-[0.82rem] font-medium transition-colors ${
                            stock.source === 'admin'
                              ? 'text-[var(--main-page-danger)] hover:bg-[var(--main-page-danger)]/10'
                              : `cursor-not-allowed ${textMuted} opacity-50`
                          }`}
                          disabled={stock.source !== 'admin'}
                          title={stock.source !== 'admin' ? admin.stocks.notDeletable : undefined}
                          onClick={() => stock.source === 'admin' && setDeleteTarget(stock)}
                        >
                          {admin.actions.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className={`mt-4 flex items-center justify-between text-[0.85rem] ${textSoft}`}>
            <span>
              {meta.total} resultados — Página {meta.page} de {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className={`${button.base} ${button.secondary}`}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className={`${button.base} ${button.secondary}`}
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      {showCreate ? (
        <AdminStockCreateModal onClose={() => setShowCreate(false)} />
      ) : null}

      {priceTarget ? (
        <AdminStockPriceModal
          stock={priceTarget}
          onClose={() => setPriceTarget(null)}
        />
      ) : null}

      {deleteTarget ? (
        <div className={surface.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={surface.modalContentMd} onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 mb-2 text-text">{admin.actions.delete}</h3>
            <p className={`mb-4 ${textSoft}`}>{admin.stocks.deleteConfirm.replace('{symbol}', deleteTarget.symbol)}</p>
            <div className="mb-4 rounded-[var(--main-page-radius-md)] border border-[var(--main-page-border)] p-4">
              <strong className="font-mono text-text">{deleteTarget.symbol}</strong>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" className={`${button.base} ${button.secondary}`} onClick={() => setDeleteTarget(null)}>
                {admin.actions.cancel}
              </button>
              <button
                type="button"
                className={`${button.base} ${button.primary}`}
                style={{ background: 'var(--main-page-danger)', borderColor: 'transparent' }}
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? admin.actions.saving : admin.actions.delete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
