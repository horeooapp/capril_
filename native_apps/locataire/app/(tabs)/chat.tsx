import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Send, Check, CheckCheck } from 'lucide-react-native';

export default function ChatScreen() {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    const loadMessages = async () => {
        try {
            const response = await fetchWithAuth('/chat');
            const json = await response.json();
            if (response.ok) {
                setMessages(json.messages || []);
                // Marquer comme lus
                await fetchWithAuth('/chat/read', {
                    method: 'POST',
                    body: JSON.stringify({ role: 'LOCATAIRE' })
                });
            }
        } catch (e) {
            console.error("Erreur chargement chat", e);
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
        // Polling toutes les 3 secondes pour simuler le temps réel
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const optimisticMessage = {
            id: Date.now().toString(),
            contenu: newMessage.trim(),
            roleExpediteur: 'LOCATAIRE',
            statut: 'ENVOYE',
            dateEnvoi: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        // Scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            await fetchWithAuth('/chat', {
                method: 'POST',
                body: JSON.stringify({
                    contenu: optimisticMessage.contenu,
                    role: 'LOCATAIRE'
                })
            });
            loadMessages(); // Recharger pour avoir le vrai ID et statut
        } catch (e) {
            console.error("Erreur envoi message", e);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.roleExpediteur === 'LOCATAIRE';
        
        return (
            <View className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${isMe ? 'bg-qgreen rounded-br-sm' : 'bg-white border border-qgrey-2 rounded-bl-sm'}`}>
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
                <ActivityIndicator size="large" color="#00C896" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="p-5 border-b border-qgrey-2 bg-white/90">
                <Text className="text-xl font-bold text-qnavy">Propriétaire</Text>
                <Text className="text-xs text-qgreen font-medium mt-0.5">En ligne</Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
                        className={`bg-qgreen w-11 h-11 rounded-full justify-center items-center mb-0.5 ${!newMessage.trim() ? 'opacity-50' : ''}`}
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
