import { getItem, setItem, STORAGE_KEYS } from './storage';
import { PROJECTION_MONTHS_DEFAULT, PROJECTION_MONTHS_MAX, PROJECTION_MONTHS_MIN } from './expenseProjection';

interface ProjectionSettingsPayload {
  version: 1;
  lookbackMonths: number;
}

export function loadProjectionLookbackMonths(): number {
  const payload = getItem<ProjectionSettingsPayload>(STORAGE_KEYS.PROJECTION_SETTINGS);
  if (!payload || typeof payload.lookbackMonths !== 'number') {
    return PROJECTION_MONTHS_DEFAULT;
  }

  return Math.min(
    PROJECTION_MONTHS_MAX,
    Math.max(PROJECTION_MONTHS_MIN, Math.round(payload.lookbackMonths)),
  );
}

export function saveProjectionLookbackMonths(lookbackMonths: number): number {
  const normalized = Math.min(
    PROJECTION_MONTHS_MAX,
    Math.max(PROJECTION_MONTHS_MIN, Math.round(lookbackMonths)),
  );

  setItem(STORAGE_KEYS.PROJECTION_SETTINGS, {
    version: 1,
    lookbackMonths: normalized,
  });

  return normalized;
}
