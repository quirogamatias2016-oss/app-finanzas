import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '../types';
import { markCloudSyncReady } from '../services/cloudSync';
import { getCachedUser, saveUserToCloud, subscribeUserCloud } from '../services/userCloud';
import {
  clearStoredSession,
  createSession,
  resolvePersistedSession,
  saveSession,
  validateSessionAgainstUser,
} from '../utils/session';
import { AuthContext, type AuthContextValue } from '../hooks/authContext';

function credentialsMatch(user: User, username: string, password: string): boolean {
  return user.username === username && user.password === password;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => resolvePersistedSession(getCachedUser()));
  const [storedUser, setStoredUser] = useState<User | null>(() => getCachedUser());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    return subscribeUserCloud((user) => {
      setStoredUser(user);
      markCloudSyncReady('user');
      setIsReady(true);
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return { success: false, message: 'Completa usuario y contraseña.' };
    }

    const currentUser = getCachedUser();

    if (!currentUser) {
      const newUser: User = {
        username: trimmedUsername,
        password: trimmedPassword,
      };

      try {
        await saveUserToCloud(newUser);
      } catch {
        return { success: false, message: 'No se pudo guardar en Firebase.' };
      }
    } else if (!credentialsMatch(currentUser, trimmedUsername, trimmedPassword)) {
      return {
        success: false,
        message: `Credenciales incorrectas. Usa el usuario «${currentUser.username}».`,
      };
    }

    const newSession = createSession(trimmedUsername);
    saveSession(newSession);
    setSession(newSession);

    return { success: true, message: 'Sesión iniciada.' };
  }, []);

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
      isReady,
      isFirstSetup: storedUser === null,
      login,
      logout,
    };
  }, [isReady, login, logout, session, storedUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
