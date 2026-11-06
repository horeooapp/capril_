with open('src/components/dashboard/owner/OwnerPortalDashboardV2.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text_norm = text.replace('\r\n', '\n')

# 1. Remove animate-pulse on green status dot
text_norm = text_norm.replace(
    '<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>',
    '<span className="w-2 h-2 rounded-full bg-emerald-600"></span>'
)

# 2. Fix greeting headline to context title
old_greeting = '''          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bonjour, <span className="text-emerald-700">{displayName}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Supervisez votre patrimoine immobilier, vos quittances certifiées et vos flux locatifs en temps réel.
          </p>'''

new_greeting = '''          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Patrimoine & Flux Locatifs
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Supervision du portefeuille en gestion directe · {displayName}
          </p>'''

text_norm = text_norm.replace(old_greeting, new_greeting)

# 3. Uppercase tracked label to sentence case
text_norm = text_norm.replace(
    'text-[11px] font-black uppercase tracking-wider text-slate-400',
    'text-xs font-medium text-slate-500'
)

# 4. Remove hover:-translate-y-0.5 from header buttons
text_norm = text_norm.replace('hover:-translate-y-0.5', '')

with open('src/components/dashboard/owner/OwnerPortalDashboardV2.tsx', 'w', encoding='utf-8') as f:
    f.write(text_norm)

print("Owner dashboard patched successfully")

