const path = require("path");
const { PrismaClient } = require("@prisma/client");

async function testDrive() {
    let fsPath = "./dev.db";
    // Like in Next.js right now
    let absPath = path.resolve(process.cwd(), fsPath);
    let finalUrl = "file:" + absPath;

    console.log("Testing with manual url:", finalUrl);

    try {
        const prisma = new PrismaClient({
            datasources: {
                db: { url: finalUrl }
            }
        });

        const user = await prisma.user.findFirst();
        console.log("Success! Found user:", user);
    } catch (e) {
        console.error("Failed:", e);
    }
}

testDrive();
