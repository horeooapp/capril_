// ═══════════════════════════════════════════════════════════════
// QAPRIL — Hooks React
// URLs corrigées : /api/v1/... (pas /v1/...)
// Noms adaptés au schéma Prisma d'Achille
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  QProperty, QLease, QReceipt,
  CreateLeaseDraftDTO, CreateReceiptDTO,
} from '../types/qapril-types';

// ── Configuration API ─────────────────────────────────────────
// ⚠ URL corrigée : /api/v1/ (Next.js App Router d'Achille)
const API = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1`
  : '/api/v1';

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      // NextAuth gère les cookies automatiquement en Next.js
      // Pas besoin de header Authorization manuel si même domaine
      ...opts.headers,
    },
    credentials: 'include', // Pour NextAuth cookies
  });
  if (res.status === 401) {
    // Rediriger vers la page de connexion Next.js
    window.location.href = '/api/auth/signin';
    throw new Error('Non authentifié');
  }
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || e.message || `Erreur ${res.status}`);
  }
  return res.json();
}

// ════════════════════════════════════════════════════════════════
// HOOK : Biens disponibles pour création de bail
// ════════════════════════════════════════════════════════════════
export function usePropertiesDisponibles() {
  const [properties, setProperties] = useState<QProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    apiFetch<QProperty[]>('/properties?status=AVAILABLE')
      .then(setProperties)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { properties, loading, error };
}

// ════════════════════════════════════════════════════════════════
// HOOK : Locataires (pour sélecteur dans formulaire bail)
// Achille utilise /api/v1/... — adapter selon son endpoint exact
// ════════════════════════════════════════════════════════════════
export function useLocataires() {
  const [locataires, setLocataires] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    // Adapter selon l'endpoint d'Achille
    apiFetch<any[]>('/mon-espace-locataires')
      .then(setLocataires)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { locataires, loading };
}

// ════════════════════════════════════════════════════════════════
// HOOK : Baux actifs (pour formulaire quittance)
// ════════════════════════════════════════════════════════════════
export function useLeasesActifs() {
  const [leases, setLeases]   = useState<QLease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<QLease[]>('/baux?status=ACTIVE')
      .then(setLeases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { leases, loading };
}

// ════════════════════════════════════════════════════════════════
// HOOK : Créer/Sauvegarder un draft de bail
// ════════════════════════════════════════════════════════════════
export function useLeaseDraft() {
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sauvegarder = useCallback(async (dto: CreateLeaseDraftDTO): Promise<QLease | null> => {
    setSaving(true);
    setError(null);
    try {
      const url    = dto.leaseId ? `/baux/${dto.leaseId}/draft` : '/baux/draft';
      const method = dto.leaseId ? 'PUT' : 'POST';
      const result = await apiFetch<QLease>(url, { method, body: JSON.stringify(dto) });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      return result;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const valider = useCallback(async (leaseId: string, dto: CreateLeaseDraftDTO): Promise<QLease | null> => {
    setSaving(true);
    setError(null);
    try {
      const url = leaseId ? `/baux/${leaseId}/valider` : '/baux/valider';
      return await apiFetch<QLease>(url, { method: 'POST', body: JSON.stringify(dto) });
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, error, saveSuccess, sauvegarder, valider };
}

// ════════════════════════════════════════════════════════════════
// HOOK : Émettre une quittance
// ════════════════════════════════════════════════════════════════
export function useEmettreReceipt() {
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [receipt, setReceipt] = useState<QReceipt | null>(null);

  const emettre = useCallback(async (dto: CreateReceiptDTO): Promise<QReceipt | null> => {
    setSaving(true);
    setError(null);
    try {
      const result = await apiFetch<QReceipt>('/receipts', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      setReceipt(result);
      return result;
    } catch (e: any) {
      // Erreur RG-QUI-ORDRE — afficher message explicite
      if (e.message?.includes('RG-QUI-ORDRE') || e.message?.includes('Ordre chronologique')) {
        setError(`⚠ ${e.message}`);
      } else {
        setError(e.message);
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, error, receipt, emettre };
}

// ════════════════════════════════════════════════════════════════
// HOOK : Premier mois impayé d'un bail (RG-QUI-ORDRE)
// ════════════════════════════════════════════════════════════════
export function usePremierMoisImpaye(leaseId: string | null) {
  const [mois, setMois]       = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leaseId) return;
    setLoading(true);
    apiFetch<{ mois: string | null }>(`/baux/${leaseId}/premier-mois-impaye`)
      .then(r => setMois(r.mois))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [leaseId]);

  return { mois, loading };
}

// ════════════════════════════════════════════════════════════════
// HOOK : Upload preuve de paiement (Mobile Money sans webhook)
// Utilise le bucket GCS d'Achille
// ════════════════════════════════════════════════════════════════
export function useUploadPreuve() {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [url, setUrl]             = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'payment_proof');
      // Adapter selon l'endpoint d'upload d'Achille (GCS bucket)
      const res = await fetch('/api/v1/kyc/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Upload échoué');
      const { url: fileUrl } = await res.json();
      setUrl(fileUrl);
      return fileUrl;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, error, url, upload };
}

// ════════════════════════════════════════════════════════════════
// HOOK : Groupes/Propriétés (Immeuble, Cour, Résidence)
// ════════════════════════════════════════════════════════════════
export function useGroupesProprietes() {
  const [groupes, setGroupes] = useState<QProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lister les biens qui sont des groupes (typePropriete non null)
    apiFetch<QProperty[]>('/properties?isGroupe=true')
      .then(setGroupes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const creerGroupe = useCallback(async (dto: Partial<QProperty>): Promise<QProperty | null> => {
    try {
      return await apiFetch<QProperty>('/properties', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (e: any) {
      console.error(e);
      return null;
    }
  }, []);

  return { groupes, loading, creerGroupe };
}
