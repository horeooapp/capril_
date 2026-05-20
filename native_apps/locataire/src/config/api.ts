/**
 * Configuration de l'API QAPRIL
 * L'adresse IP doit correspondre à l'IP locale de votre machine (ipconfig)
 * port par défaut : 3000
 */
export const BASE_URL = 'https://www.qapril.net';

export const API_ENDPOINTS = {
  BASE_URL,
  AUTH: `${BASE_URL}/api/mobile/auth`,
  DASHBOARD: `${BASE_URL}/api/mobile/dashboard`,
  PAY_RENT: `${BASE_URL}/api/mobile/pay-rent`,
  TICKETS: `${BASE_URL}/api/mobile/tenant/tickets`,
  EMERGENCY_CONTACTS: `${BASE_URL}/api/mobile/tenant/emergency-contacts`,
  MESSAGES: `${BASE_URL}/api/mobile/tenant/messages`,
};
