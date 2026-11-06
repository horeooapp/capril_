def update_env(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    orange_block = """
# Orange SMS API (Côte d'Ivoire)
ORANGE_SMS_CLIENT_ID="NwdPqbZaW7ne4xhKMdtQKgjTIWc5l9AZ"
ORANGE_SMS_CLIENT_SECRET="jsik63aaYJpLTRQIglGpi9fN4EEvdLokruZZwfpimMrq"
ORANGE_SMS_SENDER_NUMBER="tel:+22500000000"
ORANGE_SMS_SENDER_NAME="QAPRIL"
"""
    if "ORANGE_SMS_CLIENT_ID" not in content:
        content += orange_block
    else:
        # replace existing
        import re
        content = re.sub(r'ORANGE_SMS_CLIENT_ID=.*', 'ORANGE_SMS_CLIENT_ID="NwdPqbZaW7ne4xhKMdtQKgjTIWc5l9AZ"', content)
        content = re.sub(r'ORANGE_SMS_CLIENT_SECRET=.*', 'ORANGE_SMS_CLIENT_SECRET="jsik63aaYJpLTRQIglGpi9fN4EEvdLokruZZwfpimMrq"', content)

    # set SMS_GATEWAY_PROVIDER="ORANGE"
    import re
    if "SMS_GATEWAY_PROVIDER=" in content:
        content = re.sub(r'SMS_GATEWAY_PROVIDER=.*', 'SMS_GATEWAY_PROVIDER="ORANGE"', content)
    else:
        content += '\nSMS_GATEWAY_PROVIDER="ORANGE"\n'

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {filepath} successfully!")

update_env(".env")
update_env(".env.example")

