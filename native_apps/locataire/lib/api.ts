import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Gestion du stockage sécurisé universel (Web, Android, iOS)
 */
export async function getStoredToken(): Promise<string | null> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                const item = window.localStorage.getItem('userToken');
                if (item) return item;
            }
            return await AsyncStorage.getItem('userToken');
        }
        return await SecureStore.getItemAsync('userToken');
    } catch {
        try {
            return await AsyncStorage.getItem('userToken');
        } catch {
            return null;
        }
    }
}

export async function setStoredToken(token: string): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('userToken', token);
            }
            await AsyncStorage.setItem('userToken', token);
            return;
        }
        await SecureStore.setItemAsync('userToken', token);
    } catch {
        try {
            await AsyncStorage.setItem('userToken', token);
        } catch {}
    }
}

export async function removeStoredToken(): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('userToken');
            }
            await AsyncStorage.removeItem('userToken');
            return;
        }
        await SecureStore.deleteItemAsync('userToken');
    } catch {
        try {
            await AsyncStorage.removeItem('userToken');
        } catch {}
    }
}

/**
 * Purge intégrale et irréversible de la session mobile locataire et de ses caches (Web & Native)
 */
export async function clearAppSessionAndCache(): Promise<void> {
    try {
        await removeStoredToken();

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                try {
                    window.localStorage.clear();
                } catch {}
                try {
                    window.sessionStorage.clear();
                } catch {}
                try {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i];
                        const eqPos = cookie.indexOf('=');
                        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                        if (name) {
                            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
                        }
                    }
                } catch {}
                if ('caches' in window) {
                    try {
                        const keys = await window.caches.keys();
                        await Promise.all(keys.map(k => window.caches.delete(k)));
                    } catch {}
                }
            }
        }

        try {
            await AsyncStorage.clear();
        } catch {}
    } catch (e) {
        console.warn("Erreur lors de la purge de session mobile:", e);
    }
}

// Détection dynamique de l'URL API
const getApiUrl = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // En aperçu web, cibler le port 3000 de Next.js
        return 'http://localhost:3000/api/mobile';
    }
    if (__DEV__) {
        // IP locale de la machine pour les téléphones physiques et émulateurs
        return 'http://192.168.1.8:3000/api/mobile';
    }
    return 'https://www.qapril.net/api/mobile';
};

export const API_URL = getApiUrl();

/**
 * Wrapper autour de fetch qui injecte automatiquement le token JWT avec gestion de timeout.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = await getStoredToken();
    
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers,
        });

        if (response.status === 401) {
            await removeStoredToken();
            throw new Error('Non autorisé. Veuillez vous reconnecter.');
        }

        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}
