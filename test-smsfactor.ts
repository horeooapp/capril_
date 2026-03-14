
import { IKODDIService } from './src/lib/sms';
import * as dotenv from 'dotenv';

dotenv.config();

async function testSMS() {
    const service = new IKODDIService();
    const phone = process.argv[2];
    
    if (!phone) {
        console.error("Usage: npx ts-node test-ikoddi.ts <phone_number>");
        process.exit(1);
    }

    console.log(`Testing IKODDI with phone: ${phone}`);
    const result = await service.sendOTP(phone, '123456');
    
    if (result.success) {
        console.log("✅ SMS Sent Successfully!");
        console.log("Ticket ID:", result.messageId);
    } else {
        console.error("❌ SMS Failed!");
        console.error("Error:", result.error);
    }
}

testSMS().catch(console.error);
