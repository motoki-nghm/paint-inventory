# Security

## Reporting

Please report vulnerabilities privately to the maintainer rather than opening a
public issue.

## Threat model

- Multi-tenant data: every row is owned by a Supabase auth user.
- The client never holds privileged credentials. Only the anon key is shipped.
- Product lookup API keys are server-side only (`YAHOO_APP_ID` / `RAKUTEN_APP_ID`).

## Controls

| Layer        | Control                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| Auth         | Supabase Auth with PKCE flow; email OTP + Google OAuth                  |
| AuthZ        | Row Level Security on `paints` (per-user policies, force RLS)           |
| Input        | Zod validation on the client; SQL `CHECK` constraints on the DB         |
| Transport    | HTTPS only, HSTS preload, secure cookies via Supabase                   |
| Headers      | CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, COOP-ish |
| API          | `/api/product-lookup` validates JAN, rate-limits per IP, hides upstream |
| Storage      | IndexedDB only for guest mode; no secrets persisted                     |
| Image upload | MIME allowlist + 8 MB cap + canvas re-encode to JPEG (strips EXIF)      |
| Camera       | `getUserMedia` only over HTTPS; `Permissions-Policy: camera=(self)`     |
| Dependencies | Run `npm audit` before each release                                     |

## Known limitations

- The in-memory rate limit on the lookup proxy is best-effort. Multiple instances
  on Vercel may not share state. Use a distributed limiter for production scale.
- Image data URLs stored in the database can be large. Migrate to Supabase
  Storage when adoption grows past a few hundred items per user.
