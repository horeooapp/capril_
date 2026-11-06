# Patch AgencyPortalDashboardV2.tsx
with open('src/components/dashboard/agency/AgencyPortalDashboardV2.tsx', 'r', encoding='utf-8') as f:
    agency = f.read()

# 1. Top banner container
agency = agency.replace(
    'rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)]',
    'rounded-xl border border-slate-200 shadow-sm'
)

# 2. Status pulse & label
agency = agency.replace(
    '<span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>',
    '<span className="w-2 h-2 rounded-full bg-sky-600"></span>'
)
agency = agency.replace(
    'text-[11px] font-black uppercase tracking-wider text-slate-400',
    'text-xs font-medium text-slate-500'
)

# 3. Title (remove generic AI Bonjour)
agency = agency.replace(
    '<h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">\n            Bonjour, <span className="text-sky-700">{agencyDisplayName}</span>\n          </h1>',
    '<h1 className="text-2xl font-semibold text-slate-900 tracking-tight">\n            Portefeuille & Gestion d\'Agence · <span className="text-slate-600 font-normal">{agencyDisplayName}</span>\n          </h1>'
)

# 4. Remove hover:-translate-y-0.5 and font-bold on buttons
agency = agency.replace('rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5', 'rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors')
agency = agency.replace('rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5', 'rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-sm transition-colors')

# 5. Segment tabs rounded-lg instead of rounded-full
agency = agency.replace('rounded-full text-[12.5px] font-semibold transition-colors', 'rounded-lg text-[12.5px] font-medium transition-colors')

with open('src/components/dashboard/agency/AgencyPortalDashboardV2.tsx', 'w', encoding='utf-8') as f:
    f.write(agency)

print("AgencyPortalDashboardV2 patched!")

# Patch BrokerPortalDashboard.tsx
with open('src/components/dashboard/broker/BrokerPortalDashboard.tsx', 'r', encoding='utf-8') as f:
    broker = f.read()

# 1. Top banner container
broker = broker.replace(
    'rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)]',
    'rounded-xl border border-slate-200 shadow-sm'
)

# 2. Status pulse & label
broker = broker.replace(
    '<span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>',
    '<span className="w-2 h-2 rounded-full bg-violet-600"></span>'
)
broker = broker.replace(
    'text-[11px] font-black uppercase tracking-wider text-slate-400',
    'text-xs font-medium text-slate-500'
)

# 3. Title (remove generic AI Bonjour)
broker = broker.replace(
    '<h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">\n                        Bonjour, <span className="text-violet-700">{brokerDisplayName}</span>\n                    </h1>',
    '<h1 className="text-2xl font-semibold text-slate-900 tracking-tight">\n                        Mandats de Prospection & Apports · <span className="text-slate-600 font-normal">{brokerDisplayName}</span>\n                    </h1>'
)

# 4. Remove hover:-translate-y-0.5
broker = broker.replace('rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5', 'rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors')
broker = broker.replace('rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5', 'rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-sm transition-colors')

# 5. Segment tabs rounded-lg instead of rounded-full
broker = broker.replace('rounded-full text-[12.5px] font-semibold transition-colors', 'rounded-lg text-[12.5px] font-medium transition-colors')

# 6. Remove group-hover:scale-110 in quick actions
broker = broker.replace('group-hover:scale-110 transition-transform', 'transition-colors')

with open('src/components/dashboard/broker/BrokerPortalDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(broker)

print("BrokerPortalDashboard patched!")

