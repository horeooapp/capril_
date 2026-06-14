import { View, Text, StyleSheet, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function CreateLeaseScreen() {
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [tenantEmail, setTenantEmail] = useState('');
    const [rentAmount, setRentAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProps, setLoadingProps] = useState(true);

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const res = await fetchWithAuth('/proprietaire/properties');
                const data = await res.json();
                if (res.ok) {
                    // Ne garder que les biens vacants
                    const vacants = data.properties.filter((p: any) => p.status === 'Vacant');
                    setProperties(vacants);
                    if (vacants.length > 0) setSelectedPropertyId(vacants[0].id);
                }
            } catch (e) {
                Alert.alert("Erreur", "Impossible de charger vos biens");
            } finally {
                setLoadingProps(false);
            }
        };
        loadProperties();
    }, []);

    const handleCreate = async () => {
        if (!selectedPropertyId || !tenantEmail || !rentAmount) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        setLoading(true);
        try {
            const res = await fetchWithAuth('/proprietaire/leases/create', {
                method: 'POST',
                body: JSON.stringify({
                    propertyId: selectedPropertyId,
                    tenantEmail: tenantEmail.trim().toLowerCase(),
                    rentAmount: rentAmount
                })
            });
            const data = await res.json();

            if (res.ok) {
                Alert.alert("Succès", "Le bail a été généré en PDF et envoyé au locataire.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Erreur", data.error || "Impossible de créer le bail");
            }
        } catch (e) {
            Alert.alert("Erreur", "Problème de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft color="#fff" size={28} />
                </Pressable>
                <Text style={styles.title}>Nouveau Bail</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.description}>
                        Renseignez les informations du locataire pour générer un contrat de bail PDF officiel certifié par QAPRIL.
                    </Text>

                    {loadingProps ? (
                        <ActivityIndicator color="#d97706" style={{ marginTop: 20 }} />
                    ) : properties.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>Vous n'avez aucun bien vacant. Ajoutez d'abord un bien.</Text>
                        </View>
                    ) : (
                        <View style={styles.form}>
                            <Text style={styles.label}>Sélectionnez un bien vacant</Text>
                            <View style={styles.propertyList}>
                                {properties.map(p => (
                                    <Pressable 
                                        key={p.id} 
                                        style={[styles.propertyCard, selectedPropertyId === p.id && styles.propertyCardSelected]}
                                        onPress={() => setSelectedPropertyId(p.id)}
                                    >
                                        <Text style={[styles.propertyText, selectedPropertyId === p.id && styles.propertyTextSelected]}>
                                            {p.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Text style={styles.label}>Email du locataire (compte QAPRIL)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ex: locataire@gmail.com"
                                placeholderTextColor="#64748b"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={tenantEmail}
                                onChangeText={setTenantEmail}
                            />

                            <Text style={styles.label}>Loyer Mensuel (FCFA)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ex: 250000"
                                placeholderTextColor="#64748b"
                                keyboardType="numeric"
                                value={rentAmount}
                                onChangeText={setRentAmount}
                            />

                            <Pressable 
                                style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
                                onPress={handleCreate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#0A1128" />
                                ) : (
                                    <Text style={styles.submitText}>Générer le contrat PDF</Text>
                                )}
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A1128' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    backBtn: { padding: 4, marginRight: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    keyboardView: { flex: 1 },
    scroll: { padding: 20 },
    description: { color: '#9ca3af', fontSize: 16, marginBottom: 30, lineHeight: 24 },
    emptyCard: { padding: 20, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    emptyText: { color: '#ef4444', textAlign: 'center' },
    form: { gap: 16 },
    label: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: -8 },
    propertyList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
    propertyCard: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#0f172a' },
    propertyCardSelected: { borderColor: '#d97706', backgroundColor: 'rgba(217, 119, 6, 0.1)' },
    propertyText: { color: '#9ca3af', fontWeight: '500' },
    propertyTextSelected: { color: '#d97706', fontWeight: 'bold' },
    input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16 },
    submitBtn: { backgroundColor: '#d97706', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
