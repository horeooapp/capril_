import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';
import { useRouter } from 'expo-router';
import { RefreshCw, FileSignature, MessageCircle, Clock, CheckCircle2, ChevronRight, X, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react-native';
import { fetchWithAuth } from '../lib/api';

export interface ActionItem {
  id: string;
  type: 'LEASE_SIGNATURE' | 'RENT_DUE' | 'UNREAD_MESSAGE' | 'RENT_REVISION' | 'PAYMENT_CONFIRMATION' | 'MAINTENANCE_TICKET' | 'INFO';
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export function ActionNotificationBanner() {
  const router = useRouter();

  // État Mises à jour
  const [otaAvailable, setOtaAvailable] = useState(false);
  const [otaReady, setOtaReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // État Actions Requises
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // 1. Vérification des mises à jour applicatives
  const checkOTA = useCallback(async () => {
    try {
      if (__DEV__ || !Updates.isEnabled) {
        return;
      }
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        setOtaAvailable(true);
        try {
          await Updates.fetchUpdateAsync();
          setOtaReady(true);
        } catch (fetchErr) {
          console.log('[ActionBanner] Erreur téléchargement mise à jour:', fetchErr);
        }
      }
    } catch (err) {
      console.log('[ActionBanner] Info vérification mise à jour:', err);
    }
  }, []);

  // 2. Récupération des actions nécessitant une attention
  const loadActions = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/actions-required');
      if (res.ok) {
        const json = await res.json();
        if (json.actions && Array.isArray(json.actions)) {
          setActions(json.actions);
        }
      }
    } catch (e) {
      // Échec silencieux
    }
  }, []);

  useEffect(() => {
    checkOTA();
    loadActions();

    // Recharger lors du retour au premier plan
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkOTA();
        loadActions();
      }
    });

    return () => {
      sub.remove();
    };
  }, [checkOTA, loadActions]);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      if (!otaReady) {
        await Updates.fetchUpdateAsync();
      }
      await Updates.reloadAsync();
    } catch (err) {
      console.log('[ActionBanner] Erreur redémarrage mise à jour:', err);
      setIsUpdating(false);
    }
  };

  const handleExecuteAction = (action: ActionItem) => {
    if (action.actionRoute) {
      router.push(action.actionRoute as any);
    }
  };

  if (dismissed) {
    return null;
  }

  // CAS A : Une mise à jour de l'application est disponible
  if (otaAvailable) {
    return (
      <View style={[styles.container, styles.otaContainer]}>
        <View style={styles.contentCol}>
          <View style={styles.badgeRow}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.badgeText, { color: '#34D399' }]}>
              MISE À JOUR DE L'APPLICATION
            </Text>
          </View>
          <Text style={styles.titleText}>
            {otaReady ? 'Nouvelle version prête à être installée' : 'Téléchargement de la mise à jour...'}
          </Text>
          <Text style={styles.descText} numberOfLines={1}>
            {otaReady ? 'Redémarrez pour appliquer les nouveautés.' : 'Veuillez patienter quelques instants.'}
          </Text>
        </View>

        <Pressable
          style={styles.actionBtnEmerald}
          onPress={handleApplyUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <RefreshCw size={13} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>
                {otaReady ? 'Redémarrer' : 'Appliquer'}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    );
  }

  // CAS B : Des actions nécessitent l'attention du bailleur/propriétaire
  if (actions.length > 0) {
    const currentAction = actions[currentActionIndex] || actions[0];
    const isUrgent = currentAction.priority === 'URGENT';
    const isLease = currentAction.type === 'LEASE_SIGNATURE';
    const isChat = currentAction.type === 'UNREAD_MESSAGE';
    const isPayment = currentAction.type === 'PAYMENT_CONFIRMATION';

    const accentColor = isUrgent ? '#F59E0B' : isPayment ? '#10B981' : isChat ? '#38BDF8' : '#F59E0B';
    const badgeLabel = isUrgent ? 'ACTION REQUISE' : isPayment ? 'PAIEMENT À CONFIRMER' : isChat ? 'MESSAGERIE' : 'ATTENTION';

    return (
      <View style={[styles.container, isUrgent ? styles.urgentBorder : styles.normalBorder]}>
        <View style={styles.contentCol}>
          <View style={styles.topRow}>
            <View style={styles.badgeRow}>
              <View style={[styles.dot, { backgroundColor: accentColor }]} />
              <Text style={[styles.badgeText, { color: accentColor }]}>
                {badgeLabel}
              </Text>
            </View>

            {actions.length > 1 && (
              <Pressable
                onPress={() => setCurrentActionIndex((prev) => (prev + 1) % actions.length)}
                style={styles.counterBadge}
              >
                <Text style={styles.counterText}>
                  {currentActionIndex + 1}/{actions.length} · Suivant ›
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => setDismissed(true)}
              style={styles.closeBtn}
              hitSlop={8}
            >
              <X size={14} color="#94A3B8" />
            </Pressable>
          </View>

          <Text style={styles.titleText} numberOfLines={1}>
            {currentAction.title}
          </Text>
          <Text style={styles.descText} numberOfLines={2}>
            {currentAction.description}
          </Text>
        </View>

        <Pressable
          style={[styles.actionBtnPrimary, { backgroundColor: accentColor }]}
          onPress={() => handleExecuteAction(currentAction)}
        >
          {isLease ? (
            <FileSignature size={13} color="#0F172A" />
          ) : isChat ? (
            <MessageCircle size={13} color="#0F172A" />
          ) : isPayment ? (
            <CheckCircle2 size={13} color="#0F172A" />
          ) : (
            <ArrowRight size={13} color="#0F172A" />
          )}
          <Text style={[styles.actionBtnText, { color: '#0F172A' }]}>
            {currentAction.actionLabel || 'Consulter'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

// Alias pour compatibilité
export const UpdateNotificationBanner = ActionNotificationBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  otaContainer: {
    borderWidth: 1,
    borderColor: '#065F46',
    backgroundColor: '#06281E',
  },
  urgentBorder: {
    borderWidth: 1.5,
    borderColor: '#D97706',
    backgroundColor: '#1E180A',
  },
  normalBorder: {
    borderWidth: 1,
    borderColor: '#334155',
  },
  contentCol: {
    flex: 1,
    marginRight: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  counterBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  counterText: {
    fontSize: 9,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 2,
    marginLeft: 6,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  descText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  actionBtnPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnEmerald: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
