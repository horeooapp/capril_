const fs = require('fs');
let code = fs.readFileSync('src/app/mon-espace-locataire/layout-client.tsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

// 1. Add Link and MobileMenu imports
if (!code.includes('import Link from "next/link"')) {
    code = code.replace('import React from "react"', 'import React from "react"\nimport Link from "next/link"\nimport MobileMenu from "@/components/MobileMenu"');
}

// 2. Add Mobile Header before <main>
const targetMain = `<div className="flex-1 flex flex-col lg:pl-[280px] transition-all duration-300">
                {/* Header removed per user request for cleaner UI */}

                {/* Main Content */}
                <main className={session ? "flex-1 w-full max-w-7xl mx-auto pt-12 pb-32 px-4 sm:px-6 lg:px-8" : "flex-1"}>`;

const replacementMain = `<div className="flex-1 flex flex-col lg:pl-[280px] transition-all duration-300">
                {/* Mobile Header pour Espace Locataire */}
                {session?.user && (
                    <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
                        <div className="flex items-center gap-2 min-w-0">
                            {/* Bouton Retour Accueil Public */}
                            <Link 
                                href="/" 
                                className="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
                                title="Retour à la page d'accueil du site"
                                aria-label="Accueil"
                            >
                                <Home size={18} className="text-[#FF8200]" />
                            </Link>

                            <Link href="/mon-espace-locataire" className="flex items-center gap-2 min-w-0">
                                <img src="/logo.png" alt="QAPRIL" className="h-6 w-auto object-contain" />
                                <div className="min-w-0">
                                    <span className="font-black text-xs uppercase tracking-tight text-slate-900 block leading-tight truncate">Espace Locataire</span>
                                    <span className="text-[10px] font-bold text-emerald-600 block leading-none">Certifié QAPRIL</span>
                                </div>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Bouton Déconnexion Direct Mobile */}
                            <button 
                                onClick={() => onLogout()}
                                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold text-xs active:scale-95 transition-all"
                                title="Se déconnecter"
                                aria-label="Déconnexion"
                            >
                                <LogOut size={14} />
                                <span className="text-[11px] font-bold">Quitter</span>
                            </button>

                            {/* Menu Mobile Tiroir */}
                            <MobileMenu 
                                session={session} 
                                variant="dark" 
                                onLogout={onLogout}
                                activeRole="TENANT" 
                            />
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className={session ? "flex-1 w-full max-w-7xl mx-auto pt-6 lg:pt-12 pb-32 px-4 sm:px-6 lg:px-8" : "flex-1"}>`;

if (!code.includes(targetMain)) {
    console.error("targetMain not found!");
    process.exit(1);
}

code = code.replace(targetMain, replacementMain);
fs.writeFileSync('src/app/mon-espace-locataire/layout-client.tsx', code, 'utf8');
console.log("Successfully updated mon-espace-locataire layout-client.tsx with mobile header, home and disconnect buttons!");

