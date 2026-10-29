import { apiClient } from './http';
import { logError } from './error-logging';
import {
  AuthResponseSchema,
  type LoginInput,
  type RegisterInput,
  RegisterResponseSchema,
  PortfolioSummarySchema,
  StockQuoteSchema,
  PricePointSchema,
  MarketStatusSchema,
  OrderRecordSchema,
  type CreateOrderInput,
  TradeRecordSchema,
  type UpdateProfileInput,
  type ChangeEmailInput,
  type ChangePasswordInput,
  UserProfileSchema,
  WatchlistResponseSchema,
  type AddWatchlistInput,
  FriendSchema,
  FriendRequestSchema,
  type FriendActionInput,
  MessageResponseSchema,
  CurrencyRateSchema,
  AdminConfigSchema,
  AdminConfigHistorySchema,
  type CreateConfigInput,
  type UpdateConfigInput,
  AdminSnapshotSchema,
  type CreateSnapshotInput,
  AdminStockSchema,
  AdminStockListResponseSchema,
  type CreateStockInput,
  type UpdateStockPriceInput,
  TournamentSchema,
  TournamentListResponseSchema,
  TournamentCreateResponseSchema,
  TournamentParticipantSchema,
  TournamentPortfolioSchema,
  TournamentOrderSchema,
  TournamentTradeSchema,
  LeaderboardResponseSchema,
  type TournamentListParams,
  type LeaderboardParams,
  type CreateTournamentInput,
  type UpdateTournamentInput,
  ContestSchema,
  ContestListSchema,
  type CreateContestInput,
  UserContestListSchema,
  ContestEnrollmentSchema,
} from './validators';

export const authService = {
  login: async (credentials: LoginInput) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return AuthResponseSchema.parse(response.data);
    } catch (error) {
      logError('[API] Login failed:', error);
      throw error;
    }
  },

  register: async (data: RegisterInput) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return RegisterResponseSchema.parse(response.data);
    } catch (error) {
      logError('[API] Registration failed:', error);
      throw error;
    }
  },
};

export const portfolioService = {
  getSummary: async () => {
    try {
      const response = await apiClient.get('/portfolio/summary');
      return PortfolioSummarySchema.parse(response.data);
    } catch (error) {
      logError('[API] Portfolio summary fetch failed:', error);
      throw error;
    }
  },
};

export const marketService = {
  getStatus: async () => {
    try {
      const response = await apiClient.get('/market/status');
      return MarketStatusSchema.parse(response.data);
    } catch (error) {
      logError('[API] Market status fetch failed:', error);
      throw error;
    }
  },

  getStocks: async () => {
    try {
      const response = await apiClient.get('/market/stocks');
      return StockQuoteSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Stock quotes fetch failed:', error);
      throw error;
    }
  },

  getStockHistory: async (symbol: string, limit: number = 24) => {
    try {
      const response = await apiClient.get(
        `/market/stocks/${symbol}/history?limit=${limit}`,
      );
      return PricePointSchema.array().parse(response.data);
    } catch (error) {
      logError(`[API] Stock history fetch failed: ${symbol}`, error);
      throw error;
    }
  },
};

