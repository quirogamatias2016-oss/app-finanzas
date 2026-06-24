import { loadAppState, patchAppState } from '../services/appStorage';
import { PROJECTION_MONTHS_DEFAULT, PROJECTION_MONTHS_MAX, PROJECTION_MONTHS_MIN } from './expenseProjection';

export const PROJECTION_UPDATED_EVENT = 'projection-updated';

function normalizeLookbackMonths(value: number): number {
  return Math.min(
    PROJECTION_MONTHS_MAX,
    Math.max(PROJECTION_MONTHS_MIN, Math.round(value)),
  );
}

export function loadProjectionLookbackMonths(): number {
  return normalizeLookbackMonths(
    loadAppState().projection.lookbackMonths || PROJECTION_MONTHS_DEFAULT,
  );
}

export async function saveProjectionLookbackMonths(lookbackMonths: number): Promise<number> {
  const normalized = normalizeLookbackMonths(lookbackMonths);

  patchAppState((state) => ({
    ...state,
    projection: { lookbackMonths: normalized },
  }));
  window.dispatchEvent(new Event(PROJECTION_UPDATED_EVENT));
  return normalized;
}
