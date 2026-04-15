import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import { Colors } from '../theme/colors';
import { 
  ChevronLeft, 
  Coins, 
  FileCheck, 
  Users, 
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react-native';

export default function ContractScreen({ navigation, route }: any) {
  const lease = route.params?.lease;

  const handleDownloadPDF = () => {
    Alert.alert(
      "Téléchargement",
      "Le contrat de bail PDF va être téléchargé sur votre appareil.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "OK", onPress: () => {
          if (lease?.documentUrl) Linking.openURL(lease.documentUrl);
          else Alert.alert("Non disponible", "Aucun PDF associé à ce bail en base de données.");
        }}
      ]
    );
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
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <FileCheck size={24} color="#059669" />
            </View>
            <Text style={styles.actionText}>Quittance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Users size={24} color="#2563EB" />
            </View>
            <Text style={styles.actionText}>Co-locat.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <AlertTriangle size={24} color="#DC2626" />
            </View>
            <Text style={styles.actionText}>Sinistre</Text>
          </TouchableOpacity>
        </ScrollView>
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
  }
});
