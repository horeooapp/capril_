import { TopNavHeader } from '../../components/TopNavHeader';
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
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { ShieldCheck, Lock, LogOut, RefreshCw, Mail, Edit2, BookOpen, ExternalLink, Download } from 'lucide-react-native';
import { fetchWithAuth, removeStoredToken, clearAppSessionAndCache, logoutAndRedirect } from '../../lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modification email
  const [editEmailVisible, setEditEmailVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

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

  const handleSaveEmail = async () => {
    const trimmed = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      Alert.alert('Format invalide', 'Veuillez saisir une adresse e-mail valide.');
      return;
    }

    try {
      setIsSavingEmail(true);
      const res = await fetchWithAuth('/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Erreur', data.error || "Impossible de mettre à jour l'adresse e-mail.");
        return;
      }

      setUser((prev: any) => ({ ...prev, email: trimmed }));
      setEditEmailVisible(false);
      Alert.alert('Succès', 'Votre adresse e-mail a été mise à jour avec succès.');
    } catch (e: any) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur.');
    } finally {
      setIsSavingEmail(false);
    }
  };

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
      <TopNavHeader title="Mon Profil" subtitle="Espace Locataire" />
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
                
                <Pressable 
                  onPress={() => { setNewEmail(user?.email || ''); setEditEmailVisible(true); }}
                  style={styles.emailRow}
                >
                  <Mail color="#6B7280" size={13} />
                  <Text style={styles.email} numberOfLines={1}>{user?.email || 'Définir un e-mail'}</Text>
                  <Edit2 color="#2C3E6B" size={12} style={{ marginLeft: 2 }} />
                </Pressable>

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
                  <Text style={styles.cardTitle}>Vos données vous appartiennent</Text>
                  <Text style={styles.cardSub}>
                    Aucun bailleur ne voit votre tranche de confiance ni vos pièces sans votre accord explicite.
                  </Text>
                </View>
              </View>
            </View>

            {/* Manuel d'Utilisation Officiel QAPRIL v2.0 */}
            <View style={styles.card}>
              <View style={styles.row}>
                <BookOpen color="#D97706" size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Manuel d'Utilisation Officiel</Text>
                  <Text style={styles.cardSub}>
                    Consultez le guide officiel complet de l'application (version 2.0 certifiée).
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Pressable
                  style={[styles.btnSecondary, { flex: 1, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
                  onPress={() => Linking.openURL('https://qapril.net/manuel')}
                >
                  <ExternalLink color="#B45309" size={14} />
                  <Text style={[styles.btnSecondaryText, { color: '#B45309', fontSize: 12 }]}>Consulter en ligne</Text>
                </Pressable>
                <Pressable
                  style={[styles.btnSecondary, { flex: 1, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}
                  onPress={() => Linking.openURL('https://qapril.net/api/manual/download')}
                >
                  <Download color="#2C3E6B" size={14} />
                  <Text style={[styles.btnSecondaryText, { color: '#2C3E6B', fontSize: 12 }]}>Télécharger DOCX</Text>
                </Pressable>
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
              <Text style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
                Version 2.0.0 · Infrastructure certifiée QAPRIL CI
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

      {/* Modal Modification Adresse Mail */}
      <Modal visible={editEmailVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Modifier mon adresse e-mail</Text>
            <Text style={styles.modalSubtitle}>Entrez votre adresse e-mail pour vos notifications, alertes et quittances.</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="nom@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable 
                style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]} 
                onPress={() => setEditEmailVisible(false)}
                disabled={isSavingEmail}
              >
                <Text style={{ color: '#4B5563', fontWeight: '700', fontSize: 13 }}>Annuler</Text>
              </Pressable>

              <Pressable 
                style={[styles.modalBtn, { backgroundColor: '#2C3E6B' }]} 
                onPress={handleSaveEmail}
                disabled={isSavingEmail}
              >
                {isSavingEmail ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Enregistrer</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 3,
    paddingVertical: 2,
  },
  email: { fontSize: 12, color: '#6B7280', flexShrink: 1 },
  pillOk: {
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 6 },
  modalSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 17 },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
