import { delay } from './utils';
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
  type AddWatchlistInput,
  type FriendActionInput,
  FriendSchema,
  FriendRequestSchema,
  WatchlistResponseSchema,
  MessageResponseSchema,
  CurrencyRateSchema,
  AdminConfigSchema,
  AdminConfigHistorySchema,
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
import {
  STUB_AUTH_RESPONSE,
  STUB_REGISTER_RESPONSE,
  STUB_ORDERS,
  STUB_PORTFOLIO,
  STUB_QUOTES,
  STUB_TRADES,
  STUB_USER_PROFILE,
  STUB_FRIENDS,
  STUB_FRIEND_REQUESTS,
  STUB_CURRENCY_RATES,
  STUB_ADMIN_CONFIGS,
  STUB_ADMIN_SNAPSHOTS,
  buildStubHistory,
  STUB_ADMIN_CONFIG_HISTORY,
  STUB_ADMIN_STOCKS,
  STUB_ADMIN_CONTESTS,
  STUB_ENROLLED_CONTEST_IDS,
} from './stub-data';

const NETWORK_LATENCY_MS = 250;

export const authService = {
  login: async (_credentials: LoginInput) => {
    await delay(NETWORK_LATENCY_MS);
    return AuthResponseSchema.parse(STUB_AUTH_RESPONSE);
  },

  register: async (_data: RegisterInput) => {
    await delay(NETWORK_LATENCY_MS);
    return RegisterResponseSchema.parse(STUB_REGISTER_RESPONSE);
  },
};

export const portfolioService = {
  getSummary: async () => {
    await delay(NETWORK_LATENCY_MS);
    return PortfolioSummarySchema.parse(STUB_PORTFOLIO);
  },
};

export const marketService = {
  getStatus: async () => {
    await delay(NETWORK_LATENCY_MS);
    return MarketStatusSchema.parse({
      open: false,
      openTime: '09:30',
      closeTime: '16:00',
      closedDays: [6, 7],
      currentTime: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }),
    });
  },

  getStocks: async () => {
    await delay(NETWORK_LATENCY_MS);
    return StockQuoteSchema.array().parse(STUB_QUOTES);
  },

  getStockHistory: async (symbol: string, limit: number = 24) => {
    await delay(NETWORK_LATENCY_MS);
    return PricePointSchema.array().parse(buildStubHistory(symbol, limit));
  },
};

export const ordersService = {
  getPending: async () => {
    await delay(NETWORK_LATENCY_MS);
    return OrderRecordSchema.array().parse(STUB_ORDERS);
  },

  create: async (_order: CreateOrderInput) => {
    await delay(NETWORK_LATENCY_MS);
  },

  cancel: async (id: string) => {
    await delay(NETWORK_LATENCY_MS);
    const order = STUB_ORDERS.find((o) => o._id === id);
    if (!order) throw new Error(`Order not found: ${id}`);
    return OrderRecordSchema.parse({ ...order, status: 'CANCELLED' });
  },
};

export const tradesService = {
  getRecent: async (limit: number = 8) => {
    await delay(NETWORK_LATENCY_MS);
    return TradeRecordSchema.array().parse(STUB_TRADES.slice(0, limit));
  },
};

