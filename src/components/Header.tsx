import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/paths';

interface HeaderProps {
  subtitle?: string;
}

export function Header({ subtitle }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">Finanzas personales</p>
        <h1 className="app-header__title">App Finanzas</h1>
        {subtitle ? <p className="app-header__subtitle">{subtitle}</p> : null}
      </div>
      <div className="app-header__actions">
        <Link to={ROUTES.ESTADISTICAS} className="app-header__badge" aria-label="Ir a estadísticas">
          📊
        </Link>
        <Link to={ROUTES.CONFIGURACION} className="app-header__badge" aria-label="Ir a configuración">
          ⚙
        </Link>
      </div>
    </header>
  );
}
