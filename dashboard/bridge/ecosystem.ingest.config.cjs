module.exports = {
  apps: [
    {
      name: "airvent-ingest",
      cwd: __dirname,
      script: "./node_modules/.bin/ts-node",
      args: "-T ingest.ts",
      interpreter: "none",
      autorestart: true,
      restart_delay: 5000,
      watch: false,
      env: { NODE_ENV: "production" }
    }
  ]
};
