import { TopNavHeader } from '../../components/TopNavHeader';
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { playMessageNotificationSound } from '../../lib/notifications';
import { Send, Check, CheckCheck } from 'lucide-react-native';

export default function ChatScreen() {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [interlocutorName, setInterlocutorName] = useState('Bailleur');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const isFirstLoadRef = useRef<boolean>(true);

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const loadMessages = async () => {
        try {
            const response = await fetchWithAuth('/chat');
            const json = await response.json();
            if (response.ok && Array.isArray(json.messages)) {
                const newMessages = json.messages;

                // Jouer une notification sonore et vibrer si un nouveau message de l'interlocuteur est reçu
                if (!isFirstLoadRef.current && newMessages.length > 0) {
                    const latest = newMessages[newMessages.length - 1];
                    if (latest.id !== lastMessageIdRef.current && latest.roleExpediteur !== 'LOCATAIRE') {
                        playMessageNotificationSound(json.interlocutorName || 'Bailleur', latest.contenu);
                    }
                }

                if (newMessages.length > 0) {
                    lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
                }
                isFirstLoadRef.current = false;
                setMessages(newMessages);

                if (json.interlocutorName) {
                    setInterlocutorName(json.interlocutorName);
                }
                if (newMessages.length > 0) {
                    await fetchWithAuth('/chat/read', {
                        method: 'POST',
                        body: JSON.stringify({ role: 'LOCATAIRE' })
                    });
                }
            }
        } catch (e) {
            console.error("Erreur chargement chat", e);
        }
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 3500);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const optimisticMessage = {
            id: Date.now().toString(),
            contenu: newMessage.trim(),
            roleExpediteur: 'LOCATAIRE',
            statut: 'RECU', // 2 encoches grises dès émission
            dateEnvoi: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            await fetchWithAuth('/chat', {
                method: 'POST',
                body: JSON.stringify({
                    contenu: optimisticMessage.contenu,
                    role: 'LOCATAIRE'
                })
            });
            loadMessages();
        } catch (e) {
            console.error("Erreur envoi message", e);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.roleExpediteur === 'LOCATAIRE';
        
        return (
            <View style={{ marginBottom: 12, flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <View style={{
                    maxWidth: '82%',
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: isMe ? '#0D2B6E' : '#FFFFFF',
                    borderWidth: isMe ? 0 : 1,
                    borderColor: '#E2E8F0',
                    borderBottomRightRadius: isMe ? 2 : 16,
                    borderBottomLeftRadius: !isMe ? 2 : 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}>
                    {!isMe && (
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#0D2B6E', marginBottom: 2, textTransform: 'uppercase' }}>
                            {interlocutorName}
                        </Text>
                    )}
                    <Text style={{ fontSize: 14, color: isMe ? '#FFFFFF' : '#1E293B', lineHeight: 20 }}>
                        {item.contenu}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 }}>
                        <Text style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                            {new Date(item.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {/* ENCOCHES RÉGLEMENTAIRES SUR LES MESSAGES ENVOYÉS */}
                        {isMe && (
                            item.statut === 'LU' ? (
                                <CheckCheck size={14} color="#EF4444" />
                            ) : item.statut === 'RECU' ? (
                                <CheckCheck size={14} color="#9CA3AF" />
                            ) : (
                                <Check size={13} color="#9CA3AF" />
                            )
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <TopNavHeader title="Messagerie Bailleur" subtitle="Échanges directs" />
            {/* HEADER CHAT */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
                            Messagerie Sécurisée
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#0D2B6E' }}>
                            Vos échanges sont conservés et datés
                        </Text>
                    </View>
                    <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#15803D' }}>EN DIRECT</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={{ flex: 1 }}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', textAlign: 'center' }}>
                                Aucun message échangé
                            </Text>
                            <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
                                Vos messages avec votre bailleur apparaîtront ici en temps réel avec traçabilité intégrale.
                            </Text>
                        </View>
                    }
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={{ 
                    flexDirection: 'row', 
                    paddingHorizontal: 12, 
                    paddingTop: 10,
                    paddingBottom: keyboardVisible ? 10 : Math.max(insets.bottom, 10), 
                    backgroundColor: '#FFFFFF', 
                    borderTopWidth: 1, 
                    borderTopColor: '#E2E8F0', 
                    alignItems: 'center', 
                    gap: 8 
                }}>
                    <TextInput
                        style={{
                            flex: 1,
                            backgroundColor: '#F1F5F9',
                            borderWidth: 1,
                            borderColor: '#CBD5E1',
                            borderRadius: 20,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            color: '#0F172A',
                            fontSize: 14,
                        }}
                        placeholder={`Écrire à ${interlocutorName}...`}
                        placeholderTextColor="#94A3B8"
                        value={newMessage}
                        onChangeText={setNewMessage}
                    />
                    <Pressable 
                        style={{
                            backgroundColor: newMessage.trim() ? '#0D2B6E' : '#94A3B8',
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={sendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Send color="#FFFFFF" size={18} />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
