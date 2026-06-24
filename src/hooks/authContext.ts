import { createContext } from 'react';
import type { Session } from '../types';

export interface AuthContextValue {
  session: Session | null;
  registeredUsername: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  isFirstSetup: boolean;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
