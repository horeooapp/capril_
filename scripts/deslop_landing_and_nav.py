"""
Script de nettoyage chirurgical : Landing page & Navigation (Zéro dégradé, Zéro glassmorphism)
Standard Notarial QAPRIL
"""
import re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    for old, new in replacements:
        if isinstance(old, re.Pattern):
            content = old.sub(new, content)
        elif callable(old):
            content = old(content)
        else:
            content = content.replace(old, new)
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Modifié : {path}")
    else:
        print(f"[PAS DE CHANGEMENT] : {path}")

# 1. Header.tsx
update_file('src/components/Header.tsx', [
    (
        re.compile(r'const navBgClass = [^;]+;'),
        'const navBgClass = !isHome || scrolled ? "bg-[#090D16] border-b border-slate-800 shadow-md" : "bg-[#090D16] border-b border-slate-900";'
    ),
    (
        'backdrop-blur-md',
        ''
    ),
    (
        'backdrop-blur-xl',
        ''
    ),
    (
        'backdrop-blur-2xl',
        ''
    ),
    (
        'bg-[#09090B]/98',
        'bg-[#090D16]'
    ),
    (
        'bg-[#09090B]/97',
        'bg-[#090D16]'
    ),
    (
        'bg-[#09090B]/60',
        'bg-[#090D16]'
    ),
    (
        'bg-white/5 border border-white/10 px-4 py-1.5 rounded-full',
        'bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full'
    ),
])

# 2. BottomNav.tsx
update_file('src/components/BottomNav.tsx', [
    (
        'bg-white/95 backdrop-blur-2xl border-t border-gray-100/50',
        'bg-white border-t border-slate-200'
    ),
    (
        'bg-white/98 backdrop-blur-3xl border border-gray-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]',
        'bg-white border border-slate-200 rounded-2xl shadow-lg'
    ),
    (
        'bg-black/10 backdrop-blur-sm',
        'bg-black/50'
    ),
    (
        re.compile(r'backdrop-blur-[a-z0-9]+'),
        ''
    )
])

# 3. QaprilLandingV2.tsx
update_file('src/components/landing-v2/QaprilLandingV2.tsx', [
    (
        '? "bg-white/95 backdrop-blur-md border-slate-200 shadow-sm"',
        '? "bg-white border-slate-200 shadow-sm"'
    ),
    (
        ': "bg-slate-950/70 backdrop-blur-md border-white/10"',
        ': "bg-[#090D16] border-slate-800"'
    ),
    (
        'bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60',
        'bg-slate-950/85'
    ),
    (
        'bg-white/10 backdrop-blur-md border border-white/15',
        'bg-slate-900 border border-slate-700'
    ),
    (
        'bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-amber-400/40',
        'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40'
    ),
    (
        'bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-sky-400/40',
        'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40'
    ),
    (
        'bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl border border-white/10 hover:border-emerald-400/40',
        'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40'
    ),
    (
        'bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10',
        'bg-slate-900 px-4 py-2 rounded-xl border border-slate-800'
    ),
])

# 4. InteractiveMarketChart.tsx
update_file('src/components/landing-v2/InteractiveMarketChart.tsx', [
    (
        'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 shadow-lg shadow-amber-500/40',
        'bg-[#D97706]'
    ),
    (
        'bg-gradient-to-r from-amber-500 to-amber-400',
        'bg-[#D97706]'
    ),
    (
        'bg-gradient-to-br from-slate-900 to-slate-900/90',
        'bg-slate-900'
    ),
])

# 5. InteractiveModulesGrid.tsx
update_file('src/components/landing-v2/InteractiveModulesGrid.tsx', [
    (
        re.compile(r'bg-gradient-to-bl \$\{m\.gradient\}'),
        'bg-slate-800/20'
    ),
    (
        'bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent',
        'bg-slate-950/80'
    ),
    (
        'bg-white/10 backdrop-blur-md',
        'bg-slate-900 border border-slate-800'
    ),
])

# 6. InteractiveShowcase.tsx
update_file('src/components/landing-v2/InteractiveShowcase.tsx', [
    (
        'bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent',
        'bg-slate-950/80'
    ),
    (
        'bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl',
        'bg-white rounded-2xl p-6 border border-slate-200 shadow-lg'
    ),
])
