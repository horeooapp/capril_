import { RapidAPIVerifyService } from "../src/lib/sms";
import * as dotenv from "dotenv";

dotenv.config();

async function test() {
  const service = new RapidAPIVerifyService();
  const testPhone = process.argv[2] || "+2250102030405"; // Default test phone
  const testOtp = "123456";

  console.log(`Testing RapidAPI SMS to ${testPhone}...`);
  const result = await service.sendOTP(testPhone, testOtp);

  if (result.success) {
    console.log(`✅ Success! Message ID: ${result.messageId}`);
  } else {
    console.error(`❌ Failed: ${result.error}`);
  }
}

test();
