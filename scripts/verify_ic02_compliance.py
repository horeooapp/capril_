import os
import re

# Match imports of KeyboardAvoidingView from 'react-native'
IMPORT_KAV = re.compile(r"import\s+{[^}]*KeyboardAvoidingView[^}]*}\s+from\s+['\"]react-native['\"]")

violations = []
for app in ["locataire", "proprietaire", "agence"]:
    base_dir = os.path.join("native_apps", app)
    for root, dirs, files in os.walk(base_dir):
        if "node_modules" in root or ".expo" in root or "dist" in root or "forms" in root:
            continue
        for file in files:
            if file.endswith((".tsx", ".ts", ".jsx", ".js")):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    if IMPORT_KAV.search(content):
                        violations.append(path.replace("\\", "/"))

print(f"Total violations of IC02-10: {len(violations)}")
for v in violations:
    print(" - Violation:", v)
