import { TopNavHeader } from '../components/TopNavHeader';
import React, { useState, useRef, useEffect } from 'react';
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
  Navigation,
  RotateCw,
} from 'lucide-react-native';
import { fetchWithAuth } from '../lib/api';

// Chargement sécurisé conditionnel du module de géolocalisation
let LocationModule: any = null;
try {
  LocationModule = require('expo-location');
} catch {
  LocationModule = null;
}

const fmtFcfa = (n?: number | string | null) => {
  const num = typeof n === 'number' ? n : Number(n);
  if (isNaN(num)) return '0 F';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F';
};

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
  { id: 'VILLA', label: 'Villa / Maison' },
  { id: 'TERRAIN_URBAIN_NU', label: 'Terrain urbain nu' },
  { id: 'TERRAIN_RURAL', label: 'Terrain rural' },
  { id: 'STUDIO', label: 'Studio' },
  { id: 'COMMERCIAL', label: 'Commerce / Local' },
  { id: 'BUILDING', label: 'Immeuble entier' },
];

const NATURES_TITRES = [
  { id: 'ACD', label: 'ACD (Pleine propriété)' },
  { id: 'TITRE_FONCIER', label: 'Titre Foncier' },
  { id: 'LETTRE_ATTRIBUTION', label: 'Lettre d\'attribution' },
  { id: 'ATTESTATION_VILLAGEOISE', label: 'Attestation villageoise' },
  { id: 'CERTIFICAT_FONCIER_RURAL', label: 'Certificat foncier rural' },
];

const LEASE_TYPES = [
  { id: 'residential', label: 'Habitation (Résidentiel)' },
  { id: 'commercial', label: 'Commercial / Professionnel' },
];

