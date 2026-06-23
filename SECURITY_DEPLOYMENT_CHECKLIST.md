# Security Deployment Checklist

Use this checklist on the production web server/reverse proxy before retesting.

## HTTPS and Port 80

- Preferred: expose only port 443 publicly when the hosting platform can terminate HTTPS directly.
- If port 80 must remain open, use it only for a permanent HTTP-to-HTTPS redirect.
- Do not serve application pages, API responses, upload forms, or login forms over HTTP.
- Confirm after deployment that `http://ndr.dghindia.gov.in` returns only `301/308` to HTTPS.

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

Validation commands:

```bash
curl -I https://ndr.dghindia.gov.in
curl -I http://ndr.dghindia.gov.in
nmap -Pn -p 80,443 ndr.dghindia.gov.in
```

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
