import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Building2,
  MapPin,
  Home,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { fetchWithAuth } from '../lib/api';

const COMMUNES_ABIDJAN = [
  'Cocody',
  'Marcory',
  'Plateau',
  'Riviera',
  'Yopougon',
  'Bingerville',
  'Treichville',
  'Koumassi',
  'Port-Bouët',
  'Adjamé',
  'Attécoubé',
  'Abobo',
  'Songon',
  'Autre',
];

const PROPERTY_TYPES = [
  { id: 'APARTMENT', label: 'Appartement' },
  { id: 'VILLA', label: 'Villa' },
  { id: 'STUDIO', label: 'Studio' },
  { id: 'COMMERCIAL', label: 'Magasin / Commerce' },
  { id: 'OFFICE', label: 'Bureau' },
  { id: 'BUILDING', label: 'Immeuble' },
];

const LEASE_TYPES = [
  { id: 'residential', label: 'Habitation (Résidentiel)' },
  { id: 'commercial', label: 'Commercial / Professionnel' },
];

export default function CreatePropertyScreen() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [leaseType, setLeaseType] = useState('residential');
  const [commune, setCommune] = useState('Cocody');
  const [customCommune, setCustomCommune] = useState('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');
  const [surface, setSurface] = useState('');
  const [unitLabel, setUnitLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const finalCommune = commune === 'Autre' ? customCommune.trim() : commune;

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir un nom ou une désignation pour votre bien.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Champ requis', "Veuillez préciser l'adresse, quartier ou repère du bien.");
      return;
    }
    if (commune === 'Autre' && !customCommune.trim()) {
      Alert.alert('Champ requis', 'Veuillez préciser la commune.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth('/proprietaire/properties', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          commune: finalCommune,
          propertyType,
          leaseType,
          declaredRentFcfa: rent ? parseFloat(rent.replace(/\s/g, '')) : 0,
          superficieM2: surface ? parseFloat(surface.replace(/\s/g, '')) : undefined,
          unitLabel: unitLabel.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Bien enregistré !',
          `Votre bien a été créé avec succès.\nCode officiel : ${data.propertyCode || 'Enregistré'}\n\nSouhaitez-vous rédiger un contrat de bail dès maintenant ?`,
          [
            {
              text: 'Plus tard',
              style: 'cancel',
              onPress: () => router.back(),
            },
            {
              text: 'Rédiger le bail',
              onPress: () => {
                router.replace({
                  pathname: '/create-lease',
                  params: {
                    propertyId: data.propertyId,
                    propertyName: name.trim(),
                    rent: rent.trim(),
                  },
                } as any);
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de créer le bien. Vérifiez vos informations.');
      }
    } catch (err: any) {
      Alert.alert('Erreur réseau', "Vérifiez votre connexion internet et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#1C1C1E" size={26} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Nouveau Bien</Text>
          <Text style={styles.headerSub}>Ajouter un logement ou un local à votre patrimoine</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* BANDEAU CONFORMITÉ SOUVERAINE */}
          <View style={styles.legalNotice}>
            <ShieldCheck color="#1B4D3E" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.legalNoticeTitle}>Enregistrement Officiel QAPRIL</Text>
              <Text style={styles.legalNoticeDesc}>
                Votre bien sera immatriculé avec un code officiel unique pour la DGI et la CDC-CI, garantissant sa conformité à la Loi 2019-576.
              </Text>
            </View>
          </View>

          {/* 1. DÉSIGNATION DU BIEN */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>1. DÉSIGNATION DU BIEN</Text>

            <Text style={styles.fieldLabel}>Nom ou référence du bien *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Villa Duplex Riviera Golf, Apt 3P Angré..."
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>Type de bien *</Text>
            <View style={styles.chipsWrap}>
              {PROPERTY_TYPES.map((t) => {
                const active = propertyType === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setPropertyType(t.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Usage du bail *</Text>
            <View style={styles.chipsWrap}>
              {LEASE_TYPES.map((l) => {
                const active = leaseType === l.id;
                return (
                  <Pressable
                    key={l.id}
                    onPress={() => setLeaseType(l.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {l.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 2. LOCALISATION */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>2. LOCALISATION GÉOGRAPHIQUE</Text>

            <Text style={styles.fieldLabel}>Commune d'Abidjan / Ville *</Text>
            <View style={styles.chipsWrap}>
              {COMMUNES_ABIDJAN.map((c) => {
                const active = commune === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCommune(c)}
                    style={[styles.chipSmall, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipTextSmall, active && styles.chipTextActive]}>
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {commune === 'Autre' && (
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Précisez la commune ou ville (ex: Grand-Bassam, Yamoussoukro)"
                placeholderTextColor="#9CA3AF"
                value={customCommune}
                onChangeText={setCustomCommune}
              />
            )}

            <Text style={styles.fieldLabel}>Adresse précise, quartier ou repère *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Angré 8e tranche, Carrefour Glacier, Rue L44"
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.fieldLabel}>Numéro de porte / Lot (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Appartement B12, Porte 4, Villa 18"
              placeholderTextColor="#9CA3AF"
              value={unitLabel}
              onChangeText={setUnitLabel}
            />
          </View>

          {/* 3. CONDITIONS FINANCIÈRES & CARACTÉRISTIQUES */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>3. CARACTÉRISTIQUES & LOYER</Text>

            <Text style={styles.fieldLabel}>Loyer mensuel prévu (FCFA)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 250000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={rent}
              onChangeText={setRent}
            />

            <Text style={styles.fieldLabel}>Superficie en m² (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 85"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={surface}
              onChangeText={setSurface}
            />
          </View>

          {/* BOUTON DE SOUMISSION */}
          <Pressable
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.submitBtnContent}>
                <Building2 color="#FFFFFF" size={18} />
                <Text style={styles.submitBtnText}>Enregistrer le bien</Text>
              </View>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E0D7',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerSub: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
    marginTop: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  legalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#CEEAD6',
    borderRadius: 14,
  },
  legalNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  legalNoticeDesc: {
    fontSize: 11,
    color: '#2D3748',
    lineHeight: 16,
    marginTop: 2,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4E0D7',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSmall: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#1B4D3E',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
