# Update AdminSidebar.tsx
with open('src/components/admin/AdminSidebar.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'import { executeLogout }' not in c:
    c = c.replace('import { usePathname } from "next/navigation"', 'import { usePathname } from "next/navigation"\nimport { executeLogout } from "@/lib/auth-logout"')

c = c.replace('onLogout: () => Promise<void>;', 'onLogout?: () => Promise<void> | void;')
c = c.replace('onClick={onLogout}', 'onClick={() => { if (onLogout) { try { onLogout(); } catch {} } executeLogout("/admin/login"); }}')

with open('src/components/admin/AdminSidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated AdminSidebar.tsx')

# Update AdminHeader.tsx
with open('src/components/admin/AdminHeader.tsx', 'r', encoding='utf-8') as f:
    c2 = f.read()

if 'import { executeLogout }' not in c2:
    c2 = c2.replace('import { Home, LogOut } from "lucide-react"', 'import { Home, LogOut } from "lucide-react"\nimport { executeLogout } from "@/lib/auth-logout"')

c2 = c2.replace('onLogout: () => Promise<void>', 'onLogout?: () => Promise<void> | void')
c2 = c2.replace('onClick={onLogout}', 'onClick={() => { if (onLogout) { try { onLogout(); } catch {} } executeLogout("/admin/login"); }}')

with open('src/components/admin/AdminHeader.tsx', 'w', encoding='utf-8') as f:
    f.write(c2)
print('Updated AdminHeader.tsx')

