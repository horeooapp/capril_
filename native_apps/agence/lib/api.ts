import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

// Détection dynamique et sécurisée de l'URL API (Production QAPRIL)
const getApiUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api/mobile';
        }
        return 'https://qapril.net/api/mobile';
    }
    return 'https://qapril.net/api/mobile';
};

export const API_URL = getApiUrl();

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
