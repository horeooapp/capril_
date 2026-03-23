const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Wallet configuration (JS version)...');

  const walletConfigs = [
    { cle: 'wallet_seuil_alerte_defaut', valeur: 500, description: 'Seuil par défaut pour alerte SMS/WA' },
    { cle: 'wallet_mois_couverture', valeur: 2, description: 'Nombre de mois de couverture suggérés' },
    { cle: 'wallet_rappel_defaut_jour', valeur: 25, description: 'Jour par défaut pour le rappel mensuel' },
    { cle: 'wallet_alerte_max_par_jour', valeur: 1, description: "Nombre max d'alertes automatiques par jour" },
    { cle: 'wallet_deeplink_wave_base', valeur: 0, description: 'Base URL Deep Link Wave CI', metadata: 'https://wave.me/pay?amount={amt}&ref={ref}' },
    { cle: 'wallet_deeplink_om_base', valeur: 0, description: 'Base URL Deep Link Orange Money', metadata: 'https://orange.ci/pay?m={amt}&r={ref}' },
    { cle: 'wallet_deeplink_mtn_base', valeur: 0, description: 'Base URL Deep Link MTN CI', metadata: 'https://mymtn.ci/pay?a={amt}&id={ref}' },
    { cle: 'wallet_deeplink_fallback', valeur: 0, description: 'URL de repli rechargement', metadata: 'https://qapril.ci/recharge?amount={amt}&op={op}&ref={ref}' },
  ];

  for (const config of walletConfigs) {
    await prisma.configTarif.upsert({
      where: { cle: config.cle },
      update: {},
      create: {
        cle: config.cle,
        valeur: config.valeur,
        description: config.description
      }
    });
  }

  console.log('✅ Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
