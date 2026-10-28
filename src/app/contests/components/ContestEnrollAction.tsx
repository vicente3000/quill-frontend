import { useEnrollInContest } from '../../../shared/api/hooks';
import type { UserContest } from '../../../shared/api/validators';
import { contests } from '../../../shared/content/strings';
import { button } from '../../../shared/design-system/surfaces';

interface ContestEnrollActionProps {
  contest: UserContest;
}

const ENROLLED_BADGE =
  'inline-flex items-center rounded-full bg-green-500/15 px-3 py-1.5 text-[0.85rem] font-semibold text-green-600';

export function ContestEnrollAction({ contest }: ContestEnrollActionProps) {
  const enrollMutation = useEnrollInContest();
  const { actions } = contests;

  if (contest.isEnrolled) {
    return <span className={ENROLLED_BADGE}>{contests.enrolled}</span>;
  }

  if (contest.status === 'FINISHED') {
    return (
      <button type="button" disabled className={`${button.base} ${button.secondary}`}>
        {actions.finished}
      </button>
    );
  }

  if (contest.mode === 'TEAM') {
    return (
      <button type="button" disabled className={`${button.base} ${button.secondary}`}>
        {actions.team}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${button.base} ${button.primary}`}
      disabled={enrollMutation.isPending}
      onClick={() => enrollMutation.mutate({ id: contest.id, name: contest.name })}
    >
      {enrollMutation.isPending ? actions.enrolling : actions.enroll}
    </button>
  );
}
