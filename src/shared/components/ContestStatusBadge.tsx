import type { ContestStatus } from '../api/validators';
import { admin } from '../content/strings';
import { CONTEST_STATUS_STYLES } from '../utils/contest-format';

interface ContestStatusBadgeProps {
  status: ContestStatus;
}

export function ContestStatusBadge({ status }: ContestStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.78rem] font-medium ${CONTEST_STATUS_STYLES[status]}`}
    >
      {admin.contests.statuses[status]}
    </span>
  );
}
