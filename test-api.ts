import { POST } from './src/app/api/agent-bail/route';

async function run() {
    const req = {
        json: async () => ({ messages: [] })
    } as any;

    try {
        const res = await POST(req);
        console.log("Status:", res.status);
    } catch(e) {
        console.log("Error:", e);
    }
}
run();
