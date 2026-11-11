#!/usr/bin/env python3
"""
Script check_lexique (IC-01-R1 / Ticket E-08)
Grep des chaînes interdites définies dans config/lexique.json._interdits
dans les ressources mobiles (native_apps) et gabarits utilisateurs (SMS, PDF, templates).
"""

import json
import os
import sys
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEXIQUE_PATH = os.path.join(ROOT_DIR, "config", "lexique.json")

def load_prohibited():
    if not os.path.exists(LEXIQUE_PATH):
        print(f"❌ Erreur: {LEXIQUE_PATH} non trouvé.")
        sys.exit(1)
    with open(LEXIQUE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("_interdits", [])

TARGET_DIRS = [
    os.path.join(ROOT_DIR, "native_apps", "locataire", "app"),
    os.path.join(ROOT_DIR, "native_apps", "proprietaire", "app"),
    os.path.join(ROOT_DIR, "native_apps", "agence", "app"),
    os.path.join(ROOT_DIR, "src", "templates"),
]

EXCLUDED_EXTS = {".png", ".jpg", ".jpeg", ".ico", ".svg", ".lock", ".map"}

def scan():
    prohibited = load_prohibited()
    print(f"🔍 [check_lexique] Lancement de l'audit avec {len(prohibited)} motifs interdits...")
    violations = []

    for tdir in TARGET_DIRS:
        if not os.path.exists(tdir):
            continue
        for root, dirs, files in os.walk(tdir):
            if "node_modules" in root or ".git" in root or ".expo" in root:
                continue
            for f in files:
                _, ext = os.path.splitext(f)
                if ext in EXCLUDED_EXTS:
                    continue
                fpath = os.path.join(root, f)
                relpath = os.path.relpath(fpath, ROOT_DIR)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as file_obj:
                        lines = file_obj.readlines()
                    for idx, line in enumerate(lines, start=1):
                        # Ignorer les commentaires de code purs et imports techniques
                        stripped = line.strip()
                        if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
                            continue
                        if stripped.startswith("import ") or stripped.startswith("export *"):
                            continue
                        for word in prohibited:
                            if word in line:
                                violations.append({
                                    "file": relpath,
                                    "line": idx,
                                    "word": word,
                                    "content": stripped[:120]
                                })
                except Exception as e:
                    pass

    if violations:
        print(f"⚠️ {len(violations)} infraction(s) au lexique trouvée(s) :")
        for v in violations[:25]:
            print(f"  - [{v['word']}] {v['file']}:{v['line']} -> {v['content']}")
        if len(violations) > 25:
            print(f"  ... et {len(violations) - 25} autres infractions.")
        return False
    else:
        print("✅ [check_lexique] Succès : Zéro chaîne interdite dans les ressources analysées !")
        return True

if __name__ == "__main__":
    success = scan()
    sys.exit(0 if success else 1)

