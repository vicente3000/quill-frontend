import type { UserContest } from '../../../shared/api/validators';
import { ContestStatusBadge } from '../../../shared/components/ContestStatusBadge';
import { admin, contests } from '../../../shared/content/strings';
import { gradient, surface } from '../../../shared/design-system/surfaces';
import { textSoft } from '../../../shared/design-system/typography';
import { formatContestBalance, formatContestDate } from '../../../shared/utils/contest-format';
import { ContestEnrollAction } from './ContestEnrollAction';

interface ContestCardProps {
  contest: UserContest;
}

const DETAIL_LABEL = `m-0 text-[0.78rem] uppercase tracking-[0.08em] ${textSoft}`;
const DETAIL_VALUE = 'm-0 font-semibold text-text';

export function ContestCard({ contest }: ContestCardProps) {
  const { fields } = contests;

  return (
    <article className={`${surface.md} ${gradient.card} grid content-start gap-3 p-4`}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="m-0 text-text">{contest.name}</h4>
        <ContestStatusBadge status={contest.status} />
      </div>

      {contest.description ? <p className={`m-0 ${textSoft}`}>{contest.description}</p> : null}

      <dl className="m-0 grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
        <div>
          <dt className={DETAIL_LABEL}>{fields.mode}</dt>
          <dd className={DETAIL_VALUE}>{admin.contests.modes[contest.mode]}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL}>{fields.initialBalance}</dt>
          <dd className={`${DETAIL_VALUE} font-mono text-[0.92rem]`}>
            {formatContestBalance(contest.initialBalance)}
          </dd>
        </div>
        <div className="col-span-full">
          <dt className={DETAIL_LABEL}>{fields.dates}</dt>
          <dd className={DETAIL_VALUE}>
            {contests.dateRange(formatContestDate(contest.startDate), formatContestDate(contest.endDate))}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={textSoft}>{contests.participants(contest.participantsCount)}</span>
        <ContestEnrollAction contest={contest} />
      </div>
    </article>
  );
}
