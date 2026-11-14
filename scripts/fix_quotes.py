import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Problematic lines where single-quoted string has unescaped apostrophes
    replacements = [
        ("Alert.alert('Date invalide', 'Veuillez renseigner une date d'expiration valide (JJ/MM/AAAA).');",
         'Alert.alert("Date invalide", "Veuillez renseigner une date d\'expiration valide (JJ/MM/AAAA).");'),
        ("Alert.alert('Date invalide', 'Veuillez renseigner une date d\\'expiration valide (JJ/MM/AAAA).');",
         'Alert.alert("Date invalide", "Veuillez renseigner une date d\'expiration valide (JJ/MM/AAAA).");'),
        ("instruction: 'Fixez l'écran droit devant et clignez des yeux 2 fois.',",
         'instruction: "Fixez l\'écran droit devant et clignez des yeux 2 fois.",'),
        ("badge: 'Analyse d'angle 3D',",
         'badge: "Analyse d\'angle 3D",'),
        ("badge: 'Détection d'expression',",
         'badge: "Détection d\'expression",'),
        ("title: 'Souriez face à l'objectif',",
         'title: "Souriez face à l\'objectif",'),
        ("Alert.alert('Contrôle biométrique requis', 'Veuillez effectuer l'analyse du visage avec vivacité active.');",
         'Alert.alert("Contrôle biométrique requis", "Veuillez effectuer l\'analyse du visage avec vivacité active.");'),
        ("desc: 'CNI ivoirienne, Passeport biométrique ou Carte de résident.'",
         'desc: "CNI ivoirienne, Passeport biométrique ou Carte de résident."'),
        ("desc: 'Scan automatique intelligent avec détection des bords et contrôle de netteté.'",
         'desc: "Scan automatique intelligent avec détection des bords et contrôle de netteté."'),
        ("desc: 'Vérification 3D interactive (clignement, rotation, sourire) anti-usurpation.'",
         'desc: "Vérification 3D interactive (clignement, rotation, sourire) anti-usurpation."'),
        ("desc: 'Wave, Orange Money, MTN MoMo ou Moov Money au même nom certifié.'",
         'desc: "Wave, Orange Money, MTN MoMo ou Moov Money au même nom certifié."'),
        ("label: 'Carte Nationale d\'Identité (CNI)', desc: 'Format carte bancaire biométrique CNI Côte d\'Ivoire'",
         'label: "Carte Nationale d\'Identité (CNI)", desc: "Format carte bancaire biométrique CNI Côte d\'Ivoire"'),
        ("label: 'Carte de résident', desc: 'Titre de séjour légal délivré par l\'ONECI'",
         'label: "Carte de résident", desc: "Titre de séjour légal délivré par l\'ONECI"'),
        ("placeholder: 'Ex : C0123456789'",
         'placeholder: "Ex : C0123456789"'),
        ("Text style={styles.sectionSubtitle}>Placez votre pièce dans le viseur : l'alignement et le déclenchement se font automatiquement.",
         'Text style={styles.sectionSubtitle}>Placez votre pièce dans le viseur : l\'alignement et le déclenchement se font automatiquement.'),
        ("Alert.alert('Analyse requise', 'Veuillez effectuer l'analyse du visage avec vivacité active.');",
         'Alert.alert("Analyse requise", "Veuillez effectuer l\'analyse du visage avec vivacité active.");'),
        ("{autoScanStatus === 'aligning' && 'Positionnez votre pièce d'identité dans le cadre...'}",
         '{autoScanStatus === \'aligning\' && "Positionnez votre pièce d\'identité dans le cadre..."}'),
        ("Démarrer l'analyse du visage",
         'Démarrer l\'analyse du visage'),
        ("Recommencer l'analyse du visage",
         'Recommencer l\'analyse du visage'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    # Let's also do regex for any Alert.alert or text with d'
    content = re.sub(r"'([^']*?)d'([^']*?)'", r'"\1d\'\2"', content)
    content = re.sub(r"'([^']*?)l'([^']*?)'", r'"\1l\'\2"', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed {filepath}')

fix_file('native_apps/locataire/components/KycVerificationModal.tsx')
fix_file('native_apps/proprietaire/components/KycVerificationModal.tsx')
