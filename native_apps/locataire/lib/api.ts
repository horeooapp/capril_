import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// L'URL de l'API dépend de l'environnement
const getApiUrl = () => {
    if (__DEV__) {
        // L'adresse IP locale de votre machine (192.168.1.3) fonctionne sur les téléphones physiques et les émulateurs
        return 'http://192.168.1.3:3000/api/mobile';
    }
    return 'https://www.qapril.net/api/mobile';
};

export const API_URL = getApiUrl();

/**
 * Wrapper autour de fetch qui injecte automatiquement le token JWT.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = await SecureStore.getItemAsync('userToken');
    
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Gestion centralisée des erreurs (ex: token expiré)
    if (response.status === 401) {
        await SecureStore.deleteItemAsync('userToken');
        // Dans une vraie application, on utiliserait un event emitter pour déconnecter l'UI
        throw new Error('Non autorisé. Veuillez vous reconnecter.');
    }

    return response;
}
