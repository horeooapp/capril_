const net = require('net');

const client = new net.Socket();
const timeout = 5000;

client.setTimeout(timeout);

client.connect(5432, '187.77.93.154', function() {
    console.log('Connected to 187.77.93.154:5432');
    client.destroy();
});

client.on('error', function(err) {
    console.log('Error: ' + err.message);
});

client.on('timeout', function() {
    console.log('Timeout trying to connect to 187.77.93.154:5432');
    client.destroy();
});
