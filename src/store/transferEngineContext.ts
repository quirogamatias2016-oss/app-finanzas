import { createContext } from 'react';
import type { TransferPreset } from '../utils/transferEngine';

export interface TransferEngineContextValue {
  openTransfer: (preset?: TransferPreset) => void;
}

export const TransferEngineContext = createContext<TransferEngineContextValue | null>(null);
