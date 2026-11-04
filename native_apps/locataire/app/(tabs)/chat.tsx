import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Send, Check, CheckCheck } from 'lucide-react-native';

const DEMO_LOCATAIRE_MESSAGES = [
    {
        id: 'msg-1',
        contenu: "Bonjour Monsieur N’Guessan, j'ai émis un signalement d'incident concernant la fuite d'eau sous l'évier de la cuisine.",
        roleExpediteur: 'LOCATAIRE',
        statut: 'LU', // 2 encoches rouges car le bailleur l'a lu
        dateEnvoi: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
        id: 'msg-2',
        contenu: "Bonjour Madame Kouamé. J'ai bien reçu votre signalement avec photo horodatée SHA-256. L'artisan plombier passera demain à 10h.",
        roleExpediteur: 'PROPRIO',
        statut: 'LU',
        dateEnvoi: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
    },
    {
        id: 'msg-3',
        contenu: "Parfait, je serai présente à 10h. Merci pour votre réactivité !",
        roleExpediteur: 'LOCATAIRE',
        statut: 'LU', // 2 encoches rouges
        dateEnvoi: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
        id: 'msg-4',
        contenu: "Entendu. Dès que l'intervention est terminée, nous validerons la clôture contradictoire du ticket sur QAPRIL.",
        roleExpediteur: 'PROPRIO',
        statut: 'LU',
        dateEnvoi: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    }
];

export default function ChatScreen() {
    const [messages, setMessages] = useState<any[]>(DEMO_LOCATAIRE_MESSAGES);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const loadMessages = async () => {
        try {
            const response = await fetchWithAuth('/chat');
            const json = await response.json();
            if (response.ok && json.messages && json.messages.length > 0) {
                setMessages(json.messages);
                await fetchWithAuth('/chat/read', {
                    method: 'POST',
                    body: JSON.stringify({ role: 'LOCATAIRE' })
                });
            }
        } catch (e) {
            console.error("Erreur chargement chat", e);
        }
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 5000);
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
                            Koffi N’Guessan (Bailleur)
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
            {/* HEADER CHAT */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
                            Koffi N’Guessan
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#0D2B6E' }}>
                            Bailleur en titre · Résidence Émeraude
                        </Text>
                    </View>
                    <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#15803D' }}>EN LIGNE</Text>
                    </View>
                </View>

                {/* BANDEAU LÉGENDE DES ENCOCHES */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <CheckCheck size={12} color="#9CA3AF" />
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>2 encoches grises : reçu</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <CheckCheck size={12} color="#EF4444" />
                        <Text style={{ fontSize: 10, color: '#DC2626', fontWeight: '700' }}>2 encoches rouges : lu</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={{ flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center', gap: 8 }}>
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
                        placeholder="Écrire à votre bailleur..."
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
