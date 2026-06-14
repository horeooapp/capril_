import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, FileText } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';

export default function ReceiptsScreen() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const response = await fetchWithAuth('/locataire/receipts');
                const json = await response.json();
                if (response.ok) {
                    setReceipts(json.receipts || []);
                } else {
                    Alert.alert('Erreur', 'Impossible de charger vos quittances.');
                }
            } catch (e) {
                Alert.alert('Erreur', 'Problème de connexion réseau.');
            } finally {
                setLoading(false);
            }
        };

        fetchReceipts();
    }, []);

    const handleDownload = (id: string) => {
        Alert.alert("Téléchargement", `Téléchargement de la quittance ${id} en cours...`);
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
            <View style={styles.header}>
                <Text style={styles.title}>Mes Quittances</Text>
                <Text style={styles.subtitle}>Retrouvez l'historique de vos paiements</Text>
            </View>

            {receipts.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Aucune quittance disponible pour le moment.</Text>
                </View>
            ) : (
                <FlatList
                    data={receipts}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardLeft}>
                                <View style={styles.iconContainer}>
                                    <FileText color="#10b981" size={24} />
                                </View>
                                <View>
                                    <Text style={styles.month}>{item.period || 'Mois inconnu'}</Text>
                                    <Text style={styles.date}>Payé le {new Date(item.date).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.cardRight}>
                                <Text style={styles.amount}>{item.amount.toLocaleString()} FCFA</Text>
                                <Pressable 
                                    style={styles.downloadBtn}
                                    onPress={() => handleDownload(item.id)}
                                >
                                    <Download color="#10b981" size={20} />
                                </Pressable>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#021812' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 40, paddingBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#9ca3af' },
    list: { padding: 20, paddingBottom: 100 },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#9ca3af', fontSize: 16, textAlign: 'center' },
    card: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#022c22', 
        borderRadius: 16, 
        padding: 16, 
        marginBottom: 12,
        borderWidth: 1, 
        borderColor: 'rgba(52, 211, 153, 0.1)'
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconContainer: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 10, borderRadius: 12 },
    month: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 4 },
    date: { fontSize: 12, color: '#9ca3af' },
    cardRight: { alignItems: 'flex-end', gap: 8 },
    amount: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    downloadBtn: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 8 }
});
