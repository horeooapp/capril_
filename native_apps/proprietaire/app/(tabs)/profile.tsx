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
import { BUILD_NUMBER, APP_VERSION, BUILD_TIMESTAMP } from '../../lib/version';

export default function ProfileScreen() {
  const router = useRouter();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [diaspora, setDiaspora] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modification email, Diaspora & À propos
  const [editEmailVisible, setEditEmailVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [diasporaModalVisible, setDiasporaModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

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
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1B4D3E', marginTop: 2 }}>
                  {user?.phone || '+225 · Numéro vérifié'}
                </Text>
                
                <Pressable 
                  onPress={() => { setNewEmail(user?.email || ''); setEditEmailVisible(true); }}
                  style={styles.emailRow}
                >
                  <Mail color="#6E6E73" size={13} />
                  <Text style={styles.email} numberOfLines={1}>{user?.email || 'Ajouter un e-mail (optionnel)'}</Text>
                  <Edit2 color="#1B4D3E" size={12} style={{ marginLeft: 2 }} />
                </Pressable>

                <View style={styles.pillOk}>
                  <Text style={styles.pillOkText}>
                    {user?.isCertified ? 'Niveau 2 · Identité vérifiée' : 'Niveau 1 · Téléphone vérifié'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>NIVEAUX DE CONFIANCE BAILLEUR</Text>
              <Text style={[styles.item, { color: '#1E7E4E' }]}>✓ Niveau 1 · Téléphone vérifié par code SMS</Text>
              <Text style={[styles.item, { color: user?.isCertified ? '#1E7E4E' : '#6E6E73' }]}>
                {user?.isCertified
                  ? '✓ Niveau 2 · Identité vérifiée (pièce + compte Mobile Money au même nom)'
                  : '○ Niveau 2 · Identité vérifiée (pièce d’identité + Mobile Money au même nom)'}
              </Text>
              {!user?.isCertified && (
                <Pressable
                  style={[styles.btnSecondary, { marginVertical: 6, paddingVertical: 10 }]}
                  onPress={() =>
                    Alert.alert(
                      'Vérifier mon identité (Niveau 2)',
                      'La vérification associe votre pièce d’identité (CNI ou passeport) à votre compte Mobile Money au même nom pour certifier votre statut de bailleur.'
                    )
                  }
                >
                  <Text style={styles.btnSecondaryText}>Ajouter ma pièce d’identité</Text>
                </Pressable>
              )}
              <Text style={[styles.item, { color: '#6E6E73' }]}>
                ○ Niveau 3 · Titre de propriété contrôlé (par bien dans Mes biens)
              </Text>
              <Text style={[styles.item, { color: '#6E6E73' }]}>
                ○ Niveau 4 · Visite certifiée par une agence agréée (par bien)
              </Text>
            </View>

            <Pressable style={styles.cardRow} onPress={() => setDiasporaModalVisible(true)}>
              <Globe color="#1B4D3E" size={20} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Je gère depuis l’étranger — 7 € par mois</Text>
                <Text style={styles.cardSub}>
                  Affichage en FCFA et € au taux officiel · rapports mensuels PDF · visite certifiée
                </Text>
              </View>
              <Text style={[styles.statusText, { color: diaspora ? '#1E7E4E' : '#6E6E73' }]}>
                {diaspora ? 'Actif' : 'Découvrir'}
              </Text>
            </Pressable>

            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Ma boîte MaPoste</Text>
                <Text style={styles.cardSub}>
                  Boîte MaPoste : disponible prochainement (intégration La Poste CI).
                </Text>
              </View>
              <View style={{ backgroundColor: '#F5F2EC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280' }}>Bientôt disponible</Text>
              </View>
            </View>

            <Pressable
              style={styles.btnSecondary}
              onPress={() => Linking.openURL('https://qapril.net/manuel')}
            >
              <BookOpen color="#1B4D3E" size={16} />
              <Text style={styles.btnSecondaryText}>Aide & Manuel d’utilisation</Text>
            </Pressable>

            <Pressable style={styles.btnSecondary} onPress={() => setAboutModalVisible(true)}>
              <RefreshCw color="#1B4D3E" size={16} />
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

      {/* Modal Option Diaspora (IC-01 V.diaspora) */}
      <Modal visible={diasporaModalVisible} transparent animationType="fade" onRequestClose={() => setDiasporaModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Je gère depuis l’étranger</Text>
            <Text style={styles.modalSubtitle}>Option à 7 € par mois · Résiliable à tout moment</Text>
            <View style={{ backgroundColor: '#F5F2EC', borderRadius: 12, padding: 14, gap: 8, marginBottom: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1C1C1E' }}>
                ✓ Montants en FCFA et en € au taux officiel (1 € = 655,957 F)
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1C1C1E' }}>
                ✓ Rapports mensuels PDF par bien et global
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1C1C1E' }}>
                ✓ Alertes e-mail et WhatsApp sur chaque événement
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1C1C1E' }}>
                ✓ Visite certifiée par une agence partenaire (niveau 4) incluse
              </Text>
              <Text style={{ fontSize: 11, color: '#6E6E73', marginTop: 4 }}>
                QAPRIL n’encaisse jamais vos loyers : ils vont directement sur vos comptes en Côte d’Ivoire.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]} onPress={() => setDiasporaModalVisible(false)}>
                <Text style={{ color: '#4B5563', fontWeight: '700', fontSize: 13 }}>Fermer</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: '#1B4D3E' }]}
                onPress={() => {
                  const next = !diaspora;
                  setDiaspora(next);
                  setDiasporaModalVisible(false);
                  Alert.alert(
                    next ? 'Option activée' : 'Option désactivée',
                    next
                      ? 'L’affichage en € et les rapports mensuels sont activés sur votre espace.'
                      : 'L’affichage est revenu uniquement en FCFA.'
                  );
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>
                  {diaspora ? 'Désactiver' : 'Activer — 7 € / mois'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>



      {/* Modal À propos */}
      <Modal visible={aboutModalVisible} transparent animationType="fade" onRequestClose={() => setAboutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>QAPRIL Propriétaire</Text>
            <Text style={styles.modalSubtitle}>
              Version {APP_VERSION} (Build {BUILD_NUMBER}) · Application officielle QAPRIL Côte d’Ivoire.{'\n'}
              Dernière mise à jour appliquée : {BUILD_TIMESTAMP}.{'\n'}
              Gestion locative conforme à la réglementation en vigueur (Code de la Construction et de l’Habitat).
            </Text>
            <Pressable style={[styles.btnSecondary, { marginBottom: 10 }]} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
              <RefreshCw color="#1B4D3E" size={16} />
              <Text style={styles.btnSecondaryText}>
                {isCheckingUpdate ? 'Recherche en cours...' : 'Rechercher une mise à jour'}
              </Text>
            </Pressable>
            <Pressable style={[styles.modalBtn, { backgroundColor: '#1B4D3E', flex: 0 }]} onPress={() => setAboutModalVisible(false)}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Fermer</Text>
            </Pressable>
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
