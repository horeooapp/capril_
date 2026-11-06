import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Linking } from 'react-native';
import { checkBackendVersionAsync, VersionCheckResult, APP_VERSION } from '../lib/version';
import { Download, AlertTriangle, ArrowRight, X } from 'lucide-react-native';

export function VersionUpdateModal() {
  const [data, setData] = useState<VersionCheckResult | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkBackendVersionAsync().then((res) => {
      if (res && (res.isForceUpdate || res.isUpdateAvailable)) {
        setData(res);
        setVisible(true);
      }
    });
  }, []);

  if (!visible || !data) return null;

  const handleDownload = () => {
    if (data.downloadUrl) {
      Linking.openURL(data.downloadUrl).catch(() => {});
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!data.isForceUpdate) setVisible(false);
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Download color="#2563EB" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.badge}>
                {data.isForceUpdate ? 'MISE À JOUR OBLIGATOIRE' : 'NOUVELLE VERSION DISPONIBLE'}
              </Text>
              <Text style={styles.title}>Version {data.latestVersion}</Text>
            </View>
            {!data.isForceUpdate && (
              <Pressable style={styles.closeBtn} onPress={() => setVisible(false)}>
                <X color="#6B7280" size={18} />
              </Pressable>
            )}
          </View>

          <View style={styles.body}>
            <Text style={styles.subtitle}>
              Votre version actuelle : <Text style={styles.currentVer}>v{APP_VERSION}</Text>
            </Text>
            {data.releaseNotes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesTitle}>Nouveautés :</Text>
                <Text style={styles.notesText}>{data.releaseNotes}</Text>
              </View>
            ) : null}
            <Text style={styles.infoText}>
              Téléchargez la dernière version certifiée pour profiter de toutes les fonctionnalités et des améliorations de sécurité.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.primaryBtn} onPress={handleDownload}>
              <Download color="#FFFFFF" size={16} />
              <Text style={styles.primaryBtnText}>Télécharger la mise à jour</Text>
            </Pressable>

            {!data.isForceUpdate && (
              <Pressable style={styles.secondaryBtn} onPress={() => setVisible(false)}>
                <Text style={styles.secondaryBtnText}>Plus tard</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    gap: 10,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  currentVer: {
    fontWeight: '700',
    color: '#0F172A',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  notesText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
  },
  infoText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  actions: {
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
});
