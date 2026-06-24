import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FinanceStoreProvider } from '../store/FinanceStoreProvider';
import { SavingsGoalsProvider } from '../store/SavingsGoalsProvider';
import { TransferEngineProvider } from '../store/TransferEngineProvider';

export function AuthenticatedShell() {
  const { session } = useAuth();

  return (
    <FinanceStoreProvider key={session?.loggedInAt ?? session?.username ?? 'auth'}>
      <SavingsGoalsProvider>
        <TransferEngineProvider>
          <Outlet />
        </TransferEngineProvider>
      </SavingsGoalsProvider>
    </FinanceStoreProvider>
  );
}
