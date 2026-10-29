import type { ReactNode } from 'react';
import { useContests } from '../../../shared/api/hooks';
import { EmptyState } from '../../../shared/components/EmptyState';
import { QueryErrorState } from '../../../shared/components/QueryErrorState';
import { SectionCard } from '../../../shared/components/SectionCard';
import { contests } from '../../../shared/content/strings';
import { loadingScreen } from '../../../shared/design-system/layout';
import { AppShell } from '../../../shared/layout/AppShell';
import { ContestCard } from '../components/ContestCard';

export function ContestsPage() {
  const contestsQuery = useContests();

  let content: ReactNode;

  if (contestsQuery.isLoading) {
    content = <div className={loadingScreen}>{contests.loading}</div>;
  } else if (contestsQuery.isError) {
    content = (
      <QueryErrorState
        message={contests.loadError}
        onRetry={() => {
          void contestsQuery.refetch();
        }}
      />
    );
  } else if (!contestsQuery.data?.length) {
    content = <EmptyState title={contests.empty.title} description={contests.empty.description} />;
  } else {
    content = (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {contestsQuery.data.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    );
  }

  return (
    <AppShell title={contests.title} subtitle={contests.subtitle}>
      <SectionCard title={contests.listTitle}>{content}</SectionCard>
    </AppShell>
  );
}
