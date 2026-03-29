const fs = require('fs');
const path = require('path');

class MockRedis {
    constructor() {
        this.filePath = path.join(process.cwd(), '.redis-mock.json');
        this.status = 'mock';
    }

    loadStore() {
        try {
            if (fs.existsSync(this.filePath)) {
                return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
            }
        } catch (e) {
            console.error('[MockRedis] Error loading file:', e);
        }
        return {};
    }

    saveStore(store) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(store), 'utf-8');
            console.log("File saved to", this.filePath);
        } catch (e) {
            console.error('[MockRedis] Error saving file:', e);
        }
    }

    async set(key, value, mode, duration) {
        const store = this.loadStore();
        const expiry = Date.now() + (duration ? duration * 1000 : 3600000);
        store[key] = { value, expiry };
        this.saveStore(store);
        return 'OK';
    }

    async get(key) {
        const store = this.loadStore();
        const item = store[key];
        if (!item || item.expiry < Date.now()) {
            if (item) {
                delete store[key];
                this.saveStore(store);
            }
            return null;
        }
        return item.value;
    }
}

async function run() {
  const m = new MockRedis();
  await m.set('otp:test', '123456', 'EX', 600);
  const val = await m.get('otp:test');
  console.log("Tested GET:", val);
  if (fs.existsSync(m.filePath)) {
     console.log("File exists at:", m.filePath);
  } else {
     console.log("FILE DOES NOT EXIST!");
  }
}
run();
