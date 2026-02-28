const http = require('http');

async function testUssd() {
    const data = JSON.stringify({
        sessionId: "SESSION_1234",
        serviceCode: "*123#",
        phoneNumber: "+2250707070707",
        text: "2*009999" // Choix 2, suivi du numéro de quittance
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/ussd',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log('--- REPONSE USSD ---');
            console.log(responseData);
            console.log('--------------------');
        });
    });

    req.on('error', (error) => {
        console.error('Erreur de requete:', error);
    });

    req.write(data);
    req.end();
}

testUssd();
