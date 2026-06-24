import type { Movement } from '../types';
import { getExpenseCategoryKind } from './categorySettings';

export const IMMUTABLE_MOVEMENT_MESSAGE =
  'No se puede vaciar todo el historial. Elimina operaciones individualmente desde el extracto.';

/** Crea una copia nueva y la sella (inmutable en runtime). */
export function sealMovement(movement: Movement): Readonly<Movement> {
  const sealed = {
    ...movement,
    description: movement.description,
    amount: movement.amount,
  };

  return Object.freeze(sealed);
}

/** Sella cada movimiento sin reutilizar referencias del array original. */
export function sealMovements(movements: Movement[]): Readonly<Movement>[] {
  return movements.map((movement) => sealMovement({ ...movement }));
}

/** Alta append-only: nuevo array, sin mutar ni reutilizar referencias previas. */
export function appendMovement(
  current: Readonly<Movement>[],
  movement: Movement,
): Readonly<Movement>[] {
  const nextMovement = sealMovement({ ...movement });

  return [...current.map((item) => sealMovement({ ...item })), nextMovement];
}

/** Reemplaza un movimiento existente sin mutar el array original (mismo id, sin duplicar). */
export function replaceMovement(
  current: Readonly<Movement>[],
  id: string,
  updates: Pick<
    Movement,
    'description' | 'amount' | 'type' | 'date' | 'category' | 'account' | 'channel' | 'expenseKind'
  >,
): Readonly<Movement>[] {
  return current.map((item) =>
    item.id === id
      ? sealMovement({
          id: item.id,
          description: updates.description.trim(),
          amount: Number(updates.amount),
          type: updates.type,
          date: updates.date,
          category: updates.category,
          account: updates.account,
          channel: updates.channel,
          ...(updates.type === 'expense'
            ? {
                expenseKind:
                  updates.expenseKind ?? getExpenseCategoryKind(updates.category),
              }
            : {}),
        })
      : sealMovement({ ...item }),
  );
}

/** Elimina un movimiento sin mutar el array original. */
export function removeMovement(
  current: Readonly<Movement>[],
  id: string,
): Readonly<Movement>[] {
  return current
    .filter((item) => item.id !== id)
    .map((item) => sealMovement({ ...item }));
}

/** Expone copias de solo lectura para la UI (nunca referencias del store). */
export function exposeMovements(movements: Readonly<Movement>[]): Readonly<Movement>[] {
  return transactionsCopy(movements);
}

function transactionsCopy(movements: Readonly<Movement>[]): Readonly<Movement>[] {
  return movements.map((movement) => sealMovement({ ...movement }));
}

export function blockMutationAttempt(): { success: false; message: string } {
  return { success: false, message: IMMUTABLE_MOVEMENT_MESSAGE };
}
