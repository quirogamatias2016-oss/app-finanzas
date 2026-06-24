import { useState } from 'react';
import type { SavingsGoal } from '../types';
import TransferModal from './TransferModal';
import { formatCurrency } from '../utils/format';
import { getGoalProgress, getGoalRemaining, getGoalTotal } from '../utils/goalUtils';

interface GoalCardProps {
  goal: SavingsGoal;
  onRemove?: (id: string) => void;
}

export default function GoalCard({ goal, onRemove }: GoalCardProps) {
  const [mode, setMode] = useState<'none' | 'assign' | 'return'>('none');
  const assigned = getGoalTotal(goal);
  const remaining = getGoalRemaining(goal);
  const progress = getGoalProgress(goal);

  return (
    <article className="goal-card">
      <div className="goal-card__head">
        <h4 className="goal-card__title">{goal.title}</h4>
        <span className="goal-card__percent">{Math.round(progress)}%</span>
      </div>

      <dl className="goal-card__metrics">
        <div className="goal-card__metric">
          <dt>Asignado</dt>
          <dd>{formatCurrency(assigned)}</dd>
          <dd className="goal-card__sub">
            Efectivo {formatCurrency(goal.efectivo)} · Digital {formatCurrency(goal.digital)}
          </dd>
        </div>

        <div className="goal-card__metric">
          <dt>Objetivo</dt>
          <dd>{formatCurrency(goal.targetAmount)}</dd>
        </div>

        <div className="goal-card__metric">
          <dt>Faltante</dt>
          <dd className={remaining > 0 ? 'goal-card__missing' : 'goal-card__complete'}>
            {formatCurrency(remaining)}
          </dd>
        </div>
      </dl>

      <div className="goal-card__bar" role="progressbar" aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="goal-card__actions">
        <button type="button" className="btn btn--primary btn--compact" onClick={() => setMode('assign')}>
          Asignar dinero
        </button>
        <button type="button" className="btn btn--ghost btn--compact" onClick={() => setMode('return')}>
          Volver al pool
        </button>
        {onRemove ? (
          <button type="button" className="btn btn--danger btn--compact" onClick={() => onRemove(goal.id)}>
            Eliminar
          </button>
        ) : null}
      </div>

      {mode === 'assign' ? (
        <TransferModal
          from="metas"
          mode="assign"
          toGoalId={goal.id}
          onClose={() => setMode('none')}
        />
      ) : null}

      {mode === 'return' ? (
        <TransferModal
          from="objetivos"
          mode="return"
          fromGoalId={goal.id}
          onClose={() => setMode('none')}
        />
      ) : null}
    </article>
  );
}
