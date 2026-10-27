import type {
  AuthResponse,
  OrderRecord,
  PortfolioSummary,
  PricePoint,
  RegisterResponse,
  StockQuote,
  TradeRecord,
  UserRole,
  AccountType,
} from './validators';

export const STUB_AUTH_RESPONSE: AuthResponse = {
  accessToken: 'stub-token-demo',
  user: {
    id: 'stub-user-1',
    fullName: 'Demo Quill',
    email: 'demo@quill.cl',
    role: 'investor',
    accountType: 'external',
    username: 'demo_quill',
    watchlist: ['AAPL', 'TSLA'],
    availableBalance: 2_000_000,
    reservedBalance: 0,
  },
};

export const STUB_USER_PROFILE: {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  accountType: AccountType;
  username: string;
  watchlist: string[];
  availableBalance: number;
  reservedBalance: number;
} = {
  id: 'stub-user-1',
  fullName: 'Demo Quill',
  email: 'demo@quill.cl',
  role: 'investor',
  accountType: 'external',
  username: 'demo_quill',
  watchlist: ['AAPL', 'TSLA'],
  availableBalance: 2_000_000,
  reservedBalance: 0,
};

export const STUB_REGISTER_RESPONSE: RegisterResponse = {
  message: 'Cuenta de prueba creada. Ahora puedes iniciar sesion.',
  email: 'demo@quill.cl',
};

export const STUB_QUOTES: StockQuote[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currency: 'USD',
    close: 193.12,
    open: 191.8,
    high: 194.5,
    low: 190.7,
    previousClose: 190.42,
    dayChangePercentage: 1.42,
    source: 'stubs',
    volume: 8_420_000,
    lastMarketDate: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    sector: 'Technology',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    currency: 'USD',
    close: 421.64,
    open: 424.25,
    high: 426.1,
    low: 420.8,
    previousClose: 425.11,
    dayChangePercentage: -0.82,
    source: 'stubs',
    volume: 5_130_000,
    lastMarketDate: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    sector: 'Technology',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    currency: 'USD',
    close: 176.33,
    open: 173.9,
    high: 177.8,
    low: 172.6,
    previousClose: 171.2,
    dayChangePercentage: 3,
    source: 'stubs',
    volume: 12_900_000,
    lastMarketDate: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    sector: 'Automotive',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    currency: 'USD',
    close: 182.44,
    open: 183.2,
    high: 184.1,
    low: 181.6,
    previousClose: 183.18,
    dayChangePercentage: -0.4,
    source: 'stubs',
    volume: 4_780_000,
    lastMarketDate: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    sector: 'Consumer Discretionary',
  },
];

export const STUB_PORTFOLIO: PortfolioSummary = {
  availableBalance: 10_000,
  reservedBalance: 1_000,
  investedValue: 43_600,
  totalEquity: 54_600,
  unrealizedProfitLoss: 2_000,
  positions: [
    {
      symbol: 'AAPL',
      quantity: 120,
      reservedQuantity: 0,
      averageCost: 182.5,
      marketPrice: 193.12,
      marketValue: 23_174.4,
      unrealizedProfitLoss: 1_274.4,
    },
    {
      symbol: 'MSFT',
      quantity: 40,
      reservedQuantity: 0,
      averageCost: 410,
      marketPrice: 421.64,
      marketValue: 16_865.6,
      unrealizedProfitLoss: 465.6,
    },
    {
      symbol: 'TSLA',
      quantity: 75,
      reservedQuantity: 10,
      averageCost: 168,
      marketPrice: 176.33,
      marketValue: 13_224.75,
      unrealizedProfitLoss: 624.75,
    },
  ],
};

