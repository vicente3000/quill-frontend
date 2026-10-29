import { admin } from '../../../shared/content/strings';
import { surface } from '../../../shared/design-system/surfaces';
import { table } from '../../../shared/design-system';
import { textSoft } from '../../../shared/design-system/typography';
import type { Contest } from '../../../shared/api/validators';
import { ContestStatusBadge } from '../../../shared/components/ContestStatusBadge';
import {
  formatContestAccountTypes,
  formatContestBalance,
  formatContestDate,
} from '../../../shared/utils/contest-format';

interface ContestsTableProps {
  contests: Contest[];
}

const CELL = 'p-[0.85rem_0.75rem]';

export function ContestsTable({ contests }: ContestsTableProps) {
  const { fields } = admin.contests;

  return (
    <div className={surface.tableWrapper}>
      <table className="w-full min-w-[840px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className={table.header}>{fields.name}</th>
            <th className={table.header}>{fields.mode}</th>
            <th className={table.header}>{fields.accountTypes}</th>
            <th className={table.header}>{fields.initialBalance}</th>
            <th className={table.header}>{fields.startDate}</th>
            <th className={table.header}>{fields.endDate}</th>
            <th className={table.header}>{fields.status}</th>
            <th className={table.header}>{fields.participants}</th>
          </tr>
        </thead>
        <tbody>
          {!contests.length ? (
            <tr>
              <td colSpan={8} className={`${CELL} text-center ${textSoft}`}>
                {admin.contests.empty}
              </td>
            </tr>
          ) : (
            contests.map((contest) => (
              <tr key={contest.id} className="border-b border-[var(--main-page-border)] transition-colors">
                <td className={`${CELL} font-semibold text-text`}>{contest.name}</td>
                <td className={`${CELL} text-text`}>{admin.contests.modes[contest.mode]}</td>
                <td className={`${CELL} text-text`}>{formatContestAccountTypes(contest.allowedAccountTypes)}</td>
                <td className={`${CELL} font-mono text-[0.88rem] text-text`}>
                  {formatContestBalance(contest.initialBalance)}
                </td>
                <td className={`${CELL} whitespace-nowrap text-text`}>{formatContestDate(contest.startDate)}</td>
                <td className={`${CELL} whitespace-nowrap text-text`}>{formatContestDate(contest.endDate)}</td>
                <td className={CELL}>
                  <ContestStatusBadge status={contest.status} />
                </td>
                <td className={`${CELL} font-mono text-[0.88rem] text-text`}>{contest.participantsCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