export const ordersService = {
  getPending: async () => {
    try {
      const response = await apiClient.get('/orders?status=PENDING');
      return OrderRecordSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Pending orders fetch failed:', error);
      throw error;
    }
  },

  create: async (order: CreateOrderInput) => {
    try {
      await apiClient.post('/orders', order);
    } catch (error) {
      logError(`[API] Order creation failed: ${order.symbol}`, error);
      throw error;
    }
  },

  cancel: async (id: string) => {
    try {
      const response = await apiClient.patch(`/orders/${id}/cancel`);
      return OrderRecordSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Order cancellation failed: ${id}`, error);
      throw error;
    }
  },
};

export const tradesService = {
  getRecent: async (limit: number = 8) => {
    try {
      const response = await apiClient.get(`/trades?limit=${limit}`);
      return TradeRecordSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Recent trades fetch failed:', error);
      throw error;
    }
  },
};

export const usersService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return UserProfileSchema.parse(response.data);
    } catch (error) {
      logError('[API] Profile fetch failed:', error);
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileInput) => {
    try {
      const response = await apiClient.patch('/users/me', data);
      return UserProfileSchema.parse(response.data);
    } catch (error) {
      logError('[API] Profile update failed:', error);
      throw error;
    }
  },

  changeEmail: async (data: ChangeEmailInput) => {
    try {
      await apiClient.patch('/users/me/email', data);
    } catch (error) {
      logError('[API] Email change failed:', error);
      throw error;
    }
  },

  changePassword: async (data: ChangePasswordInput) => {
    try {
      await apiClient.patch('/users/me/password', data);
    } catch (error) {
      logError('[API] Password change failed:', error);
      throw error;
    }
  },

  getWatchlist: async () => {
    try {
      const response = await apiClient.get('/users/me/watchlist');
      return StockQuoteSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Watchlist fetch failed:', error);
      throw error;
    }
  },

  addToWatchlist: async (data: AddWatchlistInput) => {
    try {
      const response = await apiClient.post('/users/me/watchlist', data);
      return WatchlistResponseSchema.parse(response.data);
    } catch (error) {
      logError('[API] Watchlist add failed:', error);
      throw error;
    }
  },

  removeFromWatchlist: async (symbol: string) => {
    try {
      const response = await apiClient.delete(`/users/me/watchlist/${symbol}`);
      return WatchlistResponseSchema.parse(response.data);
    } catch (error) {
      logError('[API] Watchlist remove failed:', error);
      throw error;
    }
  },

  getFriends: async () => {
    try {
      const response = await apiClient.get('/users/me/friends');
      return FriendSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Friends fetch failed:', error);
      throw error;
    }
  },

  getFriendRequests: async () => {
    try {
      const response = await apiClient.get('/users/me/friends/requests');
      return FriendRequestSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Friend requests fetch failed:', error);
      throw error;
    }
  },

  sendFriendRequest: async (userId: string) => {
    try {
      const response = await apiClient.post(`/users/me/friends/${userId}`);
      return MessageResponseSchema.parse(response.data);
    } catch (error) {
      logError('[API] Send friend request failed:', error);
      throw error;
    }
  },

  respondToFriendRequest: async (userId: string, data: FriendActionInput) => {
    try {
      const response = await apiClient.patch(`/users/me/friends/${userId}`, data);
      return MessageResponseSchema.parse(response.data);
    } catch (error) {
      logError('[API] Friend request response failed:', error);
      throw error;
    }
  },

  removeFriend: async (userId: string) => {
    try {
      const response = await apiClient.delete(`/users/me/friends/${userId}`);
      return MessageResponseSchema.parse(response.data);
    } catch (error) {
      logError('[API] Remove friend failed:', error);
      throw error;
    }
  },
};

export const currencyService = {
  getRates: async () => {
    try {
      const response = await apiClient.get('/currency/rates');
      return CurrencyRateSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Currency rates fetch failed:', error);
      throw error;
    }
  },

  getRate: async (symbol: string) => {
    try {
      const response = await apiClient.get(`/currency/rates/${symbol}`);
      return CurrencyRateSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Currency rate fetch failed: ${symbol}`, error);
      throw error;
    }
  },
};

