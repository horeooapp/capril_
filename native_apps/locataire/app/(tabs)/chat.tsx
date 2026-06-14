import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
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
            <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
                <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
                    <Text style={styles.messageText}>{item.contenu}</Text>
                    <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>
                            {new Date(item.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMe && (
                            item.statut === 'LU' ? (
                                <CheckCheck size={14} color="#3b82f6" style={styles.statusIcon} />
                            ) : (
                                <Check size={14} color="#9ca3af" style={styles.statusIcon} />
                            )
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#10B981" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Propriétaire</Text>
                <Text style={styles.subtitle}>En ligne</Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.list}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Écrivez un message..."
                        placeholderTextColor="#64748b"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <Pressable 
                        style={[styles.sendButton, !newMessage.trim() && { opacity: 0.5 }]} 
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#021812' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: '#022c22' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 12, color: '#34d399', marginTop: 2 },
    keyboardView: { flex: 1 },
    list: { padding: 16, gap: 12, paddingBottom: 100 },
    messageWrapper: { flexDirection: 'row', marginBottom: 12 },
    messageWrapperMe: { justifyContent: 'flex-end' },
    messageWrapperOther: { justifyContent: 'flex-start' },
    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 20 },
    messageBubbleMe: { backgroundColor: '#10B981', borderBottomRightRadius: 4 },
    messageBubbleOther: { backgroundColor: '#1e293b', borderBottomLeftRadius: 4 },
    messageText: { color: '#fff', fontSize: 16 },
    messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
    messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
    statusIcon: { marginLeft: 2 },
    inputContainer: { 
        flexDirection: 'row', 
        padding: 16, 
        backgroundColor: '#022c22',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        alignItems: 'flex-end',
        gap: 12
    },
    input: {
        flex: 1,
        backgroundColor: '#0f172a',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        color: '#fff',
        maxHeight: 100,
        minHeight: 40
    },
    sendButton: {
        backgroundColor: '#10B981',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2
    }
});
