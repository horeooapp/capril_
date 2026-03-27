import { useState, useEffect, useCallback } from 'react';

/**
 * QAPRIL Custom Hooks - Consolidated & API Aligned (March 2026)
 * Based on Ref. QAPRIL/HOOKS/2026-001
 */

// --- UTILS ---

async function apiFetch(path: string, opts: any = {}) {
  // In Next.js App, we usually use relative paths for API routes if they are on the same domain
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

function useQuery(path: string, deps: any[] = []) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch(path);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
}


// ═══════════════════════════════════════════════════════════════════════════════
// MODULE LOCATAIRE
// ═══════════════════════════════════════════════════════════════════════════════

export function useLocataire() {
  return useQuery('/locataires/me');
}

/**
 * Bail actif du locataire with identity masking logic (MM-04b)
 */
export function useBailLocataire() {
  const { data, loading, error } = useQuery('/locataires/me/bail');

  const bailleurAffiche = data ? (() => {
    if (data.typeGestion === 'agreee') {
      return {
        masque: true,
        valeur: data.bailleurCode,
        mention: 'Agence agréée — substitution totale exclusive',
      };
    }
    if (data.bailleurMasque) {
      return {
        masque: true,
        valeur: data.bailleurCode,
        mention: data.typeGestion === 'directe'
          ? 'Le propriétaire a choisi de ne pas divulguer son identité'
          : 'Intermédiaire — le propriétaire a choisi de ne pas divulguer son identité',
      };
    }
    return {
      masque: false,
      valeur: data.bailleurNom,
      mention: data.typeGestion === 'directe' ? 'Gestion directe — identité visible' : 'Intermédiaire de gestion',
    };
  })() : null;

  return { bail: data, bailleurAffiche, loading, error };
}

export function useQuittancesLocataire() {
  return useQuery('/locataires/me/quittances');
}

export function useAbonnementsEnergie() {
  return useQuery('/locataires/me/abonnements-energie');
}

export function useCautionLocataire() {
  return useQuery('/locataires/me/caution');
}

export function useTicketsLocataire() {
  const { data, loading, error, refetch } = useQuery('/locataires/me/tickets');

  const ticketActif   = data?.find((t: any) => t.statut === 'En attente bailleur') || null;
  const ticketsResolus = data?.filter((t: any) => t.statut !== 'En attente bailleur') || [];

  // 144h SLA Logic (MM-03)
  const ticketAvecSLA = ticketActif ? (() => {
    const createdAt = new Date(ticketActif.createdAt).getTime();
    const now = Date.now();
    const heuresPassees = (now - createdAt) / 3600000;
    const heuresRestantes = Math.max(0, 144 - heuresPassees);
    const favorLocataire = heuresPassees > 144;
    
    return {
      ...ticketActif,
      heuresRestantes,
      favorLocataire,
      pourcentageTemps: Math.min(100, (heuresPassees / 144) * 100)
    };
  })() : null;

  return { ticketActif: ticketAvecSLA, ticketsResolus, loading, error, refetch };
}

export function useMrlDemande() {
  return useQuery('/locataires/me/mrl-demandes');
}

