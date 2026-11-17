/**
 * Script de rattrapage (backfill) idempotent pour enrichir les biens existants avec quartier, commune et ville.
 *
 * Utilisation :
 * npx ts-node scripts/backfill_quartiers_properties.ts [--batch-size=10] [--limit=50]
 */

import { prisma } from "../src/lib/prisma";
import { reverseGeocode } from "../src/lib/geo/reverseGeocode";

async function main() {
  console.log("==========================================================");
  console.log("   QAPRIL — BACKFILL IDEMPOTENT QUARTIERS / LOCALISATION   ");
  console.log("==========================================================");

  const args = process.argv.slice(2);
  let batchSize = 10;
  let maxTotal = 1000;

  for (const arg of args) {
    if (arg.startsWith("--batch-size=")) {
      batchSize = parseInt(arg.split("=")[1], 10) || 10;
    }
    if (arg.startsWith("--limit=")) {
      maxTotal = parseInt(arg.split("=")[1], 10) || 1000;
    }
  }

  // 1. Recherche des biens avec coordonnées GPS mais sans quartier ou sans quartierSource, non verrouillés manuellement
  const propertiesToBackfill = await prisma.property.findMany({
    where: {
      OR: [
        { latitude: { not: null } },
        { gpsLatitude: { not: null } },
      ],
      quartierManuel: false,
      OR: [
        { quartier: null },
        { quartier: "" },
        { quartierSource: null },
      ],
    },
    select: {
      id: true,
      propertyCode: true,
      name: true,
      latitude: true,
      longitude: true,
      gpsLatitude: true,
      gpsLongitude: true,
      commune: true,
      quartier: true,
      city: true,
      ville: true,
      quartierManuel: true,
    },
    take: maxTotal,
  });

  const total = propertiesToBackfill.length;
  console.log(`📦 Biens à enrichir détectés : ${total}`);

  if (total === 0) {
    console.log("✅ Tous les biens ayant des coordonnées sont déjà à jour.");
    return;
  }

  let succesCount = 0;
  let failCount = 0;

  for (let i = 0; i < total; i += batchSize) {
    const batch = propertiesToBackfill.slice(i, i + batchSize);
    console.log(`\n--- Traitement du lot ${Math.floor(i / batchSize) + 1} (${batch.length} biens) ---`);

    for (const prop of batch) {
      const lat = prop.latitude ?? prop.gpsLatitude;
      const lng = prop.longitude ?? prop.gpsLongitude;

      if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
        console.log(`⏩ [${prop.propertyCode}] Coordonnées manquantes, ignoré.`);
        continue;
      }

      try {
        console.log(`🔍 Résolution pour [${prop.propertyCode}] (${lat.toFixed(4)}, ${lng.toFixed(4)})...`);
        const result = await reverseGeocode(lat, lng);

        const newQuartier = result.quartier || prop.quartier || null;
        const newCommune = result.commune || prop.commune || "Cocody";
        const newVille = result.ville || prop.ville || prop.city || "Abidjan";

        await prisma.property.update({
          where: { id: prop.id },
          data: {
            latitude: lat,
            longitude: lng,
            quartier: newQuartier,
            commune: newCommune,
            ville: newVille,
            quartierSource: result.source,
            quartierManuel: false,
            localisationMiseAJourLe: new Date(),
          },
        });

        console.log(
          `   ✅ Mis à jour : 📍 ${newQuartier ? newQuartier + ", " : ""}${newCommune}, ${newVille} (Source: ${result.source})`
        );
        succesCount++;
      } catch (err: any) {
        console.error(`   ❌ Échec pour [${prop.propertyCode}]:`, err?.message || err);
        failCount++;
      }

      // Pause de sécurité entre chaque bien pour respecter les quotas
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Pause additionnelle entre les lots
    if (i + batchSize < total) {
      console.log("⏳ Pause inter-lots de 2 secondes...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n==========================================================");
  console.log(`🎉 Rapport de fin : ${succesCount} enrichis avec succès, ${failCount} échecs.`);
  console.log("==========================================================");
}

main()
  .catch((e) => {
    console.error("Erreur fatale backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
