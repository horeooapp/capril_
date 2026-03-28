import { prisma } from "./prisma";

/**
 * Generate a unique opaque landlord code (BAI-XXX)
 * Rulebook: MM-04b Opaque Code
 */
export async function generateLandlordCode(): Promise<string> {
    const min = 100;
    const max = 9999;
    let code: string = "";
    let exists = true;

    while (exists) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        code = `BAI-${num}`;
        const user = await prisma.user.findUnique({
            where: { landlordCode: code },
        });
        if (!user) exists = false;
    }

    return code;
}

/**
 * Populate missing landlord codes for all users.
 * Should be run after schema migration.
 */
export async function populateLandlordCodes() {
    const users = await prisma.user.findMany({
        where: { 
            role: { in: ["LANDLORD", "LANDLORD_PRO", "AGENCY"] },
            landlordCode: null 
        },
    });

    console.log(`[MM-04b] Found ${users.length} landlords without codes.`);

    for (const user of users) {
        const code = await generateLandlordCode();
        await prisma.user.update({
            where: { id: user.id },
            data: { landlordCode: code },
        });
        console.log(`[MM-04b] Assigned ${code} to User ${user.id}`);
    }

    return users.length;
}
