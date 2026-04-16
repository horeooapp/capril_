import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { ChevronLeft, Plus, CheckCircle } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

export default function CreateLeaseScreen({ route, navigation }: any) {
  const token = route.params?.token;
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  
  const API_PROPERTIES = API_ENDPOINTS.PROPERTIES;
  const API_CREATE_LEASE = `${API_ENDPOINTS.BASE_URL}/api/mobile/owner/leases/create`;

  useEffect(() => {
    fetch(API_PROPERTIES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setProperties(json.properties.filter((p:any) => p.status === 'Vacant'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCreate = () => {
    if (!selectedPropertyId || !rentAmount || !depositAmount) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs (Bien, Loyer, Caution).");
    }

    setLoading(true);
    fetch(API_CREATE_LEASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        propertyId: selectedPropertyId,
        tenantId: tenantId || null, // Optional if physical tenant not registered yet
        rentAmount,
        depositAmount
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          Alert.alert("Succès", "Le bail a été créé et le premier reçu a été généré.");
          navigation.goBack();
        } else {
          Alert.alert("Erreur", json.error);
        }
      })
      .catch(() => Alert.alert("Erreur réseau"))
      .finally(() => setLoading(false));
  };

  if (loading && properties.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#064E3B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Bail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>1. CHOIX DU BIEN (Vacant)</Text>
        {properties.length === 0 ? (
           <Text style={styles.noData}>Vous n'avez aucun bien vacant disponible pour un nouveau bail.</Text>
        ) : (
          properties.map(p => (
            <TouchableOpacity 
               key={p.id} 
               style={[styles.propertyCard, selectedPropertyId === p.id && styles.selectedCard]}
               onPress={() => setSelectedPropertyId(p.id)}
            >
              <Text style={styles.propertyText}>{p.address} ({p.propertyType})</Text>
              {selectedPropertyId === p.id && <CheckCircle size={20} color="#064E3B" />}
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.label}>2. LOYER MENSUEL (FCFA)</Text>
        <TextInput 
           style={styles.input} 
           keyboardType="numeric" 
           value={rentAmount} 
           onChangeText={setRentAmount} 
           placeholder="Ex: 150000"
        />

        <Text style={styles.label}>3. CAUTION EXIGÉE (FCFA)</Text>
        <TextInput 
           style={styles.input} 
           keyboardType="numeric" 
           value={depositAmount} 
           onChangeText={setDepositAmount} 
           placeholder="Généralement 2 mois de loyer"
        />

        <Text style={styles.label}>4. IDENTIFIANT DU LOCATAIRE (Optionnel)</Text>
        <TextInput 
           style={styles.input} 
           value={tenantId} 
           onChangeText={setTenantId} 
           placeholder="Numéro de téléphone du prospect ou ID"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading || properties.length === 0}>
           {loading ? <ActivityIndicator color="#fff" /> : <Plus size={20} color="#fff" />}
           <Text style={styles.submitText}>Créer le bail & Générer Reçu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#064E3B' },
  container: { padding: 16 },
  label: { fontSize: 12, fontWeight: '800', color: '#6b7280', marginTop: 24, marginBottom: 8, letterSpacing: 1 },
  noData: { color: '#dc2626', fontSize: 13, fontStyle: 'italic' },
  propertyCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', marginBottom: 8 },
  selectedCard: { borderColor: '#064E3B', backgroundColor: '#ecfdf5' },
  propertyText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827' },
  submitBtn: { backgroundColor: '#064E3B', flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 10 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
