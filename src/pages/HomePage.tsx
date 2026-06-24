import { useAuth } from '../hooks/useAuth';
import { DashboardMain } from '../components/dashboard/DashboardMain';

export function HomePage() {
  const { session } = useAuth();

  return (
    <div className="page-stack page-stack--dashboard">
      <header className="dashboard-greeting fintech-fade-in">
        <p className="dashboard-greeting__eyebrow">Inicio</p>
        <h1 className="dashboard-greeting__title">
          Hola, <span>{session?.username}</span>
        </h1>
      </header>

      <DashboardMain />
    </div>
  );
}
