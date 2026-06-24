import { Link } from 'react-router-dom';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { ROUTES } from '../../routes/paths';
import { HomeGoalListItem } from './HomeGoalListItem';

export default function HomeObjectivesSection() {
  const { goals } = useSavingsGoals();

  if (goals.length === 0) {
    return (
      <section className="home-objectives fintech-card" aria-label="Objetivos">
        <header className="home-section__header">
          <p className="home-section__eyebrow">Objetivos</p>
          <h3>Sin objetivos aún</h3>
        </header>
        <p className="home-objectives__empty">
          Crea un objetivo para ver tu progreso aquí.
        </p>
        <Link to={`${ROUTES.AGREGAR}?seccion=objetivo`} className="home-objectives__link">
          Crear objetivo
        </Link>
      </section>
    );
  }

  return (
    <section className="home-objectives fintech-card" aria-label="Objetivos">
      <header className="home-section__header">
        <p className="home-section__eyebrow">Objetivos</p>
        <h3>Progreso por meta</h3>
      </header>

      <ul className="home-objectives__list">
        {goals.map((goal) => (
          <li key={goal.id}>
            <HomeGoalListItem goal={goal} />
          </li>
        ))}
      </ul>

      <Link to={ROUTES.METAS} className="home-objectives__link">
        Gestionar en Metas
      </Link>
    </section>
  );
}
