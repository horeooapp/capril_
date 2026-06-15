import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useRouter } from 'expo-router';
import { FileDown, CalendarClock, AlertCircle, CheckCircle2, Wallet, PenTool, FileSignature } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
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
            {/* Background elements */}
            <View style={[styles.glow, styles.glow1]} />
            <View style={[styles.glow, styles.glow2]} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Bonjour 👋</Text>
                    <Text style={styles.subtitle}>
                        {data?.hasLease ? data.propertyName : "Bienvenue sur votre espace"}
                    </Text>
                </View>

                {data?.hasLease ? (
                    <>
                        <LinearGradient 
                            colors={['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.05)']}
                            style={styles.card}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Loyer de ce mois</Text>
                                <View style={[styles.statusBadge, data.rentStatus === 'PENDING' ? { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b' } : { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981' }]}>
                                    {data.rentStatus === 'PENDING' ? <AlertCircle color="#f59e0b" size={14} /> : <CheckCircle2 color="#10b981" size={14} />}
                                    <Text style={[styles.statusText, data.rentStatus === 'PENDING' ? { color: '#fbbf24' } : { color: '#34d399' }]}>
                                        {data.rentStatus === 'PENDING' ? 'En attente' : 'Payé'}
                                    </Text>
                                </View>
                            </View>
                            
                            <Text style={styles.amount}>
                                {data.currentRentAmount.toLocaleString('fr-FR')} {data.currency}
                            </Text>

                            <View style={styles.dateRow}>
                                <CalendarClock color="#9ca3af" size={16} />
                                <Text style={styles.dateText}>
                                    Prochaine échéance : <Text style={styles.dateHighlight}>{formatDate(data.nextPaymentDate)}</Text>
                                </Text>
                            </View>
                        </LinearGradient>

                        <View style={styles.kpiGrid}>
                            <View style={styles.kpiBox}>
                                <PenTool color="#10b981" size={24} style={{ marginBottom: 8 }} />
                                <Text style={styles.kpiVal}>{data.openMaintenanceCount || 0}</Text>
                                <Text style={styles.kpiLabel}>Requêtes Ouvertes</Text>
                            </View>
                            <View style={styles.kpiBox}>
                                <Wallet color="#f59e0b" size={24} style={{ marginBottom: 8 }} />
                                <Text style={styles.kpiVal}>{data.recentReceipts?.length || 0}</Text>
                                <Text style={styles.kpiLabel}>Quittances</Text>
                            </View>
                        </View>
                    </>
                ) : data?.pendingLease ? (
                    <View style={[styles.card, { borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.05)' }]}>
                        <Text style={[styles.cardTitle, { color: '#fcd34d' }]}>Nouveau Bail en Attente</Text>
                        <Text style={[styles.amount, { fontSize: 24, marginBottom: 12 }]}>Signature requise</Text>
                        <Text style={{ color: '#d1d5db', marginBottom: 20, fontSize: 14, lineHeight: 20 }}>
                            Un contrat pour "{data.pendingLease.propertyName}" ({data.pendingLease.rentAmount} FCFA/mois) attend votre validation.
                        </Text>
                        <Pressable 
                            style={[styles.leaseButton, { backgroundColor: '#f59e0b', borderColor: '#d97706', marginBottom: 0 }]} 
                            onPress={() => router.push('/(tabs)/leases' as any)}
                        >
                            <FileSignature color="#fff" size={20} />
                            <Text style={[styles.leaseButtonText, { color: '#fff' }]}>Examiner le contrat</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Information</Text>
                        <Text style={[styles.amount, { fontSize: 18 }]}>Aucun bail actif détecté.</Text>
                    </View>
                )}

                {data?.hasLease && (
                    <Pressable style={styles.leaseButton} onPress={handleDownloadLease}>
                        <FileDown color="#10b981" size={20} />
                        <Text style={styles.leaseButtonText}>Télécharger mon contrat de bail</Text>
                    </Pressable>
                )}

                {data?.hasLease && data.recentReceipts && data.recentReceipts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dernières Quittances</Text>
                        {data.recentReceipts.map((rec: any, idx: number) => (
                            <View key={idx} style={styles.receiptRow}>
                                <View style={styles.receiptIcon}>
                                    <FileDown color="#34d399" size={20} />
                                </View>
                                <View style={styles.receiptInfo}>
                                    <Text style={styles.receiptTitle}>Loyer {rec.periodMonth}</Text>
                                    <Text style={styles.receiptSub}>{rec.status === 'PAID' ? 'Payé' : 'En attente'}</Text>
                                </View>
                                <Text style={styles.receiptAmount}>{rec.amount.toLocaleString()} {data.currency}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#021812' },
    center: { justifyContent: 'center', alignItems: 'center' },
    glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15, filter: 'blur(50px)' },
    glow1: { top: -100, right: -50, backgroundColor: '#10B981' },
    glow2: { bottom: -100, left: -50, backgroundColor: '#059669' },
    scroll: { padding: 20 },
    header: { marginBottom: 30 },
    greeting: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: '#a7f3d0', marginTop: 4, fontWeight: '500' },
    
    card: { 
        borderRadius: 24, 
        padding: 24, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: 'rgba(16, 185, 129, 0.3)',
        overflow: 'hidden'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 13, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '800' },
    amount: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 20, letterSpacing: -1 },
    
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    statusText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12 },
    dateText: { color: '#d1d5db', fontSize: 13 },
    dateHighlight: { color: '#fff', fontWeight: 'bold' },

    kpiGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    kpiBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, alignItems: 'center' },
    kpiVal: { fontSize: 24, fontWeight: '900', color: '#fff' },
    kpiLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

    section: { marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    
    leaseButton: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
        padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 24, gap: 12
    },
    leaseButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    
    receiptRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, marginBottom: 12 },
    receiptIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    receiptInfo: { flex: 1 },
    receiptTitle: { color: '#fff', fontWeight: '600', fontSize: 15, marginBottom: 4 },
    receiptSub: { color: '#9ca3af', fontSize: 12 },
    receiptAmount: { color: '#fff', fontWeight: '800', fontSize: 15 }
});
