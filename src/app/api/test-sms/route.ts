import { NextResponse } from "next/server";
import { getSMSService } from "@/lib/sms";

export async function GET() {
  try {
    const service = getSMSService();
    const testPhone = "2250700000000"; // Numéro de test (sans + pour Orange CI)
    
    console.log("[TEST] Sending SMS via:", (service as any).constructor.name);
    
    const result = await service.sendOTP(testPhone, "123456");
    
    return NextResponse.json({
      success: result.success,
      provider: (service as any).constructor.name,
      messageId: result.messageId,
      error: result.error
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
