import type { Movement, User } from '../types';
import { getCachedUser, saveUserToCloud } from '../services/userCloud';

/** @deprecated Firestore es la fuente de verdad para movimientos. */
export function loadTransactions(): Readonly<Movement>[] {
  return [];
}

/** @deprecated Firestore es la fuente de verdad para movimientos. */
export function loadInitialTransactions(): Readonly<Movement>[] {
  return [];
}

/** @deprecated Firestore es la fuente de verdad para movimientos. */
export function saveTransactions(_transactions: Readonly<Movement>[]): void {
  // noop
}

export function clearTransactions(): void {
  // noop — los movimientos viven en Firebase
}

export function loadUser(): User | null {
  return getCachedUser();
}

export async function saveUser(user: User): Promise<void> {
  await saveUserToCloud(user);
}

export function clearUser(): void {
  // El usuario se gestiona vía Firebase; la sesión local se limpia en session.ts
}

export function loadAppSnapshot(): { user: User | null; transactions: Movement[] } {
  return {
    user: loadUser(),
    transactions: loadTransactions(),
  };
}
