import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Mapping officiel des archives APK certifiees
const APK_REDIRECTS: Record<string, string> = {
  "qapril-proprietaire-latest.apk": "https://expo.dev/artifacts/eas/IWiIc8XwZ8U5FjAqnPJQQo5S_qyuRMY1iPQTWZ7W_9E.apk",
  "qapril-proprietaire-v2.0.7.apk": "https://expo.dev/artifacts/eas/IWiIc8XwZ8U5FjAqnPJQQo5S_qyuRMY1iPQTWZ7W_9E.apk",
  "qapril-proprietaire-v2.0.0.apk": "https://expo.dev/artifacts/eas/ZFZfTdzC3uc9T3OmwQWR1krIVqDrlTQwTBFcigS9R3w.apk",
  "qapril-locataire-latest.apk": "https://expo.dev/artifacts/eas/eZz_QhSuR2Q1gHxNyi_i3g1sKFUMffWYRWZkvrGtc5Y.apk",
  "qapril-locataire-v2.0.7.apk": "https://expo.dev/artifacts/eas/eZz_QhSuR2Q1gHxNyi_i3g1sKFUMffWYRWZkvrGtc5Y.apk",
  "qapril-locataire-v2.0.0.apk": "https://expo.dev/artifacts/eas/fid1aYP5BbboeRhEaQvCo_vIeGFUKmuYKQYQuwmi6qE.apk",
  "qapril-agence-latest.apk": "https://expo.dev/artifacts/eas/suwZFEWCBKqH8WsgUWvZxO2I4GNTGMf5Ddm1SNHjD8E.apk",
  "qapril-agence-v2.0.7.apk": "https://expo.dev/artifacts/eas/suwZFEWCBKqH8WsgUWvZxO2I4GNTGMf5Ddm1SNHjD8E.apk",
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

