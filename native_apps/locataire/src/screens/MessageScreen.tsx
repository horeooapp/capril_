import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { Colors } from '../theme/colors';
import { 
  ChevronLeft, 
  MessageSquare, 
  Headset, 
  Send, 
  Paperclip, 
  ChevronDown,
  X 
} from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

export default function MessageScreen({ navigation, route }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = route?.params?.token || 'DUMMY';

  const sendMessage = async () => {
    if (!message.trim()) return Alert.alert("Erreur", "Veuillez saisir un message.");
    
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.MESSAGES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND', token, content: message })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Succès", "Votre message a été envoyé à l'équipe de gestion.");
        setMessage('');
        setModalVisible(false);
      } else {
        Alert.alert("Erreur", data.error || "Une erreur est survenue.");
      }
    } catch(err) {
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messagerie</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.optionCard}>
             <View style={[styles.iconBox, { backgroundColor: Colors.cardColors.mint }]}>
               <MessageSquare size={24} color="#059669" />
             </View>
             <Text style={styles.optionText}>Discuter avec l'agence</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionCard}>
             <View style={[styles.iconBox, { backgroundColor: Colors.cardColors.cream }]}>
               <Headset size={24} color="#D97706" />
             </View>
             <Text style={styles.optionText}>Discuter avec le support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.newMessageButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.newMessageText}>Envoyer un nouveau message</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* New Message Modal (Styled like Image 4) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <MessageSquare size={20} color="#D97706" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Nouveau message</Text>
                <Text style={styles.modalSubtitle}>Nos équipes sont disponibles</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <X size={20} color={Colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>VOTRE MESSAGE</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder="Décrivez votre demande en détail..."
                  style={styles.textArea}
                  placeholderTextColor={Colors.text.muted}
                  value={message}
                  onChangeText={setMessage}
                />
                <Text style={styles.charCount}>{message.length}/500</Text>
              </View>

              <Text style={styles.inputLabel}>PIÈCES JOINTES</Text>
              <TouchableOpacity style={styles.selectContainer}>
                <Text style={styles.selectText}>Sélectionner un document à joindre</Text>
                <ChevronDown size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
               {loading ? <ActivityIndicator color={Colors.text.muted} /> : <Send size={18} color={Colors.text.muted} />}
              <Text style={styles.sendButtonText}>{loading ? 'Envoi...' : 'Envoyer le message'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  container: { padding: 16 },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  newMessageButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  newMessageText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.text.muted,
  },
  closeButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  textAreaContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  textArea: {
    fontSize: 15,
    color: Colors.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 10,
    color: Colors.text.muted,
    marginTop: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectText: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text.muted,
  }
});
