import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// L'URL de l'API dépend de l'environnement
const getApiUrl = () => {
    if (__DEV__) {
        return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/mobile' : 'http://localhost:3000/api/mobile';
    }
    return 'https://www.qapril.net/api/mobile';
};

export const API_URL = getApiUrl();

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

    if (response.status === 401) {
        await SecureStore.deleteItemAsync('userToken');
        throw new Error('Non autorisé. Veuillez vous reconnecter.');
    }

    return response;
}
