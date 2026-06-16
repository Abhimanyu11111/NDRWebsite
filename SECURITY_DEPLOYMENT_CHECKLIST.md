# Security Deployment Checklist

Use this checklist on the production web server/reverse proxy before retesting.

## HTTPS and Port 80

- Keep port 80 open only for redirecting HTTP to HTTPS.
- Redirect all HTTP traffic to HTTPS with a permanent redirect.
- Do not serve application pages, API responses, or login forms over HTTP.

Example Nginx redirect server:

```nginx
server {
  listen 80;
  server_name ndr.dghindia.gov.in;
  return 301 https://$host$request_uri;
}
```

## Hide Server Banners

Disable version disclosure.

```nginx
server_tokens off;
proxy_hide_header X-Powered-By;
```

For Express, keep `X-Powered-By` disabled in application code or reverse proxy.

## TLS Headers

Confirm these headers are present on HTTPS responses:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cache-Control: no-store` on admin/API/authenticated pages

## Firewall

- Allow public access only to ports required by the deployment, normally 80 and 443.
- Restrict database, SSH, and backend-only service ports to trusted IPs/VPN.
- Re-run an external port scan after firewall changes.

## Production Secrets

- Replace development JWT and CAPTCHA secrets with strong random values.
- Store secrets in the hosting platform secret manager, not in committed files.
- Rotate any exposed credentials before go-live.
