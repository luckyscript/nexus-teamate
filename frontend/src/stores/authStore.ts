import { create } from 'zustand';
import type { CurrentUser } from '@/types/auth';

interface AuthState {
  user: CurrentUser | null;
  token: string | null;
  tenantId: number | null;
  setAuth: (token: string, tenantId: number, user: CurrentUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

function loadPersistedState(): Partial<AuthState> {
  const token = localStorage.getItem('auth_token');
  const tenantId = localStorage.getItem('auth_tenant_id');
  const userStr = localStorage.getItem('auth_user');
  return {
    token,
    tenantId: tenantId ? Number(tenantId) : null,
    user: userStr ? JSON.parse(userStr) : null,
  };
}

const persisted = loadPersistedState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: persisted.user ?? null,
  token: persisted.token ?? null,
  tenantId: persisted.tenantId ?? null,

  setAuth: (token, tenantId, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_tenant_id', String(tenantId));
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, tenantId, user });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_tenant_id');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, tenantId: null });
  },

  isAuthenticated: () => {
    const { token, user } = get();
    return !!(token && user);
  },
}));
