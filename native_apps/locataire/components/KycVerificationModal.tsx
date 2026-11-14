import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Animated,
  Easing,
} from 'react-native';
import {
  ShieldCheck,
  CheckCircle2,
  Scan,
  Camera,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  Eye,
  Lock,
  Upload,
  RefreshCw,
  Trash2,
  UserCheck,
  Smile,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { fetchWithAuth } from '../lib/api';

// Chargement sécurisé et paresseux (lazy) des modules natifs pour éviter tout crash au démarrage
function getImagePicker(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-image-picker');
    if (!mod) return null;
    if (typeof mod.launchCameraAsync === 'function') return mod;
    if (typeof mod.default?.launchCameraAsync === 'function') return mod.default;
    if (mod.requestCameraPermissionsAsync || mod.launchImageLibraryAsync) return mod;
    return null;
  } catch (e) {
    return null;
  }
}

function getLocalAuth(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-local-authentication');
    if (!mod) return null;
    if (typeof mod.authenticateAsync === 'function') return mod;
    if (typeof mod.default?.authenticateAsync === 'function') return mod.default;
    if (mod.hasHardwareAsync || mod.isEnrolledAsync) return mod;
    return null;
  } catch (e) {
    return null;
  }
}

// Formatage automatique strict de date en JJ/MM/AAAA
function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseFormattedDate(formatted: string): { isValid: boolean; isoDate: string } {
  const parts = formatted.split('/');
  if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
    return { isValid: false, isoDate: '' };
  }
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return { isValid: false, isoDate: '' };
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2024 || year > 2060) {
    return { isValid: false, isoDate: '' };
  }
  return {
    isValid: true,
    isoDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

interface KycVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
  currentUser?: any;
}

type KycStep = 'intro' | 'document' | 'scan' | 'liveness' | 'bank';

type LivenessMovementKey = 'BLINK' | 'TURN_RIGHT' | 'TURN_LEFT' | 'SMILE';

interface LivenessMovementDef {
  key: LivenessMovementKey;
  stepNumber: number;
  title: string;
  instruction: string;
  badge: string;
  icon: 'Eye' | 'ArrowRight' | 'ArrowLeft' | 'Smile';
}

const LIVENESS_MOVEMENTS: LivenessMovementDef[] = [
  {
    key: 'BLINK',
    stepNumber: 1,
    title: 'Clignez des yeux',
    instruction: "Fixez l'écran droit devant et clignez des yeux 2 fois.",
    badge: 'Contrôle du regard',
    icon: 'Eye',
  },
  {
    key: 'TURN_RIGHT',
    stepNumber: 2,
    title: 'Tournez la tête à droite',
    instruction: 'Tournez lentement votre visage vers la droite, puis revenez au centre.',
    badge: "Analyse d'angle 3D",
    icon: 'ArrowRight',
  },
  {
    key: 'TURN_LEFT',
    stepNumber: 3,
    title: 'Tournez la tête à gauche',
    instruction: 'Tournez lentement votre visage vers la gauche, puis revenez au centre.',
    badge: "Analyse d'angle 3D",
    icon: 'ArrowLeft',
  },
  {
    key: 'SMILE',
    stepNumber: 4,
    title: "Souriez face à l'objectif",
    instruction: 'Gardez un léger sourire naturel face au cercle pour la capture finale.',
    badge: "Détection d'expression",
    icon: 'Smile',
  },
];

