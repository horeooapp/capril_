import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';

export default function PropertiesScreen() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetchWithAuth('/proprietaire/properties');
                const json = await response.json();
                if (response.ok) {
                    setProperties(json.properties || []);
                } else {
                    Alert.alert('Erreur', 'Impossible de charger vos biens.');
                }
            } catch (e) {
                Alert.alert('Erreur', 'Problème de connexion réseau.');
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
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
                <Text style={styles.title}>Mes Biens</Text>
                <Text style={styles.subtitle}>Gérez votre patrimoine immobilier</Text>
            </View>

            {properties.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Vous ne possédez aucun bien pour le moment.</Text>
                </View>
            ) : (
                <FlatList
                    data={properties}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardLeft}>
                                <View style={styles.iconContainer}>
                                    <Building2 color="#3b82f6" size={24} />
                                </View>
                                <View>
                                    <Text style={styles.propertyName}>{item.name}</Text>
                                    <Text style={styles.propertyAddress}>{item.address}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.cardRight}>
                                <View style={[
                                    styles.statusBadge, 
                                    item.status === 'Occupé' ? styles.statusOccupied : styles.statusVacant
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        item.status === 'Occupé' ? styles.statusTextOccupied : styles.statusTextVacant
                                    ]}>{item.status}</Text>
                                </View>
                                <Text style={styles.rent}>{item.rent > 0 ? `${item.rent.toLocaleString()} FCFA` : '-'}</Text>
                            </View>
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
    list: { padding: 20, paddingBottom: 100 },
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
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    iconContainer: { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 10, borderRadius: 12 },
    propertyName: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 4 },
    propertyAddress: { fontSize: 12, color: '#9ca3af' },
    cardRight: { alignItems: 'flex-end', gap: 8 },
    rent: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusOccupied: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    statusVacant: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    statusTextOccupied: { color: '#10b981' },
    statusTextVacant: { color: '#ef4444' }
});
