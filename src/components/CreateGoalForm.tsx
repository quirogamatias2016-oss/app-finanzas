import { useState, type FormEvent } from 'react';
import { useSavingsGoals } from '../hooks/useSavingsGoals';

interface CreateGoalFormProps {
  onSuccess?: () => void;
}

export function CreateGoalForm({ onSuccess }: CreateGoalFormProps) {
  const { createGoal } = useSavingsGoals();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const result = createGoal({ title, targetAmount: Number(targetAmount) });

    setFeedback({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      setTitle('');
      setTargetAmount('');
      onSuccess?.();
    }
  };

  return (
    <form className="movement-form" onSubmit={handleSubmit} aria-label="Crear objetivo">
      <label className="field">
        <span>Nombre del objetivo</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. Vacaciones, emergencia..."
          required
          autoComplete="off"
        />
      </label>

      <label className="field">
        <span>Monto objetivo</span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={targetAmount}
          onChange={(event) => setTargetAmount(event.target.value)}
          placeholder="1000"
          required
          autoComplete="off"
        />
      </label>

      <p className="form-hint">
        Crea la meta y asigna dinero desde el pool en la pantalla Metas.
      </p>

      <button type="submit" className="btn btn--primary btn--block">
        Crear objetivo
      </button>

      {feedback ? (
        <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.text}</p>
      ) : null}
    </form>
  );
}
