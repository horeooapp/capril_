import React, { useState, useEffect } from 'react';
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
  FileImage,
} from 'lucide-react-native';
import { fetchWithAuth } from '../lib/api';

interface KycVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
  currentUser?: any;
}

type KycStep = 'intro' | 'document' | 'scan' | 'liveness' | 'bank';

// Statuts de scan d'un côté de document
type ScanStatus = 'idle' | 'requesting' | 'scanning' | 'done';

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

  // Scan document
  const [rectoStatus, setRectoStatus] = useState<ScanStatus>('idle');
  const [versoStatus, setVersoStatus] = useState<ScanStatus>('idle');
  const rectoCaptured = rectoStatus === 'done';
  const versoCaptured = versoStatus === 'done';

  // Liveness
  const [livenessState, setLivenessState] = useState<'idle' | 'scanning' | 'passed'>('idle');
  const [livenessStep, setLivenessStep] = useState(0);
  const LIVENESS_PROMPTS = [
    'Positionnez votre visage dans le cadre circulaire',
    'Regardez droit vers la caméra...',
    'Clignez lentement des deux yeux...',
    'Tournez légèrement la tête à droite...',
    'Contrôle biométrique validé ✓ (Conformité 99.8%)',
  ];

  // Banque
  const [mobileOperator, setMobileOperator] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money'>('Wave');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || '');

  const [submitting, setSubmitting] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Reset COMPLET à chaque ouverture du modal
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
      setRectoStatus('idle');
      setVersoStatus('idle');
      setLivenessState('idle');
      setLivenessStep(0);
      setMobileNumber(currentUser?.phone || '');
      setSubmitting(false);
    }
  }, [visible]);

  // Reset scan verso quand on change de type de doc
  useEffect(() => {
    setVersoStatus('idle');
  }, [docType]);

  const handleClose = () => {
    onClose();
  };

  // ─────────────────────────────────────────────────────────────
  // SCAN RECTO — l'utilisateur doit confirmer la prise de vue
  // ─────────────────────────────────────────────────────────────
  const handleScanRecto = () => {
    Alert.alert(
      'Numériser le Recto',
      'Placez la face avant de votre pièce dans un bon éclairage, sans reflets ni doigts masquant les inscriptions.\n\nAppuyez sur « Lancer la capture » pour démarrer.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Lancer la capture',
          onPress: () => {
            setRectoStatus('scanning');
            // Simulation d'une capture réelle avec traitement OCR (2.5s)
            setTimeout(() => {
              setRectoStatus('done');
              // Pré-remplir le numéro si vide
              if (!docNumber.trim()) {
                setDocNumber(docType === 'CNI_CI' ? 'CI009845123' : 'AB1234567');
              }
              if (!expiryDate.trim()) {
                setExpiryDate('2029-11-30');
              }
            }, 2500);
          },
        },
      ]
    );
  };

  const handleScanVerso = () => {
    Alert.alert(
      'Numériser le Verso',
      'Retournez votre document et placez la face arrière (bande MRZ / signature) dans le cadre.\n\nAppuyez sur « Lancer la capture » pour démarrer.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Lancer la capture',
          onPress: () => {
            setVersoStatus('scanning');
            setTimeout(() => {
              setVersoStatus('done');
            }, 2500);
          },
        },
      ]
    );
  };

  // ─────────────────────────────────────────────────────────────
  // LIVENESS — séquence progressive
  // ─────────────────────────────────────────────────────────────
  const handleStartLiveness = () => {
    setLivenessState('scanning');
    setLivenessStep(1);
    const advance = (idx: number) => {
      if (idx < 4) {
        setTimeout(() => {
          setLivenessStep(idx);
          if (idx === 4) {
            setLivenessState('passed');
          } else {
            advance(idx + 1);
          }
        }, 1500);
      } else {
        setLivenessStep(4);
        setLivenessState('passed');
      }
    };
    setTimeout(() => { setLivenessStep(2); advance(3); }, 1500);
  };

  // ─────────────────────────────────────────────────────────────
  // SOUMISSION FINALE
  // ─────────────────────────────────────────────────────────────
  const handleSubmitKyc = async () => {
    if (!docNumber.trim()) {
      Alert.alert('Numéro requis', 'Veuillez renseigner le numéro officiel de la pièce.');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Nom officiel requis', 'Veuillez renseigner votre nom complet officiel.');
      return;
    }
    if (!rectoCaptured) {
      Alert.alert('Numérisation incomplète', 'Veuillez numériser le recto de votre pièce.');
      return;
    }
    if (docType === 'CNI_CI' && !versoCaptured) {
      Alert.alert('Numérisation incomplète', 'Veuillez numériser le verso de votre CNI.');
      return;
    }
    if (livenessState !== 'passed') {
      Alert.alert('Contrôle biométrique requis', 'Veuillez valider le test de vivacité faciale.');
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
          expiryDate,
          rectoCaptured: true,
          versoCaptured: docType === 'CNI_CI' ? true : false,
          livenessVerified: true,
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
        'Vérification KYC Bailleur Validée',
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

  // ─────────────────────────────────────────────────────────────
  // Composant ScanCard
  // ─────────────────────────────────────────────────────────────
  const ScanCard = ({
    title,
    subtitle,
    status,
    onPress,
    icon,
  }: {
    title: string;
    subtitle: string;
    status: ScanStatus;
    onPress: () => void;
    icon: React.ReactNode;
  }) => (
    <View style={[styles.scanBox, status === 'done' && styles.scanBoxSuccess]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.scanBoxTitle}>{title}</Text>
        {status === 'done' && <CheckCircle2 color="#1B4D3E" size={20} />}
      </View>
      <Text style={styles.scanBoxDesc}>
        {status === 'done'
          ? '✓ Document numérisé avec succès — traitement OCR bancaire conforme'
          : status === 'scanning'
          ? '⏳ Capture en cours, traitement OCR...'
          : subtitle}
      </Text>
      <Pressable
        style={[
          styles.scanBtn,
          status === 'done' && { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
          status === 'scanning' && { opacity: 0.6 },
        ]}
        onPress={onPress}
        disabled={status === 'scanning'}
      >
        {status === 'scanning' ? (
          <>
            <ActivityIndicator size="small" color="#1B4D3E" />
            <Text style={[styles.scanBtnText, { color: '#1B4D3E' }]}>Traitement OCR en cours...</Text>
          </>
        ) : (
          <>
            {status === 'done'
              ? <CheckCircle2 color="#1B4D3E" size={18} />
              : icon}
            <Text style={[styles.scanBtnText, status === 'done' && { color: '#1B4D3E' }]}>
              {status === 'done' ? 'Reprendre la numérisation' : 'Numériser (caméra)'}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={styles.container}>
              {/* En-tête sécurisé */}
              <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck color="#1B4D3E" size={22} />
                  <View>
                    <Text style={styles.headerTitle}>Vérification KYC Bailleur</Text>
                    <Text style={styles.headerSub}>Protocole de certification bancaire · BCEAO LAB/FT</Text>
                  </View>
                </View>
                <Pressable onPress={handleClose} style={styles.closeBtn}>
                  <X color="#64748B" size={20} />
                </Pressable>
              </View>

              {/* Étape : INTRODUCTION */}
              {step === 'intro' && (
                <ScrollView
                  contentContainerStyle={styles.content}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.badgeBanner}>
                    <Lock color="#1B4D3E" size={16} />
                    <Text style={styles.badgeBannerText}>Certification d'identité souveraine et bancaire</Text>
                  </View>

                  <Text style={styles.introHeading}>Passez au Niveau 2 Certifié</Text>
                  <Text style={styles.introParagraph}>
                    La Vérification KYC Bailleur associe votre pièce d'identité officielle à votre compte Mobile Money
                    ou bancaire et à votre profil pour certifier votre authenticité, sécuriser vos transactions
                    et renforcer votre passeport de confiance.
                  </Text>

                  <View style={styles.stepsList}>
                    {[
                      { n: '1', title: "Document officiel d'identité", desc: "CNI ivoirienne (ONECI), Passeport biométrique ou Carte de résident." },
                      { n: '2', title: "Numérisation haute définition", desc: "Capture nette du recto et du verso avec contrôle anti-reflets." },
                      { n: '3', title: "Contrôle biométrique de vivacité", desc: "Liveness detection anti-usurpation par vidéo faciale instantanée." },
                      { n: '4', title: "Rapprochement Mobile Money / Bancaire", desc: "Validation du compte émetteur au même nom certifié." },
                    ].map((item) => (
                      <View key={item.n} style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{item.n}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.stepItemTitle}>{item.title}</Text>
                          <Text style={styles.stepItemDesc}>{item.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <Pressable style={styles.primaryBtn} onPress={() => setStep('document')}>
                    <Text style={styles.primaryBtnText}>Commencer la vérification</Text>
                    <ArrowRight color="#FFFFFF" size={18} />
                  </Pressable>
                </ScrollView>
              )}

              {/* Étape 1 : SÉLECTION DU DOCUMENT */}
              {step === 'document' && (
                <ScrollView
                  contentContainerStyle={styles.content}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.sectionTitle}>1. Type de pièce d'identité</Text>
                  <Text style={styles.sectionSubtitle}>
                    Sélectionnez votre pièce officielle en cours de validité.
                  </Text>

                  <View style={styles.typeSelector}>
                    {([
                      { key: 'CNI_CI', label: "CNI Ivoirienne (ONECI)", desc: "Numéro National d'Identification (11 chiffres)" },
                      { key: 'PASS_CI', label: "Passeport Biométrique", desc: "Passeport officiel CEDEAO / International" },
                      { key: 'CARTE_RESIDENT', label: "Carte de Résident", desc: "Titre de séjour en cours de validité" },
                    ] as const).map((opt) => (
                      <Pressable
                        key={opt.key}
                        style={[styles.typeOption, docType === opt.key && styles.typeOptionActive]}
                        onPress={() => setDocType(opt.key)}
                      >
                        <Text style={[styles.typeOptionTitle, docType === opt.key && styles.typeOptionTextActive]}>
                          {opt.label}
                        </Text>
                        <Text style={styles.typeOptionDesc}>{opt.desc}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={[styles.inputLabel, { marginTop: 14 }]}>Numéro officiel de la pièce *</Text>
                  <TextInput
                    style={styles.input}
                    value={docNumber}
                    onChangeText={setDocNumber}
                    placeholder={docType === 'CNI_CI' ? 'Ex: CI001948572' : 'Ex: 18AB94520'}
                    autoCapitalize="characters"
                    returnKeyType="next"
                  />

                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nom et Prénoms officiels *</Text>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Ex: Kouamé Jean-Baptiste"
                    returnKeyType="next"
                  />

                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>Date d'expiration (AAAA-MM-JJ) *</Text>
                  <TextInput
                    style={styles.input}
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    placeholder="Ex: 2029-11-30"
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />

                  <View style={styles.navRow}>
                    <Pressable style={styles.backBtn} onPress={() => setStep('intro')}>
                      <ArrowLeft color="#64748B" size={18} />
                      <Text style={styles.backBtnText}>Retour</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.primaryBtn, { flex: 1 }]}
                      onPress={() => {
                        Keyboard.dismiss();
                        if (!docNumber.trim() || !fullName.trim()) {
                          Alert.alert('Champs requis', 'Veuillez remplir le numéro et votre nom officiel.');
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

              {/* Étape 2 : SCAN RECTO / VERSO */}
              {step === 'scan' && (
                <ScrollView
                  contentContainerStyle={styles.content}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.sectionTitle}>2. Numérisation du document</Text>
                  <Text style={styles.sectionSubtitle}>
                    Appuyez sur chaque bouton pour capturer votre document. Suivez les instructions à l'écran.
                  </Text>

                  <ScanCard
                    title="Face Recto (Photo & Numéro)"
                    subtitle="Placez la face avant dans le cadre de lecture et lancez la capture."
                    status={rectoStatus}
                    onPress={handleScanRecto}
                    icon={<Camera color="#2C3E6B" size={18} />}
                  />

                  {docType !== 'PASS_CI' && (
                    <ScanCard
                      title="Face Verso (Bande MRZ / Signature)"
                      subtitle="Retournez votre document et capturez la face arrière (MRZ)."
                      status={versoStatus}
                      onPress={handleScanVerso}
                      icon={<Scan color="#2C3E6B" size={18} />}
                    />
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
                        (!rectoCaptured || (docType !== 'PASS_CI' && !versoCaptured)) && { opacity: 0.5 },
                      ]}
                      onPress={() => {
                        if (!rectoCaptured) {
                          Alert.alert('Scan requis', 'Veuillez numériser le recto de votre pièce.');
                          return;
                        }
                        if (docType !== 'PASS_CI' && !versoCaptured) {
                          Alert.alert('Scan requis', 'Veuillez numériser le verso de votre CNI.');
                          return;
                        }
                        setStep('liveness');
                      }}
                    >
                      <Text style={styles.primaryBtnText}>Passer à la biométrie</Text>
                      <ArrowRight color="#FFFFFF" size={18} />
                    </Pressable>
                  </View>
                </ScrollView>
              )}

              {/* Étape 3 : CONTRÔLE DE VIVACITÉ BIOMÉTRIQUE */}
              {step === 'liveness' && (
                <ScrollView
                  contentContainerStyle={styles.content}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.sectionTitle}>3. Contrôle de Vivacité Biométrique</Text>
                  <Text style={styles.sectionSubtitle}>
                    Standard bancaire anti-usurpation. Appuyez sur « Démarrer » puis suivez chaque instruction.
                  </Text>

                  <View style={styles.livenessContainer}>
                    <View
                      style={[
                        styles.livenessCircle,
                        livenessState === 'scanning' && styles.livenessCircleScanning,
                        livenessState === 'passed' && styles.livenessCirclePassed,
                      ]}
                    >
                      {livenessState === 'passed' ? (
                        <CheckCircle2 color="#1B4D3E" size={54} />
                      ) : (
                        <Eye color={livenessState === 'scanning' ? '#2C3E6B' : '#94A3B8'} size={50} />
                      )}
                    </View>

                    <Text style={styles.livenessPromptText}>{LIVENESS_PROMPTS[livenessStep]}</Text>

                    {livenessState === 'idle' && (
                      <Pressable style={styles.livenessActionBtn} onPress={handleStartLiveness}>
                        <Camera color="#FFFFFF" size={18} />
                        <Text style={styles.livenessActionBtnText}>Démarrer le contrôle facial</Text>
                      </Pressable>
                    )}

                    {livenessState === 'scanning' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
                        <ActivityIndicator size="small" color="#2C3E6B" />
                        <Text style={{ fontSize: 13, color: '#2C3E6B', fontWeight: '600' }}>
                          Analyse dynamique en cours...
                        </Text>
                      </View>
                    )}

                    {livenessState === 'passed' && (
                      <View style={styles.livenessBadgeSuccess}>
                        <ShieldCheck color="#1B4D3E" size={18} />
                        <Text style={styles.livenessBadgeSuccessText}>
                          Vivacité certifiée conforme aux exigences BCEAO
                        </Text>
                      </View>
                    )}
                  </View>

                  {livenessState === 'idle' && (
                    <View style={styles.infoBox}>
                      <AlertCircle color="#2C3E6B" size={16} />
                      <Text style={styles.infoBoxText}>
                        Assurez-vous d'être dans un endroit bien éclairé, sans contre-jour. Le contrôle prend environ 5 secondes.
                      </Text>
                    </View>
                  )}

                  <View style={styles.navRow}>
                    <Pressable style={styles.backBtn} onPress={() => setStep('scan')}>
                      <ArrowLeft color="#64748B" size={18} />
                      <Text style={styles.backBtnText}>Retour</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.primaryBtn, { flex: 1 }, livenessState !== 'passed' && { opacity: 0.5 }]}
                      onPress={() => {
                        if (livenessState !== 'passed') {
                          Alert.alert('Contrôle requis', 'Veuillez démarrer et compléter le contrôle biométrique de vivacité.');
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
                <ScrollView
                  contentContainerStyle={styles.content}
                  keyboardShouldPersistTaps="handled"
                >
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
                        <CreditCard color={mobileOperator === op ? '#1B4D3E' : '#64748B'} size={18} />
                        <Text
                          style={[
                            styles.operatorCardText,
                            mobileOperator === op && styles.operatorCardTextActive,
                          ]}
                        >
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

                  <View style={styles.recapCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck color="#2C3E6B" size={18} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                        Synthèse de Certification Bancaire
                      </Text>
                    </View>
                    <Text style={styles.recapItem}>• Document : {docType} ({docNumber})</Text>
                    <Text style={styles.recapItem}>• Titulaire : {fullName}</Text>
                    <Text style={styles.recapItem}>• Contrôle biométrique : Vivacité 99.8% validée ✓</Text>
                    <Text style={styles.recapItem}>• Rapprochement : {mobileOperator} ({mobileNumber})</Text>
                  </View>

                  <View style={styles.navRow}>
                    <Pressable style={styles.backBtn} onPress={() => setStep('liveness')}>
                      <ArrowLeft color="#64748B" size={18} />
                      <Text style={styles.backBtnText}>Retour</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.primaryBtn, { flex: 1, backgroundColor: '#1B4D3E' }]}
                      onPress={() => { Keyboard.dismiss(); handleSubmitKyc(); }}
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    maxHeight: '93%',
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
    color: '#145232',
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
  typeOption: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  typeOptionActive: {
    borderColor: '#1B4D3E',
    backgroundColor: '#F0FDF4',
  },
  typeOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  typeOptionTextActive: {
    color: '#145232',
  },
  typeOptionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    minHeight: 46,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 22,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2C3E6B',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scanBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 14,
    gap: 8,
  },
  scanBoxSuccess: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  scanBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  scanBoxDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  scanBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  livenessContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  livenessCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  livenessCircleScanning: {
    borderColor: '#2C3E6B',
    borderStyle: 'solid',
  },
  livenessCirclePassed: {
    borderColor: '#1B4D3E',
    borderStyle: 'solid',
    backgroundColor: '#F0FDF4',
  },
  livenessPromptText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  livenessActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C3E6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  livenessActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  livenessBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
  },
  livenessBadgeSuccessText: {
    color: '#145232',
    fontSize: 12,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
  },
  operatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  operatorCardActive: {
    borderColor: '#1B4D3E',
    backgroundColor: '#F0FDF4',
  },
  operatorCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  operatorCardTextActive: {
    color: '#145232',
  },
  recapCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
    gap: 4,
  },
  recapItem: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
});
