import { useCallback, useEffect, useState } from 'react';
import {
  loadProjectionLookbackMonths,
  PROJECTION_UPDATED_EVENT,
  saveProjectionLookbackMonths,
} from '../utils/projectionSettings';

export function useProjectionSettings() {
  const [lookbackMonths, setLookbackMonthsState] = useState(() => loadProjectionLookbackMonths());

  useEffect(() => {
    const handleUpdate = () => {
      setLookbackMonthsState(loadProjectionLookbackMonths());
    };

    window.addEventListener(PROJECTION_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(PROJECTION_UPDATED_EVENT, handleUpdate);
  }, []);

  const setLookbackMonths = useCallback(async (months: number) => {
    const normalized = await saveProjectionLookbackMonths(months);
    setLookbackMonthsState(normalized);
    return normalized;
  }, []);

  return { lookbackMonths, setLookbackMonths };
}
