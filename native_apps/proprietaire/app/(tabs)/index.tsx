import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useRouter } from 'expo-router';
import { Building2, AlertTriangle, FileSignature } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#d97706" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Background Glows */}
            <View style={[styles.glow, styles.glow1]} />
            <View style={[styles.glow, styles.glow2]} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Bonjour 👋</Text>
                    <Text style={styles.subtitle}>Voici le résumé de votre parc</Text>
                </View>

                <LinearGradient 
                    colors={['rgba(217, 119, 6, 0.2)', 'rgba(180, 83, 9, 0.05)']}
                    style={styles.revenueCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.kpiLabel}>Revenus mensuels attendus</Text>
                    <Text style={styles.revenueValue}>
                        {data?.monthlyRevenue?.toLocaleString('fr-FR') || 0} <Text style={styles.kpiCurrency}>{data?.currency || 'FCFA'}</Text>
                    </Text>
                </LinearGradient>

                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <Building2 color="#3b82f6" size={24} style={{ marginBottom: 12 }} />
                        <Text style={styles.kpiValue}>{data?.totalProperties || 0}</Text>
                        <Text style={styles.kpiLabelSmall}>Biens au total</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={[styles.kpiValue, { color: '#10b981' }]}>{data?.occupancyRate || 0}%</Text>
                        <Text style={styles.kpiLabelSmall}>Occupation</Text>
                        <Text style={styles.kpiSubtitle}>{data?.vacantProperties || 0} vacants</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions Requises</Text>
                    
                    <View style={styles.actionGrid}>
                        <Pressable 
                            style={styles.actionCard}
                            onPress={() => {
                                if (data?.pendingLeaseId) {
                                    router.push(`/signature/${data.pendingLeaseId}` as any);
                                } else {
                                    Alert.alert('Info', 'Aucun bail en attente de signature.');
                                }
                            }}
                        >
                            <FileSignature color="#f59e0b" size={24} />
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionVal}>{data?.pendingLeasesCount || 0}</Text>
                                <Text style={styles.actionDesc}>Baux en attente</Text>
                            </View>
                        </Pressable>

                        <View style={styles.actionCard}>
                            <AlertTriangle color="#ef4444" size={24} />
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionVal}>{data?.incidentsCount || 0}</Text>
                                <Text style={styles.actionDesc}>Incidents</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A1128' },
    center: { justifyContent: 'center', alignItems: 'center' },
    glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15, filter: 'blur(50px)' },
    glow1: { top: -100, right: -50, backgroundColor: '#d97706' },
    glow2: { bottom: -100, left: -50, backgroundColor: '#3b82f6' },
    scroll: { padding: 20 },
    header: { marginBottom: 30 },
    greeting: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: '#9ca3af', marginTop: 4, fontWeight: '500' },
    
    revenueCard: { 
        borderRadius: 24, padding: 24, marginBottom: 20, 
        borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.3)',
        alignItems: 'flex-start'
    },
    revenueValue: { fontSize: 36, fontWeight: '900', color: '#fff', marginTop: 8 },
    kpiCurrency: { fontSize: 16, color: '#d97706', fontWeight: 'bold' },
    
    kpiGrid: { flexDirection: 'row', gap: 16, marginBottom: 30 },
    kpiCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    kpiLabel: { fontSize: 12, color: '#fcd34d', textTransform: 'uppercase', fontWeight: '800', letterSpacing: 1 },
    kpiLabelSmall: { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginTop: 4 },
    kpiValue: { fontSize: 28, fontWeight: '900', color: '#fff' },
    kpiSubtitle: { fontSize: 11, color: '#ef4444', marginTop: 4, fontWeight: '700' },
    
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    
    actionGrid: { gap: 12 },
    actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    actionInfo: { marginLeft: 16 },
    actionVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
    actionDesc: { fontSize: 12, color: '#9ca3af', marginTop: 2 }
});
