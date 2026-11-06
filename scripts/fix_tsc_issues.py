# 1. Fix src/actions/lead.actions.ts
with open("src/actions/lead.actions.ts", "r", encoding="utf-8") as f:
    la = f.read()
la = la.replace('@/lib/auth', '@/auth')
with open("src/actions/lead.actions.ts", "w", encoding="utf-8") as f:
    f.write(la)
print("lead.actions.ts updated")

# 2. Fix src/app/dashboard/(portal)/layout-client.tsx
with open("src/app/dashboard/(portal)/layout-client.tsx", "r", encoding="utf-8") as f:
    lc = f.read()
lc = lc.replace('import { usePathname } from "next/navigation"', 'import { usePathname, useRouter } from "next/navigation"')
lc = lc.replace('    const pathname = usePathname()', '    const pathname = usePathname()\n    const router = useRouter()')
with open("src/app/dashboard/(portal)/layout-client.tsx", "w", encoding="utf-8") as f:
    f.write(lc)
print("layout-client.tsx updated")

# 3. Fix src/components/dashboard/agency/BuyLeadButton.tsx
with open("src/components/dashboard/agency/BuyLeadButton.tsx", "r", encoding="utf-8") as f:
    bl = f.read()
bl = bl.replace('import toast from "react-hot-toast";', 'import { toast } from "sonner";')
with open("src/components/dashboard/agency/BuyLeadButton.tsx", "w", encoding="utf-8") as f:
    f.write(bl)
print("BuyLeadButton.tsx updated")

