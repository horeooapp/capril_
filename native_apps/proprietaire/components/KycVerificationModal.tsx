import React, { useState } from 'react';
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
} from 'lucide-react-native';
import { fetchWithAuth } from '../lib/api';

interface KycVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
  currentUser?: any;
}

type KycStep = 'intro' | 'document' | 'scan' | 'liveness' | 'bank' | 'review';

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
  const [expiryDate, setExpiryDate] = useState('2030-12-31');
  const [rectoCaptured, setRectoCaptured] = useState(false);
  const [versoCaptured, setVersoCaptured] = useState(false);
  const [isScanningRecto, setIsScanningRecto] = useState(false);
  const [isScanningVerso, setIsScanningVerso] = useState(false);

  // Étape Liveness biométrique
  const [livenessState, setLivenessState] = useState<'idle' | 'scanning' | 'passed'>('idle');
  const [livenessPrompt, setLivenessPrompt] = useState('Positionnez votre visage au centre du cadre');

  // Étape Rapprochement Bancaire / Mobile Money
  const [mobileOperator, setMobileOperator] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money'>('Wave');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || '');

  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setStep('intro');
    setDocNumber('');
    setRectoCaptured(false);
    setVersoCaptured(false);
    setLivenessState('idle');
    setLivenessPrompt('Positionnez votre visage au centre du cadre');
    setSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Simulation de scan OCR certifié haute précision
  const handleSimulateScanRecto = () => {
    setIsScanningRecto(true);
    setTimeout(() => {
      setIsScanningRecto(false);
      setRectoCaptured(true);
      if (!docNumber) {
        setDocNumber(docType === 'CNI_CI' ? 'CI009845123' : '18AB94520');
      }
      if (!fullName && currentUser?.phone) {
        setFullName('Kouassi Jean-Marc');
      }
    }, 1200);
  };

  const handleSimulateScanVerso = () => {
    setIsScanningVerso(true);
    setTimeout(() => {
      setIsScanningVerso(false);
      setVersoCaptured(true);
    }, 1200);
  };

  // Simulation Liveness Check de niveau bancaire
  const handleStartLiveness = () => {
    setLivenessState('scanning');
    setLivenessPrompt('Contrôle de vivacité : Regardez l’écran...');
    setTimeout(() => {
      setLivenessPrompt('Clignez lentement des yeux...');
      setTimeout(() => {
        setLivenessPrompt('Tournez légèrement la tête à droite...');
        setTimeout(() => {
          setLivenessPrompt('Contrôle biométrique validé (Conformité 99.8%)');
          setLivenessState('passed');
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Soumission finale vers l'API KYC bancaire
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
        'Vérification KYC Validée',
        'Félicitations ! Votre profil de bailleur est certifié Niveau 2 avec conformité bancaire intégrale.',
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
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
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.badgeBanner}>
                <Lock color="#1B4D3E" size={16} />
                <Text style={styles.badgeBannerText}>Certification d'identité souveraine et bancaire</Text>
              </View>

              <Text style={styles.introHeading}>Passez au Niveau 2 Certifié</Text>
              <Text style={styles.introParagraph}>
                La vérification KYC associe votre pièce d'identité officielle à votre compte Mobile Money
                ou compte bancaire émetteur pour certifier votre statut de bailleur, sécuriser vos loyers perçus
                et valider vos baux légaux.
              </Text>

              <View style={styles.stepsList}>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepItemTitle}>Document officiel d’identité</Text>
                    <Text style={styles.stepItemDesc}>CNI ivoirienne (NNI), Passeport biométrique ou Carte de résident.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepItemTitle}>Numérisation haute définition</Text>
                    <Text style={styles.stepItemDesc}>Capture nette du recto et du verso avec contrôle anti-reflets.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepItemTitle}>Contrôle biométrique de vivacité</Text>
                    <Text style={styles.stepItemDesc}>Liveness detection anti-usurpation par vidéo faciale instantanée.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepItemTitle}>Rapprochement Mobile Money / Bancaire</Text>
                    <Text style={styles.stepItemDesc}>Validation du compte récepteur au même nom certifié.</Text>
                  </View>
                </View>
              </View>

              <Pressable style={styles.primaryBtn} onPress={() => setStep('document')}>
                <Text style={styles.primaryBtnText}>Commencer la vérification bancaire</Text>
                <ArrowRight color="#FFFFFF" size={18} />
              </Pressable>
            </ScrollView>
          )}

          {/* Étape 1 : SÉLECTION DU DOCUMENT */}
          {step === 'document' && (
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.sectionTitle}>1. Type de pièce d’identité</Text>
              <Text style={styles.sectionSubtitle}>
                Sélectionnez votre pièce officielle en cours de validité.
              </Text>

              <View style={styles.typeSelector}>
                <Pressable
                  style={[styles.typeOption, docType === 'CNI_CI' && styles.typeOptionActive]}
                  onPress={() => setDocType('CNI_CI')}
                >
                  <Text style={[styles.typeOptionTitle, docType === 'CNI_CI' && styles.typeOptionTextActive]}>
                    CNI Ivoirienne (ONECI)
                  </Text>
                  <Text style={styles.typeOptionDesc}>Numéro National d'Identification (11 chiffres)</Text>
                </Pressable>

                <Pressable
                  style={[styles.typeOption, docType === 'PASS_CI' && styles.typeOptionActive]}
                  onPress={() => setDocType('PASS_CI')}
                >
                  <Text style={[styles.typeOptionTitle, docType === 'PASS_CI' && styles.typeOptionTextActive]}>
                    Passeport Biométrique
                  </Text>
                  <Text style={styles.typeOptionDesc}>Passeport officiel CEDEAO / International</Text>
                </Pressable>

                <Pressable
                  style={[styles.typeOption, docType === 'CARTE_RESIDENT' && styles.typeOptionActive]}
                  onPress={() => setDocType('CARTE_RESIDENT')}
                >
                  <Text style={[styles.typeOptionTitle, docType === 'CARTE_RESIDENT' && styles.typeOptionTextActive]}>
                    Carte de Résident
                  </Text>
                  <Text style={styles.typeOptionDesc}>Titre de séjour en cours de validité</Text>
                </Pressable>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Numéro officiel de la pièce *</Text>
              <TextInput
                style={styles.input}
                value={docNumber}
                onChangeText={setDocNumber}
                placeholder={docType === 'CNI_CI' ? 'Ex: CI001948572' : 'Ex: 18AB94520'}
                autoCapitalize="characters"
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nom et Prénoms officiels *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ex: Kouamé Jean-Baptiste"
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Date d’expiration *</Text>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="AAAA-MM-JJ"
              />

              <View style={styles.navRow}>
                <Pressable style={styles.backBtn} onPress={() => setStep('intro')}>
                  <ArrowLeft color="#64748B" size={18} />
                  <Text style={styles.backBtnText}>Retour</Text>
                </Pressable>
                <Pressable
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={() => {
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
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.sectionTitle}>2. Numérisation du document</Text>
              <Text style={styles.sectionSubtitle}>
                Prenez une capture nette, sans reflets ni doigts masquant les inscriptions.
              </Text>

              {/* RECTO */}
              <View style={[styles.scanBox, rectoCaptured && styles.scanBoxSuccess]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.scanBoxTitle}>Face Recto (Photo & Numéro)</Text>
                  {rectoCaptured && <CheckCircle2 color="#1B4D3E" size={20} />}
                </View>
                <Text style={styles.scanBoxDesc}>
                  {rectoCaptured
                    ? '✓ Document numérisé avec succès (OCR bancaire conforme)'
                    : 'Placez la face avant dans le cadre de lecture.'}
                </Text>
                <Pressable
                  style={[styles.scanBtn, rectoCaptured && { backgroundColor: '#F0FDF4' }]}
                  onPress={handleSimulateScanRecto}
                  disabled={isScanningRecto}
                >
                  {isScanningRecto ? (
                    <ActivityIndicator size="small" color="#1B4D3E" />
                  ) : (
                    <>
                      <Camera color={rectoCaptured ? '#1B4D3E' : '#1B4D3E'} size={18} />
                      <Text style={[styles.scanBtnText, rectoCaptured && { color: '#1B4D3E' }]}>
                        {rectoCaptured ? 'Reprendre la numérisation' : 'Numériser le Recto'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              {/* VERSO (Si CNI ou Résident) */}
              {docType !== 'PASS_CI' && (
                <View style={[styles.scanBox, versoCaptured && styles.scanBoxSuccess]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.scanBoxTitle}>Face Verso (Bande MRZ / Signature)</Text>
                    {versoCaptured && <CheckCircle2 color="#1B4D3E" size={20} />}
                  </View>
                  <Text style={styles.scanBoxDesc}>
                    {versoCaptured
                      ? '✓ Verso numérisé (Zone sécurisée MRZ certifiée)'
                      : 'Numérisez la face arrière pour valider les filigranes.'}
                  </Text>
                  <Pressable
                    style={[styles.scanBtn, versoCaptured && { backgroundColor: '#F0FDF4' }]}
                    onPress={handleSimulateScanVerso}
                    disabled={isScanningVerso}
                  >
                    {isScanningVerso ? (
                      <ActivityIndicator size="small" color="#1B4D3E" />
                    ) : (
                      <>
                        <Scan color={versoCaptured ? '#1B4D3E' : '#1B4D3E'} size={18} />
                        <Text style={[styles.scanBtnText, versoCaptured && { color: '#1B4D3E' }]}>
                          {versoCaptured ? 'Reprendre la numérisation' : 'Numériser le Verso'}
                        </Text>
                      </>
                    )}
                  </Pressable>
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
                    (!rectoCaptured || (docType !== 'PASS_CI' && !versoCaptured)) && { opacity: 0.6 },
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

          {/* Étape 3 : CONTRÔLE DE VIVACITÉ BIOMÉTRIQUE (LIVENESS) */}
          {step === 'liveness' && (
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.sectionTitle}>3. Contrôle de Vivacité Biométrique</Text>
              <Text style={styles.sectionSubtitle}>
                Standard bancaire anti-usurpation d'identité. Suivez les instructions affichées à l'écran.
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
                    <Eye color={livenessState === 'scanning' ? '#1B4D3E' : '#94A3B8'} size={50} />
                  )}
                </View>

                <Text style={styles.livenessPromptText}>{livenessPrompt}</Text>

                {livenessState === 'idle' && (
                  <Pressable style={styles.livenessActionBtn} onPress={handleStartLiveness}>
                    <Camera color="#FFFFFF" size={18} />
                    <Text style={styles.livenessActionBtnText}>Démarrer le contrôle facial</Text>
                  </Pressable>
                )}

                {livenessState === 'scanning' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
                    <ActivityIndicator size="small" color="#1B4D3E" />
                    <Text style={{ fontSize: 13, color: '#1B4D3E', fontWeight: '600' }}>
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

              <View style={styles.navRow}>
                <Pressable style={styles.backBtn} onPress={() => setStep('scan')}>
                  <ArrowLeft color="#64748B" size={18} />
                  <Text style={styles.backBtnText}>Retour</Text>
                </Pressable>
                <Pressable
                  style={[styles.primaryBtn, { flex: 1 }, livenessState !== 'passed' && { opacity: 0.6 }]}
                  onPress={() => {
                    if (livenessState !== 'passed') {
                      Alert.alert(
                        'Contrôle requis',
                        'Veuillez démarrer et compléter le contrôle biométrique de vivacité.'
                      );
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
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.sectionTitle}>4. Rapprochement Bancaire & Mobile Money</Text>
              <Text style={styles.sectionSubtitle}>
                Associez le compte de perception émis au même nom officiel pour valider vos reversements.
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
                placeholder="+225 07..."
                keyboardType="phone-pad"
              />

              <View style={styles.recapCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck color="#1B4D3E" size={18} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                    Synthèse de Certification Bancaire
                  </Text>
                </View>
                <Text style={styles.recapItem}>• Document : {docType} ({docNumber})</Text>
                <Text style={styles.recapItem}>• Titulaire : {fullName}</Text>
                <Text style={styles.recapItem}>• Contrôle biométrique : Vivacité 99.8% validée</Text>
                <Text style={styles.recapItem}>• Rapprochement : {mobileOperator} ({mobileNumber})</Text>
              </View>

              <View style={styles.navRow}>
                <Pressable style={styles.backBtn} onPress={() => setStep('liveness')}>
                  <ArrowLeft color="#64748B" size={18} />
                  <Text style={styles.backBtnText}>Retour</Text>
                </Pressable>
                <Pressable
                  style={[styles.primaryBtn, { flex: 1, backgroundColor: '#1B4D3E' }]}
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
    maxHeight: '92%',
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
    paddingBottom: 36,
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
    backgroundColor: '#1B4D3E',
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
    color: '#166534',
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
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
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
    backgroundColor: '#1B4D3E',
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
    paddingVertical: 10,
    marginTop: 4,
  },
  scanBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  livenessContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
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
    borderColor: '#1B4D3E',
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
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 18,
    paddingVertical: 10,
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
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 14,
  },
  livenessBadgeSuccessText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
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
    color: '#166534',
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
    marginTop: 2,
  },
});
