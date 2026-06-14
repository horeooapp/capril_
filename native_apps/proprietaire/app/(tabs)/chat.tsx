import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
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
                    // Extraire tous les baux actifs
                    let activeLeases: any[] = [];
                    data.properties.forEach((p: any) => {
                        if (p.status === 'Occupé') {
                            activeLeases.push({ id: p.id, name: p.name }); // p.id is propertyId, we need leaseId
                            // Wait, the properties API doesn't return lease ID directly.
                        }
                    });
                    
                    // Actually, let's fetch from the DB directly a generic "get conversations" route or just use the first lease
                    // For the sake of this MVP, we will try to fetch the chat and it will fail if we don't pass leaseId, UNLESS we update the API.
                }
            } catch (e) {
                console.error(e);
            }
        };
        // loadLeases();
        // Pour simplifier ce MVP, on suppose que le propriétaire a 1 locataire actif.
        // L'API a été mise à jour pour trouver le premier bail si aucun leaseId n'est fourni,
        // MAIS seulement pour LOCATAIRE. Il faut qu'on l'autorise pour PROPRIO aussi.
    }, []);

    const loadMessages = async () => {
        try {
            const response = await fetchWithAuth('/chat'); // L'API va maintenant trouver le premier bail du proprio
            const json = await response.json();
            if (response.ok) {
                setMessages(json.messages || []);
                await fetchWithAuth('/chat/read', {
                    method: 'POST',
                    body: JSON.stringify({ role: 'PROPRIO' })
                });
            } else if (json.error) {
                // S'il n'y a pas de bail
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
                <ActivityIndicator size="large" color="#d97706" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messagerie</Text>
                <Text style={styles.subtitle}>Locataire principal</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.list}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Aucun message ou aucun bail actif.</Text>
                    }
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
    container: { flex: 1, backgroundColor: '#0A1128' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: '#0f172a' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 12, color: '#d97706', marginTop: 2 },
    keyboardView: { flex: 1 },
    list: { padding: 16, gap: 12, paddingBottom: 100 },
    emptyText: { color: '#9ca3af', textAlign: 'center', marginTop: 40 },
    messageWrapper: { flexDirection: 'row', marginBottom: 12 },
    messageWrapperMe: { justifyContent: 'flex-end' },
    messageWrapperOther: { justifyContent: 'flex-start' },
    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 20 },
    messageBubbleMe: { backgroundColor: '#d97706', borderBottomRightRadius: 4 },
    messageBubbleOther: { backgroundColor: '#1e293b', borderBottomLeftRadius: 4 },
    messageText: { color: '#fff', fontSize: 16 },
    messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
    messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
    statusIcon: { marginLeft: 2 },
    inputContainer: { 
        flexDirection: 'row', 
        padding: 16, 
        backgroundColor: '#0f172a',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        alignItems: 'flex-end',
        gap: 12
    },
    input: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        color: '#fff',
        maxHeight: 100,
        minHeight: 40
    },
    sendButton: {
        backgroundColor: '#d97706',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2
    }
});
