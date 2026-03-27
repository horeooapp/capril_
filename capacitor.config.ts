import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ci.qapril.locataire',
  appName: 'QAPRIL',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://www.qapril.ci',
    cleartext: true
  }
};

export default config;
