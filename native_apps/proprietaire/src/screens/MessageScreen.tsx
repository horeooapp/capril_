import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Keyboard,
  SafeAreaView
} from 'react-native';
import { Send, ChevronLeft, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { API_ENDPOINTS } from '../config/api';

export default function MessageScreen({ navigation, route }: any) {
  const { token, leaseId, userId, tenantName } = route.params || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const markAsRead = useCallback((messageIds: string[]) => {
    fetch(API_ENDPOINTS.MESSAGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'READ', leaseId, messageIds })
    });
  }, [token, leaseId]);

  const fetchMessages = useCallback(() => {
    if (!leaseId) return;
    fetch(API_ENDPOINTS.MESSAGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'FETCH', leaseId })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setMessages(json.data);
          const unreadIds = json.data
            .filter((m: any) => m.statut !== 'LU' && m.expediteurId !== userId)
            .map((m: any) => m.id);
          if (unreadIds.length > 0) {
            markAsRead(unreadIds);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token, leaseId, userId, markAsRead]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = () => {
    if (!content.trim() || sending || !leaseId) return;
    setSending(true);
    fetch(API_ENDPOINTS.MESSAGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'SEND', leaseId, content })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setMessages([...messages, json.data]);
          setContent('');
          Keyboard.dismiss();
        }
        setSending(false);
      })
      .catch(() => setSending(false));
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.expediteurId === userId;
    return (
      <View style={[styles.bubbleWrapper, isMine ? styles.myWrapper : styles.theirWrapper]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.msgText, isMine ? styles.myText : styles.theirText]}>
            {item.contenu}
          </Text>
          <View style={styles.msgFooter}>
            <Text style={[styles.timeText, isMine ? styles.myTime : styles.theirTime]}>
              {new Date(item.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMine && (
              <Text style={styles.statusText}>
                {item.statut === 'LU' ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{tenantName || 'Locataire'}</Text>
          <Text style={styles.headerStatus}>Chat direct</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#064E3B" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Répondre..."
            value={content}
            onChangeText={setContent}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !content.trim() && { opacity: 0.5 }]} 
            onPress={sendMessage}
            disabled={!content.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#064E3B' },
  headerStatus: { fontSize: 12, color: '#059669' },
  list: { padding: 16 },
  bubbleWrapper: { marginBottom: 12, maxWidth: '80%' },
  myWrapper: { alignSelf: 'flex-end' },
  theirWrapper: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: '#064E3B', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14 },
  myText: { color: '#fff' },
  theirText: { color: '#111827' },
  msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  timeText: { fontSize: 10 },
  myTime: { color: 'rgba(255,255,255,0.7)' },
  theirTime: { color: '#6b7280' },
  statusText: { marginLeft: 4, fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  inputArea: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100, fontSize: 14, color: '#111827' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#064E3B', justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});
