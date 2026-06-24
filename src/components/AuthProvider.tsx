import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '../types';
import { loadUser, saveUser } from '../utils/persistence';
import { STORAGE_KEYS } from '../utils/storage';
import {
  clearStoredSession,
  createSession,
  resolvePersistedSession,
  saveSession,
  validateSessionAgainstUser,
} from '../utils/session';
import { AuthContext, type AuthContextValue } from '../hooks/authContext';

interface AuthBootstrap {
  session: Session | null;
  storedUser: User | null;
}

function bootstrapAuth(): AuthBootstrap {
  const storedUser = loadUser();
  const session = resolvePersistedSession(storedUser);
  return { session, storedUser };
}

function credentialsMatch(user: User, username: string, password: string): boolean {
  return user.username === username && user.password === password;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [bootstrap] = useState<AuthBootstrap>(bootstrapAuth);
  const [session, setSession] = useState<Session | null>(bootstrap.session);
  const [storedUser, setStoredUser] = useState<User | null>(bootstrap.storedUser);

  const syncFromStorage = useCallback(() => {
    const user = loadUser();
    const nextSession = resolvePersistedSession(user);
    setStoredUser(user);
    setSession(nextSession);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.SESSION || event.key === STORAGE_KEYS.USER) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncFromStorage]);

  const login = useCallback(
    (username: string, password: string) => {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      if (!trimmedUsername || !trimmedPassword) {
        return { success: false, message: 'Completa usuario y contraseña.' };
      }

      const currentUser = loadUser();

      if (!currentUser) {
        const newUser: User = {
          username: trimmedUsername,
          password: trimmedPassword,
        };
        saveUser(newUser);
        setStoredUser(newUser);
      } else if (!credentialsMatch(currentUser, trimmedUsername, trimmedPassword)) {
        return {
          success: false,
          message: `Credenciales incorrectas. Este dispositivo usa el usuario «${currentUser.username}».`,
        };
      }

      const newSession = createSession(trimmedUsername);
      saveSession(newSession);
      setSession(newSession);

      return { success: true, message: 'Sesión iniciada.' };
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const validSession = validateSessionAgainstUser(session, storedUser);

    return {
      session: validSession,
      registeredUsername: storedUser?.username ?? null,
      isAuthenticated: validSession !== null,
      isReady: true,
      isFirstSetup: storedUser === null,
      login,
      logout,
    };
  }, [login, logout, session, storedUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
