import { TopNavHeader } from '../../components/TopNavHeader';
import { AppVersionBadge } from '../../components/AppVersionBadge';
import KycVerificationModal from '../../components/KycVerificationModal';
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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { ShieldCheck, Shield, Lock, LogOut, RefreshCw, Mail, Edit2, BookOpen, ExternalLink, Download, ChevronRight } from 'lucide-react-native';
import { fetchWithAuth, removeStoredToken, clearAppSessionAndCache, logoutAndRedirect } from '../../lib/api';
import { BUILD_NUMBER, APP_VERSION, BUILD_TIMESTAMP } from '../../lib/version';

export default function ProfileScreen() {
  const router = useRouter();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modification email, À propos & KYC Bancaire
  const [editEmailVisible, setEditEmailVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [kycModalVisible, setKycModalVisible] = useState(false);

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
        Alert.alert('Mode Développement', 'Les mises à jour sont actives sur les versions installées (Canal: ' + (Updates.channel || 'défaut') + ').');
        return;
      }
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
        Alert.alert(
          'Mise à jour disponible',
          "Une nouvelle version est disponible pour votre application. Voulez-vous la télécharger et l'appliquer maintenant ?",
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
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#2C3E6B', marginTop: 2 }}>
                  {user?.phone || '+225 · Numéro vérifié'}
                </Text>
                
                <Pressable 
                  onPress={() => { setNewEmail(user?.email || ''); setEditEmailVisible(true); }}
                  style={styles.emailRow}
                >
                  <Mail color="#6B7280" size={13} />
                  <Text style={styles.email} numberOfLines={1}>{user?.email || 'Ajouter un e-mail (optionnel)'}</Text>
                  <Edit2 color="#2C3E6B" size={12} style={{ marginLeft: 2 }} />
                </Pressable>

                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>
                    {user?.isCertified ? 'Niveau 2 · Identité vérifiée' : 'Niveau 1 · Téléphone vérifié'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Niveaux de confiance locataire (IC-01) */}
            <View style={styles.card}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 8 }}>
                MON NIVEAU DE CONFIANCE
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E7E4E', marginBottom: 6 }}>
                ✓ Niveau 1 · Téléphone vérifié par code SMS
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: user?.isCertified ? '#1E7E4E' : '#6B7280' }}>
                {user?.isCertified
                  ? '✓ Niveau 2 · Identité vérifiée (pièce d’identité contrôlée)'
                  : '○ Niveau 2 · Identité vérifiée (pièce d’identité + Mobile Money au même nom)'}
              </Text>
              {!user?.isCertified ? (
                <Pressable
                  style={[styles.btnPrimaryKyc, { marginTop: 10 }]}
                  onPress={() => setKycModalVisible(true)}
                >
                  <ShieldCheck color="#FFFFFF" size={17} />
                  <Text style={styles.btnPrimaryKycText}>Vérification KYC</Text>
                </Pressable>
              ) : (
                <View style={[styles.pillOk, { marginTop: 10, alignSelf: 'stretch', paddingVertical: 8, alignItems: 'center' }]}>
                  <Text style={[styles.pillOkText, { fontSize: 12 }]}>
                    ✓ Certification bancaire Niveau 2 active
                  </Text>
                </View>
              )}
            </View>

            {/* Ma boîte MaPoste */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Ma boîte MaPoste</Text>
                  <Text style={styles.cardSub}>
                    Boîte MaPoste : disponible prochainement (intégration La Poste CI).
                  </Text>
                </View>
                <View style={{ backgroundColor: '#F4F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280' }}>Bientôt disponible</Text>
                </View>
              </View>
            </View>

            <Pressable style={styles.card} onPress={() => router.push('/(tabs)/passeport' as any)}>
              <View style={styles.row}>
                <Shield color="#2C3E6B" size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Passeport locataire</Text>
                  <Text style={styles.cardSub}>
                    Gérez ce que vous partagez avec les bailleurs : tranche, attestations, foyer, durée de bail.
                  </Text>
                </View>
                <ChevronRight color="#2C3E6B" size={16} />
              </View>
            </Pressable>

            <Pressable
              style={styles.btnSecondary}
              onPress={() => Linking.openURL('https://qapril.net/manuel')}
            >
              <BookOpen color="#2C3E6B" size={16} />
              <Text style={styles.btnSecondaryText}>Aide & Manuel d’utilisation</Text>
            </Pressable>

            <Pressable style={styles.btnSecondary} onPress={() => setAboutModalVisible(true)}>
              <RefreshCw color="#2C3E6B" size={16} />
              <Text style={styles.btnSecondaryText}>À propos de QAPRIL · Version 2.0.0</Text>
            </Pressable>

            <Pressable style={styles.btnDanger} onPress={handleLogout}>
              <LogOut color="#C0392B" size={16} />
              <Text style={styles.btnDangerText}>Se déconnecter</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* Modal Modification Adresse Mail */}
      <Modal visible={editEmailVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
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
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>



      {/* Modal À propos */}
      <Modal visible={aboutModalVisible} transparent animationType="fade" onRequestClose={() => setAboutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>QAPRIL Locataire</Text>
            <Text style={styles.modalSubtitle}>
              Version {APP_VERSION} (Build {BUILD_NUMBER}) · Application officielle QAPRIL Côte d’Ivoire.{'\n'}
              Dernière mise à jour appliquée : {BUILD_TIMESTAMP}.{'\n'}
              Conçue conformément au Code de la Construction et de l’Habitat et aux normes républicaines de traçabilité.
            </Text>
            <Pressable style={[styles.btnSecondary, { marginBottom: 10 }]} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
              <RefreshCw color="#2C3E6B" size={16} />
              <Text style={styles.btnSecondaryText}>
                {isCheckingUpdate ? 'Recherche en cours...' : 'Rechercher une mise à jour'}
              </Text>
            </Pressable>
            <Pressable style={[styles.modalBtn, { backgroundColor: '#2C3E6B', flex: 0 }]} onPress={() => setAboutModalVisible(false)}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Processus KYC Niveau Bancaire */}
      <KycVerificationModal
        visible={kycModalVisible}
        onClose={() => setKycModalVisible(false)}
        onSuccess={(updatedUser) => {
          setUser((prev: any) => ({
            ...prev,
            ...updatedUser,
            isCertified: true,
            kycLevel: 2,
            kycStatus: 'verified',
          }));
        }}
        currentUser={user}
      />
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
  btnPrimaryKyc: {
    backgroundColor: '#1E7E4E',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1E7E4E',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnPrimaryKycText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
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