export default function CreatePropertyScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Form states
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [leaseType, setLeaseType] = useState('residential');
  const [commune, setCommune] = useState('Cocody');
  const [customCommune, setCustomCommune] = useState('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');
  const [surface, setSurface] = useState('');
  const [rooms, setRooms] = useState('3');
  const [unitLabel, setUnitLabel] = useState('');
  const [isForSale, setIsForSale] = useState(false);
  const [natureTitre, setNatureTitre] = useState('ACD');
  const [numeroTitre, setNumeroTitre] = useState('');
  const [numeroLot, setNumeroLot] = useState('');
  const [numeroIlot, setNumeroIlot] = useState('');
  const [estViabilise, setEstViabilise] = useState(true);
  const [loading, setLoading] = useState(false);

  // ADD-28 : Géolocalisation automatique et manuelle
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [precisionM, setPrecisionM] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Résolution administrative : Ville, Commune, Quartier
  const [detectedVille, setDetectedVille] = useState<string | null>(null);
  const [detectedCommune, setDetectedCommune] = useState<string | null>(null);
  const [detectedQuartier, setDetectedQuartier] = useState<string | null>(null);

  const resolveLocationDetails = async (lat: number, lng: number) => {
    try {
      // 1. Appel API hybride QAPRIL
      const res = await fetchWithAuth(`/api/geo/reverse?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data && data.success && data.data) {
        const info = data.data;
        if (info.ville) setDetectedVille(info.ville);
        if (info.commune) {
          setDetectedCommune(info.commune);
          if (COMMUNES_ABIDJAN.includes(info.commune)) {
            setCommune(info.commune);
          } else {
            setCommune('Autre');
            setCustomCommune(info.commune);
          }
        }
        if (info.quartier) {
          setDetectedQuartier(info.quartier);
          setAddress(prev => prev.trim().length === 0 ? info.quartier : prev);
        }
        return;
      }
    } catch (_e) {
      // Fallback natif Expo Location si déconnecté
      try {
        if (LocationModule?.reverseGeocodeAsync) {
          const results = await LocationModule.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (results && results.length > 0) {
            const r = results[0];
            const v = r.city || r.region || 'Abidjan';
            const c = r.subregion || r.district || r.city || 'Cocody';
            const q = [r.name, r.street].filter(Boolean).join(', ') || r.district || '';
            setDetectedVille(v);
            setDetectedCommune(c);
            setDetectedQuartier(q);
            if (COMMUNES_ABIDJAN.includes(c)) {
              setCommune(c);
            }
            if (q) {
              setAddress(prev => prev.trim().length === 0 ? q : prev);
            }
          }
        }
      } catch (_err) {}
    }
  };

  // Tentative de géolocalisation automatique à l'ouverture du formulaire
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!LocationModule?.requestForegroundPermissionsAsync) return;
      try {
        const { status } = await LocationModule.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setIsLocating(true);
          const pos = await LocationModule.getCurrentPositionAsync({
            accuracy: LocationModule.Accuracy?.Balanced ?? 3,
          });
          if (isMounted && pos?.coords) {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setGpsLatitude(lat);
            setGpsLongitude(lng);
            setPrecisionM(Math.round(pos.coords.accuracy || 15));
            setGpsMessage('Position GPS détectée automatiquement.');
            await resolveLocationDetails(lat, lng);
          }
        }
      } catch (_e) {
        // En cas d'erreur ou GPS inactif, l'utilisateur a le bouton manuel
      } finally {
        if (isMounted) setIsLocating(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleCaptureGps = async () => {
    if (!LocationModule?.requestForegroundPermissionsAsync) {
      Alert.alert(
        'Capture GPS',
        'La capture GPS directe nécessite la dernière mise à jour de l\'application. Vous pouvez saisir directement l\'adresse et la commune de votre bien.'
      );
      return;
    }
    setIsLocating(true);
    setGpsMessage(null);
    try {
      const { status } = await LocationModule.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission GPS requise',
          'Veuillez autoriser l\'accès à votre position pour capturer les coordonnées du bien.'
        );
        setIsLocating(false);
        return;
      }

      const pos = await LocationModule.getCurrentPositionAsync({
        accuracy: LocationModule.Accuracy?.High ?? 4,
      });

      if (pos?.coords) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 15);
        setGpsLatitude(lat);
        setGpsLongitude(lng);
        setPrecisionM(acc);
        setGpsMessage(`Position GPS acquise : ${lat.toFixed(5)}°, ${lng.toFixed(5)}° (±${acc}m)`);
        await resolveLocationDetails(lat, lng);
      }
    } catch (_err) {
      Alert.alert(
        'Erreur GPS',
        'Impossible de récupérer votre position actuelle. Vérifiez que la localisation GPS est activée dans les paramètres de votre téléphone.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const finalCommune = commune === 'Autre' ? customCommune.trim() : commune;

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Désignation requise', 'Veuillez saisir un nom ou une désignation pour votre bien (ex: Villa Orchidée ou Studio A1).');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Adresse requise', "Veuillez préciser l'adresse, le quartier ou un repère géographique du bien.");
      return;
    }
    if (commune === 'Autre' && !customCommune.trim()) {
      Alert.alert('Commune requise', 'Veuillez préciser la commune de situation du bien.');
      return;
    }
    if (isForSale) {
      const parsedPrix = parseFloat(rent.replace(/\s/g, ''));
      if (!rent.trim() || isNaN(parsedPrix) || parsedPrix <= 0) {
        Alert.alert('Prix de vente requis', 'Veuillez préciser le prix de vente en FCFA.');
        return;
      }
      if (!numeroTitre.trim()) {
        Alert.alert('Titre de propriété absent', 'Veuillez renseigner le numéro du titre de propriété (ACD, Titre Foncier ou Lettre d\'attribution).');
        return;
      }
    } else if (rent.trim()) {
      const parsedLoyer = parseFloat(rent.replace(/\s/g, ''));
      if (isNaN(parsedLoyer) || parsedLoyer <= 0) {
        Alert.alert('Loyer invalide', 'Veuillez saisir un montant de loyer mensuel valide en chiffres (FCFA).');
        return;
      }
    }
    if (surface.trim()) {
      const parsedSurf = parseFloat(surface.replace(/\s/g, ''));
      if (isNaN(parsedSurf) || parsedSurf <= 0) {
        Alert.alert('Superficie invalide', 'Veuillez saisir une superficie valide en mètres carrés (m²).');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth('/proprietaire/properties', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          commune: finalCommune,
          city: detectedVille || 'Abidjan',
          propertyType,
          leaseType,
          declaredRentFcfa: !isForSale && rent ? parseFloat(rent.replace(/\s/g, '')) : 0,
          superficieM2: surface ? parseFloat(surface.replace(/\s/g, '')) : undefined,
          rooms: rooms ? parseInt(rooms.replace(/\s/g, ''), 10) : undefined,
          unitLabel: unitLabel.trim() || undefined,
          // Extensions ADD-25
          forSale: isForSale,
          prixVenteFcfa: isForSale && rent ? parseFloat(rent.replace(/\s/g, '')) : undefined,
          categorie_vente: isForSale ? propertyType : undefined,
          titre_type: isForSale ? natureTitre : undefined,
          titre_numero: isForSale && numeroTitre.trim() ? numeroTitre.trim().toUpperCase() : undefined,
          numero_lot: isForSale && numeroLot.trim() ? numeroLot.trim() : undefined,
          numero_ilot: isForSale && numeroIlot.trim() ? numeroIlot.trim() : undefined,
          est_viabilise: isForSale ? estViabilise : undefined,
          // ADD-28 : Géolocalisation certifiée
          gpsLatitude: gpsLatitude ?? undefined,
          gpsLongitude: gpsLongitude ?? undefined,
          precisionM: precisionM ?? undefined,
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
      <TopNavHeader title="Nouveau Bien" subtitle="Ajouter un logement à votre patrimoine" />

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
          {/* BANDEAU CONFORMITÉ SOUVERAINE */}
          <View style={styles.legalNotice}>
            <ShieldCheck color="#1B4D3E" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.legalNoticeTitle}>Enregistrement Officiel QAPRIL</Text>
              <Text style={styles.legalNoticeDesc}>
                Votre bien sera immatriculé avec un code officiel unique pour la DGI, garantissant sa conformité à la Loi 2019-576.
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

            <Text style={styles.fieldLabel}>Destination du bien *</Text>
            <View style={styles.chipsWrap}>
              <Pressable
                onPress={() => setIsForSale(false)}
                style={[styles.chip, !isForSale && styles.chipActive]}
              >
                <Text style={[styles.chipText, !isForSale && styles.chipTextActive]}>
                  Location (Gestion locative)
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsForSale(true)}
                style={[styles.chip, isForSale && styles.chipActive]}
              >
                <Text style={[styles.chipText, isForSale && styles.chipTextActive]}>
                  Vente / Transaction
                </Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Type de bien *</Text>
            <View style={styles.chipsWrap}>
              {PROPERTY_TYPES.map((t) => {
                const active = propertyType === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => {
                      setPropertyType(t.id);
                      if (t.id === 'STUDIO') setRooms('1');
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {propertyType !== 'TERRAIN_URBAIN_NU' && propertyType !== 'TERRAIN_RURAL' && (
              <>
                <Text style={styles.fieldLabel}>Nombre de pièces *</Text>
                <View style={styles.chipsWrap}>
                  {['1', '2', '3', '4', '5', '6'].map((nb) => {
                    const active = rooms === nb;
                    return (
                      <Pressable
                        key={nb}
                        onPress={() => setRooms(nb)}
                        style={[styles.chipSmall, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipTextSmall, active && styles.chipTextActive]}>
                          {nb === '1' ? '1 pièce (Studio)' : `${nb} pièces`}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="Nombre exact de pièces (ex: 3)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={rooms}
                  onChangeText={setRooms}
                />
              </>
            )}

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

            {isForSale && (
              <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                <Text style={styles.fieldLabel}>Nature du titre juridique *</Text>
                <View style={styles.chipsWrap}>
                  {NATURES_TITRES.map((t) => {
                    const active = natureTitre === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => setNatureTitre(t.id)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, { marginTop: 10 }]}>N° du titre foncier / ACD *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex : ACD-2023-9821 ou TF-12435"
                  placeholderTextColor="#94A3B8"
                  value={numeroTitre}
                  onChangeText={setNumeroTitre}
                  autoCapitalize="characters"
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>N° de Lot</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex : 12"
                      placeholderTextColor="#94A3B8"
                      value={numeroLot}
                      onChangeText={setNumeroLot}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>N° d'Îlot</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex : 04"
                      placeholderTextColor="#94A3B8"
                      value={numeroIlot}
                      onChangeText={setNumeroIlot}
                    />
                  </View>
                </View>
              </View>
            )}
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

            {/* ADD-28 : GÉOLOCALISATION CERTIFIÉE DU BIEN */}
            <View style={styles.geoBox}>
              <View style={styles.geoHeader}>
                <View style={styles.geoIconCircle}>
                  <Navigation color="#1B4D3E" size={16} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.geoTitle}>GÉOLOCALISATION GPS DU BIEN</Text>
                    <View style={styles.geoBadge}>
                      <Text style={styles.geoBadgeText}>La Poste CI</Text>
                    </View>
                  </View>
                  <Text style={styles.geoSubtitle}>
                    Pour générer l'adresse numérique certifiée du bien
                  </Text>
                </View>
              </View>

              {gpsLatitude !== null && gpsLongitude !== null ? (
                <View style={styles.geoSuccessCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Check color="#1E7E4E" size={16} />
                      <Text style={styles.geoCoordsText}>
                        {gpsLatitude.toFixed(5)}° N, {gpsLongitude.toFixed(5)}° W
                      </Text>
                    </View>
                    <View style={styles.geoAccuracyBadge}>
                      <Text style={styles.geoAccuracyBadgeText}>±{precisionM ?? 15}m</Text>
                    </View>
                  </View>

                  {/* Résolution administrative certifiée : Ville, Commune, Quartier */}
                  <View style={styles.geoAdminCard}>
                    <View style={styles.geoAdminRow}>
                      <Text style={styles.geoAdminLabel}>Ville</Text>
                      <Text style={styles.geoAdminValue}>{detectedVille || 'Abidjan'}</Text>
                    </View>
                    <View style={styles.geoAdminRow}>
                      <Text style={styles.geoAdminLabel}>Commune</Text>
                      <Text style={[styles.geoAdminValue, { color: '#1B4D3E', fontWeight: '800' }]}>{detectedCommune || finalCommune}</Text>
                    </View>
                    <View style={styles.geoAdminRow}>
                      <Text style={styles.geoAdminLabel}>Quartier</Text>
                      <Text style={[styles.geoAdminValue, { flex: 1, textAlign: 'right', marginLeft: 8 }]} numberOfLines={1}>
                        {detectedQuartier || address || 'Zone détectée par satellite'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.geoHelpText}>
                  Si vous êtes actuellement sur place, appuyez sur le bouton ci-dessous pour capturer votre position GPS.
                </Text>
              )}

              <Pressable
                style={[styles.geoButton, isLocating && styles.geoButtonDisabled]}
                onPress={handleCaptureGps}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Navigation color="#FFFFFF" size={15} />
                )}
                <Text style={styles.geoButtonText}>
                  {isLocating
                    ? "Acquisition satellite..."
                    : gpsLatitude !== null
                    ? "Actualiser ma position GPS"
                    : "Récupérer ma position GPS actuelle"}
                </Text>
              </Pressable>

              {gpsMessage ? (
                <Text style={styles.geoStatusText}>{gpsMessage}</Text>
              ) : null}
            </View>
          </View>

          {/* 3. CONDITIONS FINANCIÈRES & CARACTÉRISTIQUES */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>3. CARACTÉRISTIQUES & FINANCES</Text>

            <Text style={styles.fieldLabel}>
              {isForSale ? 'Prix de vente souhaité (FCFA) *' : 'Loyer mensuel prévu (FCFA)'}
            </Text>
            <View style={styles.inputWithSuffixContainer}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder={isForSale ? 'Ex: 45000000' : 'Ex: 250000'}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                returnKeyType="next"
                value={rent}
                onChangeText={setRent}
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

            {rent.trim().length > 0 && (
              <View style={styles.valuePreviewCard}>
                <Text style={styles.valuePreviewLabel}>
                  {isForSale ? 'Prix de vente saisi :' : 'Loyer mensuel saisi :'}
                </Text>
                <Text style={styles.valuePreviewText}>
                  {fmtFcfa(rent.replace(/\s/g, ''))}
                </Text>
              </View>
            )}

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Superficie en m²</Text>
            <View style={[styles.chipsWrap, { marginBottom: 8 }]}>
              {['30', '50', '75', '100', '150', '250'].map((s) => {
                const active = surface === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setSurface(s)}
                    style={[styles.chipSmall, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipTextSmall, active && styles.chipTextActive]}>
                      {s} m²
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.inputWithSuffixContainer}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Ex: 85"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                returnKeyType="done"
                value={surface}
                onChangeText={setSurface}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
              />
              <View style={styles.suffixBadge}>
                <Text style={styles.suffixBadgeText}>m²</Text>
              </View>
            </View>

            {surface.trim().length > 0 && (
              <View style={styles.valuePreviewCard}>
                <Text style={styles.valuePreviewLabel}>Superficie saisie :</Text>
                <Text style={styles.valuePreviewText}>
                  {surface.trim()} m²
                </Text>
              </View>
            )}
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
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  inputWithSuffixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  geoBox: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  geoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  geoIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E6EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  geoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  geoBadge: {
    backgroundColor: '#E6EFEA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  geoBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  geoSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  geoSuccessCard: {
    backgroundColor: '#EDF7F1',
    borderWidth: 1,
    borderColor: '#C6E7D4',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  geoAccuracyBadge: {
    backgroundColor: '#C6E7D4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  geoAccuracyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  geoAdminCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1EAE0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  geoAdminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  geoAdminLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  geoAdminValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  geoCoordsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B4D3E',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  geoAccuracyText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
  },
  geoHelpText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  geoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1B4D3E',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  geoButtonDisabled: {
    opacity: 0.6,
  },
  geoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  geoStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
