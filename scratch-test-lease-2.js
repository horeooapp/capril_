const { getLeaseById } = require('./src/actions/leases');
async function run() {
  try {
    const res = await getLeaseById('60448d20-65eb-4b5a-914e-187ef2886639');
    console.log('Result:', res ? JSON.stringify(res).substring(0, 50) : 'null');
  } catch (e) {
    console.error('Crash!', e);
  }
}
run();
