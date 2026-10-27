#!/bin/sh
# Wrapper Chrome pour Docker — injecte UNIQUEMENT --no-sandbox
# @open-wa/wa-automate v4.76+ MD mode : SEULS ces 2 flags sont tolérés.
# Tout autre flag (--disable-gpu, --no-first-run, etc.) casse WhatsApp Web
# et provoque un TimeoutError de 30s lors de l'initialisation.
exec /usr/bin/chromium \
  --no-sandbox \
  --disable-setuid-sandbox \
  "$@"