export function useSoumettreRCL() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const soumettre = async (payload: any) => {
    setLoading(true);
    try {
      const res = await apiFetch('/locataires/me/tickets', {
        method: 'POST',
        body: payload,
      });
      return res; 
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { soumettre, loading, error };
}

export function useRepondreMRL() {
  const repondre = async (demandeId: string, reponse: string) => {
    return apiFetch(`/locataires/me/mrl-demandes/${demandeId}/repondre`, {
      method: 'POST',
      body: { reponse }, 
    });
  };
  return { repondre };
}

export function useInitierPreavis() {
  const initier = async (dateDepartSouhaitee: string, creneauEDL: string) => {
    return apiFetch('/locataires/me/preavis', {
      method: 'POST',
      body: { dateDepartSouhaitee, creneauEDL },
    });
  };
  return { initier };
}


// ═══════════════════════════════════════════════════════════════════════════════
// MODULE PROPRIÉTAIRE
// ═══════════════════════════════════════════════════════════════════════════════

export function useProprietaire() {
  return useQuery('/proprietaires/me');
}

/**
 * Patrimoine complet with aggregates
 */
export function usePatrimoine() {
  const { data, loading, error, refetch } = useQuery('/proprietaires/me/patrimoine');

  const toutes = data
    ? data.flatMap((e: any) => e.type === 'standalone' ? [e] : (e.unites || []).map((u: any) => ({ ...u, _entite: e })))
    : [];

  const totalLoyers = toutes.filter((u: any) => u.statut === 'occupé').reduce((s: number, u: any) => s + u.loyer, 0);
  const encaisse    = toutes.filter((u: any) => u.paiement === 'À jour').reduce((s: number, u: any) => s + u.loyer, 0);
  const impayesN    = toutes.filter((u: any) => u.paiement === 'Impayé').length;
  const vacants     = toutes.filter((u: any) => u.statut === 'vacant').length;

  return { patrimoine: data || [], totalLoyers, encaisse, impayesN, vacants, loading, error, refetch };
}

export function useRetirerEntite() {
  const [loading, setLoading] = useState(false);
  const retirer = async (entiteId: string) => {
    setLoading(true);
    try {
      return await apiFetch(`/proprietaires/me/patrimoine/${entiteId}`, {
        method: 'DELETE',
        body: { confirmation: true },
      });
    } finally {
      setLoading(false);
    }
  };
  return { retirer, loading };
}

export function useEmettreQuittance() {
  const emettre = async (uniteId: string, mois: string, montant: number, modePaiement: string) => {
    return apiFetch('/proprietaires/me/quittances', {
      method: 'POST',
      body: { uniteId, mois, montant, modePaiement },
    });
  };
  return { emettre };
}

export function useDemanderMRL() {
  const demander = async (bailRef: string, nouveauLoyer: number, dateEffet: string) => {
    return apiFetch(`/proprietaires/me/bails/${bailRef}/mrl-demande`, {
      method: 'POST',
      body: { nouveauLoyer, dateEffet },
    });
  };
  return { demander };
}


// ═══════════════════════════════════════════════════════════════════════════════
// MODULE AGENCE
// ═══════════════════════════════════════════════════════════════════════════════

export function useAgence() {
  return useQuery('/agences/me');
}

export function useMandats(filtre = 'tous') {
  const { data, loading, error, refetch } = useQuery('/agences/me/mandats');

  const mandatsFiltres = data
    ? data.filter((b: any) => {
        if (filtre === 'tous')    return true;
        if (filtre === 'occupés') return b.statut === 'occupé';
        if (filtre === 'vacants') return b.statut === 'vacant';
        if (filtre === 'impayés') return b.paiement === 'Impayé' || b.paiement === 'Partiel';
        return true;
      })
    : [];

  const totalLoyers   = data?.filter((b: any) => b.statut === 'occupé').reduce((s: number, b: any) => s + b.loyer, 0) || 0;
  const encaisse      = data?.filter((b: any) => b.paiement === 'À jour').reduce((s: number, b: any) => s + b.loyer, 0) || 0;
  const impayesCount  = data?.filter((b: any) => b.paiement === 'Impayé').length || 0;

  return { mandats: data || [], mandatsFiltres, totalLoyers, encaisse, impayesCount, loading, error, refetch };
}

export function useCandidats() {
  const { data, loading, error, refetch } = useQuery('/agences/me/candidats');

  const demanderScore = async (candidatId: string) => {
    await apiFetch(`/agences/me/candidats/${candidatId}/demander-score`, { method: 'POST' });
    refetch();
  };

  return { candidats: data || [], demanderScore, loading, error, refetch };
}

export function useSignatures() {
  const { data, loading, error, refetch } = useQuery('/agences/me/signatures');
  const relancer = async (sigId: string) => {
    await apiFetch(`/agences/me/signatures/${sigId}/relancer`, { method: 'POST' });
    refetch();
  };
  return { signatures: data || [], relancer, loading, error };
}


// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE MONEY EXTENSION
// ═══════════════════════════════════════════════════════════════════════════════

export function useMobileMoneyLocataire() {
  const { data, loading, error } = useQuery('/locataires/me/bail/mobile-money');
  const numerosActifs = data?.filter((mm: any) => mm.actif) || [];
  const numeroDefaut  = numerosActifs.find((mm: any) => mm.defaut) || numerosActifs[0] || null;
  return { numerosMM: data || [], numerosActifs, numeroDefaut, loading, error };
}

export function useInitierPaiementMM() {
  const [loading, setLoading] = useState(false);
  const [statut,  setStatut]  = useState<string | null>(null);

  const initier = async (payload: any) => {
    setLoading(true);
    setStatut('en_attente');
    try {
      return await apiFetch('/locataires/me/bail/paiement-mm/initier', {
        method: 'POST',
        body: payload,
      });
    } catch (e) {
      setStatut(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const verifierStatut = async (paiementId: string) => {
    const res = await apiFetch(`/locataires/me/bail/paiement-mm/${paiementId}/statut`);
    setStatut(res.statut);
    return res;
  };

  return { initier, verifierStatut, loading, statut };
}
