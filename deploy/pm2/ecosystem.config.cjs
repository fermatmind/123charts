// Web node only; the API-node worker uses self-hosted/app.compose.yml.
module.exports = { apps: [{
  name: "123charts-web", cwd: "/srv/123charts/current", script: "server.js",
  node_args: "--env-file=/etc/123charts/web.env", instances: 1, exec_mode: "fork",
  env: { NODE_ENV: "production" },
  out_file: "/var/log/123charts/web-out.log", error_file: "/var/log/123charts/web-error.log",
  merge_logs: true, log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  max_memory_restart: "768M", max_restarts: 10, restart_delay: 3000, kill_timeout: 15000,
}] };
