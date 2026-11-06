const clientId = "NwdPqbZaW7ne4xhKMdtQKgjTIWc5l9AZ";
const clientSecret = "jsik63aaYJpLTRQIglGpi9fN4EEvdLokruZZwfpimMrq";

async function main() {
  console.log("1. Authenticating with Orange Developer API...");
  const authHeader = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenResp = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: "grant_type=client_credentials"
  });

  console.log("Token status:", tokenResp.status);
  const tokenData = await tokenResp.json();
  console.log("Token data:", tokenData);

  if (!tokenResp.ok || !tokenData.access_token) {
    console.error("Authentication failed!");
    return;
  }

  const token = tokenData.access_token;

  console.log("\n2. Checking SMS contracts / balance...");
  const cResp = await fetch("https://api.orange.com/sms/admin/v1/contracts", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  });
  console.log("Contracts status:", cResp.status);
  const cData = await cResp.text();
  console.log("Contracts:", cData);

  console.log("\n3. Checking purchase orders...");
  const poResp = await fetch("https://api.orange.com/sms/admin/v1/purchaseorders", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  });
  console.log("Purchase orders status:", poResp.status);
  const poData = await poResp.text();
  console.log("Purchase orders:", poData);
}

main().catch(console.error);

