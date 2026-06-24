import type { Movement, User } from '../types';

/** @deprecated Usar appStorage (localStorage key app-finanzas). */
export function loadTransactions(): Readonly<Movement>[] {
  return [];
}

/** @deprecated Usar appStorage. */
export function loadInitialTransactions(): Readonly<Movement>[] {
  return [];
}

/** @deprecated Usar appStorage. */
export function saveTransactions(_transactions: Readonly<Movement>[]): void {
  // noop
}

export function clearTransactions(): void {
  // noop
}

/** @deprecated App local sin usuarios. */
export function loadUser(): User | null {
  return null;
}

/** @deprecated App local sin usuarios. */
export async function saveUser(_user: User): Promise<void> {
  // noop
}

export function clearUser(): void {
  // noop
}

export function loadAppSnapshot(): { user: User | null; transactions: Movement[] } {
  return {
    user: loadUser(),
    transactions: loadTransactions(),
  };
}
