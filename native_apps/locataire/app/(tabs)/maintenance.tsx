import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { fetchWithAuth } from '../../lib/api';

export default function MaintenanceScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetchWithAuth('/locataire/maintenance', {
                method: 'POST',
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    issueType: 'OTHER' // Par défaut pour l'instant
                })
            });

            const json = await response.json();

            if (response.ok) {
                Alert.alert("Succès", json.message || "Votre signalement a été envoyé.");
                setTitle('');
                setDescription('');
            } else {
                Alert.alert("Erreur", json.error || "Impossible d'envoyer le signalement.");
            }
        } catch (e) {
            Alert.alert("Erreur réseau", "Vérifiez votre connexion internet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nouveau signalement</Text>
                        <Text style={styles.subtitle}>Décrivez le problème rencontré dans votre logement.</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Titre du problème</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Fuite d'eau dans la salle de bain"
                            placeholderTextColor="#64748b"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Description détaillée</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Décrivez précisément la situation..."
                            placeholderTextColor="#64748b"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Pressable 
                            style={[styles.submitButton, loading && { opacity: 0.7 }]} 
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#022c22" />
                            ) : (
                                <Text style={styles.submitText}>Envoyer le signalement</Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#021812' },
    keyboardView: { flex: 1 },
    scroll: { padding: 20 },
    header: { marginBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#9ca3af' },
    form: { gap: 16 },
    label: { color: '#fff', fontSize: 16, fontWeight: '500', marginBottom: -8 },
    input: { backgroundColor: '#022c22', borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.2)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16 },
    textArea: { height: 150, paddingTop: 16 },
    submitButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    submitText: { color: '#022c22', fontSize: 16, fontWeight: 'bold' }
});
