module.exports = {
  apps: [
    {
      name: "airvent-bridge",
      cwd: "/opt/airvent-team/dashboard/bridge",
      script: "npm",
      args: "start",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
