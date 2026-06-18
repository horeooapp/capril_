import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
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
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center p-5 pt-3 border-b border-qgrey-2 bg-white/90">
                <Pressable onPress={() => router.back()} className="p-1 mr-4">
                    <ChevronLeft color="#0F1117" size={28} />
                </Pressable>
                <Text className="text-2xl font-bold text-qnavy">Nouveau Bail</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text className="text-qtext-light text-base mb-8 leading-6">
                        Renseignez les informations du locataire pour générer un contrat de bail PDF officiel certifié par QAPRIL.
                    </Text>

                    {loadingProps ? (
                        <ActivityIndicator color="#FF8B00" style={{ marginTop: 20 }} />
                    ) : properties.length === 0 ? (
                        <View className="p-5 bg-qred-pale rounded-xl border border-qred/30">
                            <Text className="text-qred text-center font-medium">Vous n'avez aucun bien vacant. Ajoutez d'abord un bien.</Text>
                        </View>
                    ) : (
                        <View className="gap-4">
                            <Text className="text-qnavy text-base font-bold mb-[-8px]">Sélectionnez un bien vacant</Text>
                            <View className="flex-row flex-wrap gap-3 mb-2">
                                {properties.map(p => (
                                    <Pressable 
                                        key={p.id} 
                                        className={`p-3 rounded-xl border ${selectedPropertyId === p.id ? 'border-qorange bg-qorange/10' : 'border-qgrey-2 bg-white'}`}
                                        onPress={() => setSelectedPropertyId(p.id)}
                                    >
                                        <Text className={`${selectedPropertyId === p.id ? 'text-qorange font-bold' : 'text-qtext-light font-medium'}`}>
                                            {p.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Text className="text-qnavy text-base font-bold mb-[-8px]">Email du locataire (compte QAPRIL)</Text>
                            <TextInput
                                className="bg-white border border-qgrey-2 rounded-xl p-4 text-qnavy text-base"
                                placeholder="ex: locataire@gmail.com"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={tenantEmail}
                                onChangeText={setTenantEmail}
                            />

                            <Text className="text-qnavy text-base font-bold mb-[-8px]">Loyer Mensuel (FCFA)</Text>
                            <TextInput
                                className="bg-white border border-qgrey-2 rounded-xl p-4 text-qnavy text-base"
                                placeholder="ex: 250000"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={rentAmount}
                                onChangeText={setRentAmount}
                            />

                            <Pressable 
                                className={`bg-qorange p-4 rounded-xl items-center mt-5 shadow-sm ${loading ? 'opacity-70' : ''}`}
                                onPress={handleCreate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text className="text-white text-base font-bold">Générer le contrat PDF</Text>
                                )}
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

