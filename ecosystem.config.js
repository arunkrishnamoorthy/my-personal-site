module.exports = {
  apps: [
    {
      name: "lmstest",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://my-personal-site_owner:npg_szOt4pqKZ6hr@ep-young-mud-a9pbietm-pooler.gwc.azure.neon.tech/my-personal-site?sslmode=require",
      },
    },
  ],
};