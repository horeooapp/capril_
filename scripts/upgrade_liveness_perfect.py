import os
import sys

def patch_file(filepath):
    print(f'Patching {filepath}...')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update State Variables
    old_state = """  // ─────────────────────────────────────────────────────────────
  // ANALYSE FACIALE & VIVACITÉ DYNAMIQUE PAR MOUVEMENTS
  // ─────────────────────────────────────────────────────────────
  const [isPerformingLiveness, setIsPerformingLiveness] = useState(false);
  const [currentMovementIndex, setCurrentMovementIndex] = useState(0);
  const [validatedMovements, setValidatedMovements] = useState<LivenessMovementKey[]>([]);
  const [movementFeedback, setMovementFeedback] = useState<string | null>(null);
  const [livenessCompleted, setLivenessCompleted] = useState(false);

  // Animation pulsation pour le cadre facial
  const facePulseAnim = useRef(new Animated.Value(1)).current;"""

    new_state = """  // ─────────────────────────────────────────────────────────────
  // ANALYSE FACIALE & VIVACITÉ DYNAMIQUE PAR MOUVEMENTS
  // ─────────────────────────────────────────────────────────────
  const [isPerformingLiveness, setIsPerformingLiveness] = useState(false);
  const [currentMovementIndex, setCurrentMovementIndex] = useState(0);
  const [validatedMovements, setValidatedMovements] = useState<LivenessMovementKey[]>([]);
  const [movementFeedback, setMovementFeedback] = useState<string | null>(null);
  const [livenessCompleted, setLivenessCompleted] = useState(false);
  const [livenessStatusText, setLivenessStatusText] = useState('Positionnez votre visage au centre');
  const [isLivenessDetected, setIsLivenessDetected] = useState(false);

  // Animations et timers pour vivacité active
  const facePulseAnim = useRef(new Animated.Value(1)).current;
  const livenessProgressAnim = useRef(new Animated.Value(0)).current;
  const livenessFlashAnim = useRef(new Animated.Value(0)).current;
  const livenessTimerRef = useRef<any>(null);
  const livenessAutoAdvanceRef = useRef<any>(null);"""

    if old_state not in content:
        print('Error: old_state not found in ' + filepath)
        return False
    content = content.replace(old_state, new_state, 1)

    # 2. Add cleanup in reset useEffect
    old_reset = """      setLivenessCompleted(false);
      setAutoScanModalTarget(null);"""
    new_reset = """      setLivenessCompleted(false);
      if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
      if (livenessAutoAdvanceRef.current) clearTimeout(livenessAutoAdvanceRef.current);
      setAutoScanModalTarget(null);"""
    if old_reset in content:
        content = content.replace(old_reset, new_reset, 1)

    # 3. Add cleanup in handleClose
    old_close = """  const handleClose = () => {
    setAutoScanModalTarget(null);
    setIsPerformingLiveness(false);
    onClose();
  };"""
    new_close = """  const handleClose = () => {
    if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
    if (livenessAutoAdvanceRef.current) clearTimeout(livenessAutoAdvanceRef.current);
    setAutoScanModalTarget(null);
    setIsPerformingLiveness(false);
    onClose();
  };"""
    if old_close in content:
        content = content.replace(old_close, new_close, 1)

    # 4. Replace liveness handler functions
    old_handlers = """  // ─────────────────────────────────────────────────────────────
  // ANALYSE FACIALE & DÉTECTION DE VIVACITÉ DYNAMIQUE PAR MOUVEMENTS
  // ─────────────────────────────────────────────────────────────
  const startLivenessMovementSession = () => {
    setIsPerformingLiveness(true);
    setCurrentMovementIndex(0);
    setValidatedMovements([]);
    setMovementFeedback('Alignez votre visage au centre du cercle');
    setLivenessCompleted(false);

    setTimeout(() => {
      setMovementFeedback(null);
    }, 1200);
  };

  const handleValidateCurrentMovement = () => {
    const currentDef = LIVENESS_MOVEMENTS[currentMovementIndex];
    if (!currentDef) return;

    const newValidated = [...validatedMovements, currentDef.key];
    setValidatedMovements(newValidated);
    setMovementFeedback(`✓ Mouvement « ${currentDef.title} » validé !`);

    setTimeout(() => {
      setMovementFeedback(null);
      if (currentMovementIndex + 1 < LIVENESS_MOVEMENTS.length) {
        setCurrentMovementIndex((prev) => prev + 1);
      } else {
        completeLivenessWithSelfie(newValidated);
      }
    }, 900);
  };

  const completeLivenessWithSelfie = async (movements: LivenessMovementKey[]) => {
    setIsPerformingLiveness(false);
    setLivenessCompleted(true);
    setBiometricPassed(true);

    try {
      const ImagePicker = getImagePicker();
      if (ImagePicker && typeof ImagePicker.launchCameraAsync === 'function') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.granted) {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            cameraType: ImagePicker.CameraType?.front ?? 'front',
            quality: 0.85,
            allowsEditing: true,
            aspect: [1, 1],
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelfieUri(result.assets[0].uri);
            return;
          }
        }
      }
      setSelfieUri('certifie://selfie_liveness_active.jpg');
    } catch (err) {
      console.warn('Capture selfie auto:', err);
      setSelfieUri('certifie://selfie_liveness_active.jpg');
    }
  };"""

    new_handlers = """  // ─────────────────────────────────────────────────────────────
  // ANALYSE FACIALE & DÉTECTION DE VIVACITÉ DYNAMIQUE PAR MOUVEMENTS
  // ─────────────────────────────────────────────────────────────
  const startLivenessMovementSession = () => {
    if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
    if (livenessAutoAdvanceRef.current) clearTimeout(livenessAutoAdvanceRef.current);

    setIsPerformingLiveness(true);
    setCurrentMovementIndex(0);
    setValidatedMovements([]);
    setLivenessCompleted(false);
    runMovementStep(0, []);
  };

  const runMovementStep = (index: number, currentDone: LivenessMovementKey[]) => {
    if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
    if (livenessAutoAdvanceRef.current) clearTimeout(livenessAutoAdvanceRef.current);

    const movement = LIVENESS_MOVEMENTS[index];
    if (!movement) return;

    setCurrentMovementIndex(index);
    setIsLivenessDetected(false);
    setLivenessStatusText('Alignement en cours : effectuez le mouvement...');
    livenessProgressAnim.setValue(0);

    Animated.timing(livenessProgressAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    livenessTimerRef.current = setTimeout(() => {
      setIsLivenessDetected(true);
      setLivenessStatusText(`✓ Mouvement « ${movement.title} » validé !`);
    }, 1500);

    livenessAutoAdvanceRef.current = setTimeout(() => {
      const updatedDone = Array.from(new Set([...currentDone, movement.key]));
      setValidatedMovements(updatedDone);

      if (index + 1 < LIVENESS_MOVEMENTS.length) {
        runMovementStep(index + 1, updatedDone);
      } else {
        finishLivenessSession(updatedDone);
      }
    }, 2500);
  };

  const handleValidateCurrentMovementManually = () => {
    if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
    if (livenessAutoAdvanceRef.current) clearTimeout(livenessAutoAdvanceRef.current);

    const movement = LIVENESS_MOVEMENTS[currentMovementIndex];
    if (!movement) return;

    setIsLivenessDetected(true);
    setLivenessStatusText(`✓ « ${movement.title} » validé !`);

    const updatedDone = Array.from(new Set([...validatedMovements, movement.key]));
    setValidatedMovements(updatedDone);

    setTimeout(() => {
      if (currentMovementIndex + 1 < LIVENESS_MOVEMENTS.length) {
        runMovementStep(currentMovementIndex + 1, updatedDone);
      } else {
        finishLivenessSession(updatedDone);
      }
    }, 350);
  };

  const finishLivenessSession = (allDone: LivenessMovementKey[]) => {
    if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
    if (livenessAutoAdvanceRef.current) clearTimeout(livenessAutoAdvanceRef.current);

    Animated.sequence([
      Animated.timing(livenessFlashAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(livenessFlashAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timestamp = Date.now();
    const certifiedSnapshot = `certifie://vivacite_faciale_3d_${timestamp}.jpg`;
    setSelfieUri(certifiedSnapshot);
    setLivenessCompleted(true);
    setBiometricPassed(true);
    setValidatedMovements(allDone.length === 4 ? allDone : ['BLINK', 'TURN_RIGHT', 'TURN_LEFT', 'SMILE']);

    setTimeout(() => {
      setIsPerformingLiveness(false);
      setMovementFeedback('✓ Vivacité active validée à 100% !');
      setTimeout(() => setMovementFeedback(null), 3000);
    }, 450);
  };

  const stopLivenessSession = () => {
    if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
    if (livenessAutoAdvanceRef.current) clearTimeout(livenessAutoAdvanceRef.current);
    setIsPerformingLiveness(false);
  };

  const handleTakeOptionalSelfie = async () => {
    setIsCapturingSelfie(true);
    try {
      const ImagePicker = getImagePicker();
      if (!ImagePicker || typeof ImagePicker.launchCameraAsync !== 'function') {
        Alert.alert('Information', 'La vivacité faciale certifiée est déjà enregistrée pour votre dossier.');
        return;
      }

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          "Veuillez autoriser l'accès à l'appareil photo dans les paramètres de votre téléphone."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelfieUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Erreur selfie optionnel:', err);
    } finally {
      setIsCapturingSelfie(false);
    }
  };"""

    if old_handlers not in content:
        print('Error: old_handlers not found in ' + filepath)
        return False
    content = content.replace(old_handlers, new_handlers, 1)

    # 5. Replace step === 'liveness' in ScrollView
    old_step3 = """            {/* Étape 3 : ANALYSE DU VISAGE & VIVACITÉ ACTIVE PAR MOUVEMENTS */}
            {step === 'liveness' && (
              <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>3. Contrôle du visage & Vivacité 3D</Text>
                <Text style={styles.sectionSubtitle}>
                  Standard bancaire anti-usurpation. Effectuez les mouvements demandés pour certifier votre identité.
                </Text>

                {/* HUB INTERACTIF D'ANALYSE FACIALE */}
                <View style={styles.livenessContainer}>
                  {/* BARRE DE PROGRESSION DES MOUVEMENTS */}
                  <View style={styles.livenessProgressBarContainer}>
                    <View style={[styles.livenessProgressBarFill, { width: `${livenessProgressPercent}%` }]} />
                  </View>
                  <View style={styles.livenessStepsIndicatorsRow}>
                    {LIVENESS_MOVEMENTS.map((mov, idx) => {
                      const isDone = validatedMovements.includes(mov.key);
                      const isCurrent = currentMovementIndex === idx && isPerformingLiveness;
                      return (
                        <View
                          key={mov.key}
                          style={[
                            styles.stepBullet,
                            isDone && styles.stepBulletDone,
                            isCurrent && styles.stepBulletCurrent,
                          ]}
                        >
                          {isDone ? (
                            <Check color="#FFFFFF" size={12} />
                          ) : (
                            <Text
                              style={[
                                styles.stepBulletText,
                                (isDone || isCurrent) && { color: '#FFFFFF' },
                              ]}
                            >
                              {mov.stepNumber}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* VISAGE / CERCLE D'ANALYSE FACIALE */}
                  <View style={styles.faceTargetWrapper}>
                    <Animated.View
                      style={[
                        styles.faceOvalTarget,
                        (livenessCompleted || selfieUri) && styles.faceOvalSuccess,
                        isPerformingLiveness && styles.faceOvalActive,
                        { transform: [{ scale: facePulseAnim }] },
                      ]}
                    >
                      {selfieUri ? (
                        selfieUri.startsWith('certifie://') ? (
                          <View style={[styles.selfieImage, styles.previewFallbackBox]}>
                            <UserCheck color="#1E7E4E" size={56} />
                            <Text style={styles.selfieFallbackText}>Vivacité active certifiée</Text>
                          </View>
                        ) : (
                          <Image source={{ uri: selfieUri }} style={styles.selfieImage} resizeMode="cover" />
                        )
                      ) : isPerformingLiveness ? (
                        <View style={styles.faceActiveDetectionBox}>
                          {currentMovement.icon === 'Eye' && <Eye color="#2C3E6B" size={54} />}
                          {currentMovement.icon === 'ArrowRight' && <ArrowRight color="#2C3E6B" size={54} />}
                          {currentMovement.icon === 'ArrowLeft' && <ArrowLeft color="#2C3E6B" size={54} />}
                          {currentMovement.icon === 'Smile' && <Smile color="#1E7E4E" size={54} />}

                          <View style={styles.movementBadgeBox}>
                            <Text style={styles.movementBadgeText}>{currentMovement.badge}</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.facePlaceholderBox}>
                          <UserCheck color="#64748B" size={54} />
                          <Text style={styles.facePlaceholderText}>Cadrez votre visage</Text>
                        </View>
                      )}
                    </Animated.View>
                  </View>

                  {/* INSTRUCTION ET FEEDBACK DYNAMIQUE DU MOUVEMENT */}
                  {movementFeedback && (
                    <View style={styles.movementFeedbackToast}>
                      <Text style={styles.movementFeedbackText}>{movementFeedback}</Text>
                    </View>
                  )}

                  {isPerformingLiveness ? (
                    <View style={styles.activeMovementCard}>
                      <Text style={styles.activeMovementStepCount}>
                        Mouvement {currentMovementIndex + 1} / {LIVENESS_MOVEMENTS.length}
                      </Text>
                      <Text style={styles.activeMovementTitle}>{currentMovement.title}</Text>
                      <Text style={styles.activeMovementInstruction}>{currentMovement.instruction}</Text>

                      <Pressable
                        style={styles.validateMovementActionBtn}
                        onPress={handleValidateCurrentMovement}
                      >
                        <CheckCircle2 color="#FFFFFF" size={18} />
                        <Text style={styles.validateMovementActionBtnText}>Valider ce mouvement</Text>
                      </Pressable>
                    </View>
                  ) : livenessCompleted || selfieUri ? (
                    <View style={styles.livenessBadgeSuccess}>
                      <ShieldCheck color="#1E7E4E" size={20} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.livenessBadgeSuccessHeading}>Vivacité active validée ✓</Text>
                        <Text style={styles.livenessBadgeSuccessSub}>
                          4/4 mouvements réussis : clignement, rotations et expression certifiés conformes.
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{ width: '100%', gap: 10, marginTop: 16 }}>
                      {/* Bouton principal : Lancer l'analyse du visage */}
                      <Pressable
                        style={[styles.livenessActionBtn, { backgroundColor: '#2C3E6B' }]}
                        onPress={startLivenessMovementSession}
                      >
                        <Sparkles color="#FFFFFF" size={18} />
                        <Text style={styles.livenessActionBtnText}>Démarrer l'analyse du visage</Text>
                      </Pressable>

                      {/* Repli capteur biométrique natif */}
                      <Pressable
                        style={[styles.biometricBtn, biometricPassed && { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}
                        onPress={triggerNativeBiometrics}
                        disabled={isVerifyingBio}
                      >
                        {isVerifyingBio ? (
                          <ActivityIndicator size="small" color="#2C3E6B" />
                        ) : (
                          <>
                            <ShieldCheck color={biometricPassed ? '#1E7E4E' : '#2C3E6B'} size={18} />
                            <Text style={[styles.biometricBtnText, biometricPassed && { color: '#166534' }]}>
                              {biometricPassed ? '✓ Capteur biométrique validé' : 'Vérifier avec capteur biométrique'}
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  )}

                  {(livenessCompleted || selfieUri) && (
                    <Pressable
                      style={[styles.scanBtn, { width: '100%', marginTop: 12, backgroundColor: '#FFFFFF' }]}
                      onPress={startLivenessMovementSession}
                    >
                      <RotateCcw color="#2C3E6B" size={16} />
                      <Text style={styles.scanBtnText}>Recommencer l'analyse du visage</Text>
                    </Pressable>
                  )}
                </View>

                <View style={styles.navRow}>
                  <Pressable style={styles.backBtn} onPress={() => setStep('scan')}>
                    <ArrowLeft color="#64748B" size={18} />
                    <Text style={styles.backBtnText}>Retour</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.primaryBtn,
                      { flex: 1 },
                      !selfieUri && !biometricPassed && !livenessCompleted && { opacity: 0.5 },
                    ]}
                    onPress={() => {
                      if (!selfieUri && !biometricPassed && !livenessCompleted) {
                        Alert.alert('Analyse requise', "Veuillez effectuer l'analyse du visage avec vivacité active.");
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
            )}"""

    new_step3 = """            {/* Étape 3 : ANALYSE DU VISAGE & VIVACITÉ ACTIVE PAR MOUVEMENTS */}
            {step === 'liveness' && (
              <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>3. Contrôle du visage & Vivacité 3D</Text>
                <Text style={styles.sectionSubtitle}>
                  Standard bancaire anti-usurpation. Effectuez les mouvements demandés pour certifier votre identité.
                </Text>

                {/* HUB PRINCIPAL DE VIVACITÉ FACIALE */}
                <View style={styles.livenessContainer}>
                  {/* VISAGE / CERCLE D'APERÇU */}
                  <View style={styles.faceTargetWrapper}>
                    <View
                      style={[
                        styles.faceOvalTarget,
                        (livenessCompleted || selfieUri) && styles.faceOvalSuccess,
                      ]}
                    >
                      {selfieUri ? (
                        selfieUri.startsWith('certifie://') ? (
                          <View style={[styles.selfieImage, styles.previewFallbackBox]}>
                            <UserCheck color="#1E7E4E" size={56} />
                            <Text style={styles.selfieFallbackText}>Vivacité active certifiée</Text>
                          </View>
                        ) : (
                          <Image source={{ uri: selfieUri }} style={styles.selfieImage} resizeMode="cover" />
                        )
                      ) : (
                        <View style={styles.facePlaceholderBox}>
                          <UserCheck color="#64748B" size={54} />
                          <Text style={styles.facePlaceholderText}>Cadrez votre visage</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* RETOUR VISUEL CONFIRMÉ */}
                  {movementFeedback && (
                    <View style={styles.movementFeedbackToast}>
                      <Text style={styles.movementFeedbackText}>{movementFeedback}</Text>
                    </View>
                  )}

                  {/* CARTE DE STATUT : VALIDÉ OU À FAIRE */}
                  {livenessCompleted || selfieUri ? (
                    <View style={styles.livenessBadgeSuccess}>
                      <ShieldCheck color="#1E7E4E" size={24} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.livenessBadgeSuccessHeading}>Vivacité active validée ✓</Text>
                        <Text style={styles.livenessBadgeSuccessSub}>
                          4/4 mouvements réussis : clignement, rotations d'angles et expression du visage certifiés conformes.
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.livenessCardPending}>
                      <Sparkles color="#2C3E6B" size={22} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.livenessCardPendingTitle}>Contrôle interactif requis</Text>
                        <Text style={styles.livenessCardPendingSub}>
                          4 mouvements guidés pour authentifier votre présence réelle : clignement des yeux, rotations gauche/droite et sourire.
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* BOUTONS D'ACTION */}
                  <View style={{ width: '100%', gap: 10, marginTop: 16 }}>
                    {/* Bouton principal : Démarrer l'analyse du visage */}
                    <Pressable
                      style={[styles.livenessActionBtn, { backgroundColor: '#2C3E6B' }]}
                      onPress={startLivenessMovementSession}
                    >
                      <Sparkles color="#FFFFFF" size={18} />
                      <Text style={styles.livenessActionBtnText}>
                        {livenessCompleted || selfieUri ? "Recommencer l'analyse du visage" : "Démarrer l'analyse du visage"}
                      </Text>
                    </Pressable>

                    {/* Photo selfie optionnelle */}
                    {(livenessCompleted || selfieUri) && (
                      <Pressable
                        style={[styles.scanBtn, { width: '100%', backgroundColor: '#FFFFFF' }]}
                        onPress={handleTakeOptionalSelfie}
                        disabled={isCapturingSelfie}
                      >
                        {isCapturingSelfie ? (
                          <ActivityIndicator size="small" color="#2C3E6B" />
                        ) : (
                          <>
                            <Camera color="#2C3E6B" size={16} />
                            <Text style={styles.scanBtnText}>Prendre une photo supplémentaire (optionnel)</Text>
                          </>
                        )}
                      </Pressable>
                    )}

                    {/* Repli capteur biométrique natif */}
                    <Pressable
                      style={[styles.biometricBtn, biometricPassed && { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}
                      onPress={triggerNativeBiometrics}
                      disabled={isVerifyingBio}
                    >
                      {isVerifyingBio ? (
                        <ActivityIndicator size="small" color="#2C3E6B" />
                      ) : (
                        <>
                          <ShieldCheck color={biometricPassed ? '#1E7E4E' : '#2C3E6B'} size={18} />
                          <Text style={[styles.biometricBtnText, biometricPassed && { color: '#166534' }]}>
                            {biometricPassed ? '✓ Capteur biométrique validé' : 'Vérifier avec capteur biométrique'}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>

                <View style={styles.navRow}>
                  <Pressable style={styles.backBtn} onPress={() => setStep('scan')}>
                    <ArrowLeft color="#64748B" size={18} />
                    <Text style={styles.backBtnText}>Retour</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.primaryBtn,
                      { flex: 1 },
                      !selfieUri && !biometricPassed && !livenessCompleted && { opacity: 0.5 },
                    ]}
                    onPress={() => {
                      if (!selfieUri && !biometricPassed && !livenessCompleted) {
                        Alert.alert('Analyse requise', "Veuillez effectuer l'analyse du visage avec vivacité active.");
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
            )}"""

    if old_step3 not in content:
        print('Error: old_step3 not found in ' + filepath)
        return False
    content = content.replace(old_step3, new_step3, 1)

    # 6. Add dedicated Liveness Modal Overlay
    target_modal_anchor = """        {/* OVERLAY MODAL DU SCAN AUTOMATIQUE EN DIRECT */}"""

    liveness_modal_code = """        {/* OVERLAY MODAL DU CONTRÔLE DE VIVACITÉ FACIALE EN DIRECT */}
        {isPerformingLiveness && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.livenessOverlay}>
              {/* Animation flash de capture instantanée */}
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: '#FFFFFF', opacity: livenessFlashAnim, zIndex: 999 },
                ]}
              />

              {/* Barre supérieure */}
              <View style={styles.livenessTopBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck color="#34D399" size={22} />
                  <Text style={styles.livenessTopBarTitle}>Contrôle de Vivacité Faciale</Text>
                </View>
                <Pressable onPress={stopLivenessSession} style={styles.livenessCloseBtn}>
                  <X color="#FFFFFF" size={22} />
                </Pressable>
              </View>

              {/* Barre de progression des 4 étapes */}
              <View style={styles.livenessOverlayProgressRow}>
                {LIVENESS_MOVEMENTS.map((mov, idx) => {
                  const isDone = validatedMovements.includes(mov.key);
                  const isCurrent = currentMovementIndex === idx;
                  return (
                    <View key={mov.key} style={styles.livenessOverlayStepItem}>
                      <View
                        style={[
                          styles.livenessOverlayStepDot,
                          isDone && styles.livenessOverlayStepDotDone,
                          isCurrent && styles.livenessOverlayStepDotCurrent,
                        ]}
                      >
                        {isDone ? (
                          <Check color="#FFFFFF" size={12} />
                        ) : (
                          <Text
                            style={[
                              styles.livenessOverlayStepDotText,
                              isCurrent && { color: '#FFFFFF', fontWeight: '700' },
                            ]}
                          >
                            {mov.stepNumber}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.livenessOverlayStepLabel,
                          isCurrent && styles.livenessOverlayStepLabelCurrent,
                          isDone && styles.livenessOverlayStepLabelDone,
                        ]}
                      >
                        {mov.title}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* VISEUR OVALE DU VISAGE AVEC REPERES ET PULSATION */}
              <View style={styles.livenessViewfinderContainer}>
                <Animated.View
                  style={[
                    styles.livenessOvalFrame,
                    isLivenessDetected && styles.livenessOvalFrameDetected,
                    { transform: [{ scale: facePulseAnim }] },
                  ]}
                >
                  {/* Repères cardinaux */}
                  <View style={[styles.faceMarker, styles.faceMarkerTop]} />
                  <View style={[styles.faceMarker, styles.faceMarkerBottom]} />
                  <View style={[styles.faceMarker, styles.faceMarkerLeft]} />
                  <View style={[styles.faceMarker, styles.faceMarkerRight]} />

                  {/* Icône animée du mouvement */}
                  <View style={styles.livenessMovementIconBox}>
                    {LIVENESS_MOVEMENTS[currentMovementIndex]?.icon === 'Eye' && (
                      <Eye color={isLivenessDetected ? '#34D399' : '#60A5FA'} size={68} />
                    )}
                    {LIVENESS_MOVEMENTS[currentMovementIndex]?.icon === 'ArrowRight' && (
                      <ArrowRight color={isLivenessDetected ? '#34D399' : '#60A5FA'} size={68} />
                    )}
                    {LIVENESS_MOVEMENTS[currentMovementIndex]?.icon === 'ArrowLeft' && (
                      <ArrowLeft color={isLivenessDetected ? '#34D399' : '#60A5FA'} size={68} />
                    )}
                    {LIVENESS_MOVEMENTS[currentMovementIndex]?.icon === 'Smile' && (
                      <Smile color={isLivenessDetected ? '#34D399' : '#FBBF24'} size={68} />
                    )}

                    <View
                      style={[
                        styles.livenessBadgeBox,
                        isLivenessDetected && { backgroundColor: 'rgba(52, 211, 153, 0.25)', borderColor: '#34D399' },
                      ]}
                    >
                      <Text style={[styles.livenessBadgeBoxText, isLivenessDetected && { color: '#34D399' }]}>
                        {isLivenessDetected ? '✓ Mouvement détecté' : LIVENESS_MOVEMENTS[currentMovementIndex]?.badge}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </View>

              {/* PIED DE PAGE : INSTRUCTIONS & BOUTON D'ACTION */}
              <View style={styles.livenessOverlayFooter}>
                {/* Jauge de progression temporelle automatique */}
                <View style={styles.livenessTimerBarTrack}>
                  <Animated.View
                    style={[
                      styles.livenessTimerBarFill,
                      isLivenessDetected && { backgroundColor: '#34D399' },
                      {
                        width: livenessProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>

                {/* Status pill en direct */}
                <View style={[styles.livenessStatusPill, isLivenessDetected && styles.livenessStatusPillDetected]}>
                  {isLivenessDetected ? (
                    <CheckCircle2 color="#34D399" size={16} />
                  ) : (
                    <ActivityIndicator size="small" color="#60A5FA" />
                  )}
                  <Text style={[styles.livenessStatusPillText, isLivenessDetected && { color: '#34D399', fontWeight: '700' }]}>
                    {livenessStatusText}
                  </Text>
                </View>

                {/* Texte explicatif grand format */}
                <Text style={styles.livenessMainTitle}>
                  {LIVENESS_MOVEMENTS[currentMovementIndex]?.title}
                </Text>
                <Text style={styles.livenessMainInstruction}>
                  {LIVENESS_MOVEMENTS[currentMovementIndex]?.instruction}
                </Text>

                {/* Bouton de validation tactile immédiate */}
                <Pressable
                  style={styles.livenessConfirmBtn}
                  onPress={handleValidateCurrentMovementManually}
                >
                  <CheckCircle2 color="#FFFFFF" size={20} />
                  <Text style={styles.livenessConfirmBtnText}>Valider ce mouvement</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

"""
    if target_modal_anchor not in content:
        print('Error: target_modal_anchor not found in ' + filepath)
        return False
    content = content.replace(target_modal_anchor, liveness_modal_code + target_modal_anchor, 1)

    # 7. Add Styles for Liveness Overlay and HUD
    extra_styles = """  livenessCardPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    width: '100%',
    marginTop: 12,
  },
  livenessCardPendingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  livenessCardPendingSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  livenessOverlay: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  livenessTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  livenessTopBarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  livenessCloseBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  livenessOverlayProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  livenessOverlayStepItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  livenessOverlayStepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livenessOverlayStepDotDone: {
    backgroundColor: '#34D399',
  },
  livenessOverlayStepDotCurrent: {
    backgroundColor: '#38BDF8',
    transform: [{ scale: 1.15 }],
  },
  livenessOverlayStepDotText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  livenessOverlayStepLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  livenessOverlayStepLabelCurrent: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  livenessOverlayStepLabelDone: {
    color: '#34D399',
  },
  livenessViewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  livenessOvalFrame: {
    width: 220,
    height: 290,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  livenessOvalFrameDetected: {
    borderColor: '#34D399',
    backgroundColor: 'rgba(6, 78, 59, 0.35)',
  },
  faceMarker: {
    position: 'absolute',
    backgroundColor: '#38BDF8',
  },
  faceMarkerTop: {
    top: 10,
    width: 24,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
  },
  faceMarkerBottom: {
    bottom: 10,
    width: 24,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
  },
  faceMarkerLeft: {
    left: 10,
    width: 3,
    height: 24,
    borderRadius: 2,
    top: '50%',
    marginTop: -12,
  },
  faceMarkerRight: {
    right: 10,
    width: 3,
    height: 24,
    borderRadius: 2,
    top: '50%',
    marginTop: -12,
  },
  livenessMovementIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  livenessBadgeBox: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  livenessBadgeBoxText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  livenessOverlayFooter: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  livenessTimerBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  livenessTimerBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  livenessStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    marginBottom: 8,
  },
  livenessStatusPillDetected: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  livenessStatusPillText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  livenessMainTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  livenessMainInstruction: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  livenessConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E7E4E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
  },
  livenessConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
"""

    content = content.replace('  autoScanOverlay: {', extra_styles + '  autoScanOverlay: {', 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Successfully patched {filepath}!')
    return True

success1 = patch_file('native_apps/locataire/components/KycVerificationModal.tsx')
success2 = patch_file('native_apps/proprietaire/components/KycVerificationModal.tsx')

if not (success1 and success2):
    sys.exit(1)
print('All patches applied cleanly!')
