import type { Session, User } from '../types';
import { getItem, removeItem, setItem, STORAGE_KEYS } from './storage';

function isValidSessionPayload(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;

  const session = value as Partial<Session>;
  return (
    typeof session.username === 'string' &&
    session.username.length > 0 &&
    typeof session.loggedInAt === 'string' &&
    session.isLoggedIn === true
  );
}

function migrateLegacySession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.username) return null;

    if (parsed.isLoggedIn === true && parsed.loggedInAt) {
      return parsed as Session;
    }

    const migrated: Session = {
      username: parsed.username,
      loggedInAt: parsed.loggedInAt ?? new Date().toISOString(),
      isLoggedIn: true,
    };

    saveSession(migrated);
    return migrated;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function getStoredSession(): Session | null {
  const session = getItem<unknown>(STORAGE_KEYS.SESSION);
  if (!isValidSessionPayload(session)) return null;
  return session;
}

export function saveSession(session: Session): void {
  setItem(STORAGE_KEYS.SESSION, session);
}

export function clearStoredSession(): void {
  removeItem(STORAGE_KEYS.SESSION);
}

export function createSession(username: string): Session {
  return {
    username,
    loggedInAt: new Date().toISOString(),
    isLoggedIn: true,
  };
}

/** Valida que la sesión corresponda al único usuario registrado en el dispositivo. */
export function validateSessionAgainstUser(
  session: Session | null,
  storedUser: User | null,
): Session | null {
  if (!session || !storedUser) {
    return null;
  }

  if (session.username !== storedUser.username) {
    return null;
  }

  return session;
}

/** Restaura sesión persistente validada contra el usuario local (sesión única). */
export function resolvePersistedSession(storedUser: User | null): Session | null {
  const rawSession = getStoredSession() ?? migrateLegacySession();
  const validSession = validateSessionAgainstUser(rawSession, storedUser);

  if (rawSession && !validSession) {
    clearStoredSession();
  }

  return validSession;
}

export function hasActiveSession(storedUser: User | null): boolean {
  return resolvePersistedSession(storedUser) !== null;
}