export const STUB_ORDERS: OrderRecord[] = [
  {
    _id: 'order-1',
    symbol: 'AAPL',
    side: 'BUY',
    type: 'LIMIT',
    quantity: 20,
    limitPrice: 191,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    _id: 'order-2',
    symbol: 'TSLA',
    side: 'SELL',
    type: 'LIMIT',
    quantity: 10,
    limitPrice: 179,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
];

export const STUB_TRADES: TradeRecord[] = [
  {
    _id: 'trade-1',
    symbol: 'MSFT',
    side: 'BUY',
    quantity: 10,
    executionPrice: 420.25,
    grossAmount: 4202.5,
    commissionAmount: 6.5,
    netAmount: 4209,
    executedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    _id: 'trade-2',
    symbol: 'AAPL',
    side: 'SELL',
    quantity: 5,
    executionPrice: 194.2,
    grossAmount: 971,
    commissionAmount: 2.2,
    netAmount: 968.8,
    executedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
];

export const STUB_FRIENDS = [
  {
    _id: 'friend-1',
    fullName: 'Maria Garcia',
    email: 'maria@example.com',
    username: 'maria_g',
  },
  {
    _id: 'friend-2',
    fullName: 'Carlos Lopez',
    email: 'carlos@example.com',
    username: 'carlos_l',
  },
];

export const STUB_FRIEND_REQUESTS = [
  {
    _id: 'request-1',
    from: {
      _id: 'user-3',
      fullName: 'Ana Torres',
      email: 'ana@example.com',
      username: 'ana_t',
    },
    status: 'pending' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export const STUB_CURRENCY_RATES = [
  {
    symbol: 'USDCLP',
    rate: 950,
    basePrice: 948,
    dayChangePercentage: 0.26,
  },
];

export const STUB_ADMIN_CONFIGS = [
  {
    key: 'COMMISSION_RATE',
    value: 0.005,
    name: 'Comisión de trading',
    tags: ['trading', 'fees'],
    inUse: true,
    lastUsedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    key: 'INITIAL_BALANCE',
    value: 100000,
    name: 'Saldo inicial',
    tags: ['registration'],
    inUse: true,
    lastUsedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    key: 'MARKET_HOURS_OPEN',
    value: '09:30',
    name: 'Horario de apertura',
    tags: ['market', 'hours'],
    inUse: true,
    lastUsedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    key: 'MARKET_HOURS_CLOSED',
    value: '16:00',
    name: 'Horario de cierre',
    tags: ['market', 'hours'],
    inUse: true,
    lastUsedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    key: 'MARKET_PROVIDER',
    value: 'mock',
    effectiveValue: 'mock',
    appliesOn: 'restart',
    name: 'Proveedor de datos de mercado',
    tags: ['market', 'provider'],
    inUse: true,
    lastUsedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    key: 'SIMULATION_STRATEGY',
    value: 'flat',
    effectiveValue: 'flat',
    appliesOn: 'restart',
    name: 'Estrategia de simulación',
    tags: ['simulation'],
    inUse: true,
    lastUsedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const STUB_ADMIN_SNAPSHOTS = [
  {
    _id: 'snapshot-1',
    configs: {
      COMMISSION_RATE: 0.005,
      INITIAL_BALANCE: 100000,
      MARKET_HOURS_OPEN: '09:30',
      MARKET_HOURS_CLOSED: '16:00',
      MARKET_PROVIDER: 'mock',
      SIMULATION_STRATEGY: 'flat',
    },
    name: 'Configuración inicial',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export const STUB_ADMIN_CONFIG_HISTORY: Array<{
  _id: string;
  key: string;
  value: string | number | boolean;
  name?: string;
  tags?: string[];
  inUse: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}> = STUB_ADMIN_CONFIGS.map((cfg, i) => ({
  _id: `hist-${i + 1}`,
  key: cfg.key,
  value: cfg.value,
  name: cfg.name,
  tags: cfg.tags,
  inUse: cfg.inUse,
  lastUsedAt: cfg.lastUsedAt,
  createdAt: cfg.createdAt,
  updatedAt: cfg.updatedAt,
}));

export const STUB_ADMIN_STOCKS: Array<{
  symbol: string;
  name: string;
  currency: 'CLP' | 'USD';
  close: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  dayChangePercentage: number;
  source: string;
  volume: number;
  baseVolatility: number;
  baseDrift: number;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    symbol: 'COPEC.SN',
    name: 'COPEC.SN',
    currency: 'CLP',
    close: 6113.44,
    open: 6200,
    high: 6220,
    low: 6136,
    previousClose: 6159,
    dayChangePercentage: -0.74,
    source: 'admin',
    volume: 1371420,
    baseVolatility: 0.015,
    baseDrift: 0,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'BSANTANDER.SN',
    name: 'BSANTANDER.SN',
    currency: 'CLP',
    close: 42.15,
    open: 42,
    high: 42.5,
    low: 41.8,
    previousClose: 42.15,
    dayChangePercentage: 0,
    source: 'admin',
    volume: 5000000,
    baseVolatility: 0.02,
    baseDrift: 0,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currency: 'USD',
    close: 193.12,
    open: 192.5,
    high: 194.8,
    low: 191.9,
    previousClose: 192.87,
    dayChangePercentage: 0.13,
    source: 'mock',
    volume: 45000000,
    baseVolatility: 0.012,
    baseDrift: 0,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currency: 'USD',
    close: 421.64,
    open: 420.1,
    high: 423.5,
    low: 419.2,
    previousClose: 420.88,
    dayChangePercentage: 0.18,
    source: 'mock',
    volume: 22000000,
    baseVolatility: 0.01,
    baseDrift: 0,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    currency: 'USD',
    close: 176.33,
    open: 175.8,
    high: 178.2,
    low: 174.5,
    previousClose: 176.33,
    dayChangePercentage: 0,
    source: 'eodhd',
    volume: 85000000,
    baseVolatility: 0.025,
    baseDrift: 0,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function buildStubHistory(symbol: string, limit = 24): PricePoint[] {
  const baseBySymbol: Record<string, number> = {
    AAPL: 193.12,
    MSFT: 421.64,
    TSLA: 176.33,
    AMZN: 182.44,
  };
  const base = baseBySymbol[symbol] ?? 100;

  return Array.from({ length: limit }, (_, index) => {
    const minuteOffset = limit - index;
    const swing = Math.sin(index / 3) * (base * 0.008);

    return {
      symbol,
      price: Number((base + swing).toFixed(2)),
      createdAt: new Date(Date.now() - minuteOffset * 60_000).toISOString(),
    } as PricePoint;
  });
}
