import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useRouter } from 'expo-router';
import { FileDown } from 'lucide-react-native';

export default function DashboardScreen() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await fetchWithAuth('/locataire/dashboard');
                const json = await response.json();
                if (response.ok) {
                    setData(json);
                } else {
                    Alert.alert("Erreur", json.error || "Impossible de charger les données");
                }
            } catch (e: any) {
                if (e.message && e.message.includes('Non autorisé')) {
                    router.replace('/');
                } else {
                    Alert.alert("Erreur réseau", "Vérifiez votre connexion internet.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const handleDownloadLease = async () => {
        try {
            const response = await fetchWithAuth('/locataire/leases');
            const json = await response.json();
            if (response.ok && json.documentUrl) {
                Linking.openURL(json.documentUrl);
            } else {
                Alert.alert("Erreur", "Aucun bail disponible au téléchargement.");
            }
        } catch (e) {
            Alert.alert("Erreur", "Impossible de récupérer le bail.");
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#10B981" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Bonjour 👋</Text>
                    <Text style={styles.subtitle}>
                        {data?.hasLease ? data.propertyName : "Bienvenue sur votre espace"}
                    </Text>
                </View>

                {data?.hasLease ? (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Loyer de ce mois</Text>
                        <Text style={styles.amount}>
                            {data.currentRentAmount.toLocaleString('fr-FR')} {data.currency}
                        </Text>
                        <View style={[styles.statusBadge, data.rentStatus === 'PENDING' && { backgroundColor: '#f59e0b' }]}>
                            <Text style={styles.statusText}>
                                {data.rentStatus === 'PENDING' ? 'En attente' : 'Payé'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Information</Text>
                        <Text style={[styles.amount, { fontSize: 18 }]}>Aucun bail actif détecté.</Text>
                    </View>
                )}

                {data?.hasLease && (
                    <Pressable style={styles.leaseButton} onPress={handleDownloadLease}>
                        <FileDown color="#10b981" size={24} />
                        <Text style={styles.leaseButtonText}>Télécharger mon contrat de bail</Text>
                    </Pressable>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Accès rapides</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridText}>Payer mon loyer</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridText}>Contacter l'agence</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#021812' },
    center: { justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 20 },
    header: { marginBottom: 30 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#9ca3af', marginTop: 4 },
    card: { backgroundColor: '#022c22', borderRadius: 20, padding: 24, marginBottom: 30, borderWidth: 1, borderColor: '#059669' },
    cardTitle: { fontSize: 14, color: '#a7f3d0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    amount: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 12 },
    statusBadge: { backgroundColor: '#f59e0b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
    statusText: { color: '#022c22', fontWeight: 'bold' },
    section: { marginTop: 30 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    alertCard: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
    alertText: { color: '#ef4444' },
    leaseButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        padding: 16, 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: 'rgba(16, 185, 129, 0.3)',
        marginTop: 16,
        gap: 12
    },
    leaseButtonText: { color: '#10b981', fontWeight: 'bold', fontSize: 16 },
    grid: { flexDirection: 'row', gap: 16 },
    gridItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, alignItems: 'center' },
    gridText: { color: '#34d399', fontWeight: 'bold', textAlign: 'center' }
});
