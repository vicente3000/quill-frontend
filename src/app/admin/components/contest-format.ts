import type { Contest, ContestAccountType } from '../../../shared/api/validators';
import { admin } from '../../../shared/content/strings';

export function formatContestBalance(value: number) {
  return `$${value.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
}

export function formatContestDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL');
}

export function formatContestAccountTypes(types: ContestAccountType[]) {
  return types.map((type) => admin.contests.accountTypes[type]).join(' · ');
}

export const CONTEST_STATUS_STYLES: Record<Contest['status'], string> = {
  UPCOMING: 'bg-blue-500/15 text-blue-600',
  ACTIVE: 'bg-green-500/15 text-green-600',
  FINISHED: 'bg-[var(--main-page-surface-muted)] text-[var(--main-page-text-soft)]',
};
