import { OrangeSMSService } from "../src/lib/sms";
import * as dotenv from "dotenv";
dotenv.config();

async function testOrangeSMS() {
    const testPhone = process.argv[2] || "+22500000000";
    console.log(`🔍 Testing Orange SMS to ${testPhone}...`);
    
    const service = new OrangeSMSService();
    
    try {
        console.log("--- Sending OTP ---");
        const result = await service.sendOTP(testPhone, "123456");
        console.log("Result:", result);
        
        if (result.success) {
            console.log("✅ SMS Sent successfully via Orange CI.");
        } else {
            console.error("❌ Failed to send SMS:", result.error);
        }
    } catch (error) {
        console.error("💥 Crash during test:", error);
    }
}

testOrangeSMS();
