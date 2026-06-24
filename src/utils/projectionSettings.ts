import {
  getCachedProjectionLookbackMonths,
  saveProjectionCloud,
} from '../services/configCloud';
import { PROJECTION_MONTHS_DEFAULT, PROJECTION_MONTHS_MAX, PROJECTION_MONTHS_MIN } from './expenseProjection';

export const PROJECTION_UPDATED_EVENT = 'projection-updated';

function normalizeLookbackMonths(value: number): number {
  return Math.min(
    PROJECTION_MONTHS_MAX,
    Math.max(PROJECTION_MONTHS_MIN, Math.round(value)),
  );
}

export function loadProjectionLookbackMonths(): number {
  return normalizeLookbackMonths(getCachedProjectionLookbackMonths() || PROJECTION_MONTHS_DEFAULT);
}

export async function saveProjectionLookbackMonths(lookbackMonths: number): Promise<number> {
  const normalized = normalizeLookbackMonths(lookbackMonths);

  await saveProjectionCloud(normalized);
  return normalized;
}
