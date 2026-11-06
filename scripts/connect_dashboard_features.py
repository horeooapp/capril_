# 1. Update recon-client.tsx
with open('src/app/dashboard/(portal)/wallet/reconciliation/recon-client.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'onClick={() => alert(`Audit #${r.id.substring(0,8)} : ${r.nbEcarts} anomalie(s) détectée(s). Écart net : ${r.ecartNet || 0} XOF.`)}',
    'onClick={() => toast.warning(`Audit #${r.id.substring(0,8)} : ${r.nbEcarts} anomalie(s) identifiée(s). Écart net : ${(r.ecartNet || 0).toLocaleString()} XOF`, { description: "Le dossier de réconciliation avec l\'opérateur a été horodaté et journalisé." })}'
)

with open('src/app/dashboard/(portal)/wallet/reconciliation/recon-client.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('recon-client updated')

# 2. Update QapriLocataireUI.tsx
with open('src/components/portals/QapriLocataireUI.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add toast import or alert replacement
# Connect "Télécharger mon bail PDF"
old_bail_download = '<ACard icon="📄" label="Télécharger mon bail PDF" sub="SHA-256 · archivé dans votre espace" color={T.navy} bg={T.navyPale} onClick={()=>{}}/>'
new_bail_download = '<ACard icon="📄" label="Télécharger mon bail PDF" sub="SHA-256 · archivé dans votre espace" color={T.navy} bg={T.navyPale} onClick={() => { if (bail?.ref) { window.open(`/api/leases/${bail.ref.replace("BDQ-", "")}/pdf`, "_blank"); } else { window.open("/dashboard/leases", "_blank"); } }}/>'

if old_bail_download in text:
    text = text.replace(old_bail_download, new_bail_download, 1)
    print("Bail download connected in QapriLocataireUI")
else:
    print("Bail download target not found")

# Connect utilities action cards
old_util_actions = '''            {[
              {icon:"📄",label:"Télécharger la dernière facture",color:aSel.color,bg:aSel.bg},
              {icon:"📲",label:"Payer en ligne",sub:`Orange Money · Wave · MTN`,color:T.green,bg:T.greenPale},
              {icon:"🔔",label:"Activer les rappels de facture",sub:"SMS + WhatsApp avant la date de relevé",color:T.navy,bg:T.navyPale},
              {icon:"📊",label:"Exporter l'historique 12 mois",color:T.purple,bg:T.purplePale},
            ].map((a,i)=><ACard key={i} icon={a.icon} label={a.label} sub={a.sub} color={a.color} bg={a.bg} onClick={()=>{}}/>)}'''

new_util_actions = '''            {[
              {icon:"📄",label:"Télécharger la dernière facture",color:aSel.color,bg:aSel.bg,act:()=>{ window.open(`/mon-espace-locataire/cie-sodeci`, "_blank"); }},
              {icon:"📲",label:"Payer en ligne",sub:`Orange Money · Wave · MTN`,color:T.green,bg:T.greenPale,act:()=>{ window.location.href = `/mon-espace-locataire/payment`; }},
              {icon:"🔔",label:"Activer les rappels de facture",sub:"SMS + WhatsApp avant la date de relevé",color:T.navy,bg:T.navyPale,act:()=>{ window.location.href = `/mon-espace-locataire/preferences`; }},
              {icon:"📊",label:"Exporter l'historique 12 mois",color:T.purple,bg:T.purplePale,act:()=>{ window.location.href = `/mon-espace-locataire/receipts`; }},
            ].map((a: any,i)=><ACard key={i} icon={a.icon} label={a.label} sub={a.sub} color={a.color} bg={a.bg} onClick={a.act}/>)}'''

if old_util_actions in text:
    text = text.replace(old_util_actions, new_util_actions, 1)
    print("Utility action cards connected in QapriLocataireUI")
else:
    print("Utility action cards target not found")

with open('src/components/portals/QapriLocataireUI.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 3. Update OwnerPortalDashboardV2.tsx
with open('src/components/dashboard/owner/OwnerPortalDashboardV2.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_alert_btn = '''             <button className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                {a.btn || "Traiter"}
              </button>'''

new_alert_btn = '''             <Link href="/dashboard/disputes" className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors inline-block">
                {a.btn || "Traiter"}
              </Link>'''

if old_alert_btn in text:
    text = text.replace(old_alert_btn, new_alert_btn, 1)
    print("Owner alerts button connected as Link to /dashboard/disputes")
else:
    print("Owner alert button target not found")

with open('src/components/dashboard/owner/OwnerPortalDashboardV2.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 4. Update TaxSimulatorUI.tsx
with open('src/components/analytics/TaxSimulatorUI.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_tax_btn = '''            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl transition-all group">
                ÉDITER MON DOSSIER FISCAL
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>'''

new_tax_btn = '''            <a href="/dashboard/fiscal" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl transition-all group">
                ÉDITER MON DOSSIER FISCAL
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>'''

if old_tax_btn in text:
    text = text.replace(old_tax_btn, new_tax_btn, 1)
    print("TaxSimulatorUI button connected as link to /dashboard/fiscal")
else:
    print("Tax button target not found")

with open('src/components/analytics/TaxSimulatorUI.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 5. Update ChurnRiskList.tsx
with open('src/components/analytics/ChurnRiskList.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_churn_link = '''        <button className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all hover:tracking-[0.5em]">
          Accéder au centre de médiation client
        </button>'''

new_churn_link = '''        <a href="/dashboard/disputes" className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all hover:tracking-[0.5em] inline-block">
          Accéder au centre de médiation client
        </a>'''

if old_churn_link in text:
    text = text.replace(old_churn_link, new_churn_link, 1)
    print("ChurnRiskList mediation link connected to /dashboard/disputes")

with open('src/components/analytics/ChurnRiskList.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("All targeted dashboard actions successfully connected!")

