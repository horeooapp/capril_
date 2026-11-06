with open('src/components/dashboard/owner/OwnerPortalDashboardV2.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """             <button className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
               {a.btn || "Traiter"}
             </button>"""

replacement = """             <Link href="/dashboard/disputes" className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors inline-block">
               {a.btn || "Traiter"}
             </Link>"""

if target in text:
    text = text.replace(target, replacement, 1)
    with open('src/components/dashboard/owner/OwnerPortalDashboardV2.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Owner alert button successfully updated to Link")
else:
    print("Exact target string mismatch")

