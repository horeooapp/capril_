const clientId = "NwdPqbZaW7ne4xhKMdtQKgjTIWc5l9AZ";
const clientSecret = "jsik63aaYJpLTRQIglGpi9fN4EEvdLokruZZwfpimMrq";

async function main() {
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

  const tokenData = await tokenResp.json();
  const token = tokenData.access_token;

  console.log("Token obtained. Testing SMS send payload...");

  const senderAddress = "tel:+22500000000";
  const recipientAddress = "tel:+2250700000000"; // Test number
  const url = `https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(senderAddress)}/requests`;

  const payload = {
    outboundSMSMessageRequest: {
      address: recipientAddress,
      senderAddress: senderAddress,
      outboundSMSTextMessage: {
        message: "Test QAPRIL Orange SMS"
      },
      senderName: "QAPRIL"
    }
  };

  const smsResp = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  console.log("Send status:", smsResp.status);
  const smsData = await smsResp.text();
  console.log("Send response:", smsData);
}

main().catch(console.error);

