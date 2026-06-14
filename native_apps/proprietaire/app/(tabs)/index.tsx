import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await fetchWithAuth('/proprietaire/dashboard');
                const json = await response.json();
                if (response.ok) {
                    setData(json);
                } else {
                    Alert.alert("Erreur", json.error || "Impossible de charger les données");
                }
            } catch (e: any) {
                if (e.message.includes('Non autorisé')) {
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

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#d97706" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Bonjour 👋</Text>
                    <Text style={styles.subtitle}>Voici le résumé de votre parc</Text>
                </View>

                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Revenus du mois</Text>
                        <Text style={styles.kpiValue}>
                            {data?.monthlyRevenue?.toLocaleString('fr-FR') || 0}
                        </Text>
                        <Text style={styles.kpiCurrency}>{data?.currency || 'FCFA'}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Occupation</Text>
                        <Text style={[styles.kpiValue, { color: '#10b981' }]}>{data?.occupancyRate || 0}%</Text>
                        <Text style={styles.kpiSubtitle}>{data?.vacantProperties || 0} biens vacants</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
                    <View style={styles.alertCard}>
                        <Text style={styles.alertText}>
                            Vous possédez {data?.totalProperties || 0} bien(s) au total.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A1128' },
    center: { justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 20 },
    header: { marginBottom: 30 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#9ca3af', marginTop: 4 },
    kpiGrid: { flexDirection: 'row', gap: 16, marginBottom: 30 },
    kpiCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.3)' },
    kpiLabel: { fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 },
    kpiValue: { fontSize: 28, fontWeight: '900', color: '#fff' },
    kpiCurrency: { fontSize: 12, color: '#d97706', fontWeight: 'bold' },
    kpiSubtitle: { fontSize: 12, color: '#ef4444', marginTop: 4 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    alertCard: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
    alertText: { color: '#fca5a5' }
});
