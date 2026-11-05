import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { ShieldCheck, Lock, LogOut, RefreshCw } from 'lucide-react-native';
import { fetchWithAuth, removeStoredToken, clearAppSessionAndCache } from '../../lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetchWithAuth('/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        // Fallback profile
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await clearAppSessionAndCache();
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    } else {
      router.replace('/');
    }
  };

  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        Alert.alert('À jour', 'Vous disposez de la dernière version QAPRIL Locataire.');
      }
    } catch (error) {
      Alert.alert('Info', 'Vérification OTA terminée.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Locataire'
    : 'Locataire';

  const avatarInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] || 'L').toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sub}>Confidentialité & Passeport Locatif</Text>
        <Text style={styles.title}>Mon Profil</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2C3E6B" />
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarInitials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.email}>{user?.email || 'Non renseigné'}</Text>
                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>
                    {user?.isCertified ? 'Identité certifiée · Dossier Validé' : 'Compte actif · Espace Locataire'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <ShieldCheck color="#2C3E6B" size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Protection des données (Loi 2013-450 CI)</Text>
                  <Text style={styles.cardSub}>
                    Aucun bailleur ne peut consulter votre score chiffré ni vos pièces d’identité sans votre autorisation explicite (ADD-21).
                  </Text>
                </View>
              </View>
            </View>

            <Pressable style={styles.btnSecondary} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
              <RefreshCw color="#2C3E6B" size={16} />
              <Text style={styles.btnSecondaryText}>Vérifier les mises à jour (OTA)</Text>
            </Pressable>

            <Pressable style={styles.btnDanger} onPress={handleLogout}>
              <LogOut color="#C0392B" size={16} />
              <Text style={styles.btnDangerText}>Se déconnecter</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  scroll: { padding: 18, gap: 14 },
  sub: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1D26' },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C3E6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  name: { fontSize: 17, fontWeight: '800', color: '#1A1D26' },
  email: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  pillOk: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#E3F5EC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillOkText: { color: '#1E7E4E', fontSize: 11, fontWeight: '800' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EF',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1D26' },
  cardSub: { fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 17 },
  btnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EF',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSecondaryText: { color: '#2C3E6B', fontSize: 13, fontWeight: '800' },
  btnDanger: {
    backgroundColor: '#FBEAE8',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnDangerText: { color: '#C0392B', fontSize: 13, fontWeight: '800' },
});
