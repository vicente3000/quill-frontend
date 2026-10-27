import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { store } from '../../store/store';
import { AuthProvider } from '../auth/hooks/use-auth';
import { ToastContainer } from '../../shared/components/Toast';
import { TournamentModeProvider } from '../tournaments/context/TournamentModeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TournamentModeProvider>
            {children}
            <ToastContainer />
          </TournamentModeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
