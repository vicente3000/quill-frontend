/**
 * Custom React Query hooks for mutations (POST, PUT, DELETE operations)
 * Encapsulates mutation logic, cache invalidation, and error handling
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, ordersService, usersService, adminConfigService, adminStockService, tournamentService } from '../api-service';
import type { UpdateConfigInput, CreateSnapshotInput, CreateStockInput, UpdateStockPriceInput, CreateOrderInput } from '../validators';
import { logError } from '../error-logging';
import { showToast } from '../../components/toast-service';

/**
 * Hook for user login mutation
 * No automatic cache invalidation (handled by auth context)
 */
export function useLoginMutation() {
  return useMutation({
    mutationFn: authService.login,
    onError: (error) => {
      logError('[Mutation] Login failed:', error);
    },
  });
}

/**
 * Hook for user registration mutation
 * No automatic cache invalidation
 */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: authService.register,
    onError: (error) => {
      logError('[Mutation] Registration failed:', error);
    },
  });
}

/**
 * Hook for creating a new order
 * Invalidates related cache keys on success to refresh data
 */
/**
 * Hook for updating user profile
 * Invalidates profile cache on success
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: () => {
      console.log('[Mutation] Profile updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      logError('[Mutation] Profile update failed:', error);
    },
  });
}

/**
 * Hook for changing email
 * No cache invalidation — forces re-login
 */
export function useChangeEmailMutation() {
  return useMutation({
    mutationFn: usersService.changeEmail,
    onError: (error) => {
      logError('[Mutation] Email change failed:', error);
    },
  });
}

/**
 * Hook for changing password
 * No cache invalidation — forces re-login
 */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: usersService.changePassword,
    onError: (error) => {
      logError('[Mutation] Password change failed:', error);
    },
  });
}

/**
 * Hook for adding symbols to watchlist
 */
export function useAddToWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.addToWatchlist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      logError('[Mutation] Add to watchlist failed:', error);
    },
  });
}

/**
 * Hook for removing symbol from watchlist
 */
export function useRemoveFromWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.removeFromWatchlist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      logError('[Mutation] Remove from watchlist failed:', error);
    },
  });
}

/**
 * Hook for sending a friend request
 */
export function useSendFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.sendFriendRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      logError('[Mutation] Send friend request failed:', error);
    },
  });
}

/**
 * Hook for responding to a friend request (accept)
 */
export function useRespondToFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { status: 'accepted' } }) =>
      usersService.respondToFriendRequest(userId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['friends'] });
      void queryClient.invalidateQueries({ queryKey: ['friends', 'requests'] });
    },
    onError: (error) => {
      logError('[Mutation] Respond to friend request failed:', error);
    },
  });
}

/**
 * Hook for removing a friend
 */
export function useRemoveFriendMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.removeFriend,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      logError('[Mutation] Remove friend failed:', error);
    },
  });
}

export function useCreateOrderMutation(tournamentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: CreateOrderInput) => {
      if (tournamentId) {
        await tournamentService.createOrder({ id: tournamentId, order });
      } else {
        await ordersService.create(order);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['portfolio', 'summary'] });
      void queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
      void queryClient.invalidateQueries({ queryKey: ['trades', 'recent'] });
      if (tournamentId) {
        void queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      }
    },
    onError: (error) => {
      logError('[Mutation] Order creation failed:', error);
    },
  });
}

function invalidateTournament(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  void queryClient.invalidateQueries({ queryKey: ['tournaments'] });
  if (id) void queryClient.invalidateQueries({ queryKey: ['tournaments', id] });
}

export function useCreateTournamentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tournamentService.create,
    onSuccess: () => invalidateTournament(queryClient),
  });
}

export function useUpdateTournamentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tournamentService.update,
    onSuccess: (_, variables) => invalidateTournament(queryClient, variables.id),
  });
}

export function useJoinTournamentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tournamentService.join,
    onSuccess: (_, variables) => invalidateTournament(queryClient, variables.id),
  });
}

export function useTournamentActionMutation(action: 'publish' | 'start' | 'finish' | 'cancel') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tournamentService[action](id),
    onSuccess: (_, id) => invalidateTournament(queryClient, id),
  });
}

export function useRotateTournamentCodeMutation() {
  return useMutation({ mutationFn: tournamentService.rotateJoinCode });
}

export function useRemoveTournamentParticipantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tournamentService.removeParticipant,
    onSuccess: (_, variables) => invalidateTournament(queryClient, variables.id),
  });
}

export function useCancelTournamentOrderMutation(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => tournamentService.cancelOrder({ id: tournamentId, orderId }),
    onSuccess: () => invalidateTournament(queryClient, tournamentId),
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'pending'] });
      void queryClient.invalidateQueries({ queryKey: ['portfolio', 'summary'] });
      void queryClient.invalidateQueries({ queryKey: ['trades', 'recent'] });
    },
    onError: (error) => {
      logError('[Mutation] Order cancellation failed:', error);
    },
  });
}

/**
 * Hook for updating an admin config
 */
export function useUpdateAdminConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateConfigInput }) =>
      adminConfigService.update(key, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'configs'] });
      showToast('Configuración actualizada correctamente.');
    },
    onError: (error) => {
      logError('[Mutation] Admin config update failed:', error);
    },
  });
}

/**
 * Hook for creating an admin snapshot
 */
export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CreateSnapshotInput) =>
      adminConfigService.createSnapshot(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'snapshots'] });
    },
    onError: (error) => {
      logError('[Mutation] Snapshot create failed:', error);
    },
  });
}

/**
 * Hook for restoring an admin snapshot
 */
export function useRestoreSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminConfigService.restoreSnapshot,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'configs'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'snapshots'] });
      showToast('Respaldo restaurado correctamente.');
    },
    onError: (error) => {
      logError('[Mutation] Snapshot restore failed:', error);
    },
  });
}

/**
 * Hook for creating a new admin stock
 */
export function useCreateAdminStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockInput) => adminStockService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stocks'] });
      showToast('Acción creada correctamente.');
    },
    onError: (error) => {
      logError('[Mutation] Admin stock create failed:', error);
    },
  });
}

/**
 * Hook for updating an admin stock price
 */
export function useUpdateAdminStockPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ symbol, data }: { symbol: string; data: UpdateStockPriceInput }) =>
      adminStockService.updatePrice(symbol, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stocks'] });
      void queryClient.invalidateQueries({ queryKey: ['market', 'stocks'] });
      showToast('Precio actualizado. La próxima actualización del proveedor sobrescribirá este valor.');
    },
    onError: (error) => {
      logError('[Mutation] Admin stock price update failed:', error);
    },
  });
}

/**
 * Hook for deleting an admin stock
 */
export function useDeleteAdminStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (symbol: string) => adminStockService.remove(symbol),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stocks'] });
      showToast('Acción eliminada correctamente.');
    },
    onError: (error) => {
      logError('[Mutation] Admin stock delete failed:', error);
    },
  });
}
