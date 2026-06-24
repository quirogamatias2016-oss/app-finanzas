import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  type Unsubscribe,
} from 'firebase/firestore';

const col = collection(db, 'movimientos');

export type MovimientoRecord = {
  id: string;
  [key: string]: unknown;
};

export const addMovimiento = async (data: Record<string, unknown>) => {
  return await addDoc(col, {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

export const getMovimientos = async (): Promise<MovimientoRecord[]> => {
  const snap = await getDocs(col);
  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
};

export const updateMovimiento = async (id: string, data: Record<string, unknown>) => {
  await updateDoc(doc(db, 'movimientos', id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteMovimiento = async (id: string) => {
  await deleteDoc(doc(db, 'movimientos', id));
};

export const subscribeMovimientos = (
  callback: (data: MovimientoRecord[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  return onSnapshot(
    col,
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      callback(data);
    },
    (error) => {
      onError?.(error);
    },
  );
};
