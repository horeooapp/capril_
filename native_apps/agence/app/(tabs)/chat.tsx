import { TopNavHeader } from '../../components/TopNavHeader';
import { View, Text, FlatList, TextInput, Pressable, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { fetchWithAuth } from '../../lib/api';
import { Send, Check, CheckCheck, MessageCircle, Building2, User } from 'lucide-react-native';

export default function AgenceChatScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ leaseId?: string }>();
    const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(params.leaseId || null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [interlocutorName, setInterlocutorName] = useState('Locataire');
    const [propertyName, setPropertyName] = useState('Logement sous gestion');
    const flatListRef = useRef<FlatList>(null);
    const isFirstLoadRef = useRef<boolean>(true);

    const loadMessages = async (targetLeaseId?: string | null) => {
        try {
            const queryLeaseId = targetLeaseId || selectedLeaseId;
            const endpoint = queryLeaseId ? `/chat?leaseId=${queryLeaseId}` : '/chat';
            const response = await fetchWithAuth(endpoint);
            const json = await response.json();

            if (response.ok) {
                if (Array.isArray(json.conversations)) {
                    setConversations(json.conversations);
                }
                if (json.activeLeaseId && !selectedLeaseId) {
                    setSelectedLeaseId(json.activeLeaseId);
                }

                if (Array.isArray(json.messages)) {
                    isFirstLoadRef.current = false;
                    setMessages(json.messages);

                    if (json.interlocutorName) setInterlocutorName(json.interlocutorName);
                    if (json.propertyName) setPropertyName(json.propertyName);

                    // Marquer comme lus
                    if (json.messages.length > 0) {
                        await fetchWithAuth('/chat/read', {
                            method: 'POST',
                            body: JSON.stringify({ leaseId: json.activeLeaseId || queryLeaseId, role: 'AGENCE' })
                        }).catch(() => {});
                    }
                }
            }
        } catch (e) {
            console.error("Erreur chargement chat agence", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages(params.leaseId || null);
        const interval = setInterval(() => loadMessages(), 3500);
        return () => clearInterval(interval);
    }, [selectedLeaseId]);

    const handleSelectConversation = (leaseId: string) => {
        setSelectedLeaseId(leaseId);
        isFirstLoadRef.current = true;
        setLoading(true);
        loadMessages(leaseId);
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const optimisticMessage = {
            id: Date.now().toString(),
            contenu: newMessage.trim(),
            roleExpediteur: 'AGENCE',
            statut: 'RECU',
            dateEnvoi: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            await fetchWithAuth('/chat', {
                method: 'POST',
                body: JSON.stringify({
                    leaseId: selectedLeaseId,
                    contenu: optimisticMessage.contenu,
                    role: 'AGENCE'
                })
            });
            loadMessages();
        } catch (e) {
            console.error("Erreur envoi message agence", e);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.roleExpediteur === 'AGENCE' || item.roleExpediteur === 'PROPRIO';
        
        return (
            <View style={{ marginBottom: 12, flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <View style={{
                    maxWidth: '82%',
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: isMe ? '#1F2A44' : '#FFFFFF',
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
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#1F2A44', marginBottom: 2, textTransform: 'uppercase' }}>
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
                        {isMe && (
                            item.statut === 'LU' ? (
                                <CheckCheck size={14} color="#34D399" />
                            ) : item.statut === 'RECU' ? (
                                <CheckCheck size={14} color="rgba(255,255,255,0.7)" />
                            ) : (
                                <Check size={13} color="rgba(255,255,255,0.7)" />
                            )
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <TopNavHeader
                title="Messagerie Agence"
                subtitle={propertyName ? `${propertyName} · ${interlocutorName}` : "Échanges avec les locataires et mandants"}
                primaryColor="#1F2A44"
            />

            {/* SÉLECTEUR DE CONVERSATION SI MULTIPLES BAUX SOUS MANDAT */}
            {conversations.length > 1 && (
                <View style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E5EE', paddingVertical: 8 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                        {conversations.map((c) => {
                            const isSelected = c.leaseId === selectedLeaseId;
                            return (
                                <Pressable
                                    key={c.leaseId}
                                    onPress={() => handleSelectConversation(c.leaseId)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                        paddingHorizontal: 12,
                                        paddingVertical: 7,
                                        borderRadius: 20,
                                        backgroundColor: isSelected ? '#1F2A44' : '#F1F5F9',
                                        borderWidth: 1,
                                        borderColor: isSelected ? '#1F2A44' : '#CBD5E1',
                                    }}
                                >
                                    <Building2 size={13} color={isSelected ? '#FFFFFF' : '#64748B'} />
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#FFFFFF' : '#334155' }} numberOfLines={1}>
                                        {c.otherPartyName} · {c.propertyName}
                                    </Text>
                                    {c.unreadCount > 0 && (
                                        <View style={{ backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1 }}>
                                            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>{c.unreadCount}</Text>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            <KeyboardAvoidingView 
                behavior="padding"
                style={{ flex: 1 }}
            >
                {loading && messages.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#1F2A44" />
                        <Text style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>Chargement des messages...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 }}>
                                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                                    <MessageCircle size={28} color="#1F2A44" />
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F2A44', textAlign: 'center' }}>
                                    Aucun message échangé
                                </Text>
                                <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 18, maxWidth: 280 }}>
                                    Échangez avec les locataires de votre portefeuille ou répondez aux requêtes en traçabilité légale.
                                </Text>
                            </View>
                        }
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}

                <View style={{ 
                    flexDirection: 'row', 
                    paddingHorizontal: 12, 
                    paddingTop: 10,
                    paddingBottom: Math.max(insets.bottom, 10), 
                    backgroundColor: '#FFFFFF', 
                    borderTopWidth: 1, 
                    borderTopColor: '#E2E5EE', 
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
                            backgroundColor: newMessage.trim() ? '#1F2A44' : '#94A3B8',
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={sendMessage}
                        disabled={!newMessage.trim()}
                        accessibilityLabel="Envoyer le message"
                    >
                        <Send color="#FFFFFF" size={18} />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
