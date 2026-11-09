import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Mapping officiel des archives APK certifiees
const APK_REDIRECTS: Record<string, string> = {
  "qapril-proprietaire-latest.apk": "https://expo.dev/artifacts/eas/rR0X5xmtZEIfme8eY61X7md2ZjkQrhF5g5VZol8M0AQ.apk",
  "qapril-proprietaire-v2.0.0.apk": "https://expo.dev/artifacts/eas/rR0X5xmtZEIfme8eY61X7md2ZjkQrhF5g5VZol8M0AQ.apk",
  "qapril-locataire-latest.apk": "https://expo.dev/artifacts/eas/9Hhd36Ex32qwW9sy05w2xn_dsznTaVfl1zsLopfGVgE.apk",
  "qapril-locataire-v2.0.0.apk": "https://expo.dev/artifacts/eas/9Hhd36Ex32qwW9sy05w2xn_dsznTaVfl1zsLopfGVgE.apk",
  "qapril-agence-latest.apk": "https://expo.dev/artifacts/eas/rR0X5xmtZEIfme8eY61X7md2ZjkQrhF5g5VZol8M0AQ.apk",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const cleanFilename = filename?.trim().toLowerCase();

    // 1. Verification de la presence physique du fichier sur le disque local
    const localFilePath = path.join(process.cwd(), "public", "downloads", filename);
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath);
      const fileBuffer = fs.readFileSync(localFilePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.android.package-archive",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": stats.size.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // 2. Redirection securisee vers l'archive EAS officielle correspondante
    const directUrl = APK_REDIRECTS[cleanFilename];
    if (directUrl) {
      return NextResponse.redirect(directUrl, { status: 302 });
    }

    // 3. Fallback : redirection vers le hub de telechargement officiel
    return NextResponse.redirect(new URL("/telecharger", req.url), { status: 302 });
  } catch (error) {
    console.error("Erreur téléchargement APK:", error);
    return NextResponse.redirect(new URL("/telecharger", req.url), { status: 302 });
  }
}