export const adminConfigService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/admin/config');
      return AdminConfigSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Admin configs fetch failed:', error);
      throw error;
    }
  },

  get: async (key: string) => {
    try {
      const response = await apiClient.get(`/admin/config/${key}`);
      return AdminConfigSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Admin config fetch failed: ${key}`, error);
      throw error;
    }
  },

  getHistory: async (key: string) => {
    try {
      const response = await apiClient.get(`/admin/config/${key}/history`);
      return AdminConfigHistorySchema.array().parse(response.data);
    } catch (error) {
      logError(`[API] Admin config history fetch failed: ${key}`, error);
      throw error;
    }
  },

  create: async (data: CreateConfigInput) => {
    try {
      const response = await apiClient.post('/admin/config', data);
      return AdminConfigSchema.parse(response.data);
    } catch (error) {
      logError('[API] Admin config create failed:', error);
      throw error;
    }
  },

  update: async (key: string, data: UpdateConfigInput) => {
    try {
      const response = await apiClient.put(`/admin/config/${key}`, data);
      return AdminConfigSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Admin config update failed: ${key}`, error);
      throw error;
    }
  },

  remove: async (key: string) => {
    try {
      const response = await apiClient.delete(`/admin/config/${key}`);
      return MessageResponseSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Admin config delete failed: ${key}`, error);
      throw error;
    }
  },

  getSnapshots: async () => {
    try {
      const response = await apiClient.get('/admin/config/snapshots');
      return AdminSnapshotSchema.array().parse(response.data);
    } catch (error) {
      logError('[API] Admin snapshots fetch failed:', error);
      throw error;
    }
  },

  getSnapshot: async (id: string) => {
    try {
      const response = await apiClient.get(`/admin/config/snapshots/${id}`);
      return AdminSnapshotSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Admin snapshot fetch failed: ${id}`, error);
      throw error;
    }
  },

  createSnapshot: async (data?: CreateSnapshotInput) => {
    try {
      const response = await apiClient.post('/admin/config/snapshots', data ?? {});
      return AdminSnapshotSchema.parse(response.data);
    } catch (error) {
      logError('[API] Admin snapshot create failed:', error);
      throw error;
    }
  },

  restoreSnapshot: async (id: string) => {
    try {
      const response = await apiClient.post(`/admin/config/snapshots/${id}/restore`);
      return AdminSnapshotSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Admin snapshot restore failed: ${id}`, error);
      throw error;
    }
  },
};

export const adminStockService = {
  list: async (params?: { search?: string; source?: string; page?: number; limit?: number }) => {
    try {
      const response = await apiClient.get('/admin/stocks', { params });
      return AdminStockListResponseSchema.parse(response.data);
    } catch (error) {
      logError('[API] Admin stocks fetch failed:', error);
      throw error;
    }
  },

  create: async (data: CreateStockInput) => {
    try {
      const response = await apiClient.post('/admin/stocks', data);
      return AdminStockSchema.parse(response.data);
    } catch (error) {
      logError('[API] Admin stock create failed:', error);
      throw error;
    }
  },

  updatePrice: async (symbol: string, data: UpdateStockPriceInput) => {
    try {
      const response = await apiClient.patch(`/admin/stocks/${symbol}/price`, data);
      return AdminStockSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Admin stock price update failed: ${symbol}`, error);
      throw error;
    }
  },

  remove: async (symbol: string) => {
    try {
      const response = await apiClient.delete(`/admin/stocks/${symbol}`);
      return MessageResponseSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Admin stock delete failed: ${symbol}`, error);
      throw error;
    }
  },
};

export const tournamentService = {
  list: async (params?: TournamentListParams) => {
    const response = await apiClient.get('/tournaments', { params });
    return TournamentListResponseSchema.parse(response.data);
  },

  get: async (id: string) => {
    const response = await apiClient.get(`/tournaments/${id}`);
    return TournamentSchema.parse(response.data);
  },

  create: async (data: CreateTournamentInput) => {
    const response = await apiClient.post('/tournaments', data);
    return TournamentCreateResponseSchema.parse(response.data);
  },

  update: async ({ id, data }: { id: string; data: UpdateTournamentInput }) => {
    const response = await apiClient.patch(`/tournaments/${id}`, data);
    return TournamentSchema.parse(response.data);
  },

  publish: async (id: string) => {
    const response = await apiClient.post(`/tournaments/${id}/publish`);
    return TournamentSchema.parse(response.data);
  },

  start: async (id: string) => {
    const response = await apiClient.post(`/tournaments/${id}/start`);
    return TournamentSchema.parse(response.data);
  },

  finish: async (id: string) => {
    const response = await apiClient.post(`/tournaments/${id}/finish`);
    return TournamentSchema.parse(response.data);
  },

  cancel: async (id: string) => {
    const response = await apiClient.post(`/tournaments/${id}/cancel`);
    return TournamentSchema.parse(response.data);
  },

  join: async ({ id, joinCode }: { id: string; joinCode?: string }) => {
    const response = await apiClient.post(`/tournaments/${id}/join`, { joinCode });
    return TournamentParticipantSchema.parse(response.data);
  },

  rotateJoinCode: async (id: string) => {
    const response = await apiClient.post(`/tournaments/${id}/join-code/rotate`);
    return response.data as { joinCode: string };
  },

  getParticipants: async (id: string) => {
    const response = await apiClient.get(`/tournaments/${id}/participants`);
    return TournamentParticipantSchema.array().parse(response.data);
  },

  removeParticipant: async ({ id, userId }: { id: string; userId: string }) => {
    const response = await apiClient.delete(`/tournaments/${id}/participants/${userId}`);
    return MessageResponseSchema.parse(response.data);
  },

  getPortfolio: async (id: string) => {
    const response = await apiClient.get(`/tournaments/${id}/portfolio`);
    return TournamentPortfolioSchema.parse(response.data);
  },

  createOrder: async ({ id, order }: { id: string; order: CreateOrderInput }) => {
    const response = await apiClient.post(`/tournaments/${id}/orders`, order);
    return TournamentOrderSchema.parse(response.data);
  },

  getOrders: async (id: string, status?: string) => {
    const response = await apiClient.get(`/tournaments/${id}/orders`, { params: { status } });
    return TournamentOrderSchema.array().parse(response.data);
  },

  cancelOrder: async ({ id, orderId }: { id: string; orderId: string }) => {
    const response = await apiClient.patch(`/tournaments/${id}/orders/${orderId}/cancel`);
    return TournamentOrderSchema.parse(response.data);
  },

  getTrades: async (id: string, limit = 50) => {
    const response = await apiClient.get(`/tournaments/${id}/trades`, { params: { limit } });
    return TournamentTradeSchema.array().parse(response.data);
  },

  getLeaderboard: async (id: string, params?: LeaderboardParams) => {
    const response = await apiClient.get(`/tournaments/${id}/leaderboard`, { params });
    return LeaderboardResponseSchema.parse(response.data);
  },

  getManagedPortfolio: async (id: string, userId: string) => {
    const response = await apiClient.get(`/tournaments/${id}/participants/${userId}/portfolio`);
    return TournamentPortfolioSchema.parse(response.data);
  },

  getManagedOrders: async (id: string, userId: string) => {
    const response = await apiClient.get(`/tournaments/${id}/participants/${userId}/orders`);
    return TournamentOrderSchema.array().parse(response.data);
  },

  getManagedTrades: async (id: string, userId: string, limit = 50) => {
    const response = await apiClient.get(`/tournaments/${id}/participants/${userId}/trades`, { params: { limit } });
    return TournamentTradeSchema.array().parse(response.data);
  },
};

export const adminContestService = {
  list: async () => {
    try {
      const response = await apiClient.get('/admin/contests');
      return ContestListSchema.parse(response.data);
    } catch (error) {
      logError('[API] Admin contests fetch failed:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/admin/contests/${id}`);
      return ContestSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Admin contest fetch failed: ${id}`, error);
      throw error;
    }
  },

  create: async (data: CreateContestInput) => {
    try {
      const response = await apiClient.post('/admin/contests', data);
      return ContestSchema.parse(response.data);
    } catch (error) {
      logError('[API] Admin contest create failed:', error);
      throw error;
    }
  },
};

export const contestsService = {
  list: async () => {
    try {
      const response = await apiClient.get('/contests');
      return UserContestListSchema.parse(response.data);
    } catch (error) {
      logError('[API] Contests fetch failed:', error);
      throw error;
    }
  },

  enroll: async (id: string) => {
    try {
      const response = await apiClient.post(`/contests/${id}/enrollments`);
      return ContestEnrollmentSchema.parse(response.data);
    } catch (error) {
      logError(`[API] Contest enrollment failed: ${id}`, error);
      throw error;
    }
  },
};
