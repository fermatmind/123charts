# 30 Production Runbook

## Date

2026-06-15

## Purpose

Day-to-day operations guide for the 123Charts production deployment on Aliyun Hong Kong. Covers startup, monitoring, logs, backups, incident response, and common maintenance tasks.

## Server Access

```
SSH:        ssh deploy@<server-ip>
App path:   /var/www/123charts
PM2:        pm2 list
Nginx:      sudo nginx -t
```

## Daily Health Check

Run the automated check:

```bash
cd /var/www/123charts
bash deploy/scripts/check-runtime.sh
```

Manual spot checks:

```bash
curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/healthz
# Expected: 200

curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/
# Expected: 200

curl -sS http://127.0.0.1:3000/sitemap.xml | head -5
# Expected: XML sitemap content
```

## PM2 Commands

```bash
# View process status
pm2 status

# View real-time logs
pm2 logs 123charts-web

# View last 50 lines
pm2 logs 123charts-web --lines 50

# Restart gracefully
pm2 restart 123charts-web

# Stop
pm2 stop 123charts-web

# Start
pm2 start deploy/pm2/ecosystem.config.cjs

# Save process list (survives server reboot)
pm2 save

# Auto-start on boot
pm2 startup
```

## Log Locations

| Log | Path |
|---|---|
| PM2 application output | `/var/log/123charts/out.log` |
| PM2 application errors | `/var/log/123charts/error.log` |
| Nginx access log | `/var/log/nginx/access.log` |
| Nginx error log | `/var/log/nginx/error.log` |

### Viewing Logs

```bash
# Tail application logs
tail -f /var/log/123charts/out.log
tail -f /var/log/123charts/error.log

# Nginx access log (last 100 requests)
tail -100 /var/log/nginx/access.log

# Search for errors
grep -i error /var/log/123charts/error.log | tail -20
grep " 500 " /var/log/nginx/access.log
```

## Monitoring Baseline

### Process Health

```bash
# Check if PM2 process is online
pm2 jlist | grep -c '"status":"online"'

# Check memory usage
pm2 list | grep 123charts-web
# Expected: memory < 512 MB

# Check CPU
pm2 monit
```

### Disk Space

```bash
df -h /var/www
# Ensure at least 20% free
```

### Nginx Status

```bash
sudo nginx -t           # Test config
sudo systemctl status nginx
```

## Common Maintenance Tasks

### Deploy New Code

```bash
cd /var/www/123charts
git pull origin main
npm ci --omit=dev
npm run build
pm2 restart 123charts-web
bash deploy/scripts/check-runtime.sh
```

### Update Nginx Config

```bash
sudo cp deploy/nginx/123charts.conf.example /etc/nginx/sites-available/123charts.conf
# Edit as needed
sudo nginx -t
sudo nginx -s reload
```

### Update SSL Certificate

```bash
# Let's Encrypt auto-renewal (if configured)
sudo certbot renew --dry-run   # Test
sudo certbot renew             # Actual renewal

# Aliyun SSL: upload new cert via console or CLI
```

### Rotate Logs

PM2 handles log rotation automatically. For Nginx logs, ensure logrotate is configured:

```bash
sudo logrotate -d /etc/logrotate.d/nginx   # Dry-run
sudo logrotate /etc/logrotate.d/nginx      # Rotate
```

## Incident Response

### Application Down (PM2 stopped)

```bash
pm2 status                          # Check status
pm2 logs 123charts-web --lines 50        # Check for errors
pm2 restart 123charts-web                # Restart
pm2 save                            # Persist
```

### High Memory Usage

```bash
pm2 list                            # Check memory column
pm2 restart 123charts-web                # Restart to clear memory
# If recurring, increase max_memory_restart in ecosystem.config.cjs
```

### Nginx Not Responding

```bash
sudo nginx -t                       # Validate config
sudo systemctl restart nginx        # Restart
sudo tail -50 /var/log/nginx/error.log
```

### Supabase Connection Issues

```bash
# Check if Supabase is reachable
curl -sS -o /dev/null -w "%{http_code}" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
# If unreachable, check Supabase dashboard for status
```

### 503 Errors on Submit/Claim

503 on submit/claim endpoints means Supabase is not configured. Check:

```bash
pm2 env 123charts-web list | grep SUPABASE
# Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
```

## Backup Considerations

### What to Back Up

- **Supabase database** — Backed up by Supabase (managed). Verify backup is enabled in Supabase dashboard.
- **PM2 process list** — Run `pm2 save` after any process changes.
- **Nginx config** — Keep a copy in the repository (`deploy/nginx/123charts.conf.example`) and on the server.
- **Environment variables** — Document in a secure location (not in git). Recoverable from `.env.example` + manual re-entry.

### What NOT to Back Up

- `/var/www/123charts/.next/` — Rebuilt from source on every deploy
- `/var/www/123charts/node_modules/` — Reinstalled on every deploy
- PM2 logs — Rotated automatically

## Emergency Contacts

| Role | Contact |
|---|---|
| Server provider | Aliyun console / support |
| Database provider | Supabase dashboard / support |
| Domain/DNS | DNS provider console |

## Scheduled Maintenance Window

For planned maintenance that requires downtime:

1. Announce in the admin channel (if applicable)
2. `pm2 stop 123charts-web`
3. Perform maintenance
4. `npm run build`
5. `pm2 start 123charts-web`
6. `bash deploy/scripts/check-runtime.sh`
7. `sudo nginx -t && sudo nginx -s reload` (if Nginx changed)
8. Confirm all checks pass
