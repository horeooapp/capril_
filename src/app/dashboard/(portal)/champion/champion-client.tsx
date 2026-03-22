"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Users, TrendingUp, 
  Wallet, Trophy, Phone, 
  MessageCircle, MessageSquare, 
  Info, ChevronRight, X,
  Search, Filter, MapPin
} from "lucide-react";
import { addProspect } from "@/actions/champion-actions";

export default function ChampionDashboardClient({ 
  user, 
  profile, 
  leaderboard 
}: { 
  user: any, 
  profile: any, 
  leaderboard: any[] 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = [
    { label: "Gains Validés", value: Number(profile?.totalCommissionsFcfa || 0), icon: Wallet, color: "text-emerald-600 bg-emerald-50", isCurrency: true },
    { label: "Prospects", value: profile?.prospects?.length || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Rang Zone", value: "#2", icon: Trophy, color: "text-orange-600 bg-orange-50" }, // Mocked rank
  ];

  const handleAddProspect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      nom: formData.get("nom") as string,
      telephone: formData.get("telephone") as string,
      quartier: formData.get("quartier") as string,
      nbLogementsEstime: formData.get("nbLogements") as string,
    };

    const res = await addProspect(profile.id, data);
    if (res.success) {
      setShowAddForm(false);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Header Mobile First */}
      <div className="flex items-center justify-between p-4 bg-white rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
            <Trophy size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Champion QAPRIL</p>
            <h1 className="text-xl font-black text-[#1F4E79] tracking-tighter uppercase">{user.name}</h1>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#C55A11] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
        >
          <Plus size={16} />
          Nouveau Prospect
        </button>
      </div>

      {/* Quick Stats Slider (Mobile) / Grid (Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card-premium p-6 rounded-3xl border border-white/50 bg-white/40 shadow-xl flex items-center gap-4">
             <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-[#1F4E79]">
                  {stat.isCurrency ? `${stat.value.toLocaleString()} FCFA` : stat.value}
                </p>
             </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Prospects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
             <h2 className="text-lg font-black text-[#1F4E79] uppercase tracking-tighter italic">Mes Prospects</h2>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{profile?.prospects?.length || 0} Total</span>
          </div>
          
          <div className="space-y-3">
            {profile?.prospects?.map((prospect: any) => (
              <div key={prospect.id} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                          <Users size={18} />
                       </div>
                       <div>
                          <p className="font-black text-gray-900 leading-none">{prospect.nom}</p>
                          <p className="text-[10px] font-medium text-gray-500 mt-1 flex items-center gap-1">
                             <MapPin size={10} /> {prospect.quartier || "Quartier non défini"}
                          </p>
                       </div>
                    </div>
                    <span className={`px-2 py-1 text-[8px] font-black uppercase rounded ${prospect.statut === "A_RAPPELER" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>
                       {prospect.statut.replace('_', ' ')}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-2 mt-4 ml-1">
                    <a href={`tel:${prospect.telephone}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Phone size={14} /></a>
                    <a href={`https://wa.me/${prospect.telephone}`} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><MessageCircle size={14} /></a>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors">
                       Voir Détails <ChevronRight size={12} />
                    </button>
                 </div>
              </div>
            ))}
            {(!profile?.prospects || profile.prospects.length === 0) && (
              <div className="text-center py-10 opacity-40">
                <Users size={32} className="mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Aucun prospect enregistré</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard & Stats */}
        <div className="space-y-6">
           <div className="glass-panel p-8 rounded-[2.5rem] bg-indigo-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400 blur-[80px] opacity-20" />
              <h2 className="text-xl font-black uppercase tracking-tighter italic mb-6">Leaderboard {profile?.zonePrincipale}</h2>
              <div className="space-y-4">
                 {leaderboard?.map((l: any) => (
                   <div key={l.rank} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3">
                         <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${l.rank === 1 ? "bg-yellow-500 text-black" : "bg-white/10"}`}>{l.rank}</span>
                         <span className="text-xs font-black uppercase truncate max-w-[120px]">{l.name}</span>
                      </div>
                      <span className="text-[12px] font-black text-indigo-300">{l.points.toLocaleString()} pts</span>
                   </div>
                 ))}
                 {!leaderboard?.length && <p className="text-xs italic text-indigo-300">Classement en cours...</p>}
              </div>
           </div>

           <div className="p-8 bg-emerald-950 text-white rounded-[2.5rem] border border-emerald-900">
              <h3 className="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                 <TrendingUp size={20} className="text-emerald-400" /> Objectif Mensuel
              </h3>
              <div className="flex items-end justify-between mb-2">
                 <p className="text-xs font-medium text-emerald-300">Progression Inscriptions</p>
                 <span className="text-[10px] font-black text-emerald-400 uppercase">7 / {profile?.objectifMensuel || 30}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[23%]" />
              </div>
              <p className="text-[9px] text-emerald-400 mt-4 leading-relaxed font-medium uppercase tracking-[0.1em]">
                Plus que 23 inscriptions pour débloquer le bonus de volume de 50.000 FCFA.
              </p>
           </div>
        </div>
      </div>

      {/* Add Prospect Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddForm(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <button onClick={() => setShowAddForm(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
              
              <div className="mb-8">
                 <h2 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none mb-2">Ajouter un<br/>Prospect.</h2>
                 <p className="text-xs text-gray-400 font-medium">Saisissez les informations clés pour le suivi.</p>
              </div>

              <form onSubmit={handleAddProspect} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1F4E79]">Nom Complet</label>
                  <input name="nom" required className="w-full' p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C55A11] text-[14px]" placeholder="Ex: Jean Kouadio" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1F4E79]">Téléphone (WhatsApp)</label>
                  <input name="telephone" required className="w-full' p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C55A11] text-[14px]" placeholder="+225 ..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1F4E79]">Quartier</label>
                    <input name="quartier" className="w-full' p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C55A11] text-[14px]" placeholder="Ex: Cocody" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1F4E79]">Nb Logements</label>
                    <input name="nbLogements" className="w-full' p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C55A11] text-[14px]" placeholder="Ex: 4 appart." />
                  </div>
                </div>
                
                <button 
                  disabled={isSubmitting}
                  className="w-full py-5' bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[14px] shadow-xl hover:bg-black transition-all disabled:opacity-50 mt-4 h-[64px]"
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer le Prospect"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
