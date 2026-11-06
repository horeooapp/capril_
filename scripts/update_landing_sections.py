import re

with open('src/components/landing-v2/QaprilLandingV2.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remplacer les 4 piliers par InteractiveShowcase
pilier_pattern = re.compile(
    r'(<section id="piliers" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">[\s\S]*?)(<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?</div>\s*</section>)',
    re.MULTILINE
)

pilier_replacement = r'''\1<div className="mt-8">
            <InteractiveShowcase />
          </div>
        </section>'''

new_text = pilier_pattern.sub(pilier_replacement, text)

if new_text != text:
    print("Section Piliers updated with InteractiveShowcase")
    text = new_text
else:
    print("Warning: Section Piliers pattern not matched")

# 2. Remplacer les modules par InteractiveModulesGrid
modules_pattern = re.compile(
    r'(<section id="modules" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">[\s\S]*?)(<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">[\s\S]*?</div>\s*</section>)',
    re.MULTILINE
)

modules_replacement = r'''\1<div className="mt-8">
            <InteractiveModulesGrid />
          </div>
        </section>'''

new_text2 = modules_pattern.sub(modules_replacement, text)

if new_text2 != text:
    print("Section Modules updated with InteractiveModulesGrid")
    text = new_text2
else:
    print("Warning: Section Modules pattern not matched")

# 3. Insérer la section InteractiveMarketChart juste avant le comparatif
chart_section = '''        {/* ══════════════════════════════════════════════════════════════════
            ANIMATION GRAPHIQUE & OBSERVATOIRE INTERACTIF DU MARCHÉ (STYLE META/APPLE)
        ══════════════════════════════════════════════════════════════════ */}
        <section id="observatoire-marche" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
          <InteractiveMarketChart />
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            7. TABLEAU COMPARATIF : MÉTHODE TRADITIONNELLE VS QAPRIL
        ══════════════════════════════════════════════════════════════════ */}'''

target_comp = '''        {/* ══════════════════════════════════════════════════════════════════
            7. TABLEAU COMPARATIF : MÉTHODE TRADITIONNELLE VS QAPRIL
        ══════════════════════════════════════════════════════════════════ */}'''

if target_comp in text:
    text = text.replace(target_comp, chart_section, 1)
    print("Market chart section added before comparison")
else:
    print("Warning: Comparison header not found")

with open('src/components/landing-v2/QaprilLandingV2.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Landing page successfully updated with rich UI/UX components!")

