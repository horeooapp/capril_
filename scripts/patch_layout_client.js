const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/(portal)/layout-client.tsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

// 1. Ensure Home is imported
if (!code.includes(' Home,')) {
    code = code.replace('Search,', 'Search,\n    Home,');
}

// 2. Replace the header section
const oldHeader = `<header className="px-4 lg:px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div>
                        <div className="font-bold text-[16px] text-slate-800 leading-none">
                            {meta.title}
                        </div>
                        <div className="text-[12px] text-slate-400 mt-1">
                            {meta.subtitle}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Desktop Search & Notifs */}
                        <div className="hidden lg:flex items-center gap-4 pr-5 border-r border-slate-200">
                            <button className="text-slate-400 hover:text-slate-700 transition-colors">
                                <Search size={18} />
                            </button>
                            <div className="text-slate-400 hover:text-slate-700 transition-colors relative cursor-pointer">
                                <NotificationCenter />
                                {unreadNotifMode && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500"></span>}
                            </div>
                        </div>

                        {session?.user && (
                            <div className="flex items-center gap-3">
                                {/* Profile Avatar configured with Accent Color */}
                                <Link href="/dashboard/profile" className={\`w-[34px] h-[34px] rounded-full \${theme.bg} flex items-center justify-center text-white font-bold text-[13px] hover:shadow-md transition-all\`}>
                                    {initials}
                                </Link>

                                <button 
                                    onClick={() => signOut()}
                                    className="hidden sm:flex text-slate-400 hover:text-rose-500 transition-colors ml-1"
                                    title="Déconnexion"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        )}
                        
                        {/* Mobile Hamburgers Menu */}
                        <div className="flex lg:hidden text-slate-800 ml-2">
                            <MobileMenu 
                                links={[]} // Managed internally by MobileMenu mostly
                                session={session} 
                                variant="dark" 
                                onLogout={() => signOut()}
                                activeRole={activeRole} 
                            />
                        </div>
                    </div>
                </header>`;

const newHeader = `<header className="px-3 sm:px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {/* Bouton Retour Accueil Mobile & Desktop */}
                        <Link 
                            href="/" 
                            className="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all shrink-0"
                            title="Retour vers la page d'accueil du site"
                            aria-label="Accueil"
                        >
                            <Home size={18} className="text-[#FF8200]" />
                        </Link>

                        <div className="min-w-0">
                            <div className="font-bold text-[15px] sm:text-[16px] text-slate-800 leading-none truncate">
                                {meta.title}
                            </div>
                            <div className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5 truncate hidden xs:block">
                                {meta.subtitle}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Desktop Search & Notifs */}
                        <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-slate-200">
                            <button className="text-slate-400 hover:text-slate-700 transition-colors p-1.5" title="Rechercher">
                                <Search size={18} />
                            </button>
                            <div className="text-slate-400 hover:text-slate-700 transition-colors relative cursor-pointer p-1.5">
                                <NotificationCenter />
                                {unreadNotifMode && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>}
                            </div>
                        </div>

                        {session?.user && (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {/* Profile Avatar configured with Accent Color */}
                                <Link 
                                    href="/dashboard/profile" 
                                    className={\`w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-full \${theme.bg} flex items-center justify-center text-white font-bold text-[12px] sm:text-[13px] hover:shadow-md transition-all\`}
                                    title="Mon Profil"
                                >
                                    {initials}
                                </Link>

                                {/* Bouton Déconnexion Mobile & Desktop */}
                                <button 
                                    onClick={() => signOut({ callbackUrl: "/dashboard/login" })}
                                    className="flex items-center justify-center w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 active:scale-95 transition-all"
                                    title="Déconnexion"
                                    aria-label="Déconnexion"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        )}
                        
                        {/* Mobile Hamburgers Menu */}
                        <div className="flex lg:hidden text-slate-800 ml-1">
                            <MobileMenu 
                                session={session} 
                                variant="dark" 
                                onLogout={() => signOut({ callbackUrl: "/dashboard/login" })}
                                activeRole={activeRole} 
                            />
                        </div>
                    </div>
                </header>`;

if (!code.includes(oldHeader)) {
    console.error("oldHeader not found!");
    process.exit(1);
}

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/app/dashboard/(portal)/layout-client.tsx', code, 'utf8');
console.log("Successfully updated layout-client.tsx with mobile home and disconnect buttons!");

