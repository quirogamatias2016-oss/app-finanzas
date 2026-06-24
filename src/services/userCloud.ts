import { db } from '../firebase';
import type { User } from '../types';
import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';

const USER_DOC = doc(db, 'config', 'user');

let cachedUser: User | null = null;
let userReady = false;

function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const value = raw as Partial<User>;
  if (typeof value.username !== 'string' || typeof value.password !== 'string') {
    return null;
  }

  return {
    username: value.username,
    password: value.password,
  };
}

export function getCachedUser(): User | null {
  return cachedUser;
}

export function isUserCloudReady(): boolean {
  return userReady;
}

export function subscribeUserCloud(
  onData: (user: User | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    USER_DOC,
    (snap) => {
      cachedUser = snap.exists() ? normalizeUser(snap.data()) : null;
      userReady = true;
      onData(cachedUser);
    },
    (error) => {
      userReady = true;
      onError?.(error);
    },
  );
}

export async function saveUserToCloud(user: User): Promise<void> {
  cachedUser = user;
  await setDoc(USER_DOC, {
    username: user.username,
    password: user.password,
    updatedAt: new Date().toISOString(),
  });
}

export async function clearUserFromCloud(): Promise<void> {
  cachedUser = null;
  await setDoc(USER_DOC, {
    username: '',
    password: '',
    updatedAt: new Date().toISOString(),
  });
}
