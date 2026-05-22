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
  Keyboard
} from 'react-native';
import { Send, ChevronLeft } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { API_ENDPOINTS } from '../config/api';

export default function MessageScreen({ navigation, route }: any) {
  const { token, leaseId, userId } = route.params || {};
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
    fetch(API_ENDPOINTS.MESSAGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'FETCH', leaseId })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setMessages(json.data);
          // Mark unread as read
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
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = () => {
    if (!content.trim() || sending) return;
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Colors.qNavy} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Propriétaire</Text>
          <Text style={styles.headerStatus}>En ligne</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.qGreen} style={{ flex: 1 }} />
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
            placeholder="Écrivez votre message..."
            value={content}
            onChangeText={setContent}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !content.trim() && { opacity: 0.5 }]} 
            onPress={sendMessage}
            disabled={!content.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color={Colors.white} /> : <Send size={20} color={Colors.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerInfo: {
    marginLeft: 15,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 16,
    color: Colors.qNavy,
  },
  headerStatus: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 12,
    color: '#4ADE80',
  },
  list: {
    padding: 16,
    paddingBottom: 30,
  },
  bubbleWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myWrapper: {
    alignSelf: 'flex-end',
  },
  theirWrapper: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: Colors.qGreen,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Colors.qCream,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 14,
  },
  myText: {
    color: Colors.white,
  },
  theirText: {
    color: Colors.qNavy,
  },
  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.body,
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTime: {
    color: Colors.qNavyMedium,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.qCream,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontFamily: Typography.fontFamily.body,
    fontSize: 14,
    color: Colors.qNavy,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.qGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }
});
