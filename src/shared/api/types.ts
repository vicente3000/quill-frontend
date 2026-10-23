import type { UserRole } from './validators/auth';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  username?: string;
  watchlist?: string[];
  availableBalance: number;
  reservedBalance: number;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export interface RegisterResponse {
  message: string;
  email: string;
  username?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  fullName: string;
  username?: string;
}

export interface StockQuote {
  _id?: string;
  symbol: string;
  name: string;
  currency: 'CLP' | 'USD';
  close: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose: number;
  dayChangePercentage: number;
  source?: string;
  volume?: number;
  lastMarketDate?: string;
  createdAt?: string;
  updatedAt?: string;
  sector?: string;
}

export interface PricePoint {
  symbol: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  createdAt: string;
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  reservedQuantity: number;
  averageCost: number;
  marketPrice: number;
  marketValue: number;
  unrealizedProfitLoss: number;
}

export interface PortfolioSummary {
  availableBalance: number;
  reservedBalance: number;
  investedValue: number;
  totalEquity: number;
  unrealizedProfitLoss: number;
  positions: PortfolioPosition[];
}

export interface TradeRecord {
  _id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  executionPrice: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  executedAt: string;
}

export interface OrderRecord {
  _id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  quantity: number;
  limitPrice?: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  executionPrice?: number;
  commissionAmount?: number;
  createdAt: string;
  executedAt?: string;
}
