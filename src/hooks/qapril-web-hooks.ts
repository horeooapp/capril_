import { useState, useEffect } from 'react';
import { getAgencyDashboardData } from '@/actions/agency-actions';

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
 * Hook for Agency (Agence)
 */
export function useAgencyData(initialData?: any) {
  const [data, setData] = useState<{ user: any, properties: any[], candidates: any[], kpis?: any } | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }
    async function load() {
      try {
        setLoading(true);
        const res = await getAgencyDashboardData();
        if (res?.success && res.data) {
          setData({
            user: res.data.user,
            properties: res.data.properties || [],
            candidates: res.data.candidatures || [],
            kpis: res.data.kpis || null,
          });
        } else {
          // Fallback gracieux pour afficher l'interface agence même sans données initiales
          setData({
            user: { agencyRole: 'chef' },
            properties: [],
            candidates: [],
            kpis: null,
          });
        }
      } catch (e: any) {
        console.warn('[useAgencyData] Fallback server action:', e);
        setData({
          user: { agencyRole: 'chef' },
          properties: [],
          candidates: [],
          kpis: null,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialData]);

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
