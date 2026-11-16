import os
import re

PATTERNS = re.compile(r"KeyboardAvoidingView|<Modal|react-native-modal|keyboard-aware-scroll-view|BottomSheet|softwareKeyboardLayoutMode")
TEXTINPUT_PATTERN = re.compile(r"<TextInput|TextInput\b")

inventaire_lines = []
fichiers_avec_saisie = set()

for app_name in ["locataire", "proprietaire", "agence"]:
    base_dir = os.path.join("native_apps", app_name)
    if not os.path.exists(base_dir):
        continue
    for root, dirs, files in os.walk(base_dir):
        # Exclude node_modules, .expo, dist
        if "node_modules" in root or ".expo" in root or "dist" in root:
            continue
        for file in files:
            if not file.endswith((".tsx", ".ts", ".jsx", ".js", ".json")):
                continue
            filepath = os.path.join(root, file)
            relpath = os.path.relpath(filepath, ".").replace("\\", "/")
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    lines = content.splitlines()
                    for idx, line in enumerate(lines, 1):
                        if PATTERNS.search(line):
                            inventaire_lines.append(f"{relpath}:{idx}:{line.strip()}")
                    if file.endswith((".tsx", ".jsx")) and TEXTINPUT_PATTERN.search(content):
                        fichiers_avec_saisie.add(relpath)
            except Exception as e:
                pass

with open("IC02_inventaire_clavier.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(inventaire_lines) + "\n")

sorted_fichiers = sorted(list(fichiers_avec_saisie))
with open("IC02_fichiers_avec_saisie.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(sorted_fichiers) + "\n")

print(f"Inventaire terminé : {len(inventaire_lines)} occurrences trouvées dans IC02_inventaire_clavier.txt")
print(f"Fichiers avec saisie : {len(sorted_fichiers)} fichiers trouvés dans IC02_fichiers_avec_saisie.txt")