export const usersService = {
  getProfile: async () => {
    await delay(NETWORK_LATENCY_MS);
    return UserProfileSchema.parse(STUB_USER_PROFILE);
  },

  updateProfile: async (_data: UpdateProfileInput) => {
    await delay(NETWORK_LATENCY_MS);
    return UserProfileSchema.parse(STUB_USER_PROFILE);
  },

  changeEmail: async (_data: ChangeEmailInput) => {
    await delay(NETWORK_LATENCY_MS);
  },

  changePassword: async (_data: ChangePasswordInput) => {
    await delay(NETWORK_LATENCY_MS);
  },

  getWatchlist: async () => {
    await delay(NETWORK_LATENCY_MS);
    const watchlistSymbols = STUB_USER_PROFILE.watchlist;
    return StockQuoteSchema.array().parse(
      STUB_QUOTES.filter((q) => watchlistSymbols.includes(q.symbol)),
    );
  },

  addToWatchlist: async (data: AddWatchlistInput) => {
    await delay(NETWORK_LATENCY_MS);
    STUB_USER_PROFILE.watchlist = [
      ...new Set([...STUB_USER_PROFILE.watchlist, ...data.symbols]),
    ];
    return WatchlistResponseSchema.parse({
      watchlist: STUB_USER_PROFILE.watchlist,
    });
  },

  removeFromWatchlist: async (symbol: string) => {
    await delay(NETWORK_LATENCY_MS);
    STUB_USER_PROFILE.watchlist = STUB_USER_PROFILE.watchlist.filter(
      (s: string) => s !== symbol,
    );
    return WatchlistResponseSchema.parse({
      watchlist: STUB_USER_PROFILE.watchlist,
    });
  },

  getFriends: async () => {
    await delay(NETWORK_LATENCY_MS);
    return FriendSchema.array().parse(STUB_FRIENDS);
  },

  getFriendRequests: async () => {
    await delay(NETWORK_LATENCY_MS);
    return FriendRequestSchema.array().parse(STUB_FRIEND_REQUESTS);
  },

  sendFriendRequest: async (_userId: string) => {
    await delay(NETWORK_LATENCY_MS);
    return MessageResponseSchema.parse({ message: 'Solicitud enviada.' });
  },

  respondToFriendRequest: async (_userId: string, _data: FriendActionInput) => {
    await delay(NETWORK_LATENCY_MS);
    return MessageResponseSchema.parse({ message: 'Solicitud aceptada.' });
  },

  removeFriend: async (_userId: string) => {
    await delay(NETWORK_LATENCY_MS);
    return MessageResponseSchema.parse({ message: 'Amigo eliminado.' });
  },
};

export const currencyService = {
  getRates: async () => {
    await delay(NETWORK_LATENCY_MS);
    return CurrencyRateSchema.array().parse(STUB_CURRENCY_RATES);
  },

  getRate: async (symbol: string) => {
    await delay(NETWORK_LATENCY_MS);
    const rate = STUB_CURRENCY_RATES.find((r) => r.symbol === symbol);
    if (!rate) throw new Error(`Currency rate not found: ${symbol}`);
    return CurrencyRateSchema.parse(rate);
  },
};

