import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FirebaseSyncGate } from '../components/FirebaseSyncGate';
import { CloudSyncProvider } from '../store/CloudSyncProvider';
import { FinanceStoreProvider } from '../store/FinanceStoreProvider';
import { SavingsGoalsProvider } from '../store/SavingsGoalsProvider';
import { TransferEngineProvider } from '../store/TransferEngineProvider';

export function AuthenticatedShell() {
  const { session } = useAuth();

  return (
    <CloudSyncProvider>
      <FinanceStoreProvider key={session?.loggedInAt ?? session?.username ?? 'auth'}>
        <SavingsGoalsProvider>
          <TransferEngineProvider>
            <FirebaseSyncGate>
              <Outlet />
            </FirebaseSyncGate>
          </TransferEngineProvider>
        </SavingsGoalsProvider>
      </FinanceStoreProvider>
    </CloudSyncProvider>
  );
}
