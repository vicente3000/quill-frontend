/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useAuth } from '../../auth/hooks/use-auth';
import { useTournament } from '../../../shared/api/hooks';
import type { Tournament } from '../../../shared/api/validators';

interface ActiveTournament {
  id: string;
  name: string;
}

interface TournamentModeValue {
  activeTournament: ActiveTournament | null;
  enterTournament: (tournament: Pick<Tournament, '_id' | 'name'>) => void;
  leaveTournamentMode: () => void;
}

const TournamentModeContext = createContext<TournamentModeValue | null>(null);

export function TournamentModeProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const storageKey = user ? `quill_active_tournament_${user.id}` : '';
  const [activeTournament, setActiveTournament] = useState<ActiveTournament | null>(() => null);

  useEffect(() => {
    if (!storageKey) {
      setActiveTournament(null);
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      setActiveTournament(stored ? JSON.parse(stored) as ActiveTournament : null);
    } catch {
      localStorage.removeItem(storageKey);
      setActiveTournament(null);
    }
  }, [storageKey]);

  const activeQuery = useTournament(activeTournament?.id ?? '');

  const leaveTournamentMode = () => {
    if (storageKey) localStorage.removeItem(storageKey);
    setActiveTournament(null);
  };

  useEffect(() => {
    if (activeQuery.data && ['FINISHED', 'CANCELLED'].includes(activeQuery.data.status)) {
      leaveTournamentMode();
    }
  }, [activeQuery.data?.status]);

  const value = useMemo<TournamentModeValue>(() => ({
    activeTournament,
    enterTournament: (tournament) => {
      const selection = { id: tournament._id, name: tournament.name };
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(selection));
      setActiveTournament(selection);
    },
    leaveTournamentMode,
  }), [activeTournament, storageKey]);

  return <TournamentModeContext.Provider value={value}>{children}</TournamentModeContext.Provider>;
}

export function useTournamentMode() {
  const context = useContext(TournamentModeContext);
  if (!context) throw new Error('useTournamentMode debe usarse dentro de TournamentModeProvider.');
  return context;
}
