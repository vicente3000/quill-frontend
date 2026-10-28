/**
 * Custom React Query hooks for data fetching
 * Encapsulates query configuration, caching strategy, and error handling
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { portfolioService, marketService, ordersService, tradesService, usersService, currencyService, adminConfigService, adminStockService, adminContestService, contestsService } from '../api-service';
import { logError } from '../error-logging';

/**
 * Hook to fetch portfolio summary
 * Caches for 30 seconds before considering stale
 */
export function usePortfolioSummary() {
  const query = useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: portfolioService.getSummary,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Portfolio summary fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch market open/closed status
 * No caching — always reflects live server time
 */
export function useMarketStatus() {
  const query = useQuery({
    queryKey: ['market', 'status'],
    queryFn: marketService.getStatus,
    staleTime: 0,
    refetchInterval: 30000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Market status fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch stock quotes/market data
 * Caches for 10 seconds before considering stale
 */
export function useMarketStocks() {
  const query = useQuery({
    queryKey: ['market', 'stocks'],
    queryFn: marketService.getStocks,
    staleTime: 10000, // 10 seconds
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Market stocks fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch pending orders
 * Caches for 15 seconds before considering stale
 */
export function usePendingOrders() {
  const query = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: ordersService.getPending,
    staleTime: 15000, // 15 seconds
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Pending orders fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch recent trades
 * Caches for 20 seconds before considering stale
 */
export function useRecentTrades(limit: number = 8) {
  const query = useQuery({
    queryKey: ['trades', 'recent', limit],
    queryFn: () => tradesService.getRecent(limit),
    staleTime: 20000, // 20 seconds
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Recent trades fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch stock price history
 * Depends on symbol parameter, refetches when symbol changes
 */
/**
 * Hook to fetch user profile
 */
export function useProfile() {
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: usersService.getProfile,
    staleTime: 60000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Profile fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch watchlist with live stock data
 */
export function useWatchlist() {
  const query = useQuery({
    queryKey: ['watchlist'],
    queryFn: usersService.getWatchlist,
    staleTime: 10000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Watchlist fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch friends list
 */
export function useFriends() {
  const query = useQuery({
    queryKey: ['friends'],
    queryFn: usersService.getFriends,
    staleTime: 30000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Friends fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch incoming friend requests
 */
export function useFriendRequests() {
  const query = useQuery({
    queryKey: ['friends', 'requests'],
    queryFn: usersService.getFriendRequests,
    staleTime: 15000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Friend requests fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

export function useStockHistory(symbol: string, limit: number = 24) {
  const query = useQuery({
    queryKey: ['market', 'history', symbol, limit],
    queryFn: () => marketService.getStockHistory(symbol, limit),
    staleTime: 5000, // 5 seconds (more frequent updates for chart data)
    retry: 1,
    enabled: Boolean(symbol), // Only fetch if symbol is provided
  });

  useEffect(() => {
    if (query.error) {
      logError(`[Query] Stock history fetch failed: ${symbol}`, query.error);
    }
  }, [query.error, symbol]);

  return query;
}

/**
 * Hook to fetch all forex/currency rates
 */
export function useForexRates() {
  const query = useQuery({
    queryKey: ['currency', 'rates'],
    queryFn: currencyService.getRates,
    staleTime: 15000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Forex rates fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch a single forex rate by symbol
 */
export function useForexRate(symbol: string) {
  const query = useQuery({
    queryKey: ['currency', 'rates', symbol],
    queryFn: () => currencyService.getRate(symbol),
    staleTime: 15000,
    retry: 1,
    enabled: Boolean(symbol),
  });

  useEffect(() => {
    if (query.error) {
      logError(`[Query] Forex rate fetch failed: ${symbol}`, query.error);
    }
  }, [query.error, symbol]);

  return query;
}

/**
 * Hook to fetch all admin configs
 */
export function useAdminConfigs() {
  const query = useQuery({
    queryKey: ['admin', 'configs'],
    queryFn: adminConfigService.getAll,
    staleTime: 30000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Admin configs fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch a single admin config by key
 */
export function useAdminConfig(key: string) {
  const query = useQuery({
    queryKey: ['admin', 'configs', key],
    queryFn: () => adminConfigService.get(key),
    staleTime: 30000,
    retry: 1,
    enabled: Boolean(key),
  });

  useEffect(() => {
    if (query.error) {
      logError(`[Query] Admin config fetch failed: ${key}`, query.error);
    }
  }, [query.error, key]);

  return query;
}

/**
 * Hook to fetch admin config history by key
 */
export function useAdminConfigHistory(key: string) {
  const query = useQuery({
    queryKey: ['admin', 'configs', key, 'history'],
    queryFn: () => adminConfigService.getHistory(key),
    staleTime: 60000,
    retry: 1,
    enabled: Boolean(key),
  });

  useEffect(() => {
    if (query.error) {
      logError(`[Query] Admin config history fetch failed: ${key}`, query.error);
    }
  }, [query.error, key]);

  return query;
}

/**
 * Hook to fetch all admin snapshots
 */
export function useAdminSnapshots() {
  const query = useQuery({
    queryKey: ['admin', 'snapshots'],
    queryFn: adminConfigService.getSnapshots,
    staleTime: 30000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Admin snapshots fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch a single admin snapshot by id
 */
export function useAdminSnapshot(id: string) {
  const query = useQuery({
    queryKey: ['admin', 'snapshots', id],
    queryFn: () => adminConfigService.getSnapshot(id),
    staleTime: 60000,
    retry: 1,
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (query.error) {
      logError(`[Query] Admin snapshot fetch failed: ${id}`, query.error);
    }
  }, [query.error, id]);

  return query;
}

/**
 * Hook to fetch admin stocks with optional search/filter/pagination
 */
export function useAdminStocks(params?: { search?: string; source?: string; page?: number; limit?: number }) {
  const query = useQuery({
    queryKey: ['admin', 'stocks', params],
    queryFn: () => adminStockService.list(params),
    staleTime: 10000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Admin stocks fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}


/**
 * Hook to fetch admin contests (sorted by start date, newest first)
 */
export function useAdminContests() {
  const query = useQuery({
    queryKey: ['admin', 'contests'],
    queryFn: () => adminContestService.list(),
    staleTime: 10000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Admin contests fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook to fetch the contests visible to the current user (newest first),
 * including participant counts and the user's enrollment state
 */
export function useContests() {
  const query = useQuery({
    queryKey: ['contests'],
    queryFn: () => contestsService.list(),
    staleTime: 10000,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      logError('[Query] Contests fetch failed:', query.error);
    }
  }, [query.error]);

  return query;
}
