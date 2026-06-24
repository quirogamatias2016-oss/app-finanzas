import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { GlobalTransferModal } from '../components/transfer/GlobalTransferModal';
import type { TransferPreset } from '../utils/transferEngine';
import { TransferEngineContext } from './transferEngineContext';

export function TransferEngineProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preset, setPreset] = useState<TransferPreset | undefined>();

  const openTransfer = useCallback((nextPreset?: TransferPreset) => {
    setPreset(nextPreset);
    setIsOpen(true);
  }, []);

  const closeTransfer = useCallback(() => {
    setIsOpen(false);
    setPreset(undefined);
  }, []);

  const value = useMemo(() => ({ openTransfer }), [openTransfer]);

  return (
    <TransferEngineContext.Provider value={value}>
      {children}
      {isOpen ? <GlobalTransferModal preset={preset} onClose={closeTransfer} /> : null}
    </TransferEngineContext.Provider>
  );
}
