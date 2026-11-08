import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/manuel/download
 * Permet de télécharger le fichier Word officiel du Manuel d'Utilisation v2.0
 */
export async function GET() {
    try {
        const publicPath = path.join(process.cwd(), 'public', 'QAPRIL_Manuel_Utilisation_v2.0.docx');
        const rootPath = path.join(process.cwd(), 'QAPRIL_Manuel_Utilisation_v2.0.docx');
        const filePath = fs.existsSync(publicPath) ? publicPath : rootPath;
        
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "Fichier du manuel introuvable." }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': 'attachment; filename="QAPRIL_Manuel_Utilisation_v2.0.docx"',
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("[MANUEL] Erreur téléchargement manuel:", error);
        return NextResponse.json({ error: "Erreur serveur lors du téléchargement." }, { status: 500 });
    }
}

