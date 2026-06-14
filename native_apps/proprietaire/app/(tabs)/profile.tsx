import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';
import { useState } from 'react';

export default function ProfileScreen() {
    const router = useRouter();
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil</Text>
            </View>
            
            <View style={styles.content}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>MP</Text>
                </View>
                <Text style={styles.name}>Monsieur Propriétaire</Text>
                <Text style={styles.email}>proprio@investissement.ci</Text>

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
    email: { fontSize: 14, color: '#9ca3af', marginBottom: 32 },
    updateButton: { backgroundColor: 'rgba(217, 119, 6, 0.1)', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.5)', marginBottom: 16, width: '100%', alignItems: 'center' },
    updateText: { color: '#d97706', fontWeight: 'bold' },
    logoutButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)', width: '100%', alignItems: 'center' },
    logoutText: { color: '#ef4444', fontWeight: 'bold' }
});
