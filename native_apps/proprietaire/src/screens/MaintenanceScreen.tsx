import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, Image, FlatList } from 'react-native';
import { ChevronLeft, AlertCircle, CheckCircle, XCircle, Wrench, Banknote, User, Phone, Plus, Camera, Filter } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

const Colors = {
  primary: '#064E3B',
  accent: '#FCD34D',
  background: '#F9FAFB',
  white: '#FFFFFF',
  border: 'rgba(0,0,0,0.08)',
  text: {
    muted: '#6B7280'
  }
};

export default function MaintenanceScreen({ route, navigation }: any) {
  const token = route.params?.token;
  const [tickets, setTickets] = useState<any[]>([]);
  const [prestataires, setPrestataires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [techModalVisible, setTechModalVisible] = useState(false);
  
  // States for management
  const [newCost, setNewCost] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  
  // States for new technician
  const [newTechName, setNewTechName] = useState('');
  const [newTechPhone, setNewTechPhone] = useState('');
  const [newTechSpec, setNewTechSpec] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const respT = await fetch(API_ENDPOINTS.TICKETS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'GET_TICKETS' })
      });
      const dataT = await respT.json();
      if (dataT.success) setTickets(dataT.tickets);

      const respP = await fetch(API_ENDPOINTS.TICKETS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'GET_PRESTATAIRES' })
      });
      const dataP = await respP.json();
      if (dataP.success) setPrestataires(dataP.prestataires);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (status?: string) => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.TICKETS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'UPDATE_TICKET',
          ticketId: selectedTicket.id,
          newStatus: status || selectedTicket.statut,
          technicianId: selectedTechId || undefined,
          cost: newCost || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Mis à jour", "Les modifications ont été enregistrées.");
        setModalVisible(false);
        fetchData();
      } else {
        if (data.error === 'INSUFFICIENT_FUNDS') {
          Alert.alert("Solde Insuffisant", "Votre tirelire QAPRIL n'est pas assez provisionnée pour couvrir cette intervention.");
        } else {
          Alert.alert("Erreur", data.error || "Action impossible.");
        }
      }
    } catch (e) {
      Alert.alert("Erreur", "Action impossible.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTech = async () => {
    if (!newTechName || !newTechPhone) return Alert.alert("Champs requis", "Le nom et le téléphone sont obligatoires.");
    
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.TICKETS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'ADD_PRESTATAIRE',
          techData: { nom: newTechName, telephone: newTechPhone, specialite: newTechSpec }
        })
      });
      const data = await res.json();
      if (data.success) {
        setPrestataires(prev => [...prev, data.prestataire]);
        setSelectedTechId(data.prestataire.id);
        setTechModalVisible(false);
        setNewTechName(''); setNewTechPhone(''); setNewTechSpec('');
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'ajouter le prestataire.");
    } finally {
      setLoading(false);
    }
  };

  const openTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setNewCost(ticket.coutFinal?.toString() || '');
    setSelectedTechId(ticket.prestataireId || '');
    setModalVisible(true);
  };

  const stats = {
    pending: tickets.filter(t => t.statut === 'EN_ATTENTE').length,
    active: tickets.filter(t => t.statut === 'PRIS_EN_CHARGE').length,
    done: tickets.filter(t => t.statut === 'RESOLU').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return '#D97706';
      case 'PRIS_EN_CHARGE': return '#2563EB';
      case 'RESOLU': return '#059669';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion Maintenance</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#D97706' }]}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Alertes</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#2563EB' }]}>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#059669' }]}>
          <Text style={styles.statValue}>{stats.done}</Text>
          <Text style={styles.statLabel}>Finis</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Interventions Récentes</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {tickets.map(ticket => (
          <TouchableOpacity key={ticket.id} style={styles.card} onPress={() => openTicket(ticket)}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(ticket.statut) }]} />
              <Text style={styles.ticketRef}>{ticket.ticketRef}</Text>
              <Text style={styles.dateText}>{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>{ticket.description}</Text>
            <View style={styles.propertyRow}>
              <View style={styles.propInfo}>
                <Text style={styles.tenantName}>{ticket.locataire.firstName} {ticket.locataire.lastName}</Text>
                <Text style={styles.addressText}>{ticket.logement.address}</Text>
              </View>
              {ticket.coutFinal && (
                <View style={styles.costBadge}>
                  <Text style={styles.costText}>{ticket.coutFinal.toLocaleString()} F</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détail Incident</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><XCircle size={28} color="#6B7280" /></TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedTicket?.photoUrl && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedTicket.photoUrl }} style={styles.ticketImage} resizeMode="cover" />
                </View>
              )}

              <Text style={styles.label}>DESCRIPTION DU LOCATAIRE</Text>
              <Text style={styles.modalDesc}>{selectedTicket?.description}</Text>

              <View style={styles.infoRow}>
                <User size={16} color={Colors.text.muted} />
                <Text style={styles.infoText}>{selectedTicket?.locataire.firstName} {selectedTicket?.locataire.lastName} ({selectedTicket?.locataire.phone})</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.label}>ACTIONS DE GESTION</Text>
              
              <Text style={styles.subLabel}>Prestataire Assigné</Text>
              <View style={styles.techSelection}>
                <View style={styles.techPicker}>
                  <Wrench size={18} color={Colors.primary} />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 10 }}>
                    <TouchableOpacity 
                      style={[styles.techChip, !selectedTechId && styles.techChipActive]}
                      onPress={() => setSelectedTechId('')}
                    >
                      <Text style={[styles.techChipText, !selectedTechId && styles.techChipTextActive]}>Non assigné</Text>
                    </TouchableOpacity>
                    {prestataires.map(p => (
                      <TouchableOpacity 
                        key={p.id} 
                        style={[styles.techChip, selectedTechId === p.id && styles.techChipActive]}
                        onPress={() => setSelectedTechId(p.id)}
                      >
                        <Text style={[styles.techChipText, selectedTechId === p.id && styles.techChipTextActive]}>{p.nom}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.addTechBtn} onPress={() => setTechModalVisible(true)}>
                    <Plus size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.subLabel}>Coût de l'intervention (FCFA)</Text>
              <TextInput 
                style={styles.costInput}
                placeholder="Montant total..."
                keyboardType="numeric"
                value={newCost}
                onChangeText={setNewCost}
              />

              <View style={styles.actionButtons}>
                {selectedTicket?.statut === 'EN_ATTENTE' && (
                  <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#DBEAFE'}]} onPress={() => handleUpdate('PRIS_EN_CHARGE')}>
                    <Text style={{color: '#2563EB', fontWeight: '800'}}>Prendre en charge</Text>
                  </TouchableOpacity>
                )}
                {selectedTicket?.statut !== 'RESOLU' && (
                  <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#064E3B'}]} onPress={() => handleUpdate('RESOLU')}>
                    <Text style={{color: '#fff', fontWeight: '800'}}>Clôturer (Travaux finis)</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#F3F4F6', marginTop: 10}]} onPress={() => handleUpdate()}>
                  <Text style={{color: '#4B5563', fontWeight: '800'}}>Enregistrer les notes</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* NEW TECH MODAL */}
      <Modal visible={techModalVisible} transparent={true} animationType="fade">
        <View style={styles.tinyOverlay}>
          <View style={styles.tinyModal}>
            <Text style={styles.tinyTitle}>Nouveau Prestataire</Text>
            <TextInput style={styles.tinyInput} placeholder="Nom / Société" value={newTechName} onChangeText={setNewTechName} />
            <TextInput style={styles.tinyInput} placeholder="Téléphone" keyboardType="phone-pad" value={newTechPhone} onChangeText={setNewTechPhone} />
            <TextInput style={styles.tinyInput} placeholder="Spécialité (ex: Plombier)" value={newTechSpec} onChangeText={setNewTechSpec} />
            <View style={styles.tinyActions}>
              <TouchableOpacity onPress={() => setTechModalVisible(false)} style={styles.tinyCancel}><Text>Annuler</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleAddTech} style={styles.tinyConfirm}><Text style={{color:'#fff', fontWeight:'700'}}>Ajouter</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  
  statsRow: { flexDirection: 'row', gap: 12, padding: 16 },
  statCard: { flex: 1, backgroundColor: Colors.white, padding: 16, borderRadius: 16, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  statValue: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.text.muted, fontWeight: '600', marginTop: 4 },

  container: { padding: 16, paddingTop: 0 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  filterBtn: { padding: 8, backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },

  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  ticketRef: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  dateText: { marginLeft: 'auto', fontSize: 11, color: Colors.text.muted },
  description: { fontSize: 14, color: '#374151', marginBottom: 16, lineHeight: 20, fontWeight: '500' },
  propertyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.03)' },
  propInfo: { flex: 1 },
  tenantName: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  addressText: { fontSize: 11, color: Colors.text.muted, marginTop: 2 },
  costBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7' },
  costText: { fontSize: 12, fontWeight: '800', color: '#166534' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  modalBody: { flex: 1 },
  imageContainer: { width: '100%', height: 220, borderRadius: 24, overflow: 'hidden', marginBottom: 24, backgroundColor: '#f3f4f6' },
  ticketImage: { width: '100%', height: '100%' },
  label: { fontSize: 11, fontWeight: '800', color: Colors.text.muted, letterSpacing: 1, marginBottom: 12 },
  modalDesc: { fontSize: 15, color: '#1F2937', lineHeight: 24, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  infoText: { fontSize: 13, color: Colors.text.muted, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },
  
  subLabel: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 12 },
  techSelection: { marginBottom: 20 },
  techPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  techChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#E5E7EB', marginRight: 8 },
  techChipActive: { backgroundColor: Colors.primary },
  techChipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  techChipTextActive: { color: '#fff' },
  addTechBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  
  costInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 24 },
  actionButtons: { gap: 10 },
  actionBtn: { padding: 18, borderRadius: 16, alignItems: 'center' },

  tinyOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', padding:32 },
  tinyModal: { backgroundColor:'#fff', borderRadius:24, padding:24 },
  tinyTitle: { fontSize:18, fontWeight:'800', color:Colors.primary, marginBottom:20 },
  tinyInput: { backgroundColor:'#f9fafb', borderRadius:12, padding:14, marginBottom:12, borderWidth:1, borderColor:'#ddd' },
  tinyActions: { flexDirection:'row', justifyContent:'flex-end', gap:12, marginTop:8 },
  tinyCancel: { padding:12 },
  tinyConfirm: { backgroundColor:Colors.primary, paddingHorizontal:20, paddingVertical:12, borderRadius:12 }
});
