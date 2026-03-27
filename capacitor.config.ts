import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ci.qapril.locataire',
  appName: 'QAPRIL',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Pour le développement local, décommentez la ligne suivante avec votre IP :
    // url: 'http://192.168.1.XX:3000', 
    cleartext: true
  }
};

export default config;
