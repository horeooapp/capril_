import { AppVersionBadge } from '../../components/AppVersionBadge';
import React, { useState, useEffect } from 'react';
import {
  Platform,
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
import { fetchWithAuth, removeStoredToken, clearAppSessionAndCache, logoutAndRedirect } from '../../lib/api';

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

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de votre compte locataire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logoutAndRedirect(router);
          },
        },
      ]
    );
  };

  const [updateAvailable, setUpdateAvailable] = useState<boolean | null>(null);

  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      if (__DEV__ || !Updates.isEnabled) {
        Alert.alert('Mode Développement', 'Les mises à jour OTA sont actives sur les versions installées (Canal: ' + (Updates.channel || 'défaut') + ').');
        return;
      }
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
        Alert.alert(
          'Mise à jour disponible !',
          'Une nouvelle version est disponible pour votre application. Voulez-vous la télécharger et l\'appliquer maintenant ?',
          [
            {
              text: 'Installer maintenant',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
            { text: 'Plus tard', style: 'cancel' }
          ]
        );
      } else {
        setUpdateAvailable(false);
        Alert.alert('Application à jour', 'Votre application dispose déjà de la toute dernière version (Canal: ' + (Updates.channel || 'production') + ').');
      }
    } catch (error: any) {
      Alert.alert('Information', 'Vérification de mise à jour effectuée (Canal: ' + (Updates.channel || 'production') + ').');
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

            <View style={{ gap: 6 }}>
              {updateAvailable === true && (
                <View style={{ backgroundColor: '#059669', padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>✓ MISE À JOUR DISPONIBLE</Text>
                  <Text style={{ color: '#A7F3D0', fontSize: 11 }}>Appuyez ci-dessous</Text>
                </View>
              )}
              <Pressable style={styles.btnSecondary} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
                <RefreshCw color="#2C3E6B" size={16} />
                <Text style={styles.btnSecondaryText}>
                  {isCheckingUpdate ? 'Recherche en cours...' : 'Vérifier les mises à jour (OTA)'}
                </Text>
              </Pressable>
              <Text style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center' }}>
                Canal actif : {Updates.channel || 'production'} · Version : {Updates.updateId ? Updates.updateId.substring(0, 8) : 'Base APK'}
              </Text>
            </View>

            <Pressable style={styles.btnDanger} onPress={handleLogout}>
              <LogOut color="#C0392B" size={16} />
              <Text style={styles.btnDangerText}>Se déconnecter</Text>
            </Pressable>
          </>
        )}
        <AppVersionBadge />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  scroll: { padding: 18, gap: 14 },
  sub: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '600', color: '#1A1D26' },
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
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  name: { fontSize: 17, fontWeight: '600', color: '#1A1D26' },
  email: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  pillOk: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#E3F5EC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillOkText: { color: '#1E7E4E', fontSize: 11, fontWeight: '600' },
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
  btnSecondaryText: { color: '#2C3E6B', fontSize: 13, fontWeight: '600' },
  btnDanger: {
    backgroundColor: '#FBEAE8',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnDangerText: { color: '#C0392B', fontSize: 13, fontWeight: '600' },
});
