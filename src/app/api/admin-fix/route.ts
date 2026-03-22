import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt-ts";

/**
 * TEMPORARY API ROUTE TO FIX PRODUCTION ADMIN LOGIN
 * Usage: /api/admin-fix?secret=QAPRIL_FIX_2026
 * 
 * IMPORTANT: Delete this file as soon as the admin access is restored!
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Basic protection
    if (secret !== "QAPRIL_FIX_2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = "admin@qapril.net";
    const password = "Admin@qapsec2026!";

    try {
        console.log(`[FIX-ADMIN] Attempting to create/update admin: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
        });

        let user;
        if (existingUser) {
            user = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    role: 'ADMIN',
                    password: hashedPassword,
                    status: 'active'
                }
            });
            console.log(`[FIX-ADMIN] Updated existing user: ${email}`);
        } else {
            // Use a unique dummy phone for admin creation
            const dummyPhone = `+2250000000000_admin_${Date.now()}`;
            user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    role: 'ADMIN',
                    phone: dummyPhone,
                    fullName: 'Administrateur Central',
                    status: 'active'
                }
            });
            console.log(`[FIX-ADMIN] Created new user: ${email}`);
        }

        return NextResponse.json({
            success: true,
            message: `Utilisateur ${email} configuré en tant qu'ADMIN.`,
            userId: user.id
        });

    } catch (error) {
        console.error("[FIX-ADMIN] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}
