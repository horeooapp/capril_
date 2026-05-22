import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Colors } from '../theme/colors';
import SignaturePad from '../components/SignaturePad';
import { 
  ChevronLeft, 
  Coins, 
  FileCheck, 
  Users, 
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

export default function ContractScreen({ navigation, route }: any) {
  const lease = route.params?.lease;
  const token = route.params?.token;
  const [showSignModal, setShowSignModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [signatureId, setSignatureId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInitiateSignature = async (base64Signature: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/mobile/leases/signature/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          leaseId: lease.id,
          documentType: "BAIL"
        })
      });
      const result = await response.json();
      if (result.success) {
        setSignatureId(result.signatureId);
        setShowSignModal(false);
        setShowOtpModal(true);
      } else {
        Alert.alert("Erreur", result.error || "Impossible d'initier la signature");
      }
    } catch (error) {
       Alert.alert("Erreur", "Problème de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/mobile/leases/signature/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          signatureId, 
          otp 
        })
      });
      const result = await response.json();
      if (result.success) {
        setShowOtpModal(false);
        Alert.alert("Succès", "Contrat signé avec succès !");
        navigation.goBack(); // Refresh dashboard
      } else {
        Alert.alert("Erreur", result.error || "Code OTP incorrect");
      }
    } catch (error) {
       Alert.alert("Erreur", "Problème de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (lease?.documentUrl) {
      Linking.openURL(lease.documentUrl);
    } else if (lease?.id) {
       const dynamicUrl = `${API_ENDPOINTS.BASE_URL}/api/mobile/leases/${lease.id}/pdf`;
       Linking.openURL(dynamicUrl);
    } else {
      Alert.alert("Erreur", "URL du document non disponible.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du Bail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Digital Tenant Card */}
        <View style={styles.digitalCard}>
          <View style={styles.cardHeader}>
             <View style={styles.logoPlaceholder}>
               <Text style={styles.logoText}>CAPRIL</Text>
             </View>
             <View style={styles.badgeLabel}>
               <Text style={styles.badgeText}>CONTRAT DE BAIL</Text>
             </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.profileContainer}>
              <View style={styles.avatarPlaceholder}>
                <Image 
                  source={require('../../assets/adaptive-icon.png')} 
                  style={styles.avatar} 
                />
              </View>
              <View style={styles.infoCol}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>RÉF Bail:</Text>
                  <Text style={styles.value}>{lease?.ref || "NON RENSEIGNÉ"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Logement:</Text>
                  <Text style={styles.value}>{lease?.propertyName || "NON RENSEIGNÉ"}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Loyer:</Text>
                  <Text style={styles.value}>{lease?.rent?.toLocaleString() || "0"} FCFA</Text>
                </View>
                <View style={styles.infoRow}>
                   <Text style={styles.label}>Charges:</Text>
                   <Text style={styles.value}>{lease?.charges?.toLocaleString() || "0"} FCFA</Text>
                </View>
                <View style={styles.infoRow}>
                   <Text style={styles.label}>Statut:</Text>
                   <Text style={[styles.value, { color: lease?.status === 'ACTIVE' ? '#059669' : '#D97706' }]}>
                     {lease?.status === 'ACTIVE' ? 'EN COURS' : (lease?.status || "INACTIF")}
                   </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.countryText}>ADRESSE : {lease?.address || "NON SPÉCIFIÉE"}</Text>
          </View>
        </View>

        {/* PDF Download Section */}
        <TouchableOpacity style={styles.pdfDownloadCard} onPress={handleDownloadPDF}>
           <View style={styles.pdfIconBox}>
             <FileText size={24} color="#DC2626" />
           </View>
           <View style={styles.pdfInfo}>
             <Text style={styles.pdfTitle}>Contrat de Bail Officiel</Text>
             <Text style={styles.pdfSubtitle}>Format PDF Certifié - 1.2 MB</Text>
           </View>
           <Download size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('PaymentProcess', { 
              amount: lease?.rent + (lease?.charges || 0), 
              leaseId: lease?.id 
            })}
          >
            <View style={styles.actionIconContainer}>
              <Coins size={24} color="#D97706" />
            </View>
            <Text style={styles.actionText}>Payer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => {
              if (lease?.qrToken) {
                const url = `${API_ENDPOINTS.BASE_URL}/v/${lease.qrToken}`;
                navigation.navigate('ReceiptView', { url });
              } else {
                Alert.alert("Information", "Aucune quittance certifiée disponible pour ce bail pour l'instant.");
              }
            }}
          >
            <View style={styles.actionIconContainer}>
              <FileCheck size={24} color="#059669" />
            </View>
            <Text style={styles.actionText}>Quittance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert("Information", "La gestion des colocataires sera disponible dans la prochaine mise à jour.")}
          >
            <View style={styles.actionIconContainer}>
              <Users size={24} color="#2563EB" />
            </View>
            <Text style={styles.actionText}>Co-locat.</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('Services', { screen: 'Maintenance' })}
          >
            <View style={styles.actionIconContainer}>
              <AlertTriangle size={24} color="#DC2626" />
            </View>
            <Text style={styles.actionText}>Sinistre</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Signature Section for Pending Contracts */}
        {(lease?.status === 'PENDING_SIGNATURE' || lease?.status === 'DRAFT') && (
          <View style={styles.signSection}>
            <View style={styles.signNotice}>
              <Text style={styles.signNoticeTitle}>Action Requise</Text>
              <Text style={styles.signNoticeText}>
                Ce contrat est en attente de votre signature électronique certifiée QAPRIL M-SIGN.
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.signButton} 
              onPress={() => setShowSignModal(true)}
            >
              <Text style={styles.signButtonText}>SIGNER LE CONTRAT MAINTENANT</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Signature Modal */}
        <Modal visible={showSignModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Signature Tactile</Text>
                 <TouchableOpacity onPress={() => setShowSignModal(false)}>
                   <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Fermer</Text>
                 </TouchableOpacity>
               </View>
               <Text style={styles.modalSubtitle}>Signez à l'aide de votre doigt dans la zone ci-dessous.</Text>
               <SignaturePad onOK={handleInitiateSignature} description="Signature du bail QAPRIL" />
               {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}
            </SafeAreaView>
          </View>
        </Modal>

        {/* OTP Modal */}
        <Modal visible={showOtpModal} animationType="none" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.otpCard}>
              <Text style={styles.modalTitle}>Vérification OTP</Text>
              <Text style={styles.modalSubtitle}>Saisissez le code reçu par SMS pour finaliser votre signature.</Text>
              <TextInput
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChangeText={setOtp}
              />
              <TouchableOpacity 
                style={[styles.signButton, { marginTop: 20, backgroundColor: Colors.primary }]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.signButtonText}>CONFIRMER</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  container: { padding: 16 },
  digitalCard: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: 24,
    elevation: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoText: {
    color: Colors.accent,
    fontWeight: '900',
    fontSize: 10,
  },
  badgeLabel: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
  },
  profileContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  avatarPlaceholder: {
    width: 130,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    marginRight: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: Colors.text.muted,
    fontWeight: '700',
    width: 65,
  },
  value: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '800',
    flex: 1,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  cardFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    alignItems: 'center',
  },
  countryText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  pdfDownloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pdfIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  pdfSubtitle: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 16,
  },
  actionsRow: {
    marginBottom: 24,
  },
  actionItem: {
    width: 80,
    alignItems: 'center',
    marginRight: 15,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  financialCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  finLeft: {
    marginRight: 16,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: Colors.background,
    borderTopColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  finRight: {
    flex: 1,
  },
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  finLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  finValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  listSection: {
    marginBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeMore: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  listItemText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  listBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  listBadgeText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 13,
  },
  signSection: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    marginTop: 20,
    marginBottom: 40,
  },
  signNotice: {
    marginBottom: 20,
  },
  signNoticeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  signNoticeText: {
    fontSize: 13,
    color: Colors.text.muted,
    lineHeight: 18,
  },
  signButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 20,
  },
  otpCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: 60,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 10,
  }
});
