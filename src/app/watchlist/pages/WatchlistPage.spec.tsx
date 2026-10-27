import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { TournamentModeProvider } from '../../tournaments/context/TournamentModeContext';
import { WatchlistPage } from './WatchlistPage';

const { marketRefetchMock, watchlistRefetchMock } = vi.hoisted(() => ({
  marketRefetchMock: vi.fn(),
  watchlistRefetchMock: vi.fn(),
}));

vi.mock('../../auth/hooks/use-auth', () => ({
  useAuth: () => ({ user: { watchlist: [] }, updateUser: vi.fn() }),
}));

vi.mock('../../../shared/api/hooks', () => ({
  useTournament: () => ({ data: undefined }),
  useWatchlist: () => ({
    isError: true,
    isLoading: false,
    refetch: watchlistRefetchMock,
  }),
  useMarketStocks: () => ({
    isError: true,
    isLoading: false,
    refetch: marketRefetchMock,
  }),
  useAddToWatchlistMutation: () => ({ isPending: false }),
  useRemoveFromWatchlistMutation: () => ({ isPending: false }),
}));

describe('WatchlistPage', () => {
  it('muestra un error y permite reintentar sin simular una lista vacia', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TournamentModeProvider>
        <WatchlistPage />
      </TournamentModeProvider>,
    );

    expect(screen.getByText(/No fue posible cargar la lista de seguimiento/)).toBeInTheDocument();
    expect(screen.queryByText('Sin seguimiento')).not.toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    });

    expect(watchlistRefetchMock).toHaveBeenCalledOnce();
    expect(marketRefetchMock).toHaveBeenCalledOnce();
  });
});
