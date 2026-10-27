import { describe, expect, it } from 'vitest';
import {
  CreateTournamentInputSchema,
  LeaderboardResponseSchema,
  TournamentPortfolioSchema,
} from './tournaments';

describe('tournament validators', () => {
  it('acepta reglas financieras validas y rechaza comisiones fuera de rango', () => {
    const input = {
      name: 'Liga UCN',
      startAt: '2026-11-01T12:00:00.000Z',
      endAt: '2026-12-01T12:00:00.000Z',
      initialBalance: 1_000_000,
      commissionRate: 0.005,
    };

    expect(CreateTournamentInputSchema.safeParse(input).success).toBe(true);
    expect(CreateTournamentInputSchema.safeParse({ ...input, commissionRate: 1.1 }).success).toBe(false);
  });

  it('valida que cartera y ranking pertenezcan al contrato del torneo', () => {
    const portfolio = TournamentPortfolioSchema.parse({
      tournamentId: 'tournament-1',
      baseCurrency: 'CLP',
      availableBalance: 800_000,
      reservedBalance: 0,
      investedValue: 220_000,
      totalEquity: 1_020_000,
      unrealizedProfitLoss: 20_000,
      returnPercentage: 2,
      finalizedAt: null,
      positions: [],
    });
    const leaderboard = LeaderboardResponseSchema.parse({
      data: [{
        participantId: 'participant-1',
        userId: 'user-1',
        fullName: 'Estudiante',
        username: null,
        accountType: 'ucn',
        availableBalance: 800_000,
        reservedBalance: 0,
        investedValue: 220_000,
        totalEquity: 1_020_000,
        returnPercentage: 2,
        unrealizedProfitLoss: 20_000,
        totalShares: 10,
        positionCount: 1,
        tradeCount: 2,
        rank: 1,
        officialRank: null,
        status: 'ACTIVE',
      }],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });

    expect(portfolio.totalEquity).toBe(1_020_000);
    expect(leaderboard.data[0].accountType).toBe('ucn');
  });
});
