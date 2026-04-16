const BASE_URL = 'http://localhost:3001'; // Change to production URL if needed
const ENDPOINT = '/api/mobile/dashboard';
const CONCURRENT_REQUESTS = 10;
const TOTAL_REQUESTS = 100;

async function runTest() {
    console.log(`🚀 Démarrage du test de charge : ${TOTAL_REQUESTS} requêtes (${CONCURRENT_REQUESTS} en parallèle)`);
    console.log(`📍 Cible : ${BASE_URL}${ENDPOINT}`);

    let completed = 0;
    let failed = 0;
    const start = Date.now();

    const sendRequest = async () => {
        try {
            const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token: "515af59d-4c95-4740-929f-f8003f6406de", 
                    role: "TENANT" 
                })
            });
            if (res.ok) completed++;
            else failed++;
        } catch (e) {
            failed++;
        }
    };

    const chunks = [];
    for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_REQUESTS) {
        const batch = Array(Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - i)).fill(null).map(sendRequest);
        await Promise.all(batch);
        process.stdout.write(`.`);
    }

    const end = Date.now();
    const duration = (end - start) / 1000;
    
    console.log("\n\n📊 RÉSULTATS DU TEST :");
    console.log(`✅ Succès : ${completed}`);
    console.log(`❌ Échecs : ${failed}`);
    console.log(`⏱️ Durée totale : ${duration.toFixed(2)}s`);
    console.log(`⚡ Moyenne : ${(completed / duration).toFixed(2)} req/s`);
    
    if (failed > 0) {
        console.warn("⚠️ Attention : Des échecs ont été détectés. Vérifiez les logs serveurs.");
    } else {
        console.log("🟢 Serveur stable sous cette charge.");
    }
}

runTest();
