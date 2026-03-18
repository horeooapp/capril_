import { PrismaClient, PaymentCanal } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed des préfixes MSISDN M-PGW...");

  const prefixes: { prefixe: string; operateur: PaymentCanal }[] = [
    // Orange CI : 05, 07
    { prefixe: "0500", operateur: "ORANGE" }, { prefixe: "0501", operateur: "ORANGE" },
    { prefixe: "0502", operateur: "ORANGE" }, { prefixe: "0503", operateur: "ORANGE" },
    { prefixe: "0504", operateur: "ORANGE" }, { prefixe: "0505", operateur: "ORANGE" },
    { prefixe: "0506", operateur: "ORANGE" }, { prefixe: "0507", operateur: "ORANGE" },
    { prefixe: "0508", operateur: "ORANGE" }, { prefixe: "0509", operateur: "ORANGE" },
    { prefixe: "0700", operateur: "ORANGE" }, { prefixe: "0701", operateur: "ORANGE" },
    { prefixe: "0702", operateur: "ORANGE" }, { prefixe: "0703", operateur: "ORANGE" },
    { prefixe: "0707", operateur: "ORANGE" }, { prefixe: "0708", operateur: "ORANGE" },
    { prefixe: "0709", operateur: "ORANGE" },

    // MTN CI : 05 (certains), 06
    { prefixe: "0600", operateur: "MTN" }, { prefixe: "0601", operateur: "MTN" },
    { prefixe: "0602", operateur: "MTN" }, { prefixe: "0603", operateur: "MTN" },
    { prefixe: "0604", operateur: "MTN" }, { prefixe: "0605", operateur: "MTN" },
    { prefixe: "0606", operateur: "MTN" }, { prefixe: "0607", operateur: "MTN" },
    { prefixe: "0608", operateur: "MTN" }, { prefixe: "0609", operateur: "MTN" },
    { prefixe: "0544", operateur: "MTN" }, { prefixe: "0545", operateur: "MTN" },
    { prefixe: "0546", operateur: "MTN" }, { prefixe: "0554", operateur: "MTN" },
    { prefixe: "0555", operateur: "MTN" },

    // Wave CI : 01
    { prefixe: "0100", operateur: "WAVE" }, { prefixe: "0101", operateur: "WAVE" },
    { prefixe: "0102", operateur: "WAVE" }, { prefixe: "0103", operateur: "WAVE" },
    { prefixe: "0104", operateur: "WAVE" },

    // Moov CI : 01 (certains), 07
    { prefixe: "0105", operateur: "MOOV" }, { prefixe: "0106", operateur: "MOOV" },
    { prefixe: "0107", operateur: "MOOV" }, { prefixe: "0147", operateur: "MOOV" },
    { prefixe: "0148", operateur: "MOOV" }, { prefixe: "0704", operateur: "MOOV" },
    { prefixe: "0705", operateur: "MOOV" }, { prefixe: "0706", operateur: "MOOV" },
    { prefixe: "0747", operateur: "MOOV" }, { prefixe: "0748", operateur: "MOOV" },
  ];

  for (const item of prefixes) {
    await prisma.pgwMsisdnLookup.upsert({
      where: { prefixe: item.prefixe },
      update: { operateur: item.operateur, actif: true },
      create: { prefixe: item.prefixe, operateur: item.operateur, actif: true },
    });
  }

  console.log(`✅ Seed terminé : ${prefixes.length} préfixes importés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
