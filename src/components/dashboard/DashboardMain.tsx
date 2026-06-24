import { useTransferEngine } from '../../hooks/useTransferEngine';
import { DashboardAccountsDetail } from './DashboardAccountsDetail';
import { DashboardHero } from './DashboardHero';
import { DashboardMetrics } from './DashboardMetrics';

export function DashboardMain() {
  const { openTransfer } = useTransferEngine();

  return (
    <div className="dashboard-main">
      <DashboardHero />

      <button
        type="button"
        className="dashboard-main__cta btn btn--primary"
        onClick={() => openTransfer()}
      >
        Transferir dinero
      </button>

      <DashboardMetrics />
      <DashboardAccountsDetail />
    </div>
  );
}
