import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreateGoalForm } from '../components/CreateGoalForm';
import { MovementForm } from '../components/MovementForm';
import { useFinanceStore } from '../hooks/useFinance';
import { ROUTES } from '../routes/paths';

type AddSection = 'caja' | 'objetivo';
type CajaKind = 'ingreso' | 'gasto';

const SECTIONS: Array<{ id: AddSection; label: string }> = [
  { id: 'caja', label: 'Caja' },
  { id: 'objetivo', label: 'Objetivo' },
];

function parseSection(value: string | null): AddSection {
  if (value === 'objetivo') {
    return 'objetivo';
  }
  if (value === 'ahorro' || value === 'movimiento') {
    return 'caja';
  }
  return 'caja';
}

function parseCajaKind(value: string | null): CajaKind {
  return value === 'gasto' ? 'gasto' : 'ingreso';
}

export function AddPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addTransaction } = useFinanceStore();

  const section = parseSection(searchParams.get('seccion'));
  const cajaKind = parseCajaKind(searchParams.get('tipo'));
  const isIncome = cajaKind === 'ingreso';

  const panelCopy = useMemo(() => {
    if (section === 'objetivo') {
      return {
        title: 'Nuevo objetivo',
        caption: 'Define una meta con nombre y monto objetivo',
      };
    }

    return {
      title: isIncome ? 'Registrar ingreso' : 'Registrar gasto',
      caption: 'Ingresos y gastos solo afectan el dinero disponible en Caja',
    };
  }, [isIncome, section]);

  const setSection = (next: AddSection) => {
    const params = new URLSearchParams(searchParams);
    params.set('seccion', next);
    if (next === 'caja' && !params.get('tipo')) {
      params.set('tipo', 'ingreso');
    }
    setSearchParams(params, { replace: true });
  };

  const setCajaKind = (next: CajaKind) => {
    const params = new URLSearchParams(searchParams);
    params.set('seccion', 'caja');
    params.set('tipo', next);
    setSearchParams(params, { replace: true });
  };

  const handleSuccess = () => {
    if (section === 'objetivo') {
      navigate(ROUTES.METAS);
      return;
    }
    navigate(ROUTES.CAJA);
  };

  return (
    <div className="page-stack">
      <nav className="add-module-tabs add-module-tabs--dual" aria-label="Módulo agregar">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`add-module-tabs__item${section === item.id ? ' add-module-tabs__item--active' : ''}`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {section === 'caja' ? (
        <nav className="add-tabs" aria-label="Tipo de operación de caja">
          <button
            type="button"
            className={`add-tabs__item${isIncome ? ' add-tabs__item--active income' : ''}`}
            onClick={() => setCajaKind('ingreso')}
          >
            Ingreso
          </button>
          <button
            type="button"
            className={`add-tabs__item${!isIncome ? ' add-tabs__item--active expense' : ''}`}
            onClick={() => setCajaKind('gasto')}
          >
            Gasto
          </button>
        </nav>
      ) : null}

      <section className="add-movement-panel panel" aria-label="Agregar">
        <header className="panel__header">
          <h2>{panelCopy.title}</h2>
          <p>{panelCopy.caption}</p>
        </header>
        <div className="add-movement-panel__body">
          {section === 'caja' ? (
            <MovementForm
              key={cajaKind}
              fixedType={isIncome ? 'income' : 'expense'}
              submitLabel={isIncome ? 'Registrar ingreso' : 'Registrar gasto'}
              onSubmit={addTransaction}
              onSuccess={handleSuccess}
            />
          ) : null}

          {section === 'objetivo' ? <CreateGoalForm onSuccess={handleSuccess} /> : null}
        </div>
      </section>
    </div>
  );
}
