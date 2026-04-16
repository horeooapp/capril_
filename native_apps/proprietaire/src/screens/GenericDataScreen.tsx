import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { ChevronLeft, FileText, Database, ShieldAlert, Coins, RefreshCw, FileImage } from 'lucide-react-native';

const getIconForType = (type: string) => {
  switch (type) {
    case 'Bail': return <FileText size={24} color="#059669" />;
    case 'Quittance': return <Coins size={24} color="#d97706" />;
    case 'Alerte': return <ShieldAlert size={24} color="#dc2626" />;
    case 'Mandat': return <Database size={24} color="#4f46e5" />;
    case 'Fichier': return <FileImage size={24} color="#6b7280" />;
    default: return <Database size={24} color="#059669" />;
  }
};

export default function GenericDataScreen({ route, navigation }: any) {
  const { featureName, token } = route.params || {};
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch('https://www.qapril.ci/api/mobile/owner/generic-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, moduleName: featureName }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const json = await response.json();
      if (json.success) setData(json.data);
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        setData([]);
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (featureName && token) fetchData();
    else setLoading(false);
  }, [featureName, token]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        {getIconForType(item.type)}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <View style={styles.cardFooter}>
           <Text style={styles.cardDate}>{item.date}</Text>
           {item.amount !== undefined && (
             <Text style={styles.cardAmount}>{item.amount.toLocaleString()} FCFA</Text>
           )}
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'À RÉCUPÉRER' ? '#fee2e2' : '#d1fae5' }]}>
         <Text style={[styles.statusText, { color: item.status === 'À RÉCUPÉRER' ? '#dc2626' : '#059669' }]}>
            {item.status.substring(0, 12)}
         </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{featureName || 'Module Data'}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
          <RefreshCw size={20} color="#064E3B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Extraction depuis la Blockchain...</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.centerContainer}>
          <Database size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Aucune donnée trouvée pour {featureName}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600'
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '600'
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  cardAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  }
});
