import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, FileSignature, Info, ExternalLink } from 'lucide-react-native';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await fetchWithAuth('/locataire/notifications');
                const json = await response.json();
                if (response.ok) {
                    setNotifications(json.notifications || []);
                } else {
                    Alert.alert("Erreur", "Impossible de charger les notifications.");
                }
            } catch (e) {
                Alert.alert("Erreur réseau", "Vérifiez votre connexion internet.");
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const handleAction = (url: string) => {
        if (url) {
            router.push(url as any);
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
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
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </Pressable>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 44 }} /> {/* Espacement pour centrer le titre */}
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Bell color="#3f3f46" size={48} style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyText}>Aucune notification</Text>
                        <Text style={styles.emptySubtext}>Vous n'avez pas de nouveaux messages ou d'actions requises.</Text>
                    </View>
                ) : (
                    notifications.map((notif, index) => (
                        <View key={notif.id || index} style={[styles.card, notif.type === 'ACTION' ? styles.cardAction : null]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, notif.type === 'ACTION' ? { backgroundColor: 'rgba(245, 158, 11, 0.1)' } : { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    {notif.type === 'ACTION' ? (
                                        <FileSignature color="#f59e0b" size={20} />
                                    ) : (
                                        <Info color="#10b981" size={20} />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.cardTitle, notif.type === 'ACTION' && { color: '#fcd34d' }]}>
                                        {notif.title}
                                    </Text>
                                    <Text style={styles.cardDate}>{formatDate(notif.createdAt)}</Text>
                                </View>
                            </View>

                            <Text style={styles.cardContent}>{notif.content}</Text>

                            {notif.type === 'ACTION' && notif.actionUrl && (
                                <Pressable 
                                    style={styles.actionButton}
                                    onPress={() => handleAction(notif.actionUrl)}
                                >
                                    <ExternalLink color="#021812" size={18} />
                                    <Text style={styles.actionButtonText}>Traiter maintenant</Text>
                                </Pressable>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#021812' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    scroll: {
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#9ca3af',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardAction: {
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardDate: {
        color: '#6b7280',
        fontSize: 12,
    },
    cardContent: {
        color: '#d1d5db',
        fontSize: 14,
        lineHeight: 20,
    },
    actionButton: {
        marginTop: 16,
        backgroundColor: '#fcd34d',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButtonText: {
        color: '#021812',
        fontWeight: 'bold',
        fontSize: 15,
    }
});
