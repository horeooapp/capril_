import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { MapPin, Home, MessageSquare, Phone } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { API_ENDPOINTS } from '../config/api';

export default function MarketplaceScreen({ navigation, route }: any) {
  const { token } = route.params || {};
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ENDPOINTS.MARKETPLACE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setAnnonces(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const renderAnnonce = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <Image 
        source={{ uri: item.photosUrls?.[0] || 'https://via.placeholder.com/400x200' }} 
        style={styles.image} 
      />
      <View style={styles.content}>
        <Text style={styles.title}>{item.titre}</Text>
        <View style={styles.row}>
          <MapPin size={14} color={Colors.qNavyMedium} />
          <Text style={styles.location}>{item.logement?.commune || 'Abidjan'}</Text>
        </View>
        <Text style={styles.price}>{item.loyerDemande.toLocaleString()} F <Text style={styles.period}>/mois</Text></Text>
        
        <View style={styles.footer}>
          <View style={styles.badge}>
            <Home size={12} color={Colors.qGreenDark} />
            <Text style={styles.badgeText}>{item.logement?.category || 'Maison'}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}>
              <MessageSquare size={18} color={Colors.qGreen} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { marginLeft: 10 }]}>
              <Phone size={18} color={Colors.qGreen} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <Text style={styles.headerSub}>Trouvez votre prochain logement</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.qGreen} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={annonces}
          renderItem={renderAnnonce}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucune annonce disponible pour le moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.qCream,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 24,
    color: Colors.qNavy,
  },
  headerSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 14,
    color: Colors.qNavyMedium,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.qNavyLight,
  },
  content: {
    padding: 16,
  },
  title: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 18,
    color: Colors.qNavy,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 13,
    color: Colors.qNavyMedium,
    marginLeft: 4,
  },
  price: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 20,
    color: Colors.qGreen,
    marginBottom: 12,
  },
  period: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.body,
    color: Colors.qNavyMedium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.qGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 11,
    color: Colors.qGreenDark,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.qCream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.body,
    color: Colors.qNavyLight,
  }
});
