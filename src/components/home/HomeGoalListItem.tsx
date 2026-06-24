import type { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/format';
import { getGoalRemaining, getGoalTotal } from '../../utils/goalUtils';

function HomeGoalListItem({ goal }: { goal: SavingsGoal }) {
  const assigned = getGoalTotal(goal);
  const remaining = getGoalRemaining(goal);
  const progress =
    goal.targetAmount > 0 ? Math.min(100, (assigned / goal.targetAmount) * 100) : 0;

  return (
    <article className="home-goal-list-item">
      <div className="home-goal-list-item__head">
        <h4>{goal.title}</h4>
        <span>{Math.round(progress)}%</span>
      </div>
      <dl className="home-goal-list-item__stats">
        <div>
          <dt>Asignado</dt>
          <dd>{formatCurrency(assigned)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatCurrency(goal.targetAmount)}</dd>
        </div>
        <div>
          <dt>Faltante</dt>
          <dd>{formatCurrency(remaining)}</dd>
        </div>
      </dl>
      <div className="home-goal-list-item__bar" role="progressbar" aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}

export { HomeGoalListItem };
