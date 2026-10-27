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
  ContestSchema,
  ContestListSchema,
  type CreateContestInput,
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
      createdBy: 'stub-admin',
      createdAt: now,
      updatedAt: now,
    });
    STUB_ADMIN_CONTESTS.unshift(contest);
    return contest;
  },
};
