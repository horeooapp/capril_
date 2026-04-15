import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Send } from 'lucide-react-native';

export default function MessageScreen({ route, navigation }: any) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = route?.params?.token || 'DUMMY';

  // We reuse the existing tenant messages endpoint but parameterize it for owner context if needed
  // For demonstration, simulating network call
  const sendMessage = () => {
    if (!message.trim()) return Alert.alert("Erreur", "Saisissez un message.");
    setLoading(true);
    setTimeout(() => {
       Alert.alert("Envoyé", "Message transmis à l'équipe plateforme ou locataire concerné.");
       setMessage('');
       setLoading(false);
       navigation.goBack();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Diffusion</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>MESSAGE</Text>
        <TextInput 
          multiline
          numberOfLines={6}
          style={styles.textArea} 
          value={message} 
          onChangeText={setMessage} 
          placeholder="Rédigez votre message..."
        />

        <TouchableOpacity style={styles.submitBtn} onPress={sendMessage} disabled={loading}>
           {loading ? <ActivityIndicator color="#fff" /> : <Send size={20} color="#fff" />}
           <Text style={styles.submitText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#064E3B' },
  container: { padding: 16 },
  label: { fontSize: 12, fontWeight: '800', color: '#6b7280', marginBottom: 8, letterSpacing: 1 },
  textArea: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827', height: 150, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#064E3B', flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 10 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
