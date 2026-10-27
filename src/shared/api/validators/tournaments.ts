import { z } from 'zod';
import { CreateOrderInputSchema, OrderRecordSchema } from './orders';
import { PortfolioPositionSchema } from './portfolio';
import { TradeRecordSchema } from './trades';

export const TOURNAMENT_STATUSES = ['DRAFT', 'OPEN', 'ACTIVE', 'FINISHED', 'CANCELLED'] as const;
export const TOURNAMENT_RANKING_METRICS = [
  'RETURN_PERCENTAGE',
  'TOTAL_EQUITY',
  'TOTAL_SHARES',
  'TRADE_COUNT',
  'INVESTED_VALUE',
  'AVAILABLE_BALANCE',
] as const;

export const TournamentSchema = z.object({
  _id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  description: z.string().default(''),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  status: z.enum(TOURNAMENT_STATUSES),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  initialBalance: z.number(),
  commissionRate: z.number(),
  baseCurrency: z.string().default('CLP'),
  maxParticipants: z.number().int().optional(),
  participantCount: z.number().int(),
  finishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const PaginationMetaSchema = z.object({
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export const TournamentListResponseSchema = z.object({
  data: z.array(TournamentSchema),
  meta: PaginationMetaSchema,
});

export const CreateTournamentInputSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  initialBalance: z.number().positive(),
  commissionRate: z.number().min(0).max(1).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  maxParticipants: z.number().int().min(2).max(10000).optional(),
});

export const TournamentCreateResponseSchema = z.object({
  tournament: TournamentSchema,
  joinCode: z.string(),
});

const ParticipantUserSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  username: z.string().nullish(),
  email: z.string().email(),
  accountType: z.enum(['ucn', 'external']).default('external'),
});

export const TournamentParticipantSchema = z.object({
  _id: z.string(),
  tournamentId: z.string(),
  userId: z.union([z.string(), ParticipantUserSchema]),
  availableBalance: z.number(),
  reservedBalance: z.number(),
  initialBalance: z.number(),
  status: z.enum(['ACTIVE', 'DISQUALIFIED', 'FINISHED']),
  joinedAt: z.string().datetime(),
  finalEquity: z.number().optional(),
  finalReturnPercentage: z.number().optional(),
  finalRank: z.number().int().optional(),
  finalizedAt: z.string().datetime().optional(),
});

export const TournamentPortfolioSchema = z.object({
  tournamentId: z.string(),
  baseCurrency: z.string(),
  availableBalance: z.number(),
  reservedBalance: z.number(),
  investedValue: z.number(),
  totalEquity: z.number(),
  unrealizedProfitLoss: z.number(),
  returnPercentage: z.number(),
  finalizedAt: z.string().datetime().nullable(),
  positions: z.array(PortfolioPositionSchema),
});

export const TournamentOrderSchema = OrderRecordSchema.extend({
  tournamentId: z.string().optional(),
  userId: z.string().optional(),
  reservedAmount: z.number().optional(),
  cancelledAt: z.string().datetime().optional(),
});

export const TournamentTradeSchema = TradeRecordSchema.extend({
  tournamentId: z.string().optional(),
  userId: z.string().optional(),
  orderId: z.string().optional(),
});

export const LeaderboardRowSchema = z.object({
  participantId: z.string(),
  userId: z.string(),
  fullName: z.string(),
  username: z.string().nullable(),
  accountType: z.enum(['ucn', 'external']),
  availableBalance: z.number(),
  reservedBalance: z.number(),
  investedValue: z.number(),
  totalEquity: z.number(),
  returnPercentage: z.number(),
  unrealizedProfitLoss: z.number(),
  totalShares: z.number(),
  positionCount: z.number().int(),
  tradeCount: z.number().int(),
  rank: z.number().int(),
  officialRank: z.number().int().nullable(),
  status: z.enum(['ACTIVE', 'DISQUALIFIED', 'FINISHED']),
});

export const LeaderboardResponseSchema = z.object({
  data: z.array(LeaderboardRowSchema),
  meta: PaginationMetaSchema,
});

export type Tournament = z.infer<typeof TournamentSchema>;
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];
export type TournamentRankingMetric = (typeof TOURNAMENT_RANKING_METRICS)[number];
export type TournamentListResponse = z.infer<typeof TournamentListResponseSchema>;
export type CreateTournamentInput = z.infer<typeof CreateTournamentInputSchema>;
export type UpdateTournamentInput = Partial<CreateTournamentInput>;
export type TournamentParticipant = z.infer<typeof TournamentParticipantSchema>;
export type TournamentPortfolio = z.infer<typeof TournamentPortfolioSchema>;
export type TournamentOrder = z.infer<typeof TournamentOrderSchema>;
export type TournamentTrade = z.infer<typeof TournamentTradeSchema>;
export type LeaderboardRow = z.infer<typeof LeaderboardRowSchema>;
export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;
export type TournamentOrderInput = z.infer<typeof CreateOrderInputSchema>;

export interface TournamentListParams {
  scope?: 'available' | 'joined' | 'current' | 'history' | 'owned' | 'all';
  status?: TournamentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LeaderboardParams {
  accountType?: 'ucn' | 'external';
  sortBy?: TournamentRankingMetric;
  direction?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}
