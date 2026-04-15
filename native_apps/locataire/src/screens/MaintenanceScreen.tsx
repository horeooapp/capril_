import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { API_ENDPOINTS } from '../config/api';

export default function MaintenanceScreen({ route, navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MOYENNE');
  const [category, setCategory] = useState('PLOMBERIE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) return Alert.alert("Erreur", "Veuillez remplir tous les champs");

    setLoading(true);
    
    try {
      // Pour une app en production, on devrait utiliser AsyncStorage ou Context pour le token
      const token = route.params?.token || 'DUMMY_TOKEN';
      
      const res = await fetch(API_ENDPOINTS.TICKETS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'CREATE_TICKET',
          token, 
          title, 
          description, 
          priority, 
          category 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        Alert.alert("Succès", "Votre déclaration d'incident a été envoyée au propriétaire/à l'agence.");
        setTitle('');
        setDescription('');
      } else {
        Alert.alert("Erreur", data.error || "Impossible de déclarer l'incident.");
      }
    } catch (e) {
      Alert.alert("Erreur réseau", "Serveur injoignable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Assistance & Maintenance</Text>
        <Text style={styles.subtitle}>Signalez un problème dans votre logement</Text>

        <Text style={styles.inputLabel}>Catégorie</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.choiceBtn, category === 'PLOMBERIE' && styles.choiceActive]} onPress={() => setCategory('PLOMBERIE')}>
            <Text style={[styles.choiceText, category === 'PLOMBERIE' && styles.choiceTextActive]}>Plomb.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.choiceBtn, category === 'ELECTRICITE' && styles.choiceActive]} onPress={() => setCategory('ELECTRICITE')}>
            <Text style={[styles.choiceText, category === 'ELECTRICITE' && styles.choiceTextActive]}>Elect.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.choiceBtn, category === 'STRUCTURE' && styles.choiceActive]} onPress={() => setCategory('STRUCTURE')}>
            <Text style={[styles.choiceText, category === 'STRUCTURE' && styles.choiceTextActive]}>Struct.</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Urgence</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.priBtn, priority === 'FAIBLE' && styles.priBtnF]} onPress={() => setPriority('FAIBLE')}>
            <Text style={[styles.choiceText, priority === 'FAIBLE' && styles.priTextF]}>Faible</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.priBtn, priority === 'MOYENNE' && styles.priBtnM]} onPress={() => setPriority('MOYENNE')}>
            <Text style={[styles.choiceText, priority === 'MOYENNE' && styles.priTextM]}>Moyenne</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.priBtn, priority === 'CRITIQUE' && styles.priBtnC]} onPress={() => setPriority('CRITIQUE')}>
            <Text style={[styles.choiceText, priority === 'CRITIQUE' && styles.priTextC]}>CRITIQUE</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Titre de l'incident</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Fuite sous lavabo"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.inputLabel}>Description détaillée</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Décrivez précisément votre problème..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>SOUMETTRE LE TICKET</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { padding: 24, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '900', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 32 },
  
  btnRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  choiceBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#e5e7eb', borderRadius: 8 },
  choiceActive: { backgroundColor: '#111827' },
  choiceText: { fontSize: 11, fontWeight: '800', color: '#6b7280', textTransform: 'uppercase' },
  choiceTextActive: { color: '#ffffff' },

  priBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 },
  priBtnF: { backgroundColor: '#f3f4f6', borderColor: '#9ca3af' },
  priBtnM: { backgroundColor: '#fff7ed', borderColor: '#ea580c' },
  priBtnC: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
  
  priTextF: { color: '#374151' },
  priTextM: { color: '#c2410c' },
  priTextC: { color: '#b91c1c' },

  inputLabel: { fontSize: 12, fontWeight: '800', color: '#4b5563', textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 24 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  
  submitBtn: { backgroundColor: '#059669', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginTop: 16 },
  submitBtnText: { color: '#ffffff', fontWeight: '900', letterSpacing: 1, fontSize: 13 }
});
