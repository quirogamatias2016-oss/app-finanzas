import type { AccountTransfer } from '../types';

/** @deprecated Firestore es la fuente de verdad para transferencias. */
export function loadTransfers(): AccountTransfer[] {
  return [];
}

/** @deprecated Firestore es la fuente de verdad para transferencias. */
export function saveTransfers(_transfers: Readonly<AccountTransfer>[]): void {
  // noop
}
