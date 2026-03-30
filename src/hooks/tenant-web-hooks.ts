import { useState, useEffect } from 'react';

/**
 * QAPRIL Web Hooks for Tenant Portal
 */

async function apiFetch(path: string, opts: any = {}) {
  // Use relative path for Next.js API
  const url = `/api/v1${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Error ${res.status}`);
  }

  return res.json();
}

export function useTenantData() {
  const [data, setData] = useState<{
    loc: any;
    bail: any;
    quittances: any[];
    abos: any;
    tickets: any[];
    caution: any;
    noLease?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [loc, bail, quittances, abos, tickets, caution] = await Promise.all([
          apiFetch('/locataires/me'),
          apiFetch('/locataires/me/bail'),
          apiFetch('/locataires/me/quittances'),
          apiFetch('/locataires/me/abonnements-energie'),
          apiFetch('/locataires/me/tickets'),
          apiFetch('/locataires/me/caution'),
        ]);

        setData({ loc, bail, quittances, abos, tickets, caution });
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
