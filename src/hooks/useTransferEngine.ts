import { useContext } from 'react';
import { TransferEngineContext } from '../store/transferEngineContext';

export function useTransferEngine() {
  const context = useContext(TransferEngineContext);

  if (!context) {
    throw new Error('useTransferEngine debe usarse dentro de TransferEngineProvider');
  }

  return context;
}
