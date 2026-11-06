with open('src/components/landing-v2/QaprilLandingV2.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Imports
imp_target = 'import { choisirTypeConnexion } from "@/actions/auth.actions";'
imp_replacement = '''import { choisirTypeConnexion } from "@/actions/auth.actions";
import InteractiveShowcase from "./InteractiveShowcase";
import InteractiveModulesGrid from "./InteractiveModulesGrid";
import InteractiveMarketChart from "./InteractiveMarketChart";'''

if imp_target in text:
    text = text.replace(imp_target, imp_replacement, 1)
    print("Imports added")
else:
    print("Imports target not found")

with open('src/components/landing-v2/QaprilLandingV2.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

