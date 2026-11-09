import { TopNavHeader } from '../components/TopNavHeader';
import React, { useState, useEffect, useRef } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  FileSpreadsheet,
  Building2,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Coins,
} from 'lucide-react-native';
import { fetchWithAuth } from '../lib/api';

const DURATION_OPTIONS = [
  { id: '12', label: '12 mois (1 an)' },
  { id: '24', label: '24 mois (2 ans)' },
  { id: '36', label: '36 mois (3 ans)' },
];

export default function CreateLeaseScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{
    propertyId?: string;
    propertyName?: string;
    rent?: string;
  }>();

  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);

  // Form states
  const [selectedPropertyId, setSelectedPropertyId] = useState(params.propertyId || '');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [rentAmount, setRentAmount] = useState(params.rent || '');
  const [depositAmount, setDepositAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [maskIdentity, setMaskIdentity] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger les biens du propriétaire
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await fetchWithAuth('/proprietaire/properties');
        const data = await res.json();
        if (res.ok && data.properties) {
          // Filtrer les biens vacants en priorité, ou tous les biens
          const vacants = data.properties.filter((p: any) => !p.isRented && p.occupancyStatus !== 'Loué');
          setProperties(vacants.length > 0 ? vacants : data.properties);
          
          if (!selectedPropertyId) {
            if (params.propertyId) {
              setSelectedPropertyId(params.propertyId);
            } else if (vacants.length > 0) {
              setSelectedPropertyId(vacants[0].id);
              if (vacants[0].currentRent || vacants[0].declaredRentFcfa) {
                setRentAmount(String(vacants[0].currentRent || vacants[0].declaredRentFcfa));
              }
            }
          }
        }
      } catch (e) {
        console.warn("Erreur chargement biens pour bail:", e);
      } finally {
        setLoadingProps(false);
      }
    };
    loadProperties();
  }, []);

  // Recalcul automatique de la caution et avance (max 2 mois selon la loi ivoirienne)
  useEffect(() => {
    const rentNum = parseFloat(rentAmount.replace(/\s/g, '')) || 0;
    if (rentNum > 0) {
      if (!depositAmount || parseFloat(depositAmount) === 0) {
        setDepositAmount(String(rentNum * 2));
      }
      if (!advanceAmount || parseFloat(advanceAmount) === 0) {
        setAdvanceAmount(String(rentNum * 2));
      }
    }
  }, [rentAmount]);

  const rentNum = parseFloat(rentAmount.replace(/\s/g, '')) || 0;
  const depositNum = parseFloat(depositAmount.replace(/\s/g, '')) || 0;
  const advanceNum = parseFloat(advanceAmount.replace(/\s/g, '')) || 0;
  const maxLegalCaution = rentNum * 2;

  const isDepositOverLimit = rentNum > 0 && depositNum > maxLegalCaution;
  const isAdvanceOverLimit = rentNum > 0 && advanceNum > maxLegalCaution;

  const handleCreate = async () => {
    if (!selectedPropertyId) {
      Alert.alert('Bien requis', 'Veuillez sélectionner un bien immobilier dans la liste.');
      return;
    }
    if (!tenantName.trim()) {
      Alert.alert('Nom absent', 'Veuillez renseigner le nom complet du locataire.');
      return;
    }
    if (!tenantPhone.trim()) {
      Alert.alert('Numéro de téléphone absent', 'Veuillez ajouter le numéro de téléphone du locataire pour l’envoi de la quittance et la signature du bail par code SMS.');
      return;
    }
    const cleanDigits = tenantPhone.replace(/\D/g, '');
    if (cleanDigits.length < 8) {
      Alert.alert('Numéro de téléphone invalide', 'Veuillez renseigner un numéro de téléphone valide à 10 chiffres (ex: 07 00 00 00 00 ou 05 00 00 00 00).');
      return;
    }
    if (!rentAmount.trim() || rentNum <= 0) {
      Alert.alert('Montant requis', 'Veuillez préciser le montant du loyer mensuel en FCFA.');
      return;
    }
    if (isDepositOverLimit || isAdvanceOverLimit) {
      Alert.alert(
        'Plafonnement Légal Dépassé',
        `Selon la Loi N° 2019-576 (Art. 415 & 416 CCH), la caution et l'avance sont strictement plafonnées à 2 mois maximum (soit ${(maxLegalCaution).toLocaleString('fr-FR')} FCFA). Veuillez ajuster les montants.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth('/proprietaire/leases/create', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          tenantEmail: tenantEmail.trim().toLowerCase(),
          tenantPhone: tenantPhone.trim(),
          tenantName: tenantName.trim(),
          rentAmount: rentAmount.trim(),
          depositAmount: depositAmount.trim() || String(maxLegalCaution),
          avanceLoyer: advanceAmount.trim() || String(maxLegalCaution),
          durationMonths: durationMonths,
          bailleurMasque: maskIdentity,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Alert.alert(
          'Bail Créé & Envoyé !',
          `Le contrat de bail officiel a été généré en PDF et scellé numériquement.\n\nUne notification SMS a été transmise au locataire pour sa signature par code SMS.\n\nRéf : ${data.lease?.leaseReference || 'Enregistré'}`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de créer le bail.');
      }
    } catch (e) {
      Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Nouveau Bail Certifié" subtitle="Contrat conforme Loi 2019-576" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scroll, { paddingBottom: 380 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* BANDEAU RÈGLEMENTAIRE */}
          <View style={styles.legalNotice}>
            <ShieldCheck color="#1B4D3E" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.legalNoticeTitle}>Sécurisation Intégrale & Signature SMS</Text>
              <Text style={styles.legalNoticeDesc}>
                Le bail est scellé avec un certificat numérique infalsifiable. Les deux parties signent par code SMS certifié, et les quittances à code de vérification sont immédiatement activées.
              </Text>
            </View>
          </View>

          {/* 1. SÉLECTION DU BIEN */}
          <View style={styles.formSection}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>1. BIEN IMMOBILIER</Text>
              <Pressable
                onPress={() => router.push('/create-property')}
                style={styles.addPropertyLink}
              >
                <Text style={styles.addPropertyLinkText}>+ Ajouter un autre bien</Text>
              </Pressable>
            </View>

            {loadingProps ? (
              <ActivityIndicator color="#1B4D3E" style={{ marginVertical: 12 }} />
            ) : properties.length === 0 ? (
              <View style={styles.emptyPropsCard}>
                <Building2 color="#9CA3AF" size={28} />
                <Text style={styles.emptyPropsText}>
                  Vous n'avez aucun bien disponible. Créez d'abord un bien immobilier.
                </Text>
                <Pressable
                  style={styles.btnSmallGreen}
                  onPress={() => router.push('/create-property')}
                >
                  <Text style={styles.btnSmallGreenText}>+ Créer un bien</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.chipsWrap}>
                {properties.map((p) => {
                  const active = selectedPropertyId === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => {
                        setSelectedPropertyId(p.id);
                        if (p.currentRent || p.declaredRentFcfa) {
                          setRentAmount(String(p.currentRent || p.declaredRentFcfa));
                        }
                      }}
                      style={[styles.propChip, active && styles.propChipActive]}
                    >
                      <Building2 color={active ? '#FFFFFF' : '#1B4D3E'} size={15} />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.propChipTitle, active && styles.propChipTextActive]}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                        <Text
                          style={[styles.propChipSub, active && styles.propChipSubActive]}
                          numberOfLines={1}
                        >
                          {p.commune || 'Abidjan'} · {(p.currentRent || p.declaredRentFcfa || 0).toLocaleString('fr-FR')} F
                        </Text>
                      </View>
                      {active && <CheckCircle2 color="#FFFFFF" size={16} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* 2. LOCATAIRE */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>2. INFORMATIONS DU LOCATAIRE</Text>

            <Text style={styles.fieldLabel}>Nom et Prénom du locataire *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Kouadio Jean-Marc"
              placeholderTextColor="#9CA3AF"
              value={tenantName}
              onChangeText={setTenantName}
            />

            <Text style={styles.fieldLabel}>Numéro de Téléphone (pour signature par code SMS) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 0701020304"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={tenantPhone}
              onChangeText={setTenantPhone}
            />

            <Text style={styles.fieldLabel}>Email du locataire (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: locataire@gmail.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={tenantEmail}
              onChangeText={setTenantEmail}
            />
          </View>

          {/* 3. CONDITIONS FINANCIÈRES & LÉGALES */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>3. CONDITIONS FINANCIÈRES (LOI 2019-576)</Text>

            <Text style={styles.fieldLabel}>Loyer Mensuel (FCFA) *</Text>
            <View style={styles.inputWithSuffixContainer}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Ex: 250000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                returnKeyType="next"
                value={rentAmount}
                onChangeText={setRentAmount}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
              />
              <View style={styles.suffixBadge}>
                <Text style={styles.suffixBadgeText}>FCFA</Text>
              </View>
            </View>

            {rentAmount.trim().length > 0 && (
              <View style={styles.valuePreviewCard}>
                <Text style={styles.valuePreviewLabel}>Loyer mensuel saisi :</Text>
                <Text style={styles.valuePreviewText}>
                  {Number(rentAmount.replace(/\s/g, '') || 0).toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            )}

            <View style={{ marginTop: 8 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.fieldLabel}>Dépôt de garantie / Caution (FCFA)</Text>
                <Text style={styles.helperLabel}>Max 2 mois : {maxLegalCaution.toLocaleString('fr-FR')} F</Text>
              </View>
              <View style={styles.inputWithSuffixContainer}>
                <TextInput
                  style={[styles.input, styles.inputFlex, isDepositOverLimit && styles.inputError]}
                  placeholder={`Ex: ${maxLegalCaution}`}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  returnKeyType="next"
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 150);
                  }}
                />
                <View style={styles.suffixBadge}>
                  <Text style={styles.suffixBadgeText}>FCFA</Text>
                </View>
              </View>
              {depositAmount.trim().length > 0 && !isDepositOverLimit && (
                <View style={styles.valuePreviewCard}>
                  <Text style={styles.valuePreviewLabel}>Caution saisie :</Text>
                  <Text style={styles.valuePreviewText}>
                    {Number(depositAmount.replace(/\s/g, '') || 0).toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
              )}
              {isDepositOverLimit && (
                <Text style={styles.errorText}>
                  ⚠️ La caution ne peut dépasser 2 mois de loyer selon la loi ivoirienne.
                </Text>
              )}
            </View>

            <View style={{ marginTop: 8 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.fieldLabel}>Avance sur Loyer (FCFA)</Text>
                <Text style={styles.helperLabel}>Max 2 mois : {maxLegalCaution.toLocaleString('fr-FR')} F</Text>
              </View>
              <View style={styles.inputWithSuffixContainer}>
                <TextInput
                  style={[styles.input, styles.inputFlex, isAdvanceOverLimit && styles.inputError]}
                  placeholder={`Ex: ${maxLegalCaution}`}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  returnKeyType="done"
                  value={advanceAmount}
                  onChangeText={setAdvanceAmount}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 150);
                  }}
                />
                <View style={styles.suffixBadge}>
                  <Text style={styles.suffixBadgeText}>FCFA</Text>
                </View>
              </View>
              {advanceAmount.trim().length > 0 && !isAdvanceOverLimit && (
                <View style={styles.valuePreviewCard}>
                  <Text style={styles.valuePreviewLabel}>Avance saisie :</Text>
                  <Text style={styles.valuePreviewText}>
                    {Number(advanceAmount.replace(/\s/g, '') || 0).toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
              )}
              {isAdvanceOverLimit && (
                <Text style={styles.errorText}>
                  ⚠️ L'avance sur loyer ne peut dépasser 2 mois selon la loi ivoirienne.
                </Text>
              )}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Durée du bail</Text>
            <View style={styles.chipsWrapHorizontal}>
              {DURATION_OPTIONS.map((d) => {
                const active = durationMonths === d.id;
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => setDurationMonths(d.id)}
                    style={[styles.durationChip, active && styles.durationChipActive]}
                  >
                    <Text style={[styles.durationChipText, active && styles.durationChipTextActive]}>
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 4. CONFIDENTIALITÉ DU BAILLEUR (IC-01 P1-01 / P1-02) */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>4. PROTECTION DE VOTRE IDENTITÉ</Text>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 12,
                backgroundColor: maskIdentity ? '#F0FDF4' : '#FFFFFF',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: maskIdentity ? '#86EFAC' : '#E5E7EB',
                marginTop: 6,
              }}
              onPress={() => setMaskIdentity(!maskIdentity)}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontWeight: '700', color: '#1A1D26', fontSize: 14 }}>
                  Masquer mon identité à ce locataire
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 16 }}>
                  {maskIdentity
                    ? "✓ Activé : Le locataire verra 'Bailleur certifié' au lieu de votre nom et contact direct."
                    : "Désactivé : Vos nom et coordonnées apparaîtront sur l'espace locataire."}
                </Text>
              </View>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: maskIdentity ? '#1E7E4E' : '#D1D5DB',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {maskIdentity && <CheckCircle2 color="#fff" size={16} />}
              </View>
            </Pressable>
          </View>

          {/* BOUTON D'ACTION PRINCIPAL */}
          <Pressable
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.submitBtnContent}>
                <FileSpreadsheet color="#FFFFFF" size={18} />
                <Text style={styles.submitBtnText}>Générer le Contrat de Bail PDF</Text>
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
    gap: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addPropertyLink: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
  },
  addPropertyLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  helperLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  inputWithSuffixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  inputFlex: {
    flex: 1,
  },
  suffixBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  suffixBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  valuePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  valuePreviewLabel: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  valuePreviewText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 3,
    fontWeight: '500',
  },
  chipsWrap: {
    gap: 8,
    marginTop: 4,
  },
  chipsWrapHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  propChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  propChipActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
  },
  propChipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  propChipSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  propChipTextActive: {
    color: '#FFFFFF',
  },
  propChipSubActive: {
    color: '#D1FAE5',
  },
  emptyPropsCard: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyPropsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  btnSmallGreen: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 4,
  },
  btnSmallGreenText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  durationChipTextActive: {
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
