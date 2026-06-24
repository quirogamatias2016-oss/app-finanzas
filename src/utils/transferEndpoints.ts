import type { AccountTransfer, PaymentChannel, SavingsGoal, TransferAccount } from '../types';
import type { TransferAccountsInput } from '../store/financeStore';
import { getGoalLabel } from './goalUtils';

export type TransferEndpointType = 'caja' | 'ahorro' | 'pool' | 'meta';

export const TRANSFER_ENDPOINT_TYPES: TransferEndpointType[] = ['caja', 'ahorro', 'pool', 'meta'];

export const TRANSFER_ENDPOINT_LABELS: Record<TransferEndpointType, string> = {
  caja: 'Caja',
  ahorro: 'Ahorro',
  pool: 'Metas (pool)',
  meta: 'Meta',
};

export interface TransferEndpoint {
  type: TransferEndpointType;
  goalId?: string;
}

export interface TransferPreset {
  from?: TransferEndpoint;
  to?: TransferEndpoint;
  /** Atajo: meta destino (asignación interna desde pool) */
  toGoalId?: string;
  /** Atajo: meta origen (devolución al pool) */
  fromGoalId?: string;
}

export function ledgerAccountFromEndpointType(
  type: TransferEndpointType,
): TransferAccount | undefined {
  if (type === 'caja') {
    return 'disponible';
  }

  if (type === 'ahorro') {
    return 'ahorros';
  }

  if (type === 'pool') {
    return 'objetivos';
  }

  return undefined;
}

export function endpointFromPresetField(
  type: TransferEndpointType,
  goalId?: string,
): TransferEndpoint {
  return type === 'meta' ? { type, goalId } : { type };
}

export function resolveTransferPreset(preset?: TransferPreset): {
  from: TransferEndpoint;
  to: TransferEndpoint;
} {
  if (preset?.from) {
    return {
      from: preset.from,
      to: preset.to ?? { type: 'ahorro' },
    };
  }

  if (preset?.to) {
    return {
      from: { type: 'caja' },
      to: preset.to,
    };
  }

  if (preset?.toGoalId) {
    return {
      from: { type: 'pool' },
      to: { type: 'meta', goalId: preset.toGoalId },
    };
  }

  if (preset?.fromGoalId) {
    return {
      from: { type: 'meta', goalId: preset.fromGoalId },
      to: { type: 'pool' },
    };
  }

  return {
    from: { type: 'caja' },
    to: { type: 'ahorro' },
  };
}

export function areTransferEndpointsEqual(a: TransferEndpoint, b: TransferEndpoint): boolean {
  if (a.type !== b.type) {
    return false;
  }

  if (a.type === 'meta') {
    return Boolean(a.goalId) && a.goalId === b.goalId;
  }

  return true;
}

export function isAllowedTransferPair(from: TransferEndpoint, to: TransferEndpoint): boolean {
  if (areTransferEndpointsEqual(from, to)) {
    return false;
  }

  if (from.type === 'meta' && !from.goalId) {
    return false;
  }

  if (to.type === 'meta' && !to.goalId) {
    return false;
  }

  const fromLedger = from.type === 'caja' || from.type === 'ahorro';
  const toLedger = to.type === 'caja' || to.type === 'ahorro';

  if (from.type === 'meta' && toLedger) {
    return false;
  }

  if (to.type === 'meta' && fromLedger) {
    return false;
  }

  if (from.type === 'pool' && to.type === 'pool') {
    return false;
  }

  return true;
}

export function isValidTransferEndpoints(from: TransferEndpoint, to: TransferEndpoint): boolean {
  return isAllowedTransferPair(from, to);
}

export function endpointToFromFields(
  endpoint: TransferEndpoint,
): Pick<TransferAccountsInput, 'fromAccount' | 'fromGoalId'> {
  if (endpoint.type === 'meta') {
    return { fromGoalId: endpoint.goalId };
  }

  const account = ledgerAccountFromEndpointType(endpoint.type);
  return account ? { fromAccount: account } : {};
}

