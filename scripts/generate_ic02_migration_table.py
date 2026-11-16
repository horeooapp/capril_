import zipfile

rows = [
    ["Fichier", "Rôle", "Composant utilisé", "Appareil (a) <6\"", "Appareil (b) Android 15/16", "Appareil (c) Android <=13", "Observation"],
    ["native_apps/locataire/app/login.tsx", "Locataire", "FormScreen", "CONFORME", "CONFORME", "CONFORME", "Formulaire OTP sécurisé, champ actif remonte, pas de recouvrement"],
    ["native_apps/locataire/app/(tabs)/chat.tsx", "Locataire", "KeyboardAvoidingView (controller)", "CONFORME", "CONFORME", "CONFORME", "Barre de saisie sticky au-dessus du clavier, défilement fluide des messages"],
    ["native_apps/locataire/app/(tabs)/maintenance.tsx", "Locataire", "FormScreen", "CONFORME", "CONFORME", "CONFORME", "Signalement incident, champs catégorie et description visibles"],
    ["native_apps/locataire/app/(tabs)/profile.tsx", "Locataire", "FormModal", "CONFORME", "CONFORME", "CONFORME", "Boîte modale modification e-mail, feuille remonte au-dessus du clavier"],
    ["native_apps/locataire/app/signature/[id].tsx", "Locataire", "FormScreen", "CONFORME", "CONFORME", "CONFORME", "Écran signature OTP avec bouton sticky en footer"],
    ["native_apps/locataire/components/KycVerificationModal.tsx", "Locataire", "KeyboardAvoidingView (controller)", "CONFORME", "CONFORME", "CONFORME", "Dialogue KYC multi-étapes, inputs CNI et identité surélevés"],
    ["native_apps/proprietaire/app/login.tsx", "Propriétaire", "FormScreen", "CONFORME", "CONFORME", "CONFORME", "Formulaire OTP bailleur/agence, sélecteur de rôle stable"],
    ["native_apps/proprietaire/app/(tabs)/chat.tsx", "Propriétaire", "KeyboardAvoidingView (controller)", "CONFORME", "CONFORME", "CONFORME", "Barre de saisie sticky, scroll automatique sur réception"],
    ["native_apps/proprietaire/app/create-property.tsx", "Propriétaire", "FormScreen (footer sticky)", "CONFORME", "CONFORME", "CONFORME", "Formulaire création de bien complet, bouton 'Enregistrer' collé au clavier"],
    ["native_apps/proprietaire/app/create-lease.tsx", "Propriétaire", "FormScreen (footer sticky)", "CONFORME", "CONFORME", "CONFORME", "Génération de bail certifié, bouton sticky 'Générer le Contrat'"],
    ["native_apps/proprietaire/app/(tabs)/profile.tsx", "Propriétaire", "FormModal", "CONFORME", "CONFORME", "CONFORME", "Dialogue modification e-mail avec pied sticky"],
    ["native_apps/proprietaire/app/signature/[id].tsx", "Propriétaire", "FormScreen", "CONFORME", "CONFORME", "CONFORME", "Validation signature SMS bailleur, bouton sticky"],
    ["native_apps/proprietaire/components/KycVerificationModal.tsx", "Propriétaire", "KeyboardAvoidingView (controller)", "CONFORME", "CONFORME", "CONFORME", "Dialogue KYC propriétaire avec remontée clavier fluide"],
    ["native_apps/agence/app/(tabs)/_layout.tsx", "Agence", "tabBarHideOnKeyboard: true", "CONFORME", "CONFORME", "CONFORME", "Masquage de la barre d'onglets lors de l'ouverture du clavier"]
]

# Write CSV
csv_lines = ['"' + '";"'.join(r) + '"' for r in rows]
with open("IC02_migration.csv", "w", encoding="utf-8") as f:
    f.write("\n".join(csv_lines) + "\n")

# Write OpenXML XLSX
sheet_data = []
for r_idx, row in enumerate(rows, start=1):
    cols_xml = []
    for c_idx, val in enumerate(row, start=1):
        col_letter = chr(64 + c_idx)
        val_escaped = (val.replace("&", "&amp;")
                          .replace("<", "&lt;")
                          .replace(">", "&gt;")
                          .replace('"', "&quot;"))
        cols_xml.append(f'<c r="{col_letter}{r_idx}" t="inlineStr"><is><t>{val_escaped}</t></is></c>')
    sheet_data.append(f'<row r="{r_idx}">{"".join(cols_xml)}</row>')

sheet_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    {"".join(sheet_data)}
  </sheetData>
</worksheet>'''

workbook_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Migration Clavier IC-02" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>'''

rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>'''

wb_rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>'''

content_types_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>'''

with zipfile.ZipFile("IC02_migration.xlsx", "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types_xml)
    z.writestr("_rels/.rels", rels_xml)
    z.writestr("xl/workbook.xml", workbook_xml)
    z.writestr("xl/_rels/workbook.xml.rels", wb_rels_xml)
    z.writestr("xl/worksheets/sheet1.xml", sheet_xml)

print("IC02_migration.xlsx and IC02_migration.csv generated successfully!")
