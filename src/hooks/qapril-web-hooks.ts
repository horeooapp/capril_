import { useState, useEffect } from 'react';

async function apiFetch(path: string, opts: any = {}) {
  const url = `/api/v1${path}`;
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * Hook for Landlord (Propriétaire)
 */
export function useLandlordData() {
  const [data, setData] = useState<{ user: any, properties: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [user, properties] = await Promise.all([
          apiFetch('/proprietaires/me'),
          apiFetch('/proprietaires/patrimoine'),
        ]);
        setData({ user, properties });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for Agency (Agence)
 */
export function useAgencyData() {
  const [data, setData] = useState<{ user: any, properties: any[], candidates: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [user, properties, candidates] = await Promise.all([
          apiFetch('/agences/me'),
          apiFetch('/agences/portfolio'),
          apiFetch('/agences/candidates').catch(() => ({ candidates: [] })), // Fallback if candidates endpoint not fully ready
        ]);
        setData({ user, properties, candidates: candidates.candidates || [] });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for Diaspora
 */
export function useDiasporaData() {
  const [data, setData] = useState<{ user: any, stats: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [user, stats] = await Promise.all([
          apiFetch('/diaspora/me'),
          apiFetch('/diaspora/stats'),
        ]);
        setData({ user, stats });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for QAPRIL Wallet (ADD-07 v3)
 */
export function useWalletData() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const stats = await apiFetch('/wallet/stats');
      setData(stats);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const recharge = async (amount: number, operator: string, method: string) => {
    return apiFetch('/wallet/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount, operator, method })
    });
  };

  return { data, loading, error, refresh, recharge };
}
