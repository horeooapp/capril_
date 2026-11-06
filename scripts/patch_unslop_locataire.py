with open('src/app/mon-espace-locataire/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text_norm = text.replace('\r\n', '\n')

# 1. Replace emoji 🏠 with Home icon
text_norm = text_norm.replace(
    '<div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-6 mx-auto">\n                                🏠\n                            </div>',
    '<div className="w-16 h-16 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-700 mb-6 mx-auto">\n                                <Home size={32} />\n                            </div>'
)

# 2. Remove blur blob
text_norm = text_norm.replace(
    '<div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>',
    '<!-- Calm dark surface -->'
)

# 3. Replace gradient button
text_norm = text_norm.replace(
    'className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl px-6 py-3.5 text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5"',
    'className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl px-6 py-3 text-xs transition-colors flex items-center justify-center gap-2"'
)

# 4. Replace Sparkles with ShieldCheck
text_norm = text_norm.replace(
    '<Sparkles size={12} /> Passeport Actif',
    '<ShieldCheck size={13} /> Passeport vérifié'
)

with open('src/app/mon-espace-locataire/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text_norm)

print("Locataire dashboard patched successfully")

