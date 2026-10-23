export const button = {
  base: 'inline-flex items-center justify-center gap-[0.6rem] min-h-[42px] px-4 py-2.5 rounded-[var(--main-page-radius-md)] transition-all duration-[var(--main-page-transition)]',
  primary: '[background:var(--gradient-primary-button)] text-[#10252b] font-semibold shadow-[0_8px_20px_var(--main-page-accent-shadow)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-[0.72] disabled:transform-none',
  secondary: '[background:var(--gradient-secondary-button)] text-[var(--color-text)] border border-[var(--main-page-border)] shadow-[var(--main-page-shadow-soft)] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-[0.72] disabled:transform-none',
  themeToggle: 'inline-flex items-center justify-center gap-[0.5rem] min-h-[40px] px-3 py-2 rounded-[var(--main-page-radius-md)] transition-all duration-[var(--main-page-transition)] [background:var(--gradient-secondary-button)] text-[var(--color-text)] border border-[var(--main-page-border)] hover:border-[var(--main-page-border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2',
}

export const gradient = {
  hero: '[background:var(--gradient-hero)]',
  sidebar: '[background:var(--gradient-sidebar)]',
  card: '[background:var(--gradient-card-surface)]',
  heroPanel: '[background:var(--gradient-hero-panel)]',
  pulseCard: '[background:var(--gradient-pulse-card)]',
  chart: '[background:var(--gradient-chart)]',
  tabActive: '[background:var(--gradient-tab-active)]',
  tabInactive: '[background:var(--gradient-tab-inactive)]',
  metricCard: '[background:var(--gradient-metric-surface)]',
}

export const surface = {
  xl: 'rounded-[var(--main-page-radius-xl)] shadow-[var(--main-page-shadow)] border border-[var(--main-page-border)] backdrop-blur-xl',
  lg: 'rounded-[var(--main-page-radius-lg)] shadow-[var(--main-page-shadow)] border border-[var(--main-page-border)] backdrop-blur-xl',
  md: 'rounded-[var(--main-page-radius-md)] shadow-[var(--main-page-shadow-soft)] border border-[var(--main-page-border)]',
  summaryCard: 'rounded-[var(--main-page-radius-xl)] shadow-[var(--main-page-shadow)] border border-[var(--main-page-border)] backdrop-blur-xl [background:var(--gradient-card-surface)] p-[1.1rem] transition-all duration-[var(--main-page-transition)] hover:-translate-y-0.5',
  inverseCard: 'rounded-[var(--main-page-radius-md)] border border-[var(--main-page-inverse-border)] [background:var(--gradient-metric-surface)]',
  tableWrapper: 'overflow-auto rounded-[calc(var(--main-page-radius-md)-2px)] border border-[var(--main-page-border)] bg-[var(--main-page-surface-strong)]',
  sidebarNavLink: 'flex items-center gap-3 rounded-[var(--main-page-radius-md)] px-3 py-2.5 text-white transition-colors',
  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
  modalContent: 'w-full max-w-lg rounded-[var(--main-page-radius-lg)] border border-[var(--main-page-border)] bg-[var(--main-page-surface-strong)] p-6 shadow-[var(--main-page-shadow)]',
  modalContentMd: 'w-full max-w-md rounded-[var(--main-page-radius-lg)] border border-[var(--main-page-border)] bg-[var(--main-page-surface-strong)] p-6 shadow-[var(--main-page-shadow)]',
  strong: '[background:var(--main-page-surface-strong)]',
  innerCard: 'rounded-[var(--main-page-radius-md)] border border-[var(--main-page-border)] p-4',
  innerCardPulse: 'rounded-[var(--main-page-radius-md)] border border-[var(--main-page-border)] p-[0.95rem_1rem] shadow-[var(--main-page-shadow-soft)] [background:var(--gradient-pulse-card)]',
}
