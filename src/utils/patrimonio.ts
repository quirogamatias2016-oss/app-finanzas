import type { AccountBalances, MetasState } from '../types';
import { sumGoalsBalances } from './goalUtils';

export interface PatrimonioBreakdown {
  caja: AccountBalances['disponible'];
  ahorro: AccountBalances['ahorros'];
  metas: MetasState['pool'];
  objetivos: AccountBalances['objetivos'];
  total: number;
}

/** Patrimonio = Caja + Ahorro + pool Metas + dinero en objetivos (sin doble conteo). */
export function getPatrimonioBreakdown(
  balances: AccountBalances,
  metasState: MetasState,
): PatrimonioBreakdown {
  const objetivos = sumGoalsBalances(metasState.goals);
  const { disponible: caja, ahorros: ahorro } = balances;
  const metas = metasState.pool;

  const total =
    caja.efectivo +
    caja.digital +
    ahorro.efectivo +
    ahorro.digital +
    metas.efectivo +
    metas.digital +
    objetivos.efectivo +
    objetivos.digital;

  return { caja, ahorro, metas, objetivos, total };
}
