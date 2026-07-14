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

Disable version disclosure in the production Nginx configuration. Put `server_tokens off;`
inside the global `http {}` block in `/etc/nginx/nginx.conf`, not only inside an
application file.

```nginx
http {
  server_tokens off;

  # existing config...
}
```

If Nginx is reverse-proxying Node/Express, also hide upstream technology headers:

```nginx
location /api/ {
  proxy_hide_header X-Powered-By;
  proxy_pass http://127.0.0.1:5000;
}
```

To avoid the default Nginx 404 page showing the server banner in the response body,
serve a custom error page from the site build:

```nginx
server {
  listen 443 ssl;
  server_name ndr.dghindia.gov.in;

  root /var/www/ndrwebsite/dist;
  error_page 404 /404.html;

  location = /404.html {
    internal;
  }
}
```

For Express, keep `X-Powered-By` disabled in application code as well.

Validation commands:

```bash
curl -I https://ndr.dghindia.gov.in
curl -I http://ndr.dghindia.gov.in
nmap -Pn -p 80,443 ndr.dghindia.gov.in
```

## Block Unsafe HTTP Methods

The Express backend already blocks `HEAD`, `TRACE`, and `TRACK`, but production
Nginx must also block them because static files and frontend routes can be served
before a request reaches Node.js.

Add this near the top of the HTTPS `server {}` block:

```nginx
server {
  listen 443 ssl;
  server_name ndr.dghindia.gov.in;

  if ($request_method ~ ^(HEAD|TRACE|TRACK)$) {
    return 405;
  }

  add_header Allow "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;

  # existing config...
}
```

If the scanner requires a bodyless response for blocked methods, `405` is the
correct status. Do not use `200`, `301`, or `302` for `HEAD`.

Validation commands:

```bash
curl -I -X HEAD https://ndr.dghindia.gov.in/
curl -I -X HEAD https://ndr.dghindia.gov.in/admin/login
curl -I -X TRACE https://ndr.dghindia.gov.in/
curl -I -X TRACK https://ndr.dghindia.gov.in/
```

Expected result for each blocked method: `405 Method Not Allowed`.

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
