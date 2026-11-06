with open('src/app/mon-espace-locataire/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c_norm = c.replace('\r\n', '\n')

old_block = """    if (!dashboardData?.success) {
        return (
            <div className="flex items-center justify-center p-8 text-center text-rose-700 bg-rose-50/80 border border-rose-200 rounded-3xl max-w-lg mx-auto mt-12 overflow-hidden shadow-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <AlertCircle className="mx-auto mb-4 text-rose-600" size={32} />
                    <p className="font-bold text-base">Erreur de chargement</p>
                    <p className="text-xs text-rose-600/80 mt-2">{dashboardData?.error || "Incapable de joindre le serveur d'authentification."}</p>
                </motion.div>
            </div>
        )
    }"""

new_block = """    if (!dashboardData?.success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-rose-700 bg-rose-50/80 border border-rose-200 rounded-3xl max-w-lg mx-auto mt-12 overflow-hidden shadow-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <AlertCircle className="mx-auto mb-4 text-rose-600" size={32} />
                    <p className="font-bold text-base">Erreur de chargement</p>
                    <p className="text-xs text-rose-600/80 mt-2 mb-4">{dashboardData?.error || "Incapable de joindre le serveur d'authentification."}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        Actualiser la page
                    </button>
                </motion.div>
            </div>
        )
    }"""

if old_block in c_norm:
    c_norm = c_norm.replace(old_block, new_block)
    with open('src/app/mon-espace-locataire/page.tsx', 'w', encoding='utf-8') as f:
        f.write(c_norm)
    print("Patched successfully!")
else:
    print("Block not found!")

