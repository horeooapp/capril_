with open('src/components/landing-v2/QaprilLandingV2.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text_norm = text.replace('\r\n', '\n')

old_cards = """              {/* 3 Portails Métiers Directs (Cartes Apple/Meta Design Frosted) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <button
                  onClick={() => handleLogin("BAILLEUR")}
                  className="relative p-5 text-left rounded-2xl bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xl border border-white/15 hover:border-amber-400/70 shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/15 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-125 duration-500" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-sm group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-amber-300 group-hover:bg-amber-500/20 transition-all">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <div className="text-[13px] font-black text-white uppercase tracking-wider relative z-10">
                    Propriétaires
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-1 leading-snug relative z-10">
                    Gérez vos biens, encaissez vos loyers et suivez vos quittances.
                  </p>
                </button>

                <button
                  onClick={() => handleLogin("LOCATAIRE")}
                  className="relative p-5 text-left rounded-2xl bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xl border border-white/15 hover:border-sky-400/70 shadow-lg hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-500/15 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-125 duration-500" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-sm group-hover:bg-sky-400 group-hover:text-slate-950 transition-all duration-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-sky-300 group-hover:bg-sky-500/20 transition-all">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <div className="text-[13px] font-black text-white uppercase tracking-wider relative z-10">
                    Locataires
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-1 leading-snug relative z-10">
                    Payez par Wave/Mobile Money et recevez votre reçu immédiat.
                  </p>
                </button>

                <Link
                  href="/dashboard/login/agency"
                  className="relative p-5 text-left rounded-2xl bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-xl border border-white/15 hover:border-emerald-400/70 shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer block overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/15 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-125 duration-500" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-sm group-hover:bg-emerald-400 group-hover:text-slate-950 transition-all duration-300">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-emerald-300 group-hover:bg-emerald-500/20 transition-all">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <div className="text-[13px] font-black text-white uppercase tracking-wider relative z-10">
                    Agences Agréées
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-1 leading-snug relative z-10">
                    Gérez vos mandats de gestion et vos reversements bailleurs.
                  </p>
                </Link>
              </div>"""

new_cards = """              {/* 3 Portails Métiers Directs */}
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
                    Agences immobilières
                  </div>
                  <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed relative z-10">
                    Gérez vos mandats de gestion et vos reversements bailleurs.
                  </p>
                </Link>
              </div>"""

if old_cards in text_norm:
    text_norm = text_norm.replace(old_cards, new_cards, 1)
    with open('src/components/landing-v2/QaprilLandingV2.tsx', 'w', encoding='utf-8') as f:
        f.write(text_norm)
    print("Cards replaced successfully")
else:
    print("Cards not found")
