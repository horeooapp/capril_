module.exports = {
  apps: [
    {
      name: "qapril-prod",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "max", // Utilise tous les cœurs CPU disponibles
      exec_mode: "cluster", // Mode cluster pour la haute disponibilité
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      }
    }
  ]
};