export const adminConfigService = {
  getAll: async () => {
    await delay(NETWORK_LATENCY_MS);
    return AdminConfigSchema.array().parse(STUB_ADMIN_CONFIGS);
  },

  get: async (key: string) => {
    await delay(NETWORK_LATENCY_MS);
    const config = STUB_ADMIN_CONFIGS.find((c) => c.key === key);
    if (!config) throw new Error(`Admin config not found: ${key}`);
    return AdminConfigSchema.parse(config);
  },

  getHistory: async (_key: string) => {
    await delay(NETWORK_LATENCY_MS);
    return AdminConfigHistorySchema.array().parse(STUB_ADMIN_CONFIG_HISTORY);
  },

  // create: async (data: CreateConfigInput) => {
  //   await delay(NETWORK_LATENCY_MS);
  //   const config = {
  //     ...data,
  //     inUse: true,
  //     lastUsedAt: null,
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   };
  //   return AdminConfigSchema.parse(config);
  // },

  update: async (_key: string, data: UpdateConfigInput) => {
    await delay(NETWORK_LATENCY_MS);
    const existing = STUB_ADMIN_CONFIGS[0];
    const config = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return AdminConfigSchema.parse(config);
  },

  // remove: async (_key: string) => {
  //   await delay(NETWORK_LATENCY_MS);
  //   return { message: `Configuración "${_key}" eliminada.` };
  // },

  getSnapshots: async () => {
    await delay(NETWORK_LATENCY_MS);
    return AdminSnapshotSchema.array().parse(STUB_ADMIN_SNAPSHOTS);
  },

  getSnapshot: async (id: string) => {
    await delay(NETWORK_LATENCY_MS);
    const snapshot = STUB_ADMIN_SNAPSHOTS.find((s) => s._id === id);
    if (!snapshot) throw new Error(`Snapshot not found: ${id}`);
    return AdminSnapshotSchema.parse(snapshot);
  },

  createSnapshot: async (data?: CreateSnapshotInput) => {
    await delay(NETWORK_LATENCY_MS);
    const snapshot = {
      _id: `snapshot-${Date.now()}`,
      configs: {
        COMMISSION_RATE: 0.005,
        INITIAL_BALANCE: 100000,
        MARKET_HOURS_OPEN: '09:30',
        MARKET_HOURS_CLOSED: '16:00',
        MARKET_PROVIDER: 'mock',
        SIMULATION_STRATEGY: 'flat',
      },
      name: data?.name ?? `Snapshot ${new Date().toISOString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return AdminSnapshotSchema.parse(snapshot);
  },

  restoreSnapshot: async (_id: string) => {
    await delay(NETWORK_LATENCY_MS);
    const snapshot = STUB_ADMIN_SNAPSHOTS[0];
    return AdminSnapshotSchema.parse(snapshot);
  },
};

export const adminStockService = {
  list: async (params?: { search?: string; source?: string; page?: number; limit?: number }) => {
    await delay(NETWORK_LATENCY_MS);
    let stocks = [...STUB_ADMIN_STOCKS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      stocks = stocks.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    if (params?.source) {
      stocks = stocks.filter((s) => s.source === params.source);
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const total = stocks.length;
    const totalPages = Math.ceil(total / limit);
    const data = stocks.slice((page - 1) * limit, page * limit);
    return AdminStockListResponseSchema.parse({ data, meta: { total, page, limit, totalPages } });
  },

  create: async (data: CreateStockInput) => {
    await delay(NETWORK_LATENCY_MS);
    const existing = STUB_ADMIN_STOCKS.find((s) => s.symbol === data.symbol);
    if (existing) {
      throw new Error(`El símbolo "${data.symbol}" ya existe.`);
    }
    const stock = {
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      currency: data.currency ?? 'CLP',
      close: data.close,
      open: data.close,
      high: data.close,
      low: data.close,
      previousClose: data.close,
      dayChangePercentage: 0,
      source: 'admin',
      volume: 0,
      baseVolatility: data.baseVolatility ?? 0.015,
      baseDrift: data.baseDrift ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return AdminStockSchema.parse(stock);
  },

  updatePrice: async (symbol: string, data: UpdateStockPriceInput) => {
    await delay(NETWORK_LATENCY_MS);
    const index = STUB_ADMIN_STOCKS.findIndex((s) => s.symbol === symbol);
    if (index === -1) {
      throw new Error(`Stock "${symbol}" no encontrado.`);
    }
    const existing = STUB_ADMIN_STOCKS[index];
    const updated = {
      ...existing,
      close: data.price,
      previousClose: existing.close,
      dayChangePercentage: ((data.price - existing.close) / existing.close) * 100,
      updatedAt: new Date().toISOString(),
    };
    return AdminStockSchema.parse(updated);
  },

  remove: async (symbol: string) => {
    await delay(NETWORK_LATENCY_MS);
    const stock = STUB_ADMIN_STOCKS.find((s) => s.symbol === symbol);
    if (!stock) {
      throw new Error(`Stock "${symbol}" no encontrado.`);
    }
    if (stock.source !== 'admin') {
      throw new Error(`No se puede eliminar un stock administrado por el proveedor.`);
    }
    return MessageResponseSchema.parse({ message: `Stock "${symbol}" eliminado.` });
  },
};

const stubNow = new Date();
const stubTournament = {
  _id: 'tournament-demo-1',
  ownerId: 'teacher-demo',
  name: 'Liga de inversiones UCN',
  description: 'Torneo de demostracion con datos reales del mercado.',
  startAt: new Date(stubNow.getTime() - 24 * 60 * 60 * 1000).toISOString(),
  endAt: new Date(stubNow.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'ACTIVE' as const,
  visibility: 'PUBLIC' as const,
  initialBalance: 1_000_000,
  commissionRate: 0.005,
  baseCurrency: 'CLP',
  maxParticipants: 100,
  participantCount: 12,
  createdAt: stubNow.toISOString(),
  updatedAt: stubNow.toISOString(),
};

const stubTournamentPortfolio = {
  tournamentId: stubTournament._id,
  baseCurrency: 'CLP',
  ...STUB_PORTFOLIO,
  returnPercentage: 2.45,
  finalizedAt: null,
};

export const tournamentService = {
  list: async (_params?: TournamentListParams) => {
    await delay(NETWORK_LATENCY_MS);
    return TournamentListResponseSchema.parse({
      data: [stubTournament],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
  },

  get: async (_id: string) => {
    await delay(NETWORK_LATENCY_MS);
    return TournamentSchema.parse(stubTournament);
  },

  create: async (data: CreateTournamentInput) => {
    await delay(NETWORK_LATENCY_MS);
    return TournamentCreateResponseSchema.parse({
      tournament: {
        ...stubTournament,
        ...data,
        _id: `tournament-${Date.now()}`,
        status: 'DRAFT',
        participantCount: 0,
        commissionRate: data.commissionRate ?? 0,
        visibility: data.visibility ?? 'PRIVATE',
      },
      joinCode: 'QUILL123',
    });
  },

  update: async ({ data }: { id: string; data: UpdateTournamentInput }) => {
    await delay(NETWORK_LATENCY_MS);
    return TournamentSchema.parse({ ...stubTournament, ...data });
  },

  publish: async (_id: string) => TournamentSchema.parse({ ...stubTournament, status: 'OPEN' }),
  start: async (_id: string) => TournamentSchema.parse({ ...stubTournament, status: 'ACTIVE' }),
  finish: async (_id: string) => TournamentSchema.parse({ ...stubTournament, status: 'FINISHED' }),
  cancel: async (_id: string) => TournamentSchema.parse({ ...stubTournament, status: 'CANCELLED' }),

  join: async ({ id }: { id: string; joinCode?: string }) => {
    await delay(NETWORK_LATENCY_MS);
    return TournamentParticipantSchema.parse({
      _id: 'participant-demo',
      tournamentId: id,
      userId: STUB_USER_PROFILE.id,
      availableBalance: stubTournament.initialBalance,
      reservedBalance: 0,
      initialBalance: stubTournament.initialBalance,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
    });
  },

  rotateJoinCode: async (_id: string) => ({ joinCode: 'NUEVO123' }),
  getParticipants: async (_id: string) => [],
  removeParticipant: async (_input: { id: string; userId: string }) => ({ message: 'Participante retirado.' }),
  getPortfolio: async (_id: string) => TournamentPortfolioSchema.parse(stubTournamentPortfolio),
  createOrder: async ({ order }: { id: string; order: CreateOrderInput }) =>
    TournamentOrderSchema.parse({
      _id: `order-${Date.now()}`,
      ...order,
      status: order.type === 'MARKET' ? 'EXECUTED' : 'PENDING',
      createdAt: new Date().toISOString(),
    }),
  getOrders: async (_id: string, _status?: string) => TournamentOrderSchema.array().parse(STUB_ORDERS),
  cancelOrder: async ({ orderId }: { id: string; orderId: string }) =>
    TournamentOrderSchema.parse({ ...STUB_ORDERS[0], _id: orderId, status: 'CANCELLED' }),
  getTrades: async (_id: string, limit = 50) => TournamentTradeSchema.array().parse(STUB_TRADES.slice(0, limit)),
  getLeaderboard: async (_id: string, _params?: LeaderboardParams) =>
    LeaderboardResponseSchema.parse({
      data: [
        {
          participantId: 'participant-demo',
          userId: STUB_USER_PROFILE.id,
          fullName: STUB_USER_PROFILE.fullName,
          username: STUB_USER_PROFILE.username ?? null,
          accountType: 'ucn',
          availableBalance: STUB_PORTFOLIO.availableBalance,
          reservedBalance: STUB_PORTFOLIO.reservedBalance,
          investedValue: STUB_PORTFOLIO.investedValue,
          totalEquity: STUB_PORTFOLIO.totalEquity,
          returnPercentage: 2.45,
          unrealizedProfitLoss: STUB_PORTFOLIO.unrealizedProfitLoss,
          totalShares: STUB_PORTFOLIO.positions.reduce((sum, position) => sum + position.quantity, 0),
          positionCount: STUB_PORTFOLIO.positions.length,
          tradeCount: STUB_TRADES.length,
          rank: 1,
          officialRank: null,
          status: 'ACTIVE',
        },
      ],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    }),
  getManagedPortfolio: async (_id: string, _userId: string) => TournamentPortfolioSchema.parse(stubTournamentPortfolio),
  getManagedOrders: async (_id: string, _userId: string) => TournamentOrderSchema.array().parse(STUB_ORDERS),
  getManagedTrades: async (_id: string, _userId: string, limit = 50) => TournamentTradeSchema.array().parse(STUB_TRADES.slice(0, limit)),
};

function resolveStubContestStatus(startDate: string, endDate: string) {
  const now = Date.now();
  if (now < new Date(startDate).getTime()) return 'UPCOMING';
  if (now > new Date(endDate).getTime()) return 'FINISHED';
  return 'ACTIVE';
}

export const adminContestService = {
  list: async () => {
    await delay(NETWORK_LATENCY_MS);
    const sorted = [...STUB_ADMIN_CONTESTS].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
    return ContestListSchema.parse(sorted);
  },

  getById: async (id: string) => {
    await delay(NETWORK_LATENCY_MS);
    const contest = STUB_ADMIN_CONTESTS.find((c) => c.id === id);
    if (!contest) {
      throw new Error('Concurso no encontrado.');
    }
    return ContestSchema.parse(contest);
  },

  create: async (data: CreateContestInput) => {
    await delay(NETWORK_LATENCY_MS);
    const now = new Date().toISOString();
    const contest = ContestSchema.parse({
      id: `stub-contest-${STUB_ADMIN_CONTESTS.length + 1}-${Date.now()}`,
      name: data.name,
      description: data.description ?? null,
      startDate: data.startDate,
      endDate: data.endDate,
      initialBalance: data.initialBalance,
      mode: data.mode,
      allowedAccountTypes: data.allowedAccountTypes,
      status: resolveStubContestStatus(data.startDate, data.endDate),
      participantsCount: 0,
      createdBy: 'stub-admin',
      createdAt: now,
      updatedAt: now,
    });
    STUB_ADMIN_CONTESTS.unshift(contest);
    return contest;
  },
};

export const contestsService = {
  list: async () => {
    await delay(NETWORK_LATENCY_MS);
    const sorted = [...STUB_ADMIN_CONTESTS]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .map((contest) => ({ ...contest, isEnrolled: STUB_ENROLLED_CONTEST_IDS.has(contest.id) }));
    return UserContestListSchema.parse(sorted);
  },

  enroll: async (id: string) => {
    await delay(NETWORK_LATENCY_MS);
    const contest = STUB_ADMIN_CONTESTS.find((c) => c.id === id);
    if (!contest) {
      throw new Error('Concurso no encontrado.');
    }
    if (contest.status === 'FINISHED') {
      throw new Error('El concurso ya finalizó.');
    }
    if (contest.mode === 'TEAM') {
      throw new Error('Este concurso es por equipos; la inscripción individual no está disponible.');
    }
    if (STUB_ENROLLED_CONTEST_IDS.has(id)) {
      throw new Error('Ya estás inscrito en este concurso.');
    }
    STUB_ENROLLED_CONTEST_IDS.add(id);
    contest.participantsCount += 1;
    return ContestEnrollmentSchema.parse({
      contestId: id,
      userId: STUB_AUTH_RESPONSE.user.id,
      joinedAt: new Date().toISOString(),
    });
  },
};