export function endpointToToFields(
  endpoint: TransferEndpoint,
): Pick<TransferAccountsInput, 'toAccount' | 'toGoalId'> {
  if (endpoint.type === 'meta') {
    return { toGoalId: endpoint.goalId };
  }

  const account = ledgerAccountFromEndpointType(endpoint.type);
  return account ? { toAccount: account } : {};
}

export function buildTransferAccountsInput(
  from: TransferEndpoint,
  to: TransferEndpoint,
  channel: PaymentChannel,
  amount: number,
): TransferAccountsInput {
  return {
    ...endpointToFromFields(from),
    ...endpointToToFields(to),
    channel,
    amount,
  };
}

export function getFromEndpointFromInput(
  input: Pick<TransferAccountsInput, 'fromAccount' | 'fromGoalId'>,
): TransferEndpoint {
  if (input.fromGoalId) {
    return { type: 'meta', goalId: input.fromGoalId };
  }

  if (input.fromAccount === 'objetivos') {
    return { type: 'pool' };
  }

  return input.fromAccount === 'ahorros' ? { type: 'ahorro' } : { type: 'caja' };
}

export function getToEndpointFromInput(
  input: Pick<TransferAccountsInput, 'toAccount' | 'toGoalId'>,
): TransferEndpoint {
  if (input.toGoalId) {
    return { type: 'meta', goalId: input.toGoalId };
  }

  if (input.toAccount === 'objetivos') {
    return { type: 'pool' };
  }

  return input.toAccount === 'ahorros' ? { type: 'ahorro' } : { type: 'caja' };
}

export function getTransferFromEndpoint(transfer: AccountTransfer): TransferEndpoint {
  if (transfer.fromGoalId) {
    return { type: 'meta', goalId: transfer.fromGoalId };
  }

  if (transfer.fromAccount === 'objetivos') {
    return { type: 'pool' };
  }

  return transfer.fromAccount === 'ahorros' ? { type: 'ahorro' } : { type: 'caja' };
}

export function getTransferToEndpoint(transfer: AccountTransfer): TransferEndpoint {
  if (transfer.toGoalId) {
    return { type: 'meta', goalId: transfer.toGoalId };
  }

  if (transfer.toAccount === 'objetivos') {
    return { type: 'pool' };
  }

  return transfer.toAccount === 'ahorros' ? { type: 'ahorro' } : { type: 'caja' };
}

export function formatTransferEndpointLabel(
  endpoint: TransferEndpoint,
  goals: Readonly<SavingsGoal>[],
): string {
  if (endpoint.type === 'meta') {
    const title = getGoalLabel(goals, endpoint.goalId);
    return title ? `Meta · ${title}` : 'Meta';
  }

  return TRANSFER_ENDPOINT_LABELS[endpoint.type];
}

export function formatTransferRoute(
  transfer: AccountTransfer,
  goals: Readonly<SavingsGoal>[],
): string {
  const from = formatTransferEndpointLabel(getTransferFromEndpoint(transfer), goals);
  const to = formatTransferEndpointLabel(getTransferToEndpoint(transfer), goals);
  return `${from} → ${to}`;
}

export function getDefaultDestinationType(from: TransferEndpoint): TransferEndpointType {
  if (from.type === 'caja') {
    return 'ahorro';
  }

  if (from.type === 'ahorro') {
    return 'caja';
  }

  if (from.type === 'pool') {
    return 'caja';
  }

  return 'pool';
}

export function inferTransferKind(
  input: TransferAccountsInput,
): 'external' | 'internal' | 'account' {
  if (input.fromGoalId || input.toGoalId) {
    return 'internal';
  }

  if (input.fromAccount === 'objetivos' || input.toAccount === 'objetivos') {
    return 'external';
  }

  return 'account';
}
