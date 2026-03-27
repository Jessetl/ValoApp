import type {
  AuthSession,
  AuthTokens,
  AuthUser,
} from '@/shared/domain/auth/auth.types';
import { create } from 'zustand';
import { secureStorage } from '../storage/app-storage';

const AUTH_SESSION_KEY = 'auth-session';

type PersistedAuthSession = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
};

interface AuthState {
  /** Si el store ya terminó de hidratarse desde persistencia */
  hasHydrated: boolean;
  /** Si el usuario está autenticado */
  isAuthenticated: boolean;
  /** Datos del usuario autenticado */
  user: AuthUser | null;
  /** Access token actual */
  accessToken: string | null;
  /** Refresh token para renovar la sesión */
  refreshToken: string | null;
  /** Si la sesión se está restaurando al abrir la app */
  isRestoringSession: boolean;
  /** Si el modal de login está visible */
  isLoginModalVisible: boolean;

  /** Guarda la sesión completa tras login exitoso */
  setSession: (session: AuthSession) => void;
  /** Actualiza solo los tokens (tras refresh) */
  updateTokens: (tokens: AuthTokens) => void;
  /** Limpia toda la sesión (logout) */
  clearSession: () => void;
  /** Marca que la restauración terminó */
  setRestoringSession: (value: boolean) => void;
  /** Marca que la hidratación del store terminó */
  setHasHydrated: (value: boolean) => void;
  /** Hidrata la sesión persistida en SecureStore */
  hydrateSession: () => Promise<void>;
  /** Abre el modal de login */
  openLoginModal: () => void;
  /** Cierra el modal de login */
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  hasHydrated: false,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isRestoringSession: true,
  isLoginModalVisible: false,

  setSession: (session: AuthSession) => {
    const persistedSession: PersistedAuthSession = {
      isAuthenticated: true,
      user: session.user ?? null,
      accessToken: session.tokens.idToken,
      refreshToken: session.tokens.refreshToken,
    };

    set({
      ...persistedSession,
      isLoginModalVisible: false,
    });

    void secureStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify(persistedSession),
    );
  },

  updateTokens: (tokens: AuthTokens) => {
    set({
      accessToken: tokens.idToken,
      refreshToken: tokens.refreshToken,
    });

    const state = get();
    const persistedSession: PersistedAuthSession = {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      accessToken: tokens.idToken,
      refreshToken: tokens.refreshToken,
    };

    void secureStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify(persistedSession),
    );
  },

  clearSession: () => {
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });

    void secureStorage.removeItem(AUTH_SESSION_KEY);
  },

  setRestoringSession: (value: boolean) => set({ isRestoringSession: value }),

  setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

  hydrateSession: async () => {
    if (get().hasHydrated) {
      return;
    }

    const raw = await secureStorage.getItem(AUTH_SESSION_KEY);

    if (!raw) {
      set({ hasHydrated: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PersistedAuthSession;

      set({
        isAuthenticated: parsed.isAuthenticated,
        user: parsed.user,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        hasHydrated: true,
      });
    } catch {
      await secureStorage.removeItem(AUTH_SESSION_KEY);
      set({ hasHydrated: true });
    }
  },

  openLoginModal: () => set({ isLoginModalVisible: true }),
  closeLoginModal: () => set({ isLoginModalVisible: false }),
}));

// --- Selectores para uso fuera de React (api-client, interceptors) ---

/** Obtiene el access token actual de forma síncrona */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

/** Obtiene el refresh token actual de forma síncrona */
export function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}

/** Actualiza tokens de forma síncrona (para el interceptor) */
export function updateTokensSync(tokens: AuthTokens): void {
  useAuthStore.getState().updateTokens(tokens);
}

/** Limpia sesión de forma síncrona (para el interceptor cuando refresh falla) */
export function clearSessionSync(): void {
  useAuthStore.getState().clearSession();
}
