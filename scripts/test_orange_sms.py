import requests
import json
import base64

client_id = "NwdPqbZaW7ne4xhKMdtQKgjTIWc5l9AZ"
client_secret = "jsik63aaYJpLTRQIglGpi9fN4EEvdLokruZZwfpimMrq"

print("1. Authenticating with Orange Developer API...")
auth_header = "Basic " + base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

token_url = "https://api.orange.com/oauth/v3/token"
resp = requests.post(
    token_url,
    headers={
        "Authorization": auth_header,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    },
    data="grant_type=client_credentials"
)

print(f"Token status: {resp.status_code}")
try:
    token_data = resp.json()
    print("Token response:", json.dumps(token_data, indent=2))
    access_token = token_data.get("access_token")
except Exception as e:
    print("Token error:", resp.text)
    access_token = None

if access_token:
    print("\n2. Checking SMS contracts / balance...")
    contracts_url = "https://api.orange.com/sms/admin/v1/contracts"
    c_resp = requests.get(
        contracts_url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }
    )
    print(f"Contracts status: {c_resp.status_code}")
    print("Contracts response:", c_resp.text)

    print("\n3. Checking purchase orders...")
    po_url = "https://api.orange.com/sms/admin/v1/purchaseorders"
    po_resp = requests.get(
        po_url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }
    )
    print(f"Purchase orders status: {po_resp.status_code}")
    print("Purchase orders response:", po_resp.text)

