import { TopNavHeader } from '../../components/TopNavHeader';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, FileText, CheckCircle2, ShieldCheck, X, ExternalLink } from 'lucide-react-native';
import { fetchWithAuth } from '../../lib/api';

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await fetchWithAuth('/locataire/receipts');
        const json = await response.json();
        if (response.ok && json.receipts) {
          setReceipts(json.receipts);
        }
      } catch (e) {
        console.error("Erreur chargement quittances", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2C3E6B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopNavHeader title="Mes Quittances" subtitle="La preuve officielle de vos paiements" />
      <View style={styles.header}>
        <Text style={styles.sub}>Mes quittances — la preuve de vos paiements</Text>
        <Text style={styles.title}>Mes quittances</Text>
      </View>

      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>{receipts.length} quittance{receipts.length > 1 ? 's' : ''} émise{receipts.length > 1 ? 's' : ''}</Text>
          <Text style={styles.bannerSub}>Acceptée par les banques et les administrations</Text>
        </View>
        {receipts.length > 0 && (
          <Pressable
            style={styles.packBtn}
            onPress={() => {
              const exportUrl = 'https://qapril.net/mon-espace-locataire/receipts';
              Linking.openURL(exportUrl).catch(() => {
                Alert.alert('Pack Quittances', 'Exportez vos quittances complètes depuis votre espace Web QAPRIL.');
              });
            }}
          >
            <Text style={styles.packBtnText}>Tout exporter</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 }}>
            <FileText size={40} color="#94A3B8" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B', textAlign: 'center', marginTop: 12 }}>
              Aucune quittance émise pour le moment
            </Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
              Vos quittances apparaîtront ici dès la validation de vos règlements de loyer.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <CheckCircle2 color="#1E7E4E" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.month}>
                {item.period || 'Loyer mensuel'} · {(item.amount || 0).toLocaleString('fr-FR')} F
              </Text>
              <Text style={styles.meta}>
                {item.date ? `Payé le ${new Date(item.date).toLocaleDateString('fr-FR')}` : 'En cours'} · {item.via || 'Mobile Money'}
              </Text>
            </View>
            <Pressable
              style={styles.pdfBtn}
              onPress={() => setSelectedReceipt(item)}
            >
              <Download color="#2C3E6B" size={16} />
              <Text style={styles.pdfBtnText}>Afficher</Text>
            </Pressable>
          </View>
        )}
      />

      {/* MODALE : VISUALISATION COMPLÈTE DE LA QUITTANCE CERTIFIÉE */}
      <Modal visible={!!selectedReceipt} transparent animationType="slide" onRequestClose={() => setSelectedReceipt(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#E3F5EC', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck color="#1E7E4E" size={20} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Quittance de Loyer Officielle</Text>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>Preuve certifiée conforme</Text>
                </View>
              </View>
              <Pressable onPress={() => setSelectedReceipt(null)} style={{ padding: 6 }}>
                <X color="#64748B" size={22} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>Référence</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>
                    {selectedReceipt?.receiptRef || selectedReceipt?.id}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>Période réglée</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                    {selectedReceipt?.period || 'Loyer mensuel'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>Montant total réglé</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E7E4E' }}>
                    {(selectedReceipt?.amount || 0).toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>Canal de paiement</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>
                    {selectedReceipt?.via || 'Wave / Mobile Money'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>Date d'encaissement</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>
                    {selectedReceipt?.date ? new Date(selectedReceipt.date).toLocaleDateString('fr-FR') : 'Confirmé'}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: '#166534', lineHeight: 16 }}>
                  Dont quittance, sous réserve de tous droits. Ce document certifié constitue une preuve formelle opposable aux banques, administrations et consulats.
                </Text>
              </View>

              <Pressable
                style={{ backgroundColor: '#2C3E6B', borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}
                onPress={() => {
                  const ref = selectedReceipt?.receiptRef || selectedReceipt?.id;
                  const verifyUrl = `https://qapril.net/verifier?ref=${ref}`;
                  Linking.openURL(verifyUrl).catch(() => {
                    Alert.alert('Vérification en ligne', `Référence : ${ref}\nVérification disponible sur qapril.net`);
                  });
                }}
              >
                <ExternalLink color="#FFFFFF" size={16} />
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Vérifier / Télécharger le PDF officiel</Text>
              </Pressable>

              <Pressable
                style={{ backgroundColor: '#F1F5F9', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => setSelectedReceipt(null)}
              >
                <Text style={{ color: '#475569', fontSize: 13, fontWeight: '700' }}>Fermer</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 },
  sub: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '600', color: '#1A1D26', marginTop: 2 },
  banner: {
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#2C3E6B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  packBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  packBtnText: { color: '#2C3E6B', fontSize: 11, fontWeight: '600' },
  list: { paddingHorizontal: 18, paddingBottom: 40, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EF',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E3F5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: { fontSize: 14, fontWeight: '700', color: '#1A1D26' },
  meta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8ECF6',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  pdfBtnText: { fontSize: 11, fontWeight: '600', color: '#2C3E6B' },
});
