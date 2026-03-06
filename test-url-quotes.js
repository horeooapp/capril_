const urlWithSingleQuotes = "'https://qapril.net'/api/auth/callback/resend?token=123";
try {
    const parsed = new URL(urlWithSingleQuotes);
    console.log("Success:", parsed.host);
} catch (e) {
    console.error("Error parsing single quoted URL:", e.message);
}

const urlWithDoubleQuotes = '"https://qapril.net"/api/auth/callback/resend?token=123';
try {
    const parsed = new URL(urlWithDoubleQuotes);
    console.log("Success:", parsed.host);
} catch (e) {
    console.error("Error parsing double quoted URL:", e.message);
}

const normalUrl = 'https://qapril.net/api/auth/callback/resend?token=123';
try {
    const parsed = new URL(normalUrl);
    console.log("Success:", parsed.host);
} catch (e) {
    console.error("Error parsing normal URL:", e.message);
}
