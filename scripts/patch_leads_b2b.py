# 1. Patch src/actions/lead.actions.ts
with open("src/actions/lead.actions.ts", "r", encoding="utf-8") as f:
    la = f.read()

old_func = """export async function purchaseLead(agenceId: string, leadId: string) {
    try {
        return await prisma.$transaction(async (tx) => {"""

new_func = """export async function purchaseLead(agenceId: string, leadId: string) {
    try {
        let targetAgenceId = agenceId;
        if (!targetAgenceId) {
            const { auth } = await import("@/lib/auth");
            const session = await auth();
            if (!session?.user?.id) throw new Error("Veuillez vous connecter pour acheter un lead.");
            targetAgenceId = session.user.id;
        }

        return await prisma.$transaction(async (tx) => {"""

if old_func in la:
    la = la.replace(old_func, new_func)
    la = la.replace("where: { userId: agenceId, status: \"COMPLETED\" }", "where: { userId: targetAgenceId, status: \"COMPLETED\" }")
    la = la.replace("userId: agenceId,", "userId: targetAgenceId,")
    la = la.replace("agenceId: agenceId,", "agenceId: targetAgenceId,")
    with open("src/actions/lead.actions.ts", "w", encoding="utf-8") as f:
        f.write(la)
    print("lead.actions.ts patched successfully!")
else:
    print("old_func not found in lead.actions.ts")

# 2. Patch src/app/dashboard/(portal)/leads-b2b/page.tsx
with open("src/app/dashboard/(portal)/leads-b2b/page.tsx", "r", encoding="utf-8") as f:
    lp = f.read()

# Add import
lp = lp.replace(
    'import { Users, Target, Zap, ShoppingCart } from "lucide-react";',
    'import { Users, Target, Zap, ShoppingCart } from "lucide-react";\nimport { BuyLeadButton } from "@/components/dashboard/agency/BuyLeadButton";'
)

# Replace button
old_button = """                                        <td className="px-6 py-4 text-right">
                                            <button className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                                                <ShoppingCart size={16} className="mr-1.5" />
                                                Acheter
                                            </button>
                                        </td>"""

new_button = """                                        <td className="px-6 py-4 text-right">
                                            <BuyLeadButton leadId={lead.id} prix={lead.prixLead || 10000} />
                                        </td>"""

if old_button in lp:
    lp = lp.replace(old_button, new_button)
    with open("src/app/dashboard/(portal)/leads-b2b/page.tsx", "w", encoding="utf-8") as f:
        f.write(lp)
    print("leads-b2b/page.tsx patched successfully!")
else:
    # try CRLF
    old_button_crlf = old_button.replace("\n", "\r\n")
    new_button_crlf = new_button.replace("\n", "\r\n")
    if old_button_crlf in lp:
        lp = lp.replace(old_button_crlf, new_button_crlf)
        with open("src/app/dashboard/(portal)/leads-b2b/page.tsx", "w", encoding="utf-8") as f:
            f.write(lp)
        print("leads-b2b/page.tsx patched with CRLF successfully!")
    else:
        print("old_button not found in leads-b2b/page.tsx")

