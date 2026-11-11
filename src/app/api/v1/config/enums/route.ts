import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "config", "enums.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Fichier config/enums.json introuvable" }, { status: 404 });
    }
    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erreur serveur" }, { status: 500 });
  }
}

