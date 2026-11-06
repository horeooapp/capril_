with open('src/components/landing-v2/QaprilLandingV2.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace lines 286 to 351 (0-based: 286 to 351)
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '{/* 3 Portails Métiers Directs' in line:
        start_idx = i
    if start_idx != -1 and 'Pilotez vos mandats, portefeuilles et commissions' in line:
        # find the closing </div> of this grid
        for j in range(i, i + 10):
            if lines[j].strip() == '</div>':
                end_idx = j + 1
                break
        break

print(f"Found block from line {start_idx} to {end_idx}")

new_block = """              {/* 3 Portails Métiers Directs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <button
                  onClick={() => handleLogin("BAILLEUR")}
                  className="relative p-5 text-left rounded-2xl bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-amber-400/40 shadow-sm transition-colors duration-200 group cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-300 shadow-sm group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-amber-300 group-hover:bg-amber-500/20 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white relative z-10">
                    Propriétaires bailleurs
                  </div>
                  <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed relative z-10">
                    Gérez vos biens, encaissez vos loyers et suivez vos quittances.
                  </p>
                </button>

                <button
                  onClick={() => handleLogin("LOCATAIRE")}
                  className="relative p-5 text-left rounded-2xl bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-sky-400/40 shadow-sm transition-colors duration-200 group cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/20 flex items-center justify-center text-sky-300 shadow-sm group-hover:bg-sky-400 group-hover:text-slate-950 transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-sky-300 group-hover:bg-sky-500/20 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white relative z-10">
                    Locataires certifiés
                  </div>
                  <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed relative z-10">
                    Payez par Wave/Mobile Money et recevez votre reçu officiel immédiat.
                  </p>
                </button>

                <Link
                  href="/dashboard/login/agency"
                  className="relative p-5 text-left rounded-2xl bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 shadow-sm transition-colors duration-200 group cursor-pointer block overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300 shadow-sm group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-emerald-300 group-hover:bg-emerald-500/20 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white relative z-10">
                    Agences & Mandats
                  </div>
                  <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed relative z-10">
                    Pilotez vos mandats, portefeuilles et commissions en toute sérénité.
                  </p>
                </Link>
              </div>
"""

if start_idx != -1 and end_idx != -1:
    lines[start_idx:end_idx] = [new_block]
    with open('src/components/landing-v2/QaprilLandingV2.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("SUCCESS")
else:
    print("FAILED TO LOCATE INDICES")

