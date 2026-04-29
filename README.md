# Insighta Labs+ — Developer Profiles Portal

A production-ready **Next.js 14 (App Router)** web portal for browsing, searching, and managing developer profiles. It connects to a separate backend API and uses GitHub OAuth for authentication.

---

## System Architecture

```
Browser ──► Next.js Portal (port 3001)
                 │
                 ├── /api/auth/*   ──► Backend /api/v1/auth/*
                 ├── /api/profiles ──► Backend /api/v1/profiles
                 └── /dashboard    (server-side rendered, auth-gated)
```

The portal is a **Next.js 14 App Router** application that:
- Renders pages server-side for security (tokens never reach the client)
- Proxies all API requests through Next.js API routes to keep `access_token` in HTTP-only cookies
- Uses React context for client-side auth state (role, CSRF token)

---

## Auth Flow — GitHub OAuth with HTTP-only Cookies

```
1. User clicks "Login with GitHub"
2. Browser → GET /api/auth/login  →  redirects to backend OAuth
3. Backend initiates PKCE OAuth → GitHub
4. GitHub → Backend callback → tokens resolved
5. Backend → /api/auth/callback?access_token=...&refresh_token=...
6. Callback route sets HTTP-only cookies + csrf_token
7. Redirect → /dashboard
```

### Cookie Details

| Cookie         | httpOnly | maxAge  | Purpose                            |
|----------------|----------|---------|------------------------------------|
| access_token   | Yes      | 15 min  | Bearer token for API calls         |
| refresh_token  | Yes      | 7 days  | Refresh access token               |
| csrf_token     | No       | 1 day   | Sent as X-CSRF-Token on mutations  |

---

## Web Portal Pages

| Page | Description |
|------|-------------|
| `/login` | GitHub OAuth login |
| `/dashboard` | Profile grid, search, filter, export |
| `/dashboard/profiles` | Full profiles browser |
| `/dashboard/profiles/[id]` | Profile detail view |

---

## Role Enforcement

| Feature | Admin | Analyst |
|---------|-------|---------|
| View profiles | ✅ | ✅ |
| Search & filter | ✅ | ✅ |
| Export CSV | ✅ | ✅ |
| Edit profile | ✅ | ❌ |
| Delete profile | ✅ | ❌ |

---

## Environment Setup

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
CSRF_SECRET=your-random-secret
```

---

## How to Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # lint check
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout + AuthProvider
│   ├── page.tsx              # Redirect to /login or /dashboard
│   ├── login/page.tsx        # Login page
│   ├── dashboard/            # Protected pages
│   └── api/                  # Auth + profiles proxy routes
├── components/               # UI components
├── lib/                      # types, auth helpers, API client
└── middleware.ts             # Route protection + CSRF enforcement
```
