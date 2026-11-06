import { NextRequest, NextResponse } from "next/server";
import versionConfig from "@/../config/version.json";

function parseVersion(v?: string | null): number[] {
  if (!v) return [0, 0, 0];
  const clean = v.replace(/^v/, "").trim();
  const parts = clean.split(".").map((n) => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3);
}

function compareVersions(v1: string, v2: string): number {
  const p1 = parseVersion(v1);
  const p2 = parseVersion(v2);
  for (let i = 0; i < 3; i++) {
    if (p1[i] > p2[i]) return 1;
    if (p1[i] < p2[i]) return -1;
  }
  return 0;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appKey = searchParams.get("app") || "locataire"; // 'locataire' | 'proprietaire'
    const currentVersion = searchParams.get("currentVersion") || "1.0.0";
    const platform = searchParams.get("platform") || "android";

    const appConfig =
      (versionConfig.apps as Record<string, any>)[appKey] ||
      versionConfig.apps.locataire;

    const latestVersion = appConfig.version || versionConfig.version;
    const minVersion = versionConfig.minSupportedVersion || "1.0.0";

    const isBelowMin = compareVersions(currentVersion, minVersion) < 0;
    const isBelowLatest = compareVersions(currentVersion, latestVersion) < 0;

    return NextResponse.json(
      {
        success: true,
        app: appKey,
        platform,
        currentVersion,
        latestVersion,
        minSupportedVersion: minVersion,
        buildNumber: appConfig.versionCode || versionConfig.buildNumber,
        isUpdateAvailable: isBelowLatest,
        isForceUpdate: isBelowMin,
        releaseNotes: appConfig.releaseNotes,
        releaseDate: versionConfig.releaseDate,
        downloadUrl: appConfig.apkUrl,
        channel: versionConfig.channel,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur de vérification de version",
      },
      { status: 500 }
    );
  }
}
