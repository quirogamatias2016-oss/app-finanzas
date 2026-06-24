import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const syncLogCol = collection(db, 'sync_log');

export async function logManualSync(): Promise<void> {
  await addDoc(syncLogCol, {
    action: 'manual_sync',
    timestamp: new Date().toISOString(),
  });
}
