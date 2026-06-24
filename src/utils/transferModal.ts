import type { PaymentChannel } from '../types';
import type { TransferAccountsInput } from '../store/financeStore';

export type TransferFromContext = 'caja' | 'ahorro' | 'metas' | 'objetivos';

export type TransferDestination = 'caja' | 'ahorro' | 'metas' | 'objetivo';

export function getDestinationOptions(from: TransferFromContext): TransferDestination[] {
  switch (from) {
    case 'caja':
      return ['ahorro', 'metas'];
    case 'ahorro':
      return ['caja', 'metas'];
    case 'metas':
      return ['caja', 'ahorro', 'objetivo'];
    case 'objetivos':
      return ['metas', 'objetivo'];
    default:
      return [];
  }
}

export function buildTransferInput(
  from: TransferFromContext,
  destination: TransferDestination,
  channel: PaymentChannel,
  amount: number,
  options?: {
    toGoalId?: string;
    fromGoalId?: string;
  },
): TransferAccountsInput {
  const toGoalId = options?.toGoalId;
  const fromGoalId = options?.fromGoalId;

  if (from === 'caja' && destination === 'ahorro') {
    return { fromAccount: 'disponible', toAccount: 'ahorros', channel, amount };
  }

  if (from === 'caja' && destination === 'metas') {
    return { fromAccount: 'disponible', toAccount: 'objetivos', channel, amount };
  }

  if (from === 'ahorro' && destination === 'caja') {
    return { fromAccount: 'ahorros', toAccount: 'disponible', channel, amount };
  }

  if (from === 'ahorro' && destination === 'metas') {
    return { fromAccount: 'ahorros', toAccount: 'objetivos', channel, amount };
  }

  if (from === 'metas' && destination === 'caja') {
    return { fromAccount: 'objetivos', toAccount: 'disponible', channel, amount };
  }

  if (from === 'metas' && destination === 'ahorro') {
    return { fromAccount: 'objetivos', toAccount: 'ahorros', channel, amount };
  }

  if (from === 'metas' && destination === 'objetivo' && toGoalId) {
    return { fromAccount: 'objetivos', toGoalId, channel, amount };
  }

  if (from === 'objetivos' && destination === 'metas' && fromGoalId) {
    return { fromGoalId, toAccount: 'objetivos', channel, amount };
  }

  if (from === 'objetivos' && destination === 'objetivo' && fromGoalId && toGoalId) {
    return { fromGoalId, toGoalId, channel, amount };
  }

  throw new Error('Combinación de transferencia inválida.');
}
