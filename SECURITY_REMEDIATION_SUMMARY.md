# Security Remediation Summary

Project: EICE Technology Pvt Ltd / NDR Website  
Audit Report: Web Application Security Initial Audit Report  
Report Date: June 01, 2026  
Target URLs:

- https://ndr.dghindia.gov.in/
- https://ndr.dghindia.gov.in/admin/login

## Summary

The initial audit listed 28 findings. Application-level fixes have been implemented for the major upload, authentication, authorization, validation, session, header, CORS, CAPTCHA, password, and admin data-room issues.

Some findings require production server/reverse-proxy/firewall verification and cannot be fully closed by source-code changes alone.

## Remediation Status

| No. | Finding | Severity | Status | What Was Fixed |
| --- | --- | --- | --- | --- |
| 1 | Double Extension File Upload | High | Fixed | Upload validation now rejects filenames with multiple extensions. Uploaded files are renamed with safe random filenames. |
| 2 | Null Byte File Upload | High | Fixed | Upload validation rejects null bytes and encoded null-byte patterns in filenames. |
| 3 | Improper File Content Validation | High | Fixed | Server validates allowed extension, MIME type, and file magic bytes for JPG, PNG, and PDF files. |
| 4 | Upload Module in Public Page | Medium | Fixed | Upload endpoint now has rate limiting, CAPTCHA verification, strict file validation, and controlled processing. |
| 5 | Role Infringement | Medium | Fixed | Admin/user JWT validation and role checks were hardened. Admin role matching was normalized. |
| 6 | Security Headers Not Implemented | Medium | Fixed | Added CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and cache headers. |
| 7 | Authentication Bypass | Medium | Fixed | JWT validation now requires secret, issuer, audience, expiry, and active-session validation. |
| 8 | Client Side Desync HTTP/1.1 | Low | Partially Fixed | Request size limits and unsafe method blocking added. Final confirmation requires proxy/server retest. |
| 9 | Back Button Enable | Low | Fixed / Retest Required | Added no-store/no-cache headers for API/admin pages and static deployment headers. |
| 10 | Banner Grabbing | Low | Partially Fixed | Express `X-Powered-By` disabled. Reverse-proxy banner hiding must be configured on production. |
| 11 | Block Policy Not Implemented | Low | Fixed | Login and registration rate limiting added. Repeated login attempts are blocked temporarily. |
| 12 | Password Travel in Clear Text | Low | Infra Pending | App supports HTTPS enforcement/HSTS. Production TLS and HTTP-to-HTTPS redirect must be verified. |
| 13 | Concurrent User Login | Low | Fixed / Retest Required | Single active JWT session is enforced in application memory. For multi-server production, use Redis/DB session storage. |
| 14 | CORS Misconfiguration | Low | Fixed | CORS now uses an allowlist and restricted methods/headers. |
| 15 | Email and Mobile Number Not Validate | Low | Fixed | Server-side and frontend email/mobile validation added. |
| 16 | HEAD Methods Enabled | Low | Fixed | HEAD, TRACE, and TRACK methods are blocked. |
| 17 | Input Validation Not Implemented | Low | Fixed | Added validation for login, registration, password, phone, email, upload fields, and request body size. |
| 18 | 80 Port Open | Low | Infra Pending | Must be fixed through firewall/reverse proxy. Port 80 should only redirect to HTTPS. |
| 19 | Captcha Not Available | Low | Fixed | CAPTCHA challenge added to user login, admin login, and registration. |
| 20 | Change Password Not Available | Low | Fixed | Backend change-password API and frontend UI added under My Account > Security. |
| 21 | Password Complexity Not Maintained | Low | Fixed | Strong password policy enforced: minimum 12 chars, uppercase, lowercase, number, and special character. |
| 22 | Page Access Through Cache History | Low | Fixed / Retest Required | Added no-store/no-cache headers for authenticated/API/admin pages and static hosting headers. |
| 23 | Robots.txt File Exposure | Low | Fixed | Placeholder sitemap replaced with production sitemap. Sensitive paths are not exposed in robots.txt. |
| 24 | Session Timeout | Low | Fixed | JWT expiry reduced to 30 minutes. Expired/invalid sessions are rejected. |
| 25 | Token Not Validated | Low | Fixed | JWT issuer, audience, expiry, secret, and active session validation added. |
| 26 | Autofill Enable | Low | Fixed | Sensitive login/register/password inputs now use appropriate autocomplete controls. |
| 27 | User Not Able to Login After Registration | Low | Business Flow / Clarified | Registration intentionally stays pending until admin approval. Login is allowed only after approval. |
| 28 | Manage Data Rooms Module Not Working | Low | Fixed | Admin data-room page now uses correct admin endpoints and backend room controller uses the correct Room model fields. |

## Main Code Changes

- Added secure upload handling with extension, MIME, magic-byte, null-byte, and filename checks.
- Added CAPTCHA API and CAPTCHA checks on login, admin login, and registration.
- Added login/register rate limiting.
- Added stronger JWT validation and active-session checks.
- Added logout and change-password APIs.
- Added Change Password UI in the user account page.
- Added global security headers and stricter CORS policy.
- Disabled Express `X-Powered-By`.
- Blocked unsafe HTTP methods.
- Added frontend validation for password, phone, email, and CAPTCHA.
- Fixed Manage Data Rooms admin module.
- Added static hosting security headers in `vercel.json`.
- Added production deployment checklist in `SECURITY_DEPLOYMENT_CHECKLIST.md`.

## Production/Infra Pending Items

These must be completed on the production server or hosting platform:

- Configure port 80 to only redirect to HTTPS.
- Confirm all login/API/admin traffic is served over HTTPS.
- Hide Nginx/Apache/server version banners.
- Confirm HSTS and cache-control headers are visible on deployed responses.
- Restrict database, SSH, and backend-only ports through firewall rules.
- Rotate production secrets before retest, especially JWT/CAPTCHA/SMTP/payment credentials.
- Use Redis or DB-backed session storage if the backend runs on multiple instances.

## Verification Performed

- Backend syntax checks passed.
- Backend module import smoke test passed.
- Frontend production build passed with `npm.cmd run build`.

Note: Full ESLint could not complete because generated public map files caused Node.js out-of-memory during linting. The production build completed successfully.
