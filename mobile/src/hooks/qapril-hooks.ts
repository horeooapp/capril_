import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

/**
 * QAPRIL Mobile Hooks - REST API Connection
 * Aligned with QAPRIL_API_MAPPING.md (March 2026)
 */

const API_BASE_URL = 'https://qapril.ci'; // Reference: QAPRIL_API_BASE_URL

let AUTH_TOKEN: string | null = null;
const TOKEN_KEY = 'QAPRIL_AUTH_TOKEN';

/**
 * Load token from SecureStore on startup
 */
export async function initAuth() {
  AUTH_TOKEN = await SecureStore.getItemAsync(TOKEN_KEY);
  return AUTH_TOKEN;
}

/**
 * Set the authentication token for subsequent requests
 */
export async function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

/**
 * API Fetch wrapper for mobile
 */
export async function apiFetch(path: string, opts: any = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/api') ? path : `/api/v1${path}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };

  if (AUTH_TOKEN) {
    (headers as any)['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || errorBody.message || `Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Generic Query Hook
 */
function useQuery(path: string, deps: any[] = []) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch(path);
      setData(d);
    } catch (e: any) {
      console.error(`[API ERROR] ${path}:`, e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path, ...deps]);

  useEffect(() => {
    if (AUTH_TOKEN || path.includes('/auth/')) {
       fetchData();
    }
  }, [fetchData, path]);

  return { data, loading, error, refetch: fetchData };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION (OTP)
// ═══════════════════════════════════════════════════════════════════════════════

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login with Email and OTP
   * Aligned with Section 2 of QAPRIL_API_MAPPING.md
   */
  const login = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/auth/otp/verify', {
        method: 'POST',
        body: { email, otp }
      });
      
      if (res.token) {
        await setAuthToken(res.token);
      }
      
      return {
        success: true,
        token: res.token,
        profil: res.profile || 'locataire',
        userId: res.userId
      };
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/auth/otp/request', {
        method: 'POST',
        body: { email }
      });
      return res;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { login, requestOtp, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE LOCATAIRE
// ═══════════════════════════════════════════════════════════════════════════════

export function useLocataire() {
  return useQuery('/locataires/me');
}

export function useBail() {
  return useQuery('/locataires/me/bail');
}

export function useQuittances(params: { statut?: string, page?: number } = {}) {
  const query = new URLSearchParams(params as any).toString();
  return useQuery(`/locataires/me/quittances${query ? `?${query}` : ''}`, [query]);
}

export function useAbonnementsEnergie() {
  return useQuery('/locataires/me/abonnements-energie');
}

export function useTickets() {
  return useQuery('/locataires/me/tickets');
}

export function useMrlDemandes() {
  return useQuery('/locataires/me/mrl-demandes');
}

export function useLocataireMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit RCL Ticket
   * Body: { code, description, travauxType?, travauxUrgent? }
   */
  const submitTicket = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch('/locataires/me/tickets', {
        method: 'POST',
        body: data
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const respondMRL = async (id: string, reponse: 'oui' | 'non') => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch(`/locataires/me/mrl-demandes/${id}/repondre`, {
        method: 'POST',
        body: { reponse }
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const submitPreavis = async (data: { dateDepartSouhaitee: string, creneauEDL: string }) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch('/locataires/me/preavis', {
        method: 'POST',
        body: data
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { submitTicket, respondMRL, submitPreavis, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE PROPRIÉTAIRE
// ═══════════════════════════════════════════════════════════════════════════════

export function useProprio() {
  return useQuery('/proprietaires/me');
}

export function usePatrimoine() {
  return useQuery('/proprietaires/patrimoine');
}

export function useProprioMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEntity = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch('/proprietaires/patrimoine', {
        method: 'POST',
        body: data
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove Portefeuille - Soft Delete 10 years (Rule MM-04)
   */
  const removeEntity = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch(`/proprietaires/patrimoine/${id}`, {
        method: 'DELETE',
        body: { confirmation: true }
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateWalletConfig = async (data: { payoutOperator: string, payoutNumber: string }) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch('/wallet/config', {
        method: 'PATCH',
        body: data
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { firstName: string, lastName: string, birthDate: string, birthPlace: string, neighborhood: string, phone: string, docType?: string, docNumber?: string }) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch('/proprietaires/me/profile', {
        method: 'PATCH',
        body: data
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const requestDisbursement = async (amount: number) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch('/wallet/pay', {
        method: 'POST',
        body: { amount }
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { addEntity, removeEntity, updateWalletConfig, updateProfile, requestDisbursement, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE INTERMÉDIAIRE
// ═══════════════════════════════════════════════════════════════════════════════

export function useIntermediaire() {
  return useQuery('/intermediaires/me');
}

export function useIntermediaireActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = async (action: string, params: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch('/intermediaires/actions', {
        method: 'POST',
        body: { action, ...params }
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { performAction, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE DIASPORA
// ═══════════════════════════════════════════════════════════════════════════════

export function useDiaspora() {
  return useQuery('/diaspora/me');
}

export function useDiasporaTransfer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transfer = async (amountFcfa: number, currency: string) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch('/diaspora/transfer', {
        method: 'POST',
        body: { amountFcfa, currency }
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { transfer, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEASE ACTIONS (SHARED)
// ═══════════════════════════════════════════════════════════════════════════════

export function useLeaseActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestMRL = async (bailRef: string, nouveauLoyer: number, dateEffet: string) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch(`/baux/${bailRef}/mrl`, {
        method: 'POST',
        body: { nouveauLoyer, dateEffet }
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { requestMRL, loading, error };
}
