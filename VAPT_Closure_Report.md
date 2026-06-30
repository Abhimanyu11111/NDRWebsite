VAPT REMEDIATION CLOSURE REPORT
National Data Repository (NDR) Web Application
URL: https://ndr.dghindia.gov.in/

Prepared by: EICE Technology Pvt. Ltd.
Report date: 30-06-2026
Reference: Client Action Taken Sheet (Re-Scan 25-06-2026)

================================================================
1. SUMMARY
================================================================

Total findings reported               : 30
Closed (confirmed in earlier re-scans) : 21
Pending confirmation (now verified)    :  5
Open as of 25-06-2026 re-scan          :  4

Action taken on 30-06-2026:
  - All 4 previously OPEN findings have been remediated in code.
  - All 5 findings marked CONFIRMATION have been re-verified against
    the current codebase and are confirmed CLOSED.
  - 1 finding (Sr. No. 18 - 80 port open) cannot be closed from the
    application codebase — it requires a server/firewall-level change.
    See Section 4 for details and required action.

Net result: 29 / 30 findings closed. 1 finding requires infra-side action.

================================================================
2. PREVIOUSLY OPEN FINDINGS — NOW REMEDIATED
================================================================

--------------------------------------------------------------
Sr. No. 4 — Upload Module in public page          [Severity: MEDIUM]
--------------------------------------------------------------
GISPL Recommendation: "Implement OTP verification during file upload
to verify the identity of the user uploading the file."

Remediation:
  - New endpoint POST /api/auth/register/send-otp issues a one-time
    6-digit code to the registrant's email (captcha-gated, rate-limited
    to 5 requests / 15 min).
  - POST /api/auth/register now rejects the identity-certificate upload
    unless a valid, unexpired, single-use OTP for that exact email is
    presented. The certificate is only written to disk after OTP
    verification succeeds.
  - Frontend registration form updated with a "Send OTP" / "Verify"
    step before the form can be submitted.

Files changed: backend/routes/authRoutes.js,
backend/utils/registrationOtp.js (new),
backend/src/services/emailService.js, src/Pages/Register.jsx

--------------------------------------------------------------
Sr. No. 10 — Banner Grabbing                       [Severity: LOW]
--------------------------------------------------------------
GISPL Recommendation: "Remove the server version information from
the banner to prevent server fingerprinting."

Remediation:
  - Application-level "Server" header is now explicitly stripped/blanked
    on every response (X-Powered-By was already disabled).
  - Added a generic 404 handler and a global error handler so framework
    internals / stack traces are never returned to the client.

Files changed: backend/middleware/security.js, backend/index.js

Note: If a reverse proxy (Nginx/Apache) sits in front of the
application server, its own version banner must additionally be
suppressed at that layer (e.g. `server_tokens off;` in Nginx). That
configuration is outside this codebase — see Section 4.

--------------------------------------------------------------
Sr. No. 27 — User not able to login after registration [Severity: LOW]
--------------------------------------------------------------
Root cause: The admin "activate/deactivate user" action updated only
the `is_active` flag and never the `approval_status` field. A user
manually activated this way could remain stuck on `approval_status =
PENDING`, which the login route checks first — blocking login even
though the account showed as "Active".

Remediation:
  - Admin status-update endpoint now syncs approval_status to APPROVED
    whenever a user is activated, so this stuck state cannot recur.
  - Registration success message on the frontend was also corrected —
    it previously implied immediate login access; it now clearly states
    that login is only possible after admin approval.

Files changed: backend/controllers/userAdminController.js,
src/Pages/Register.jsx

--------------------------------------------------------------
Sr. No. 30 — Multiple request flooding             [Severity: LOW]
--------------------------------------------------------------
Remediation:
  - Added a short-window "burst" rate limiter (30 requests / 10 seconds
    per IP) layered in front of the existing per-minute API limiter
    (120 requests / minute), applied globally to all /api routes.
  - Added a dedicated rate limit (20 requests / minute) on the
    previously-unprotected GET /api/auth/captcha endpoint.

Files changed: backend/index.js, backend/routes/authRoutes.js

================================================================
3. PREVIOUSLY "CONFIRMATION" FINDINGS — RE-VERIFIED CLOSED
================================================================

Sr. No. 12 — Password travel in clear text
  Verified: HTTPS is force-redirected in production
  (requireHttpsInProduction) and Strict-Transport-Security (HSTS) is
  set on every response. No password values are written to logs
  anywhere in the codebase.

Sr. No. 17 — Input validation not implemented
  Verified: A global validateRequestPayload middleware inspects every
  request body/query/params for XSS payloads, null bytes, prototype-
  pollution keys and oversized input before it reaches any route.
  Auth fields additionally have dedicated regex validation
  (email, phone, password complexity, pincode).

Sr. No. 23 — Robots.txt file
  Verified: public/robots.txt exists and disallows crawling of
  /admin/, /api/, /uploads/, /invoices/, /account and /book-vdr.

Sr. No. 29 — Weak Captcha
  Verified: Captcha is HMAC-signed (server secret), single-use,
  compared with a timing-safe check, rendered as a noisy/rotated SVG,
  6 characters from a 32-character alphabet (~1 billion combinations),
  and expires after 3 minutes.

================================================================
4. OPEN ITEM REQUIRING INFRASTRUCTURE ACTION
================================================================

Sr. No. 18 — 80 port open
  Status: NOT fixable from the application codebase.

  The Node.js/Express application itself does not bind to port 80 (it
  listens only on the configured app PORT, default 5000) and already
  redirects any HTTP traffic it does receive to HTTPS. The open port 80
  finding refers to the network/server layer (firewall, load balancer,
  or reverse proxy in front of the application), which is outside this
  repository.

  Action required (server/hosting team):
    - Close port 80 at the firewall/security-group level, OR
    - If port 80 must remain open for ACME/Let's-Encrypt renewal,
      configure the front-facing web server (Nginx/Apache) to do a
      301 redirect to HTTPS only, with no application content served
      over plain HTTP.

================================================================
5. CLOSING NOTE
================================================================

All findings within the application's control (29 of 30) have been
remediated and verified against the current codebase as of
30-06-2026. We request a re-scan to confirm closure on our end, and
recommend the hosting/infra team action Section 4 to fully close the
remaining item.

EICE Technology Pvt. Ltd.
