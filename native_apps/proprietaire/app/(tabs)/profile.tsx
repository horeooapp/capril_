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
import { ShieldCheck, Globe, LogOut, RefreshCw, Mail, Edit2, BookOpen, ExternalLink, Download } from 'lucide-react-native';
import { fetchWithAuth, removeStoredToken, clearAppSessionAndCache, logoutAndRedirect } from '../../lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [diaspora, setDiaspora] = useState(false);
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
      'Êtes-vous sûr de vouloir vous déconnecter de votre compte ?',
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
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Bailleur Propriétaire'
    : 'Bailleur Propriétaire';

  const avatarInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] || 'B').toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Mon Compte" subtitle="Espace Bailleur Propriétaire" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sub}>Espace Bailleur & Gestion Immobilière</Text>
        <Text style={styles.title}>Mon Compte</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1B4D3E" />
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
                  <Mail color="#6E6E73" size={13} />
                  <Text style={styles.email} numberOfLines={1}>{user?.email || 'Définir un e-mail'}</Text>
                  <Edit2 color="#1B4D3E" size={12} style={{ marginLeft: 2 }} />
                </Pressable>

                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>
                    {user?.isCertified ? 'Bailleur certifié · Identité validée' : 'Compte actif · Espace Bailleur'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>VOTRE NIVEAU DE CONFIANCE</Text>
              <Text style={styles.item}>✓ Niveau 1 · Téléphone vérifié</Text>
              <Text style={[styles.item, !user?.isCertified && { color: '#6E6E73' }]}>
                {user?.isCertified ? '✓ Niveau 2 · Identité validée (Pièce + Rapprochement)' : '○ Niveau 2 · Ajouter ma pièce d’identité pour valider'}
              </Text>
              <Text style={[styles.item, { color: '#6E6E73' }]}>
                ○ Niveau 3 · Titre de propriété contrôlé (enregistré par bien)
              </Text>
              <Text style={[styles.item, { color: '#6E6E73' }]}>
                ○ Niveau 4 · Visite certifiée par agence agréée (par bien)
              </Text>
            </View>

            <Pressable style={styles.cardRow} onPress={() => setDiaspora(!diaspora)}>
              <Globe color="#1B4D3E" size={20} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Je gère depuis l’étranger — 7 € par mois</Text>
                <Text style={styles.cardSub}>
                  Affichage en FCFA et € au taux officiel · rapports de gestion mensuels
                </Text>
              </View>
              <Text style={[styles.statusText, { color: diaspora ? '#1E7E4E' : '#6E6E73' }]}>
                {diaspora ? 'Actif' : 'Inactif'}
              </Text>
            </Pressable>

            {/* Manuel d'Utilisation Officiel QAPRIL v2.0 */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <BookOpen color="#D97706" size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Manuel d'Utilisation Officiel</Text>
                  <Text style={styles.cardSub}>
                    Guide officiel complet certifié v2.0 (espace bailleur, baux légaux et adoption).
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
                  <Download color="#1B4D3E" size={14} />
                  <Text style={[styles.btnSecondaryText, { color: '#1B4D3E', fontSize: 12 }]}>Télécharger DOCX</Text>
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
                <RefreshCw color="#1B4D3E" size={16} />
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

      {/* Modal Modification Adresse Mail */}
      <Modal visible={editEmailVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Modifier mon adresse e-mail</Text>
            <Text style={styles.modalSubtitle}>Entrez votre adresse e-mail pour vos notifications et quittances de loyer.</Text>
            
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
                style={[styles.modalBtn, { backgroundColor: '#1B4D3E' }]} 
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
  container: { flex: 1, backgroundColor: '#F5F2EC' },
  scroll: { padding: 18, gap: 12 },
  sub: { fontSize: 12, color: '#6E6E73', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '600', color: '#1C1C1E' },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 3,
    paddingVertical: 2,
  },
  email: { fontSize: 12, color: '#6E6E73', flexShrink: 1 },
  pillOk: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  pillOkText: { color: '#1E7E4E', fontSize: 11, fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    gap: 6,
  },
  label: { fontSize: 11, fontWeight: '600', color: '#6E6E73', marginBottom: 4 },
  item: { fontSize: 12, color: '#1C1C1E', fontWeight: '600' },
  cardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  cardSub: { fontSize: 11, color: '#6E6E73', marginTop: 2 },
  statusText: { fontSize: 12, fontWeight: '600' },
  btnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0D7',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSecondaryText: { color: '#1B4D3E', fontSize: 13, fontWeight: '600' },
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
