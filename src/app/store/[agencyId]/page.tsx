import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, BedDouble, ShieldCheck, Home } from "lucide-react";

export default async function StorefrontPage({ params }: { params: Promise<{ agencyId: string }> }) {
    const resolvedParams = await params;
    const agencyId = resolvedParams.agencyId;

    let agency = null;
    let annonces = [];

    if (agencyId !== 'my-agency') {
        agency = await prisma.user.findUnique({ where: { id: agencyId } });
        if (!agency) return notFound();
        annonces = await prisma.annonce.findMany({
            where: { agenceId: agencyId, statut: "ACTIVE" },
            include: { logement: true }
        });
    } else {
        // Fallback demo
        agency = { firstName: "Agence", lastName: "Demo", phone: "+225 0102030405" };
        annonces = [
            { 
                id: "DEMO-1", 
                titre: "Superbe Villa", 
                loyerDemande: 1500000, 
                logement: { city: "Riviera 3", propertyType: "villa" } 
            }
        ];
    }

    return (
        <div className="min-h-screen bg-[#F2F5FA] font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#1F4E79] rounded-2xl flex items-center justify-center text-white">
                            <Home size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#1F4E79] uppercase tracking-tight">Vitrine {agency.firstName} {agency.lastName}</h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck size={12} className="text-green-500" /> Partenaire Certifié QAPRIL
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#FF7A00] text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-500/30">
                        {agency.phone || 'Contactez-nous'}
                    </div>
                </div>
            </header>

            {/* List */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-in fade-in duration-700 slide-in-from-bottom-5">
                <div className="mb-8 border-l-4 border-[#FF7A00] pl-4">
                    <h2 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tighter">Biens Disponibles ({annonces.length})</h2>
                    <p className="text-gray-500 font-medium mt-1">Découvrez notre sélection de biens immobiliers exclusifs, vérifiés et prêts à la location.</p>
                </div>

                {annonces.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-[2rem] p-12 text-center shadow-sm">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aucun bien actif pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {annonces.map((a: any) => (
                            <div key={a.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                                <div className="h-56 bg-gray-200 relative overflow-hidden">
                                    {/* Placeholder image */}
                                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#1F4E79_0%,#111827_100%)] opacity-10"></div>
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#1F4E79]">
                                        {a.logement?.propertyType || "Logement"}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/30">
                                        Disponible
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{a.titre}</h3>
                                    <p className="text-gray-500 flex items-center gap-2 text-sm font-medium mb-6">
                                        <MapPin size={16} className="text-[#FF7A00]" /> {a.logement?.city || "Non spécifié"}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Loyer Mensuel</p>
                                            <p className="text-2xl font-black text-[#1F4E79]">{a.loyerDemande.toLocaleString()} ₣</p>
                                        </div>
                                        <button className="bg-gray-100 text-[#1F4E79] w-12 h-12 rounded-xl flex items-center justify-center font-black hover:bg-[#FF7A00] hover:text-white transition-colors">
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
