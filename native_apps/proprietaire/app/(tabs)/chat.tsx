import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Send, Check, CheckCheck } from 'lucide-react-native';

export default function ChatScreen() {
    const [leases, setLeases] = useState<any[]>([]);
    const [activeLeaseId, setActiveLeaseId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    // Charger les baux du proprio
    useEffect(() => {
        const loadLeases = async () => {
            try {
                const res = await fetchWithAuth('/proprietaire/properties');
                const data = await res.json();
                if (res.ok) {
                    let activeLeases: any[] = [];
                    data.properties.forEach((p: any) => {
                        if (p.status === 'Occupé') {
                            activeLeases.push({ id: p.id, name: p.name });
                        }
                    });
                }
            } catch (e) {
                console.error(e);
            }
        };
    }, []);

    const loadMessages = async () => {
        try {
            const response = await fetchWithAuth('/chat');
            const json = await response.json();
            if (response.ok) {
                setMessages(json.messages || []);
                await fetchWithAuth('/chat/read', {
                    method: 'POST',
                    body: JSON.stringify({ role: 'PROPRIO' })
                });
            } else if (json.error) {
                setMessages([]);
            }
        } catch (e) {
            console.error("Erreur chargement chat", e);
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const optimisticMessage = {
            id: Date.now().toString(),
            contenu: newMessage.trim(),
            roleExpediteur: 'PROPRIO',
            statut: 'ENVOYE',
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
                    role: 'PROPRIO'
                })
            });
            loadMessages();
        } catch (e) {
            console.error("Erreur envoi message", e);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.roleExpediteur === 'PROPRIO';
        
        return (
            <View className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${isMe ? 'bg-qorange rounded-br-sm' : 'bg-white border border-qgrey-2 rounded-bl-sm'}`}>
                    <Text className={`text-base ${isMe ? 'text-white' : 'text-qnavy'}`}>{item.contenu}</Text>
                    <View className="flex-row items-center justify-end mt-1 gap-1">
                        <Text className={`text-[10px] ${isMe ? 'text-white/80' : 'text-qtext-light'}`}>
                            {new Date(item.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMe && (
                            item.statut === 'LU' ? (
                                <CheckCheck size={14} color="#FFF" className="ml-0.5" />
                            ) : (
                                <Check size={14} color="#FFF" opacity={0.7} className="ml-0.5" />
                            )
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color="#FF8B00" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="p-5 border-b border-qgrey-2 bg-white/90">
                <Text className="text-xl font-bold text-qnavy">Messagerie</Text>
                <Text className="text-xs text-qorange font-medium mt-0.5">Locataire principal</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListEmptyComponent={
                        <Text className="text-qtext-light text-center mt-10">Aucun message ou aucun bail actif.</Text>
                    }
                />

                <View className="flex-row p-4 bg-white border-t border-qgrey-2 items-end gap-3 shadow-lg">
                    <TextInput
                        className="flex-1 bg-qgrey-1 border border-qgrey-2 rounded-[20px] px-4 py-3 text-qnavy text-base max-h-[100px] min-h-[40px]"
                        placeholder="Écrivez un message..."
                        placeholderTextColor="#94A3B8"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <Pressable 
                        className={`bg-qorange w-11 h-11 rounded-full justify-center items-center mb-0.5 ${!newMessage.trim() ? 'opacity-50' : ''}`}
                        onPress={sendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Send color="#fff" size={20} />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
