import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';

export default function FinanceScreen() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const response = await fetchWithAuth('/proprietaire/finance');
                const json = await response.json();
                if (response.ok) {
                    setTransactions(json.transactions || []);
                    setBalance(json.balance || 0);
                } else {
                    Alert.alert('Erreur', 'Impossible de charger vos données financières.');
                }
            } catch (e) {
                Alert.alert('Erreur', 'Problème de connexion réseau.');
            } finally {
                setLoading(false);
            }
        };

        fetchFinance();
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
            <View style={styles.header}>
                <Text style={styles.title}>Finances</Text>
                <Text style={styles.subtitle}>Suivi de votre trésorerie</Text>
            </View>

            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Solde total</Text>
                <Text style={styles.balanceAmount}>{balance.toLocaleString()} FCFA</Text>
            </View>

            <Text style={styles.sectionTitle}>Transactions récentes</Text>

            {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Aucune transaction enregistrée.</Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardLeft}>
                                <View style={[
                                    styles.iconContainer, 
                                    item.type === 'INCOME' ? styles.iconIncome : styles.iconExpense
                                ]}>
                                    {item.type === 'INCOME' ? (
                                        <ArrowDownLeft color="#10b981" size={24} />
                                    ) : (
                                        <ArrowUpRight color="#ef4444" size={24} />
                                    )}
                                </View>
                                <View>
                                    <Text style={styles.property}>{item.property}</Text>
                                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            
                            <Text style={[
                                styles.amount, 
                                item.type === 'INCOME' ? styles.textIncome : styles.textExpense
                            ]}>
                                {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString()} FCFA
                            </Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A1128' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 40, paddingBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#9ca3af' },
    balanceCard: { 
        marginHorizontal: 20, 
        padding: 24, 
        backgroundColor: 'rgba(217, 119, 6, 0.1)', 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: 'rgba(217, 119, 6, 0.3)',
        marginBottom: 24,
        alignItems: 'center'
    },
    balanceLabel: { color: '#d97706', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    balanceAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 16 },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#9ca3af', fontSize: 16, textAlign: 'center' },
    card: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#0f172a', 
        borderRadius: 16, 
        padding: 16, 
        marginBottom: 12,
        borderWidth: 1, 
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconContainer: { padding: 10, borderRadius: 12 },
    iconIncome: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    iconExpense: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    property: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 4 },
    date: { fontSize: 12, color: '#9ca3af' },
    amount: { fontSize: 16, fontWeight: 'bold' },
    textIncome: { color: '#10b981' },
    textExpense: { color: '#ef4444' }
});
