with open("src/app/admin/(authenticated)/reclamations/ReclamationsClient.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# Add selectedTicket state
c = c.replace(
    'const [selectedSignalement, setSelectedSignalement] = useState<any>(null)',
    'const [selectedSignalement, setSelectedSignalement] = useState<any>(null)\n    const [selectedTicket, setSelectedTicket] = useState<any>(null)'
)

# Add onClick to ticket row and button
c = c.replace(
    '<button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase hover:bg-gray-200 transition-colors">Consulter</button>',
    '<button onClick={() => setSelectedTicket(r)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase hover:bg-gray-200 transition-colors">Consulter</button>'
)

# Add selectedTicket modal before the last closing div
ticket_modal = """
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-8 shadow-2xl relative">
                        <button onClick={() => setSelectedTicket(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold">✕</button>
                        
                        <div className="flex items-center gap-3 mb-6 text-slate-800">
                            <Clock size={32} />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Ticket Maintenance</h2>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Type d'incident</p>
                                    <p className="font-black text-gray-900 text-lg uppercase">{selectedTicket.categorie || selectedTicket.titre || "Panne Technique"}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedTicket.urgence === "URGENTE" ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-100 text-gray-500"}`}>{selectedTicket.urgence}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Description de la réclamation</p>
                                <p className="text-sm font-medium text-gray-700">{selectedTicket.description || selectedTicket.details || "Aucune description renseignée."}</p>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                                <span>Statut actuel : <strong className="text-slate-800">{selectedTicket.statut}</strong></span>
                                <span>Date : {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button onClick={() => setSelectedTicket(null)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                            Fermer
                        </button>
                    </div>
                </div>
            )}
"""

c = c.replace('            {selectedSignalement && (', ticket_modal + '\n            {selectedSignalement && (')

with open("src/app/admin/(authenticated)/reclamations/ReclamationsClient.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("Successfully patched ReclamationsClient.tsx!")