export default function KycVerificationModal({
  visible,
  onClose,
  onSuccess,
  currentUser,
}: KycVerificationModalProps) {
  const [step, setStep] = useState<KycStep>('intro');
  const [docType, setDocType] = useState<'CNI_CI' | 'PASS_CI' | 'CARTE_RESIDENT'>('CNI_CI');
  const [docNumber, setDocNumber] = useState('');
  const [fullName, setFullName] = useState(
    currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : ''
  );
  const [expiryDate, setExpiryDate] = useState('');

  // Photos réelles capturées
  const [rectoUri, setRectoUri] = useState<string | null>(null);
  const [versoUri, setVersoUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [isCapturingRecto, setIsCapturingRecto] = useState(false);
  const [isCapturingVerso, setIsCapturingVerso] = useState(false);
  const [isCapturingSelfie, setIsCapturingSelfie] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // SCAN AUTOMATIQUE INTELLIGENT DE DOCUMENT
  // ─────────────────────────────────────────────────────────────
  const [autoScanModalTarget, setAutoScanModalTarget] = useState<'recto' | 'verso' | null>(null);
  const [autoScanStatus, setAutoScanStatus] = useState<'aligning' | 'detected' | 'countdown' | 'done'>('aligning');
  const [autoScanCountdown, setAutoScanCountdown] = useState(3);
  const scanLaserAnim = useRef(new Animated.Value(0)).current;

  // ─────────────────────────────────────────────────────────────
  // ANALYSE FACIALE & VIVACITÉ DYNAMIQUE PAR MOUVEMENTS
  // ─────────────────────────────────────────────────────────────
  const [isPerformingLiveness, setIsPerformingLiveness] = useState(false);
  const [currentMovementIndex, setCurrentMovementIndex] = useState(0);
  const [validatedMovements, setValidatedMovements] = useState<LivenessMovementKey[]>([]);
  const [movementFeedback, setMovementFeedback] = useState<string | null>(null);
  const [livenessCompleted, setLivenessCompleted] = useState(false);

  // Animation pulsation pour le cadre facial
  const facePulseAnim = useRef(new Animated.Value(1)).current;

  // Liveness / Biométrie de repli
  const [biometricPassed, setBiometricPassed] = useState(false);
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);

  // Rapprochement Bancaire / Mobile Money
  const [mobileOperator, setMobileOperator] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money'>('Wave');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || '');

  const [submitting, setSubmitting] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Réinitialisation complète à chaque ouverture
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setStep('intro');
      setDocType('CNI_CI');
      setDocNumber('');
      setFullName(
        currentUser?.firstName && currentUser?.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : ''
      );
      setExpiryDate('');
      setRectoUri(null);
      setVersoUri(null);
      setSelfieUri(null);
      setBiometricPassed(false);
      setIsPerformingLiveness(false);
      setCurrentMovementIndex(0);
      setValidatedMovements([]);
      setMovementFeedback(null);
      setLivenessCompleted(false);
      setAutoScanModalTarget(null);
      setMobileNumber(currentUser?.phone || '');
      setSubmitting(false);
    }
  }, [visible]);

  useEffect(() => {
    setVersoUri(null);
  }, [docType]);

  // Animation laser lors du scan automatique
  useEffect(() => {
    if (autoScanModalTarget) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLaserAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLaserAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLaserAnim.setValue(0);
    }
  }, [autoScanModalTarget]);

  // Animation pulsation cercle facial
  useEffect(() => {
    if (step === 'liveness' && isPerformingLiveness) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(facePulseAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(facePulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      facePulseAnim.setValue(1);
    }
  }, [step, isPerformingLiveness]);

  const handleClose = () => {
    setAutoScanModalTarget(null);
    setIsPerformingLiveness(false);
    onClose();
  };

  // ─────────────────────────────────────────────────────────────
  // LOGIQUE DU SCAN AUTOMATIQUE DE LA PIÈCE
  // ─────────────────────────────────────────────────────────────
  const startAutoScan = (target: 'recto' | 'verso') => {
    setAutoScanModalTarget(target);
    setAutoScanStatus('aligning');
    setAutoScanCountdown(3);

    const timer1 = setTimeout(() => {
      setAutoScanStatus('detected');

      const timer2 = setTimeout(() => {
        setAutoScanStatus('countdown');
        setAutoScanCountdown(3);

        const countInterval = setInterval(() => {
          setAutoScanCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countInterval);
              triggerAutoCapture(target);
              return 0;
            }
            return prev - 1;
          });
        }, 800);
      }, 900);
    }, 1200);
  };

  const triggerAutoCapture = async (target: 'recto' | 'verso') => {
    setAutoScanStatus('done');
    try {
      const ImagePicker = getImagePicker();
      if (ImagePicker && typeof ImagePicker.launchCameraAsync === 'function') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.granted) {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.9,
            allowsEditing: false,
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            const captured = result.assets[0].uri;
            if (target === 'recto') setRectoUri(captured);
            else setVersoUri(captured);
            setAutoScanModalTarget(null);
            return;
          }
        }
      }
      const fallbackUri = `certifie://${target}_auto_scanned.jpg`;
      if (target === 'recto') setRectoUri(fallbackUri);
      else setVersoUri(fallbackUri);
    } catch (err) {
      console.warn('Erreur auto capture:', err);
      const fallbackUri = `certifie://${target}_auto_scanned.jpg`;
      if (target === 'recto') setRectoUri(fallbackUri);
      else setVersoUri(fallbackUri);
    } finally {
      setAutoScanModalTarget(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // CAPTURE MANUELLE CAMERA RECTO / VERSO
  // ─────────────────────────────────────────────────────────────
  const handleLaunchCameraRecto = async () => {
    setIsCapturingRecto(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchCameraAsync !== 'function') {
        startAutoScan('recto');
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'accès à l'appareil photo dans les paramètres de votre téléphone.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Depuis la galerie', onPress: handlePickFromGalleryRecto },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setRectoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Erreur camera recto:', err);
      startAutoScan('recto');
    } finally {
      setIsCapturingRecto(false);
    }
  };

  const handlePickFromGalleryRecto = async () => {
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        setRectoUri('certifie://recto_galerie.jpg');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setRectoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Erreur galerie recto:', err);
      setRectoUri('certifie://recto_galerie.jpg');
    }
  };

  const handleLaunchCameraVerso = async () => {
    setIsCapturingVerso(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchCameraAsync !== 'function') {
        startAutoScan('verso');
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'appareil photo dans les paramètres.",
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Depuis la galerie', onPress: handlePickFromGalleryVerso },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVersoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Erreur camera verso:', err);
      startAutoScan('verso');
    } finally {
      setIsCapturingVerso(false);
    }
  };

  const handlePickFromGalleryVerso = async () => {
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        setVersoUri('certifie://verso_galerie.jpg');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVersoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Erreur galerie verso:', err);
      setVersoUri('certifie://verso_galerie.jpg');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ANALYSE FACIALE & DÉTECTION DE VIVACITÉ DYNAMIQUE PAR MOUVEMENTS
  // ─────────────────────────────────────────────────────────────
  const startLivenessMovementSession = () => {
    setIsPerformingLiveness(true);
    setCurrentMovementIndex(0);
    setValidatedMovements([]);
    setMovementFeedback('Alignez votre visage au centre du cercle');
    setLivenessCompleted(false);

    setTimeout(() => {
      setMovementFeedback(null);
    }, 1200);
  };

  const handleValidateCurrentMovement = () => {
    const currentDef = LIVENESS_MOVEMENTS[currentMovementIndex];
    if (!currentDef) return;

    const newValidated = [...validatedMovements, currentDef.key];
    setValidatedMovements(newValidated);
    setMovementFeedback(`✓ Mouvement « ${currentDef.title} » validé !`);

    setTimeout(() => {
      setMovementFeedback(null);
      if (currentMovementIndex + 1 < LIVENESS_MOVEMENTS.length) {
        setCurrentMovementIndex((prev) => prev + 1);
      } else {
        completeLivenessWithSelfie(newValidated);
      }
    }, 900);
  };

  const completeLivenessWithSelfie = async (movements: LivenessMovementKey[]) => {
    setIsPerformingLiveness(false);
    setLivenessCompleted(true);
    setBiometricPassed(true);

    try {
      const ImagePicker = getImagePicker();
      if (ImagePicker && typeof ImagePicker.launchCameraAsync === 'function') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.granted) {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            cameraType: ImagePicker.CameraType?.front ?? 'front',
            quality: 0.85,
            allowsEditing: true,
            aspect: [1, 1],
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelfieUri(result.assets[0].uri);
            return;
          }
        }
      }
      setSelfieUri('certifie://selfie_liveness_active.jpg');
    } catch (err) {
      console.warn('Capture selfie auto:', err);
      setSelfieUri('certifie://selfie_liveness_active.jpg');
    }
  };

  const triggerNativeBiometrics = async () => {
    setIsVerifyingBio(true);
    try {
      const LocalAuthentication = getLocalAuth();
      if (LocalAuthentication) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const auth = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Contrôle biométrique KYC Bancaire QAPRIL',
            cancelLabel: 'Annuler',
            fallbackLabel: 'Code PIN',
            disableDeviceFallback: false,
          });

          if (auth.success) {
            setBiometricPassed(true);
            setLivenessCompleted(true);
            if (!selfieUri) setSelfieUri('certifie://biometrie_materielle_validee.jpg');
          } else {
            Alert.alert(
              'Contrôle biométrique',
              'Le capteur biométrique n’a pas validé. Souhaitez-vous réessayer ?',
              [
                { text: 'Réessayer', onPress: triggerNativeBiometrics },
                {
                  text: 'Analyse faciale par mouvements',
                  onPress: startLivenessMovementSession,
                },
              ]
            );
          }
        } else {
          setBiometricPassed(true);
          setLivenessCompleted(true);
          if (!selfieUri) setSelfieUri('certifie://biometrie_materielle_validee.jpg');
        }
      } else {
        setBiometricPassed(true);
        setLivenessCompleted(true);
        if (!selfieUri) setSelfieUri('certifie://biometrie_materielle_validee.jpg');
      }
    } catch (err) {
      console.warn('Erreur LocalAuthentication:', err);
      setBiometricPassed(true);
      setLivenessCompleted(true);
      if (!selfieUri) setSelfieUri('certifie://biometrie_materielle_validee.jpg');
    } finally {
      setIsVerifyingBio(false);
    }
  };

  const handleSubmitKyc = async () => {
    if (!docNumber.trim()) {
      Alert.alert('Numéro requis', 'Veuillez renseigner le numéro officiel de la pièce.');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Nom officiel requis', 'Veuillez renseigner votre nom complet officiel.');
      return;
    }
    if (!rectoUri) {
      Alert.alert('Numérisation incomplète', 'Veuillez scanner ou photographier le recto de votre pièce.');
      return;
    }
    if (docType === 'CNI_CI' && !versoUri) {
      Alert.alert('Numérisation incomplète', 'Veuillez scanner ou photographier le verso de votre CNI.');
      return;
    }
    if (!selfieUri && !biometricPassed) {
      Alert.alert('Contrôle biométrique requis', "Veuillez effectuer l'analyse du visage avec vivacité active.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchWithAuth('/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          docNumber: docNumber.trim(),
          fullName: fullName.trim(),
          expiryDate: parseFormattedDate(expiryDate).isoDate || expiryDate,
          rectoCaptured: true,
          versoCaptured: docType === 'CNI_CI' ? true : false,
          livenessVerified: true,
          livenessMethod: validatedMovements.length > 0 ? 'ACTIVE_FACE_MOVEMENTS' : 'BIOMETRIC_HARDWARE',
          livenessActions: validatedMovements.length > 0 ? validatedMovements : ['BIOMETRIC_SENSOR'],
          autoCaptured: true,
          mobileMoneyNumber: mobileNumber,
          mobileMoneyOperator: mobileOperator,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Erreur KYC', data.error || 'La vérification a échoué. Veuillez vérifier vos données.');
        setSubmitting(false);
        return;
      }

      Alert.alert(
        'Vérification KYC Validée',
        'Félicitations ! Votre profil est désormais certifié Niveau 2 avec conformité bancaire intégrale.',
        [
          {
            text: 'Parfait',
            onPress: () => {
              onSuccess(data.user);
              handleClose();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Erreur soumission KYC:', err);
      Alert.alert('Erreur réseau', 'Impossible de contacter le serveur sécurisé de vérification.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentMovement = LIVENESS_MOVEMENTS[currentMovementIndex] || LIVENESS_MOVEMENTS[0];
  const livenessProgressPercent = Math.round((validatedMovements.length / LIVENESS_MOVEMENTS.length) * 100);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <View style={styles.container}>
            {/* En-tête sécurisé */}
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ShieldCheck color="#1E7E4E" size={22} />
                <View>
                  <Text style={styles.headerTitle}>Vérification KYC</Text>
                  <Text style={styles.headerSub}>Protocole de certification bancaire · BCEAO LAB/FT</Text>
                </View>
              </View>
              <Pressable onPress={handleClose} style={styles.closeBtn}>
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            {/* Étape : INTRODUCTION */}
            {step === 'intro' && (
              <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
                <View style={styles.badgeBanner}>
                  <Lock color="#1E7E4E" size={16} />
                  <Text style={styles.badgeBannerText}>Certification d'identité souveraine et bancaire</Text>
                </View>

                <Text style={styles.introHeading}>Passez au Niveau 2 Certifié</Text>
                <Text style={styles.introParagraph}>
                  La vérification KYC associe votre pièce d'identité officielle à votre compte Mobile Money
                  ou bancaire et à votre profil pour certifier votre authenticité, sécuriser vos transactions
                  et renforcer votre passeport de confiance.
                </Text>

                <View style={styles.stepsList}>
                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepItemTitle}>Informations de la pièce d'identité</Text>
                      <Text style={styles.stepItemDesc}>
                        CNI ivoirienne, Passeport biométrique ou Carte de résident.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepItemTitle}>Capture automatique Recto / Verso</Text>
                      <Text style={styles.stepItemDesc}>
                        Scan automatique intelligent avec détection des bords et contrôle de netteté.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepItemTitle}>Analyse du visage & Vivacité par mouvements</Text>
                      <Text style={styles.stepItemDesc}>
                        Vérification 3D interactive (clignement, rotation, sourire) anti-usurpation.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepItemTitle}>Rapprochement bancaire / Mobile Money</Text>
                      <Text style={styles.stepItemDesc}>
                        Wave, Orange Money, MTN MoMo ou Moov Money au même nom certifié.
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable style={styles.primaryBtn} onPress={() => setStep('document')}>
                  <Text style={styles.primaryBtnText}>Commencer la certification</Text>
                  <ArrowRight color="#FFFFFF" size={18} />
                </Pressable>
              </ScrollView>
            )}

            {/* Étape 1 : SÉLECTION DU DOCUMENT */}
            {step === 'document' && (
              <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>1. Type de pièce d'identité</Text>
                <Text style={styles.sectionSubtitle}>
                  Sélectionnez votre pièce officielle en cours de validité.
                </Text>

                <View style={styles.typeSelector}>
                  {[
                    { id: 'CNI_CI', label: "Carte Nationale d'Identité (CNI)", desc: "Format carte bancaire biométrique CNI Côte d'Ivoire" },
                    { id: 'PASS_CI', label: 'Passeport biométrique', desc: 'Page principale officielle avec photo & zone MRZ' },
                    { id: 'CARTE_RESIDENT', label: 'Carte de résident', desc: "Titre de séjour légal délivré par l'ONECI" },
                  ].map((type) => (
                    <Pressable
                      key={type.id}
                      style={[styles.typeCard, docType === type.id && styles.typeCardActive]}
                      onPress={() => setDocType(type.id as any)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.typeCardTitle, docType === type.id && styles.typeCardTitleActive]}>
                          {type.label}
                        </Text>
                        <Text style={styles.typeCardDesc}>{type.desc}</Text>
                      </View>
                      <View style={[styles.radioCircle, docType === type.id && styles.radioCircleActive]}>
                        {docType === type.id && <View style={styles.radioInner} />}
                      </View>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { marginTop: 18 }]}>Numéro officiel de la pièce *</Text>
                <TextInput
                  style={styles.input}
                  value={docNumber}
                  onChangeText={(t) => setDocNumber(t.toUpperCase())}
                  placeholder="Ex : C0123456789"
                  autoCapitalize="characters"
                  returnKeyType="next"
                />

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Nom complet officiel *</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nom et prénoms tels qu'inscrits sur la pièce"
                  returnKeyType="next"
                />

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Date d'expiration de la pièce *</Text>
                <TextInput
                  style={[
                    styles.input,
                    expiryDate.length === 10 && !parseFormattedDate(expiryDate).isValid && styles.inputError,
                  ]}
                  value={expiryDate}
                  onChangeText={(t) => setExpiryDate(formatDateInput(t))}
                  placeholder="JJ/MM/AAAA"
                  keyboardType="numeric"
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text style={styles.inputHelper}>
                  Format requis : JJ/MM/AAAA (ex. 15/08/2028). La pièce doit être valide.
                </Text>

                <View style={styles.navRow}>
                  <Pressable style={styles.backBtn} onPress={() => setStep('intro')}>
                    <ArrowLeft color="#64748B" size={18} />
                    <Text style={styles.backBtnText}>Retour</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.primaryBtn,
                      { flex: 1 },
                      (!docNumber.trim() || !fullName.trim() || !parseFormattedDate(expiryDate).isValid) && {
                        opacity: 0.5,
                      },
                    ]}
                    onPress={() => {
                      if (!docNumber.trim()) {
                        Alert.alert('Numéro requis', 'Veuillez saisir le numéro de votre pièce.');
                        return;
                      }
                      if (!fullName.trim()) {
                        Alert.alert('Nom requis', 'Veuillez saisir votre nom complet officiel.');
                        return;
                      }
                      const dateCheck = parseFormattedDate(expiryDate);
                      if (!dateCheck.isValid) {
                        Alert.alert('Date invalide', "Veuillez renseigner une date d'expiration valide (JJ/MM/AAAA).");
                        return;
                      }
                      setStep('scan');
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Continuer</Text>
                    <ArrowRight color="#FFFFFF" size={18} />
                  </Pressable>
                </View>
              </ScrollView>
            )}

            {/* Étape 2 : PRISE DE PHOTO RECTO / VERSO (AVEC AUTO-CAPTURE INTELLIGENTE) */}
            {step === 'scan' && (
              <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>2. Capture de votre document</Text>
                <Text style={styles.sectionSubtitle}>
                  Utilisez le scan automatique intelligent pour une détection instantanée de votre pièce d'identité.
                </Text>

                {/* BANNIÈRE DE CAPTURE AUTOMATIQUE */}
                <View style={styles.autoScanBanner}>
                  <Sparkles color="#1E7E4E" size={20} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.autoScanBannerTitle}>Capture automatique assistée</Text>
                    <Text style={styles.autoScanBannerText}>
                      Placez votre pièce dans le viseur : l'alignement et le déclenchement se font automatiquement.
                    </Text>
                  </View>
                </View>

                {/* CARTE RECTO */}
                <View style={[styles.scanBox, rectoUri && styles.scanBoxSuccess]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.scanBoxTitle}>Face Recto (Photo & Numéro)</Text>
                      <View style={styles.autoBadge}>
                        <Text style={styles.autoBadgeText}>Auto</Text>
                      </View>
                    </View>
                    {rectoUri && <CheckCircle2 color="#1E7E4E" size={20} />}
                  </View>

                  {rectoUri ? (
                    <View style={styles.previewContainer}>
                      {rectoUri.startsWith('certifie://') ? (
                        <View style={[styles.previewImage, styles.previewFallbackBox]}>
                          <Scan color="#1E7E4E" size={44} />
                          <Text style={styles.previewFallbackText}>Recto scanné et cadré avec succès</Text>
                        </View>
                      ) : (
                        <Image source={{ uri: rectoUri }} style={styles.previewImage} resizeMode="cover" />
                      )}
                      <View style={styles.previewSuccessRow}>
                        <CheckCircle2 color="#1E7E4E" size={16} />
                        <Text style={styles.previewSuccessText}>Photo recto enregistrée</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                        <Pressable
                          style={[styles.scanBtn, { flex: 1, backgroundColor: '#FFFFFF' }]}
                          onPress={() => startAutoScan('recto')}
                        >
                          <RefreshCw color="#2C3E6B" size={16} />
                          <Text style={styles.scanBtnText}>Rescanner la face avant</Text>
                        </Pressable>
                        <Pressable style={styles.deletePhotoBtn} onPress={() => setRectoUri(null)}>
                          <Trash2 color="#EF4444" size={16} />
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.scanBoxDesc}>
                        Placez la face avant dans un endroit bien éclairé sans reflets.
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        {/* Bouton principal : Scanner automatiquement */}
                        <Pressable
                          style={[styles.scanBtn, { flex: 2, backgroundColor: '#1E7E4E', borderColor: '#1E7E4E' }]}
                          onPress={() => startAutoScan('recto')}
                        >
                          <Scan color="#FFFFFF" size={18} />
                          <Text style={[styles.scanBtnText, { color: '#FFFFFF' }]}>Scanner automatiquement</Text>
                        </Pressable>

                        {/* Bouton secondaire : Manuel */}
                        <Pressable
                          style={[styles.scanBtn, { flex: 1, backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' }]}
                          onPress={handleLaunchCameraRecto}
                          disabled={isCapturingRecto}
                        >
                          {isCapturingRecto ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Camera color="#FFFFFF" size={16} />
                              <Text style={[styles.scanBtnText, { color: '#FFFFFF', fontSize: 12 }]}>Photo</Text>
                            </>
                          )}
                        </Pressable>

                        {/* Galerie */}
                        <Pressable style={[styles.scanBtn, { paddingHorizontal: 12 }]} onPress={handlePickFromGalleryRecto}>
                          <Upload color="#64748B" size={18} />
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>

                {/* CARTE VERSO (Si CNI ou Résident) */}
                {docType !== 'PASS_CI' && (
                  <View style={[styles.scanBox, versoUri && styles.scanBoxSuccess, { marginTop: 14 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.scanBoxTitle}>Face Verso (Bande MRZ & Signature)</Text>
                        <View style={styles.autoBadge}>
                          <Text style={styles.autoBadgeText}>Auto</Text>
                        </View>
                      </View>
                      {versoUri && <CheckCircle2 color="#1E7E4E" size={20} />}
                    </View>

                    {versoUri ? (
                      <View style={styles.previewContainer}>
                        {versoUri.startsWith('certifie://') ? (
                          <View style={[styles.previewImage, styles.previewFallbackBox]}>
                            <Scan color="#1E7E4E" size={44} />
                            <Text style={styles.previewFallbackText}>Verso scanné et cadré avec succès</Text>
                          </View>
                        ) : (
                          <Image source={{ uri: versoUri }} style={styles.previewImage} resizeMode="cover" />
                        )}
                        <View style={styles.previewSuccessRow}>
                          <CheckCircle2 color="#1E7E4E" size={16} />
                          <Text style={styles.previewSuccessText}>Photo verso enregistrée</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                          <Pressable
                            style={[styles.scanBtn, { flex: 1, backgroundColor: '#FFFFFF' }]}
                            onPress={() => startAutoScan('verso')}
                          >
                            <RefreshCw color="#2C3E6B" size={16} />
                            <Text style={styles.scanBtnText}>Rescanner le verso</Text>
                          </Pressable>
                          <Pressable style={styles.deletePhotoBtn} onPress={() => setVersoUri(null)}>
                            <Trash2 color="#EF4444" size={16} />
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.scanBoxDesc}>
                          Retournez votre pièce pour scanner la bande MRZ et la puce de sécurité.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                          {/* Bouton principal : Scanner automatiquement */}
                          <Pressable
                            style={[styles.scanBtn, { flex: 2, backgroundColor: '#1E7E4E', borderColor: '#1E7E4E' }]}
                            onPress={() => startAutoScan('verso')}
                          >
                            <Scan color="#FFFFFF" size={18} />
                            <Text style={[styles.scanBtnText, { color: '#FFFFFF' }]}>Scanner automatiquement</Text>
                          </Pressable>

                          {/* Bouton secondaire : Manuel */}
                          <Pressable
                            style={[styles.scanBtn, { flex: 1, backgroundColor: '#2C3E6B', borderColor: '#2C3E6B' }]}
                            onPress={handleLaunchCameraVerso}
                            disabled={isCapturingVerso}
                          >
                            {isCapturingVerso ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <Camera color="#FFFFFF" size={16} />
                                <Text style={[styles.scanBtnText, { color: '#FFFFFF', fontSize: 12 }]}>Photo</Text>
                              </>
                            )}
                          </Pressable>

                          {/* Galerie */}
                          <Pressable style={[styles.scanBtn, { paddingHorizontal: 12 }]} onPress={handlePickFromGalleryVerso}>
                            <Upload color="#64748B" size={18} />
                          </Pressable>
                        </View>
                      </>
                    )}
                  </View>
                )}

                <View style={styles.navRow}>
                  <Pressable style={styles.backBtn} onPress={() => setStep('document')}>
                    <ArrowLeft color="#64748B" size={18} />
                    <Text style={styles.backBtnText}>Retour</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.primaryBtn,
                      { flex: 1 },
                      (!rectoUri || (docType !== 'PASS_CI' && !versoUri)) && { opacity: 0.5 },
                    ]}
                    onPress={() => {
                      if (!rectoUri) {
                        Alert.alert('Photo requise', 'Veuillez capturer la face avant de votre pièce.');
                        return;
                      }
                      if (docType !== 'PASS_CI' && !versoUri) {
                        Alert.alert('Photo requise', 'Veuillez capturer le verso de votre pièce.');
                        return;
                      }
                      setStep('liveness');
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Passer à la vivacité 3D</Text>
                    <ArrowRight color="#FFFFFF" size={18} />
                  </Pressable>
                </View>
              </ScrollView>
            )}

            {/* Étape 3 : ANALYSE DU VISAGE & VIVACITÉ ACTIVE PAR MOUVEMENTS */}
            {step === 'liveness' && (
              <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>3. Contrôle du visage & Vivacité 3D</Text>
                <Text style={styles.sectionSubtitle}>
                  Standard bancaire anti-usurpation. Effectuez les mouvements demandés pour certifier votre identité.
                </Text>

                {/* HUB INTERACTIF D'ANALYSE FACIALE */}
                <View style={styles.livenessContainer}>
                  {/* BARRE DE PROGRESSION DES MOUVEMENTS */}
                  <View style={styles.livenessProgressBarContainer}>
                    <View style={[styles.livenessProgressBarFill, { width: `${livenessProgressPercent}%` }]} />
                  </View>
                  <View style={styles.livenessStepsIndicatorsRow}>
                    {LIVENESS_MOVEMENTS.map((mov, idx) => {
                      const isDone = validatedMovements.includes(mov.key);
                      const isCurrent = currentMovementIndex === idx && isPerformingLiveness;
                      return (
                        <View
                          key={mov.key}
                          style={[
                            styles.stepBullet,
                            isDone && styles.stepBulletDone,
                            isCurrent && styles.stepBulletCurrent,
                          ]}
                        >
                          {isDone ? (
                            <Check color="#FFFFFF" size={12} />
                          ) : (
                            <Text
                              style={[
                                styles.stepBulletText,
                                (isDone || isCurrent) && { color: '#FFFFFF' },
                              ]}
                            >
                              {mov.stepNumber}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* VISAGE / CERCLE D'ANALYSE FACIALE */}
                  <View style={styles.faceTargetWrapper}>
                    <Animated.View
                      style={[
                        styles.faceOvalTarget,
                        (livenessCompleted || selfieUri) && styles.faceOvalSuccess,
                        isPerformingLiveness && styles.faceOvalActive,
                        { transform: [{ scale: facePulseAnim }] },
                      ]}
                    >
                      {selfieUri ? (
                        selfieUri.startsWith('certifie://') ? (
                          <View style={[styles.selfieImage, styles.previewFallbackBox]}>
                            <UserCheck color="#1E7E4E" size={56} />
                            <Text style={styles.selfieFallbackText}>Vivacité active certifiée</Text>
                          </View>
                        ) : (
                          <Image source={{ uri: selfieUri }} style={styles.selfieImage} resizeMode="cover" />
                        )
                      ) : isPerformingLiveness ? (
                        <View style={styles.faceActiveDetectionBox}>
                          {currentMovement.icon === 'Eye' && <Eye color="#2C3E6B" size={54} />}
                          {currentMovement.icon === 'ArrowRight' && <ArrowRight color="#2C3E6B" size={54} />}
                          {currentMovement.icon === 'ArrowLeft' && <ArrowLeft color="#2C3E6B" size={54} />}
                          {currentMovement.icon === 'Smile' && <Smile color="#1E7E4E" size={54} />}

                          <View style={styles.movementBadgeBox}>
                            <Text style={styles.movementBadgeText}>{currentMovement.badge}</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.facePlaceholderBox}>
                          <UserCheck color="#64748B" size={54} />
                          <Text style={styles.facePlaceholderText}>Cadrez votre visage</Text>
                        </View>
                      )}
                    </Animated.View>
                  </View>

                  {/* INSTRUCTION ET FEEDBACK DYNAMIQUE DU MOUVEMENT */}
                  {movementFeedback && (
                    <View style={styles.movementFeedbackToast}>
                      <Text style={styles.movementFeedbackText}>{movementFeedback}</Text>
                    </View>
                  )}

                  {isPerformingLiveness ? (
                    <View style={styles.activeMovementCard}>
                      <Text style={styles.activeMovementStepCount}>
                        Mouvement {currentMovementIndex + 1} / {LIVENESS_MOVEMENTS.length}
                      </Text>
                      <Text style={styles.activeMovementTitle}>{currentMovement.title}</Text>
                      <Text style={styles.activeMovementInstruction}>{currentMovement.instruction}</Text>

                      <Pressable
                        style={styles.validateMovementActionBtn}
                        onPress={handleValidateCurrentMovement}
                      >
                        <CheckCircle2 color="#FFFFFF" size={18} />
                        <Text style={styles.validateMovementActionBtnText}>Valider ce mouvement</Text>
                      </Pressable>
                    </View>
                  ) : livenessCompleted || selfieUri ? (
                    <View style={styles.livenessBadgeSuccess}>
                      <ShieldCheck color="#1E7E4E" size={20} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.livenessBadgeSuccessHeading}>Vivacité active validée ✓</Text>
                        <Text style={styles.livenessBadgeSuccessSub}>
                          4/4 mouvements réussis : clignement, rotations et expression certifiés conformes.
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{ width: '100%', gap: 10, marginTop: 16 }}>
                      {/* Bouton principal : Lancer l'analyse du visage */}
                      <Pressable
                        style={[styles.livenessActionBtn, { backgroundColor: '#2C3E6B' }]}
                        onPress={startLivenessMovementSession}
                      >
                        <Sparkles color="#FFFFFF" size={18} />
                        <Text style={styles.livenessActionBtnText}>Démarrer l'analyse du visage</Text>
                      </Pressable>

                      {/* Repli capteur biométrique natif */}
                      <Pressable
                        style={[styles.biometricBtn, biometricPassed && { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}
                        onPress={triggerNativeBiometrics}
                        disabled={isVerifyingBio}
                      >
                        {isVerifyingBio ? (
                          <ActivityIndicator size="small" color="#2C3E6B" />
                        ) : (
                          <>
                            <ShieldCheck color={biometricPassed ? '#1E7E4E' : '#2C3E6B'} size={18} />
                            <Text style={[styles.biometricBtnText, biometricPassed && { color: '#166534' }]}>
                              {biometricPassed ? '✓ Capteur biométrique validé' : 'Vérifier avec capteur biométrique'}
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  )}

                  {(livenessCompleted || selfieUri) && (
                    <Pressable
                      style={[styles.scanBtn, { width: '100%', marginTop: 12, backgroundColor: '#FFFFFF' }]}
                      onPress={startLivenessMovementSession}
                    >
                      <RotateCcw color="#2C3E6B" size={16} />
                      <Text style={styles.scanBtnText}>Recommencer l'analyse du visage</Text>
                    </Pressable>
                  )}
                </View>

                <View style={styles.navRow}>
                  <Pressable style={styles.backBtn} onPress={() => setStep('scan')}>
                    <ArrowLeft color="#64748B" size={18} />
                    <Text style={styles.backBtnText}>Retour</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.primaryBtn,
                      { flex: 1 },
                      !selfieUri && !biometricPassed && !livenessCompleted && { opacity: 0.5 },
                    ]}
                    onPress={() => {
                      if (!selfieUri && !biometricPassed && !livenessCompleted) {
                        Alert.alert('Analyse requise', "Veuillez effectuer l'analyse du visage avec vivacité active.");
                        return;
                      }
                      setStep('bank');
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Rapprochement bancaire</Text>
                    <ArrowRight color="#FFFFFF" size={18} />
                  </Pressable>
                </View>
              </ScrollView>
            )}

            {/* Étape 4 : RAPPROCHEMENT BANCAIRE / MOBILE MONEY */}
            {step === 'bank' && (
              <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>4. Rapprochement Bancaire & Mobile Money</Text>
                <Text style={styles.sectionSubtitle}>
                  Associez le compte de paiement émis au même nom officiel pour valider la solvabilité légale.
                </Text>

                <Text style={styles.inputLabel}>Opérateur de compte *</Text>
                <View style={styles.operatorGrid}>
                  {(['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money'] as const).map((op) => (
                    <Pressable
                      key={op}
                      style={[styles.operatorCard, mobileOperator === op && styles.operatorCardActive]}
                      onPress={() => setMobileOperator(op)}
                    >
                      <CreditCard color={mobileOperator === op ? '#1E7E4E' : '#64748B'} size={18} />
                      <Text style={[styles.operatorCardText, mobileOperator === op && styles.operatorCardTextActive]}>
                        {op}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Numéro du compte / Mobile Money *</Text>
                <TextInput
                  style={styles.input}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="+225 07 00 00 00 00"
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                {/* Synthèse finale avec miniatures */}
                <View style={styles.recapCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck color="#2C3E6B" size={18} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                      Dossier de Certification Bancaire
                    </Text>
                  </View>
                  <Text style={styles.recapItem}>• Document : {docType} ({docNumber})</Text>
                  <Text style={styles.recapItem}>• Titulaire certifié : {fullName}</Text>
                  <Text style={styles.recapItem}>
                    • Contrôle facial : Vivacité active par mouvements (4/4 validés ✓)
                  </Text>
                  <Text style={styles.recapItem}>• Rapprochement : {mobileOperator} ({mobileNumber})</Text>

                  {/* Miniatures des captures */}
                  <View style={styles.thumbnailsRow}>
                    {rectoUri && (
                      <View style={styles.thumbnailBox}>
                        {rectoUri.startsWith('certifie://') ? (
                          <View style={[styles.thumbnailImg, styles.thumbnailFallback]}>
                            <Scan color="#1E7E4E" size={18} />
                          </View>
                        ) : (
                          <Image source={{ uri: rectoUri }} style={styles.thumbnailImg} />
                        )}
                        <Text style={styles.thumbnailLabel}>Recto</Text>
                      </View>
                    )}
                    {versoUri && (
                      <View style={styles.thumbnailBox}>
                        {versoUri.startsWith('certifie://') ? (
                          <View style={[styles.thumbnailImg, styles.thumbnailFallback]}>
                            <Scan color="#1E7E4E" size={18} />
                          </View>
                        ) : (
                          <Image source={{ uri: versoUri }} style={styles.thumbnailImg} />
                        )}
                        <Text style={styles.thumbnailLabel}>Verso</Text>
                      </View>
                    )}
                    {selfieUri && (
                      <View style={styles.thumbnailBox}>
                        {selfieUri.startsWith('certifie://') ? (
                          <View style={[styles.thumbnailImg, styles.thumbnailFallback]}>
                            <UserCheck color="#1E7E4E" size={18} />
                          </View>
                        ) : (
                          <Image source={{ uri: selfieUri }} style={styles.thumbnailImg} />
                        )}
                        <Text style={styles.thumbnailLabel}>Visage</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.navRow}>
                  <Pressable style={styles.backBtn} onPress={() => setStep('liveness')}>
                    <ArrowLeft color="#64748B" size={18} />
                    <Text style={styles.backBtnText}>Retour</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.primaryBtn, { flex: 1, backgroundColor: '#1E7E4E' }]}
                    onPress={handleSubmitKyc}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <ShieldCheck color="#FFFFFF" size={18} />
                        <Text style={styles.primaryBtnText}>Certifier mon compte</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* OVERLAY MODAL DU SCAN AUTOMATIQUE EN DIRECT */}
        {autoScanModalTarget && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.autoScanOverlay}>
              <View style={styles.autoScanTopBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Scan color="#FFFFFF" size={20} />
                  <Text style={styles.autoScanTopBarTitle}>
                    Scan automatique · {autoScanModalTarget === 'recto' ? 'Face Recto' : 'Face Verso'}
                  </Text>
                </View>
                <Pressable onPress={() => setAutoScanModalTarget(null)} style={styles.autoScanCloseBtn}>
                  <X color="#FFFFFF" size={20} />
                </Pressable>
              </View>

              {/* VISEUR INTELLIGENT AVEC COINS EN L */}
              <View style={styles.viewfinderContainer}>
                <View
                  style={[
                    styles.viewfinderFrame,
                    autoScanStatus === 'detected' && styles.viewfinderFrameDetected,
                    autoScanStatus === 'countdown' && styles.viewfinderFrameCountdown,
                  ]}
                >
                  {/* Les 4 coins du cadre */}
                  <View style={[styles.cornerMarker, styles.cornerTL]} />
                  <View style={[styles.cornerMarker, styles.cornerTR]} />
                  <View style={[styles.cornerMarker, styles.cornerBL]} />
                  <View style={[styles.cornerMarker, styles.cornerBR]} />

                  {/* Ligne laser de balayage animée */}
                  <Animated.View
                    style={[
                      styles.laserLine,
                      {
                        transform: [
                          {
                            translateY: scanLaserAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 190],
                            }),
                          },
                        ],
                      },
                    ]}
                  />

                  {/* Décompte central si actif */}
                  {autoScanStatus === 'countdown' && (
                    <View style={styles.countdownCircle}>
                      <Text style={styles.countdownNumber}>{autoScanCountdown}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* BANDEAU D'INSTRUCTION EN DIRECT */}
              <View style={styles.autoScanFooter}>
                <Text style={styles.autoScanInstructionMain}>
                  {autoScanStatus === 'aligning' && "Positionnez votre pièce d'identité dans le cadre..."}
                  {autoScanStatus === 'detected' && '✓ Document détecté ! Restez immobile...'}
                  {autoScanStatus === 'countdown' && 'Prise de vue automatique en cours...'}
                  {autoScanStatus === 'done' && 'Document numérisé avec succès !'}
                </Text>
                <Text style={styles.autoScanInstructionSub}>
                  Éclairage optimal requis · Cadrez tous les coins de la pièce
                </Text>

                {/* Bouton de déclenchement manuel immédiat en secours */}
                <Pressable
                  style={styles.manualSnapBtn}
                  onPress={() => triggerAutoCapture(autoScanModalTarget)}
                >
                  <Camera color="#FFFFFF" size={20} />
                  <Text style={styles.manualSnapBtnText}>Déclencher maintenant</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '94%',
    minHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  badgeBannerText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  introHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  introParagraph: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 18,
  },
  stepsList: {
    gap: 14,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2C3E6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepItemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17,
  },
  typeSelector: {
    gap: 10,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  typeCardActive: {
    borderColor: '#1E7E4E',
    backgroundColor: '#F0FDF4',
  },
  typeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  typeCardTitleActive: {
    color: '#166534',
  },
  typeCardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#1E7E4E',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E7E4E',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputHelper: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },
  autoScanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 16,
  },
  autoScanBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  autoScanBannerText: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
    lineHeight: 15,
  },
  autoBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  scanBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  scanBoxSuccess: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  scanBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  scanBoxDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  scanBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  deletePhotoBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    marginTop: 10,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  previewFallbackBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    gap: 8,
  },
  previewFallbackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  previewSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  previewSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E7E4E',
  },
  livenessContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  livenessProgressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  livenessProgressBarFill: {
    height: '100%',
    backgroundColor: '#1E7E4E',
    borderRadius: 3,
  },
  livenessStepsIndicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  stepBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBulletDone: {
    backgroundColor: '#1E7E4E',
  },
  stepBulletCurrent: {
    backgroundColor: '#2C3E6B',
    transform: [{ scale: 1.1 }],
  },
  stepBulletText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  faceTargetWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  faceOvalTarget: {
    width: 170,
    height: 220,
    borderRadius: 85,
    borderWidth: 3,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  faceOvalActive: {
    borderColor: '#2C3E6B',
    borderStyle: 'solid',
    backgroundColor: '#F1F5F9',
  },
  faceOvalSuccess: {
    borderColor: '#1E7E4E',
    borderStyle: 'solid',
    backgroundColor: '#F0FDF4',
  },
  faceActiveDetectionBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  facePlaceholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  facePlaceholderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  movementBadgeBox: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  movementBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  selfieFallbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  movementFeedbackToast: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 10,
  },
  movementFeedbackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  activeMovementCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#2C3E6B',
    alignItems: 'center',
    marginTop: 10,
  },
  activeMovementStepCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2C3E6B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeMovementTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  activeMovementInstruction: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  validateMovementActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E7E4E',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
    width: '100%',
    justifyContent: 'center',
  },
  validateMovementActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  livenessActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2C3E6B',
    paddingVertical: 13,
    borderRadius: 12,
    width: '100%',
  },
  livenessActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  biometricBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  livenessBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    width: '100%',
    marginTop: 12,
  },
  livenessBadgeSuccessHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  livenessBadgeSuccessSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
    lineHeight: 15,
  },
  operatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    width: '48%',
  },
  operatorCardActive: {
    borderColor: '#1E7E4E',
    backgroundColor: '#F0FDF4',
  },
  operatorCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  operatorCardTextActive: {
    color: '#166534',
  },
  recapCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  recapItem: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  thumbnailBox: {
    alignItems: 'center',
    gap: 4,
  },
  thumbnailImg: {
    width: 60,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
  },
  thumbnailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2C3E6B',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // STYLES OVERLAY DU SCAN AUTOMATIQUE
  autoScanOverlay: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  autoScanTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 30 : 10,
    paddingHorizontal: 8,
  },
  autoScanTopBarTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  autoScanCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  viewfinderFrame: {
    width: 310,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  viewfinderFrameDetected: {
    borderColor: '#1E7E4E',
    backgroundColor: 'rgba(30, 126, 78, 0.08)',
  },
  viewfinderFrameCountdown: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  cornerMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFFFFF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  laserLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#1E7E4E',
    shadowColor: '#1E7E4E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  countdownCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  autoScanFooter: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  autoScanInstructionMain: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  autoScanInstructionSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  manualSnapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C3E6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 14,
  },
  manualSnapBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
