import { Outlet } from 'react-router-dom';
import { FinanzasStateProvider } from '../store/FinanzasStateProvider';
import { FinanceStoreProvider } from '../store/FinanceStoreProvider';
import { SavingsGoalsProvider } from '../store/SavingsGoalsProvider';
import { TransferEngineProvider } from '../store/TransferEngineProvider';

export function AppShell() {
  return (
    <FinanzasStateProvider>
      <FinanceStoreProvider>
        <SavingsGoalsProvider>
          <TransferEngineProvider>
            <Outlet />
          </TransferEngineProvider>
        </SavingsGoalsProvider>
      </FinanceStoreProvider>
    </FinanzasStateProvider>
  );
}
