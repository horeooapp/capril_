import { useState, useEffect, useCallback } from 'react';

/**
 * QAPRIL Mobile Hooks - REST API Connection
 * Handles the communication between the Expo app and the NestJS/Next.js backend.
 */

// In development, use your computer's local IP (e.g. 192.168.x.x) if testing on a real device
const API_BASE_URL = 'http://localhost:3000/api/v1'; // Adjust to your actual server URL

let AUTH_TOKEN: string | null = null;

/**
 * Set the authentication token for subsequent requests
 */
export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
}

/**
 * API Fetch wrapper for mobile
 */
async function apiFetch(path: string, opts: any = {}) {
  const url = `${API_BASE_URL}${path}`;
  
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
    throw new Error(errorBody.error || `Error ${res.status}: ${res.statusText}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => {
    if (AUTH_TOKEN || path.includes('/auth/')) {
       fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════════

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOTP = async (email: string) => {
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

  const verifyOTP = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/auth/otp/verify', {
        method: 'POST',
        body: { email, otp }
      });
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { requestOTP, verifyOTP, loading, error };
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

export function useQuittances() {
  return useQuery('/locataires/me/quittances');
}

export function useAbonnementsEnergie() {
  return useQuery('/locataires/me/abonnements-energie');
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

// --- AGENCY HOOKS ---
export function useAgency() {
  return useQuery('/agences/me');
}

export function useAgencyPortfolio() {
  return useQuery('/agences/portfolio');
}

export function useCandidates() {
  return useQuery('/agences/candidates');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE DIASPORA
// ═══════════════════════════════════════════════════════════════════════════════

export function useDiaspora() {
  return useQuery('/diaspora/me');
}

export function useDiasporaStats() {
  return useQuery('/diaspora/stats');
}

export function useDiasporaTransfer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transfer = async (amountFcfa: number, currency: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/diaspora/transfer', {
        method: 'POST',
        body: { amountFcfa, currency }
      });
      return res;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/diaspora/invite', {
        method: 'POST'
      });
      return res;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { transfer, generateInvite, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE INTERMÉDIAIRE
// ═══════════════════════════════════════════════════════════════════════════════

export function useIntermediaire() {
  return useQuery('/intermediaires/me');
}

export function useIntermediaireStats() {
  return useQuery('/intermediaires/stats');
}

export function useIntermediaireActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = async (action: string, params: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/intermediaires/actions', {
        method: 'POST',
        body: { action, ...params }
      });
      return res;
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
// MODULE BAUX / LEASES
// ═══════════════════════════════════════════════════════════════════════════════

export function useLeaseActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLease = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/agences/leases/create', {
        method: 'POST',
        body: data
      });
      return res;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createLease, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE WALLET / PAIEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export function usePaymentActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payReceipt = async (receiptId: string, channel: string = 'WAVE_CI') => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/wallet/pay', {
        method: 'POST',
        body: { receiptId, channel }
      });
      return res;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { payReceipt, loading, error };
}
