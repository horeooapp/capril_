import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import { Mic, X, Send, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { fetchWithAuth } from '../lib/api';
import { useRouter } from 'expo-router';

interface VoiceAssistantFABProps {
  moduleName?: 'BAILLEUR' | 'LOCATAIRE' | 'AGENCE';
  primaryColor?: string;
  visible?: boolean;
}

export function VoiceAssistantFAB({
  moduleName = 'LOCATAIRE',
  primaryColor = '#1B4D3E',
  visible = true,
}: VoiceAssistantFABProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Historique de l'interaction
  const [conversation, setConversation] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; action?: any }>
  >([]);

  const handleOpen = () => {
    Vibration.vibrate(40);
    setModalVisible(true);
    if (conversation.length === 0) {
      setConversation([
        {
          sender: 'assistant',
          text: `Bonjour ! Je suis votre assistant QAPRIL. Dites-moi ce que vous souhaitez accomplir (ex: « Télécharger mon attestation de résidence » ou « Déclarer un occupant »).`,
        },
      ]);
    }
  };

  const handleSendPrompt = async (promptToSend?: string) => {
    const textToProcess = (promptToSend || inputText).trim();
    if (!textToProcess) return;

    setInputText('');
    setConversation((prev) => [...prev, { sender: 'user', text: textToProcess }]);
    setLoading(true);

    try {
      const res = await fetchWithAuth('/v1/pilot/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToProcess,
          module: moduleName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (!data.compris) {
          setConversation((prev) => [
            ...prev,
            {
              sender: 'assistant',
              text: data.message || "Je n'ai pas bien compris. Essayez de reformuler simplement.",
            },
          ]);
        } else if (!data.estComplete && data.questionSuivante) {
          setConversation((prev) => [
            ...prev,
            {
              sender: 'assistant',
              text: `${data.reformulation}\n\n👉 ${data.questionSuivante}`,
            },
          ]);
        } else if (data.estComplete && data.actionConfirmation) {
          setConversation((prev) => [
            ...prev,
            {
              sender: 'assistant',
              text: `${data.reformulation}\n\n${data.recapitulatif || ''}\n⚠️ ${data.noticeJuridique}`,
              action: data.actionConfirmation,
            },
          ]);
        }
      } else {
        setConversation((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.error || "Une erreur est survenue lors du traitement.",
          },
        ]);
      }
    } catch (e) {
      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "Erreur de connexion au serveur QAPRIL. Vérifiez votre connexion internet.",
        },
      ]);
    } finally {
      setLoading(false);
      setIsListening(false);
    }
  };

  const handleExecuteAction = (action: any) => {
    setModalVisible(false);
    if (action.screen) {
      router.push({
        pathname: action.screen,
        params: action.payload || {},
      } as any);
    }
  };

  return (
    <>
      {/* Bouton Micro Flottant Universel (ML-06 : marge basse 80 px, masquable au défilement) */}
      {visible && (
        <Pressable
          style={[styles.fab, { backgroundColor: primaryColor }]}
          onPress={handleOpen}
          accessibilityLabel="Parler à QAPRIL"
        >
          <Mic color="#FFFFFF" size={24} />
        </Pressable>
      )}
      </Pressable>

      {/* Modal interactif du pilote vocal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={[styles.modalHeader, { backgroundColor: primaryColor }]}>
              <View style={styles.headerTitleWrap}>
                <Sparkles color="#FFFFFF" size={18} />
                <Text style={styles.headerTitle}>Assistant & Pilote Vocal</Text>
              </View>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X color="#FFFFFF" size={20} />
              </Pressable>
            </View>

            {/* Avertissement souverain RG-AST-01 */}
            <View style={styles.legalBanner}>
              <ShieldCheck color="#1B4D3E" size={16} />
              <Text style={styles.legalBannerText}>
                Sécurité : Tout acte juridique exige votre confirmation tactile manuelle.
              </Text>
            </View>

            {/* Conversation */}
            <View style={styles.messagesList}>
              {conversation.map((msg, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.bubble,
                    msg.sender === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      msg.sender === 'user' ? styles.userBubbleText : styles.assistantBubbleText,
                    ]}
                  >
                    {msg.text}
                  </Text>

                  {/* Bouton d'action concrète RG-AST-01 */}
                  {msg.action && (
                    <Pressable
                      style={[styles.actionConfirmBtn, { backgroundColor: primaryColor }]}
                      onPress={() => handleExecuteAction(msg.action)}
                    >
                      <Text style={styles.actionConfirmBtnText}>{msg.action.label}</Text>
                      <ChevronRight color="#FFFFFF" size={16} />
                    </Pressable>
                  )}
                </View>
              ))}

              {loading && (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={primaryColor} />
                  <Text style={styles.loadingText}>QAPRIL analyse votre demande...</Text>
                </View>
              )}
            </View>

            {/* Champ de dictée / saisie */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Parlez ou écrivez ici..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendPrompt()}
              />
              <Pressable
                style={[styles.sendBtn, { backgroundColor: primaryColor }]}
                onPress={() => handleSendPrompt()}
                disabled={loading || !inputText.trim()}
              >
                <Send color="#FFFFFF" size={18} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 400,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  legalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  legalBannerText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '90%',
  },
  assistantBubble: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  assistantBubbleText: {
    color: '#0F172A',
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  actionConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  actionConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

