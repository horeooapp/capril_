import { loginWithAdminCredentials, loginWithOTP } from "./src/actions/auth";

async function run() {
    console.log("Testing Admin login...");
    try {
        const adminRes = await loginWithAdminCredentials("admin@qapril.ci", "admin123");
        console.log("Admin Res:", adminRes);
    } catch (e) {
        console.error("Admin Login Error:", e);
    }

    console.log("Testing OTP login...");
    try {
        const otpRes = await loginWithOTP("test@qapril.ci", "123456");
        console.log("OTP Res:", otpRes);
    } catch (e) {
        console.error("OTP Login Error:", e);
    }
}

run();
