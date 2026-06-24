import { useCallback, useState } from 'react';
import {
  loadProjectionLookbackMonths,
  saveProjectionLookbackMonths,
} from '../utils/projectionSettings';

export function useProjectionSettings() {
  const [lookbackMonths, setLookbackMonthsState] = useState(() => loadProjectionLookbackMonths());

  const setLookbackMonths = useCallback((months: number) => {
    const normalized = saveProjectionLookbackMonths(months);
    setLookbackMonthsState(normalized);
    return normalized;
  }, []);

  return { lookbackMonths, setLookbackMonths };
}
