import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ci.qapril.locataire',
  appName: 'QAPRIL',
  webDir: 'out',
  server: {
    androidScheme: 'http',
    url: 'https://qapril.ci/',
    allowNavigation: ['*'],
    cleartext: true
  }
};

export default config;
