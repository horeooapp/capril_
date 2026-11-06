import re

# 1. Fix diaspora-client.tsx
with open("src/app/dashboard/(portal)/diaspora/diaspora-client.tsx", "r", encoding="utf-8") as f:
    diaspora = f.read()

# Add toast import if missing
if 'import { toast }' not in diaspora:
    diaspora = 'import { toast } from "sonner";\n' + diaspora

# Fix button line 72
diaspora = diaspora.replace(
    '<button className="w-full py-4 mt-auto bg-slate-100 text-slate-800 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">\n                                Choisir Sérénité\n                            </button>',
    '<button onClick={() => setIsSubscribed(true)} className="w-full py-4 mt-auto bg-slate-100 text-slate-800 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">\n                                Choisir Sérénité\n                            </button>'
)

# Fix button line 166
diaspora = diaspora.replace(
    '<button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">\n                                    <ArrowRight size={16} />\n                                </button>',
    '<button onClick={() => toast.info(`Consultation du rapport financier ${report.month}`)} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">\n                                    <ArrowRight size={16} />\n                                </button>'
)

# Fix button line 183
diaspora = diaspora.replace(
    '<button className="px-6 py-3 bg-amber-50 text-amber-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-colors mt-4">\n                        Demander une visite\n                    </button>',
    '<button onClick={() => toast.success("Demande d\'inspection vidéo enregistrée. Votre gestionnaire QAPRIL planifie la visite.")} className="px-6 py-3 bg-amber-50 text-amber-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-colors mt-4">\n                        Demander une visite\n                    </button>'
)

with open("src/app/dashboard/(portal)/diaspora/diaspora-client.tsx", "w", encoding="utf-8") as f:
    f.write(diaspora)
print("1. Fixed diaspora-client.tsx")

# 2. Fix AgencyCandidateList.tsx
with open("src/components/dashboard/agency/AgencyCandidateList.tsx", "r", encoding="utf-8") as f:
    cand = f.read()

cand = cand.replace('/dashboard/candidatures/new', '/dashboard/matching')
with open("src/components/dashboard/agency/AgencyCandidateList.tsx", "w", encoding="utf-8") as f:
    f.write(cand)
print("2. Fixed AgencyCandidateList.tsx")

# 3. Fix WalletDashboard.tsx
with open("src/components/dashboard/owner/WalletDashboard.tsx", "r", encoding="utf-8") as f:
    wallet = f.read()

wallet = wallet.replace('/dashboard/wallet/settings', '/dashboard/wallet')
with open("src/components/dashboard/owner/WalletDashboard.tsx", "w", encoding="utf-8") as f:
    f.write(wallet)
print("3. Fixed WalletDashboard.tsx")

# 4. Fix layout-client.tsx search button
with open("src/app/dashboard/(portal)/layout-client.tsx", "r", encoding="utf-8") as f:
    layout = f.read()

layout = layout.replace(
    '<button className="text-slate-400 hover:text-slate-700 transition-colors p-1.5" title="Rechercher">\n                                <Search size={18} />\n                            </button>',
    '<button onClick={() => router.push("/dashboard/properties")} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5" title="Rechercher des biens">\n                                <Search size={18} />\n                            </button>'
)
with open("src/app/dashboard/(portal)/layout-client.tsx", "w", encoding="utf-8") as f:
    f.write(layout)
print("4. Fixed layout-client.tsx")

# 5. Fix agency/intelligence/page.tsx footer links
with open("src/app/(dashboard)/agency/intelligence/page.tsx", "r", encoding="utf-8") as f:
    intel = f.read()

intel = intel.replace('<a href="#" className="hover:text-blue-400">Documentation API</a>', '<a href="/dashboard/agency" className="hover:text-blue-400">Documentation API</a>')
intel = intel.replace('<a href="#" className="hover:text-blue-400">Compliance DGI</a>', '<a href="/dashboard/fiscal" className="hover:text-blue-400">Compliance DGI</a>')
intel = intel.replace('<a href="#" className="hover:text-blue-400">Support</a>', '<a href="mailto:contact@qapril.net" className="hover:text-blue-400">Support</a>')
with open("src/app/(dashboard)/agency/intelligence/page.tsx", "w", encoding="utf-8") as f:
    f.write(intel)
print("5. Fixed agency/intelligence/page.tsx")

