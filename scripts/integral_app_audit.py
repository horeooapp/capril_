import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 80)
print("🔍 AUDIT INTÉGRAL DE L'APPLICATION QAPRIL (CODE, BOUTONS, ROUTES, SÉCURITÉ)")
print("=" * 80)

# 1. Cartographie de toutes les routes existantes dans `src/app`
existing_routes = set()
for root, dirs, files in os.walk("src/app"):
    if "page.tsx" in files or "page.ts" in files or "route.ts" in files or "route.tsx" in files:
        rel = os.path.relpath(root, "src/app").replace("\\", "/")
        if rel == ".":
            route = "/"
        else:
            # clean route groups (group), [param]
            segments = rel.split("/")
            cleaned_segments = [s for s in segments if not (s.startswith("(") and s.endswith(")"))]
            route = "/" + "/".join(cleaned_segments)
        existing_routes.add(route)

print(f"\n✅ Total des routes applicatives identifiées : {len(existing_routes)}")

# 2. Analyse des boutons orphelins ou sans action
button_regex = re.compile(r'<button\b([^>]*)>', re.IGNORECASE)
link_regex = re.compile(r'<Link\b([^>]*)href=["\']([^"\']+)["\']', re.IGNORECASE)
router_push_regex = re.compile(r'router\.push\(["\']([^"\']+)["\']\)')

suspicious_buttons = []
empty_handlers = []
broken_links = []

scan_dirs = ["src/app", "src/components"]

for sdir in scan_dirs:
    for root, _, files in os.walk(sdir):
        for f in files:
            if f.endswith((".tsx", ".jsx")):
                path = os.path.join(root, f).replace("\\", "/")
                with open(path, "r", encoding="utf-8", errors="ignore") as file_content:
                    lines = file_content.readlines()

                content_str = "".join(lines)

                # Chercher les handlers vides : onClick={() => {}} ou alert('TODO')
                for idx, line in enumerate(lines):
                    line_num = idx + 1
                    if re.search(r'onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}', line):
                        empty_handlers.append((path, line_num, "onClick={() => {}} vide"))
                    elif re.search(r'onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*alert\(', line):
                        empty_handlers.append((path, line_num, "onClick avec alert temporaire"))
                    elif re.search(r'href\s*=\s*["\']#["\']', line):
                        # ignorer s'il y a un onClick actif
                        if "onClick" not in line:
                            empty_handlers.append((path, line_num, 'href="#" sans onClick'))

                # Chercher les boutons sans onClick, sans type="submit", sans formAction
                for idx, line in enumerate(lines):
                    if "<button" in line:
                        chunk = "".join(lines[idx:min(idx + 7, len(lines))])
                        m = button_regex.search(chunk)
                        if m:
                            attrs = m.group(1)
                            # Vérifier si submit, onClick, formAction, asChild ou disabled
                            has_action = any(k in attrs for k in ["onClick", 'type="submit"', "type='submit'", "formAction", "asChild", "role="])
                            if not has_action and "hidden" not in attrs:
                                # Vérifier si bouton encapsulé dans un <form> parent
                                suspicious_buttons.append((path, idx + 1, line.strip()[:90]))

                # Vérifier les liens Link internes
                for m in link_regex.finditer(content_str):
                    href = m.group(2)
                    if href.startswith("/") and not href.startswith("//") and not href.startswith("/api/"):
                        # Normaliser href
                        clean_href = href.split("?")[0].split("#")[0]
                        # check dynamic [id] or exact match
                        # match against existing_routes
                        matched = False
                        if clean_href in existing_routes:
                            matched = True
                        else:
                            # check pattern matching for dynamic segments
                            href_parts = clean_href.strip("/").split("/")
                            for r in existing_routes:
                                r_parts = r.strip("/").split("/")
                                if len(r_parts) == len(href_parts):
                                    match_all = True
                                    for rp, hp in zip(r_parts, href_parts):
                                        if rp.startswith("[") and rp.endswith("]"):
                                            continue
                                        if rp != hp:
                                            match_all = False
                                            break
                                    if match_all:
                                        matched = True
                                        break
                        if not matched and clean_href not in ["/", "/login", "/register", "/connexion", "/dashboard", "/admin", "/marketplace", "/mon-espace-locataire"]:
                            broken_links.append((path, href))

print("\n--- RAPPORT INTERACTIF DES COMPOSANTS ---")
print(f"Boutons suspects sans handler explicite : {len(suspicious_buttons)}")
print(f"Handlers vides ou provisoires (alert, empty) : {len(empty_handlers)}")
print(f"Liens potentiellement orphelins : {len(broken_links)}")

if empty_handlers:
    print("\n⚠️ DÉTAILS DES HANDLERS VIDES / TEMPORAIRES :")
    for p, lnum, reason in empty_handlers[:20]:
        print(f"  - {p}:{lnum} ➔ {reason}")

if suspicious_buttons:
    print("\n⚠️ EXEMPLES DE BOUTONS SANS HANDLER EXPLICITE :")
    for p, lnum, code in suspicious_buttons[:15]:
        print(f"  - {p}:{lnum} ➔ {code}")

if broken_links:
    print("\n⚠️ EXEMPLES DE LIENS NON RÉSOLUS :")
    for p, href in broken_links[:15]:
        print(f"  - {p} ➔ {href}")

# 3. Audit des Server Actions dans `src/actions`
print("\n" + "=" * 80)
print("🔒 AUDIT DES ACTIONS SERVEUR (SÉCURITÉ & GESTION DES RÔLES)")
print("=" * 80)

actions_dir = "src/actions"
actions_files = [os.path.join(actions_dir, f) for f in os.listdir(actions_dir) if f.endswith(".ts")]
print(f"Nombre de fichiers Server Actions : {len(actions_files)}")

actions_without_auth = []
for afile in actions_files:
    with open(afile, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    # Check exported async function
    exports = re.findall(r'export\s+async\s+function\s+([a-zA-Z0-9_]+)', content)
    has_auth_import = "auth" in content or "session" in content or "getServerSession" in content
    if not has_auth_import and exports:
        actions_without_auth.append((afile, exports))

print(f"Fichiers d'actions sans vérification d'authentification apparente : {len(actions_without_auth)}")
for af, exp in actions_without_auth:
    print(f"  - {af} : {exp[:4]}")

print("\nAudit statique terminé.")

