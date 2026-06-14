import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';
import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { fetchWithAuth } from '../../lib/api';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/mobile';

export default function ProfileScreen() {
    const router = useRouter();
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await fetchWithAuth('/auth/me');

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error("Erreur récupération profil", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/');
    };

    const handleCheckUpdate = async () => {
        try {
            setIsCheckingUpdate(true);
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert(
                    "Mise à jour disponible",
                    "Une nouvelle version de l'application est disponible. Voulez-vous l'installer maintenant ?",
                    [
                        { text: "Plus tard", style: "cancel" },
                        { text: "Installer", onPress: async () => {
                            try {
                                await Updates.fetchUpdateAsync();
                                await Updates.reloadAsync();
                            } catch (e) {
                                Alert.alert("Erreur", "Impossible de télécharger la mise à jour.");
                            }
                        }}
                    ]
                );
            } else {
                Alert.alert("À jour", "Vous disposez déjà de la dernière version de l'application.");
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible de vérifier les mises à jour. Assurez-vous d'être connecté à internet.");
        } finally {
            setIsCheckingUpdate(false);
        }
    };

    const getInitials = () => {
        if (!user) return "MP";
        const f = user.firstName ? user.firstName.charAt(0).toUpperCase() : "";
        const l = user.lastName ? user.lastName.charAt(0).toUpperCase() : "";
        if (!f && !l) return "QA";
        return `${f}${l}`;
    };

    const getKycStatusText = () => {
        if (!user) return "";
        if (user.kycStatus === 'verified') return "Vérifié (KYC Level " + user.kycLevel + ")";
        if (user.kycStatus === 'pending') return "En attente (KYC Level " + user.kycLevel + ")";
        return "Non vérifié (KYC Level " + user.kycLevel + ")";
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil</Text>
            </View>
            
            {loading ? (
                <View style={styles.content}>
                    <ActivityIndicator size="large" color="#d97706" />
                </View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                    <Text style={styles.name}>
                        {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Propriétaire' : 'Propriétaire'}
                    </Text>
                    <Text style={styles.email}>{user?.email || ''}</Text>

                    <View style={styles.kycContainer}>
                        <Text style={styles.kycLabel}>Statut KYC :</Text>
                        <Text style={[styles.kycValue, user?.kycStatus === 'verified' ? styles.kycVerified : styles.kycPending]}>
                            {getKycStatusText()}
                        </Text>
                    </View>

                    <Pressable 
                        style={styles.updateButton} 
                        onPress={handleCheckUpdate}
                        disabled={isCheckingUpdate}
                    >
                        {isCheckingUpdate ? (
                            <ActivityIndicator color="#d97706" />
                        ) : (
                            <Text style={styles.updateText}>Vérifier les mises à jour (OTA)</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Se déconnecter</Text>
                    </Pressable>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A1128' },
    header: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    content: { padding: 20, alignItems: 'center' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#d97706', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    avatarText: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
    name: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    email: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },
    kycContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    kycLabel: { color: '#9ca3af', marginRight: 8, fontSize: 14 },
    kycValue: { fontSize: 14, fontWeight: 'bold' },
    kycVerified: { color: '#34d399' },
    kycPending: { color: '#fbbf24' },
    updateButton: { backgroundColor: 'rgba(217, 119, 6, 0.1)', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.5)', marginBottom: 16, width: '100%', alignItems: 'center' },
    updateText: { color: '#d97706', fontWeight: 'bold' },
    logoutButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)', width: '100%', alignItems: 'center' },
    logoutText: { color: '#ef4444', fontWeight: 'bold' }
});
