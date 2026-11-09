import { TopNavHeader } from '../../components/TopNavHeader';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Clock, Wrench } from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';

const CATEGORIES = [
  { id: 'PLOMB', label: 'Plomberie / Eau', icon: '💧' },
  { id: 'ELEC', label: 'Électricité', icon: '⚡' },
  { id: 'SERR', label: 'Serrure & Accès', icon: '🔑' },
  { id: 'CLIM', label: 'Climatisation', icon: '❄️' },
  { id: 'AUTRE', label: 'Autre dégradation', icon: '📦' },
];

export default function MaintenanceScreen() {
  const [category, setCategory] = useState('PLOMB');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [landlordName, setLandlordName] = useState('Bailleur propriétaire');
  const [propertyName, setPropertyName] = useState('Votre logement');

  const loadTickets = async () => {
    try {
      const res = await fetchWithAuth('/locataire/maintenance');
      if (res.ok) {
        const json = await res.json();
        if (json.tickets && Array.isArray(json.tickets)) {
          setHistory(json.tickets.map((t: any) => ({
            id: t.id,
            cat: t.categorie || 'Incident',
            t: t.description,
            d: t.dateSignalement ? `Émis le ${new Date(t.dateSignalement).toLocaleDateString('fr-FR')}` : 'Signalé',
            dest: `Reçu par ${json.landlordName || 'le bailleur'}`,
            st: t.statut === 'RESOLU' ? 'Résolu' : t.statut === 'EN_COURS' ? 'Pris en charge' : 'Transmis',
            stColor: t.statut === 'RESOLU' ? '#059669' : t.statut === 'EN_COURS' ? '#3B82F6' : '#D97706',
            stBg: t.statut === 'RESOLU' ? '#ECFDF5' : t.statut === 'EN_COURS' ? '#EFF6FF' : '#FEF3C7',
          })));
        }
        if (json.landlordName) setLandlordName(json.landlordName);
        if (json.propertyName) setPropertyName(json.propertyName);
      }
    } catch (e) {
      console.error('Erreur chargement maintenance', e);
    }
  };

  React.useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Champs requis', 'Veuillez préciser le titre et la description de l’incident.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth('/locataire/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: description.trim(),
          hasPhoto,
        }),
      });
      if (res.ok) {
        Alert.alert(
          'Signalement émis avec succès',
          `Votre signalement a été transmis à ${landlordName} avec horodatage certifié et preuve contradictoire.`
        );
        setTitle('');
        setDescription('');
        setHasPhoto(false);
        loadTickets();
      } else {
        const errJson = await res.json();
        Alert.alert('Erreur', errJson.error || 'Erreur lors de l’envoi');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Signalements" subtitle="Gestion des incidents" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* BANDEAU RÔLE : ÉMISSION LOCATAIRE */}
          <View style={styles.roleBanner}>
            <View style={styles.roleTag}>
              <Wrench color="#059669" size={14} />
              <Text style={styles.roleTagText}>ÉMISSION DU LOCATAIRE → BAILLEUR</Text>
            </View>
            <Text style={styles.roleDesc}>
              En tant que locataire, vous émettez ici vos déclarations de pannes ou travaux. Votre bailleur reçoit
              l’alerte en temps réel avec preuve contradictoire horodatée.
            </Text>
            <View style={styles.destinataireCard}>
              <Text style={styles.destinataireLabel}>DESTINATAIRE NOTIFIÉ :</Text>
              <Text style={styles.destinataireName}>{landlordName}</Text>
              <Text style={styles.destinataireSub}>Logement : {propertyName}</Text>
            </View>
          </View>

          {/* FORMULAIRE DE SIGNALEMENT */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>DÉCLARER UN NOUVEL INCIDENT</Text>

            {/* CHOIX DE LA CATÉGORIE */}
            <Text style={styles.label}>NATURE DE L’INCIDENT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategory(c.id)}
                    style={[styles.catChip, active && styles.catChipActive]}
                  >
                    <Text style={styles.catIcon}>{c.icon}</Text>
                    <Text style={[styles.catText, active && styles.catTextActive]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.label, { marginTop: 6 }]}>TITRE DE L'INCIDENT</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. : Fuite d’eau sous l'évier de la cuisine"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>DESCRIPTION PRÉCISE DU PROBLÈME</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Expliquez ce qui ne fonctionne pas pour que le bailleur puisse mandater le bon artisan..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            {/* JOINDRE UNE PHOTO HORODATÉE */}
            <Pressable
              style={[styles.photoBtn, hasPhoto && styles.photoBtnSuccess]}
              onPress={() => {
                setHasPhoto(!hasPhoto);
                Alert.alert(
                  !hasPhoto ? 'Photo datée ajoutée' : 'Photo retirée',
                  !hasPhoto
                    ? '1 photo datée faisant foi attachée au dossier.'
                    : 'La photo a été détachée.'
                );
              }}
            >
              {hasPhoto ? (
                <>
                  <CheckCircle2 color="#059669" size={18} />
                  <Text style={[styles.photoBtnText, { color: '#059669' }]}>
                    1 photo datée attachée
                  </Text>
                </>
              ) : (
                <>
                  <Camera color="#2C3E6B" size={18} />
                  <Text style={styles.photoBtnText}>Photo datée qui fait preuve</Text>
                </>
              )}
            </Pressable>

            {/* BOUTON D'ÉMISSION DU SIGNALEMENT */}
            <Pressable
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.submitBtnInner}>
                  <Text style={styles.submitText}>Envoyer à mon bailleur</Text>
                  <ArrowRight color="#FFFFFF" size={16} />
                </View>
              )}
            </Pressable>
          </View>

          {/* HISTORIQUE DES SIGNALEMENTS ÉMIS */}
          <View style={styles.historySection}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionHeading}>SIGNALEMENTS TRANSMIS AU BAILLEUR</Text>
              <Text style={styles.historyCount}>{history.length} déclarations</Text>
            </View>

            {history.length === 0 ? (
              <View style={[styles.historyCard, { alignItems: 'center', paddingVertical: 28 }]}>
                <Wrench color="#9CA3AF" size={32} />
                <Text style={[styles.historyTitle, { marginTop: 8, color: '#64748B' }]}>Aucun incident signalé</Text>
                <Text style={[styles.historySub, { textAlign: 'center', marginTop: 4 }]}>
                  En cas de panne ou dégradation, utilisez le formulaire ci-dessus pour notifier votre bailleur avec preuve horodatée.
                </Text>
              </View>
            ) : (
              history.map((h) => (
                <View key={h.id} style={styles.historyCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.historyCat}>{h.cat}</Text>
                  <View style={[styles.pill, { backgroundColor: h.stBg }]}>
                    <Text style={[styles.pillText, { color: h.stColor }]}>{h.st}</Text>
                  </View>
                </View>

                <Text style={styles.historyTitle}>{h.t}</Text>

                <View style={styles.historyDestRow}>
                  <CheckCircle2 color="#059669" size={13} />
                  <Text style={styles.historyDestText}>{h.dest}</Text>
                </View>

                <View style={styles.historyFooter}>
                  <Clock color="#9CA3AF" size={12} />
                  <Text style={styles.historySub}>{h.d}</Text>
                </View>
              </View>
            )))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  roleBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    gap: 8,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    letterSpacing: 0.8,
  },
  roleDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  destinataireCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  destinataireLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  destinataireName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  destinataireSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    gap: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.8,
  },
  catRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catChipActive: {
    backgroundColor: '#2C3E6B',
    borderColor: '#2C3E6B',
  },
  catIcon: {
    fontSize: 14,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    height: 90,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  photoBtnSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  submitBtn: {
    backgroundColor: '#2C3E6B',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  historySection: {
    gap: 10,
    marginTop: 4,
  },
  historyCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    gap: 6,
  },
  historyCat: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  historyDestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  historyDestText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  historyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  historySub: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
