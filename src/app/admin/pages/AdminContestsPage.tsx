import { useState } from 'react';
import { useAdminContests } from '../../../shared/api/hooks';
import { admin } from '../../../shared/content/strings';
import { button } from '../../../shared/design-system/surfaces';
import { loadingScreen } from '../../../shared/design-system/layout';
import { SectionCard } from '../../../shared/components/SectionCard';
import { QueryErrorState } from '../../../shared/components/QueryErrorState';
import { AdminContestCreateModal } from '../components/AdminContestCreateModal';
import { ContestsTable } from '../components/ContestsTable';

export function AdminContestsPage() {
  const contestsQuery = useAdminContests();
  const [showCreate, setShowCreate] = useState(false);

  if (contestsQuery.isLoading) {
    return <div className={loadingScreen}>{admin.contests.loading}</div>;
  }

  if (contestsQuery.isError) {
    return (
      <QueryErrorState
        message={admin.contests.loadError}
        onRetry={() => {
          void contestsQuery.refetch();
        }}
      />
    );
  }

  return (
    <>
      <SectionCard
        title={admin.contests.title}
        description={admin.contests.description}
        actions={
          <button
            type="button"
            className={`${button.base} ${button.primary}`}
            onClick={() => setShowCreate(true)}
          >
            {admin.contests.create}
          </button>
        }
      >
        <ContestsTable contests={contestsQuery.data ?? []} />
      </SectionCard>

      {showCreate ? <AdminContestCreateModal onClose={() => setShowCreate(false)} /> : null}
    </>
  );
}
