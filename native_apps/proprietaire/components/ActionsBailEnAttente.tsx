import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fetchWithAuth } from '../lib/api';
import { FormModal } from './forms/FormModal';

/**
 * [IC-09] Bail en attente de la signature du locataire : renvoyer le code, corriger le numéro, annuler.
 * C'est le locataire qui signe ; le bailleur ne saisit jamais le code.
 */
export function ActionsBailEnAttente({ leaseId, telephone, onChange }: { leaseId: string; telephone?: string | null; onChange: () => void }) {
  const [occupe, setOccupe] = useState<null | 'code' | 'numero' | 'annuler'>(null);
  const [saisie, setSaisie] = useState(false);
  const [numero, setNumero] = useState('');

  const appel = async (chemin: string, method: string, corps?: any) => {
    const res = await fetchWithAuth(chemin, { method, ...(corps ? { body: JSON.stringify(corps) } : {}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(data.error || 'Opération impossible.');
    return data;
  };

  const renvoyer = async (message?: string) => {
    setOccupe('code');
    try {
      await appel(`/shared/leases/${leaseId}/otp`, 'POST');
      Alert.alert('Code envoyé', message || `Le locataire reçoit le bail et un nouveau code${telephone ? ` au ${telephone}` : ''}. Le code est valable 48 heures.`);
      onChange();
    } catch (e: any) {
      Alert.alert('Envoi impossible', e.message);
    } finally { setOccupe(null); }
  };

  const corriger = async () => {
    setOccupe('numero');
    try {
      const r = await appel(`/shared/leases/${leaseId}/locataire`, 'PATCH', { telephone: numero });
      setSaisie(false); setNumero('');
      await renvoyer(`Numéro corrigé. Le bail et son code partent au ${r.telephone}.`);
    } catch (e: any) {
      Alert.alert('Correction impossible', e.message);
      setOccupe(null);
    }
  };

  const annuler = () => Alert.alert('Annuler ce bail ?', 'Le code envoyé au locataire ne fonctionnera plus. Cette action ne peut pas être défaite.', [
    { text: 'Non, le garder', style: 'cancel' },
    { text: 'Oui, annuler', style: 'destructive', onPress: async () => {
      setOccupe('annuler');
      try { await appel(`/shared/leases/${leaseId}/annuler`, 'POST'); onChange(); }
      catch (e: any) { Alert.alert('Annulation impossible', e.message); }
      finally { setOccupe(null); }
    } },
  ]);

  return (
    <View style={s.bloc}>
      <Text style={s.titre}>En attente de la signature du locataire</Text>
      <Text style={s.aide}>Il signe depuis le lien reçu. Sans téléphone connecté, il peut signer sur votre appareil avec les codes reçus sur son propre téléphone.</Text>
      <View style={s.ligne}>
        <Pressable style={[s.btn, s.btnPlein]} onPress={() => renvoyer()} disabled={!!occupe} accessibilityRole="button">
          {occupe === 'code' ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.btnPleinTexte}>Renvoyer le code</Text>}
        </Pressable>
        <Pressable style={[s.btn, s.btnContour]} onPress={() => setSaisie(true)} disabled={!!occupe} accessibilityRole="button">
          <Text style={s.btnContourTexte}>Corriger le numéro</Text>
        </Pressable>
      </View>
      <Pressable style={s.lien} onPress={annuler} disabled={!!occupe} accessibilityRole="button">
        {occupe === 'annuler' ? <ActivityIndicator color="#B91C1C" /> : <Text style={s.lienTexte}>Annuler le bail</Text>}
      </Pressable>

      <FormModal
        visible={saisie}
        onClose={() => setSaisie(false)}
        footer={
          <Pressable style={[s.btn, s.btnPlein, numero.replace(/\D/g, '').length < 10 && { opacity: 0.5 }]} onPress={corriger} disabled={!!occupe || numero.replace(/\D/g, '').length < 10}>
            {occupe === 'numero' ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.btnPleinTexte}>Corriger et renvoyer</Text>}
          </Pressable>
        }
      >
        <Text style={s.titre}>Nouveau numéro du locataire</Text>
        <Text style={s.aide}>Le bail et le code de signature seront envoyés à ce numéro.</Text>
        <TextInput style={s.champ} value={numero} onChangeText={setNumero} keyboardType="phone-pad" placeholder="07 00 00 00 00" placeholderTextColor="#9CA3AF" autoFocus accessibilityLabel="Nouveau numéro du locataire" />
      </FormModal>
    </View>
  );
}

const s = StyleSheet.create({
  bloc: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  titre: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  aide: { fontSize: 11, color: '#92400E', marginTop: 4, lineHeight: 16 },
  ligne: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  btnPlein: { backgroundColor: '#2C3E6B' },
  btnPleinTexte: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  btnContour: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB' },
  btnContourTexte: { color: '#111827', fontSize: 13, fontWeight: '700' },
  lien: { minHeight: 40, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  lienTexte: { color: '#B91C1C', fontSize: 13, fontWeight: '700' },
  champ: { marginTop: 12, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: '#111827' },
});
