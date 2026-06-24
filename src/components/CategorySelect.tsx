import type { MovementType } from '../types';
import { useCategorySettings } from '../hooks/useCategorySettings';

interface CategorySelectProps {
  type: MovementType;
  value: string;
  onChange: (category: string) => void;
  id?: string;
}

export function CategorySelect({ type, value, onChange, id = 'movement-category' }: CategorySelectProps) {
  const { incomeCategories, expenseCategories } = useCategorySettings();
  const options = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <label className="field">
      <span>Categoría</span>
      <select
        id={id}
        name="movement-category"
        className="field-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      >
        {options.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>
  );
}
