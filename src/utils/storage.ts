export const STORAGE_KEYS = {
  USER: 'finanzas_user',
  SESSION: 'finanzas_session',
  MOVEMENTS: 'finanzas_movements',
  STARTER_SEEDED: 'finanzas_starter_seeded',
  SAVINGS_GOALS: 'finanzas_savings_goals',
  TRANSFERS: 'finanzas_transfers',
  PROJECTION_SETTINGS: 'finanzas_projection_settings',
  CATEGORY_SETTINGS: 'finanzas_category_settings',
} as const;

export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}
