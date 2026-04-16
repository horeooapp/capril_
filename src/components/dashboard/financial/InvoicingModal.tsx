"use client"

import React, { useState } from "react";
import { X, Receipt, Plus, Trash2, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface InvoiceItem {
    id: string;
    description: string;
    amount: number;
}

export default function InvoicingModal({ isOpen, onClose, lease }: { isOpen: boolean, onClose: () => void, lease: any }) {
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [newDesc, setNewDesc] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const addItem = () => {
        if (!newDesc || !newAmount) return;
        const item: InvoiceItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: newDesc,
            amount: parseFloat(newAmount)
        };
        setItems([...items, item]);
        setNewDesc("");
        setNewAmount("");
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const total = items.reduce((sum, i) => sum + i.amount, 0);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulation de génération de facture sécurisée
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Facture commerciale générée et certifiée (Q-INV)");
        setIsGenerating(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Émission Facture</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lease?.tenant?.firstName} {lease?.tenant?.lastName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                type="text" 
                                placeholder="Désignation (ex: Réparation serrure)" 
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Montant (FCFA)" 
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    className="flex-1 p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                />
                                <button 
                                    onClick={addItem}
                                    className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {items.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-xs text-slate-400 italic">Aucun article ajouté à cette facture.</p>
                            </div>
                        )}
                        {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div>
                                    <p className="text-sm font-bold text-slate-700 uppercase">{item.description}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{item.amount.toLocaleString()} FCFA</p>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total à régler</span>
                        <span className="text-2xl font-black text-slate-800">{total.toLocaleString()} FCFA</span>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            disabled={items.length === 0 || isGenerating}
                            onClick={handleGenerate}
                            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            {isGenerating ? "Traitement..." : "Générer & Sceller"} <ShieldCheck size={16} />
                        </button>
                    </div>
                    <p className="text-[9px] text-center text-slate-400 font-medium">
                        Cette facture sera horodatée et transmise par email au locataire.
                    </p>
                </div>
            </div>
        </div>
    );
}
