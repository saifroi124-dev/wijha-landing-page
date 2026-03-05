# ورشة عمل — WIJHA Landing

React (Vite) app: 3 landing pages + admin dashboard. Supabase for leads and auth.

## Setup

1. **Env**  
   Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_META_PIXEL_ID` (optional)

2. **Database**  
   Run `supabase-schema.sql` in Supabase → SQL Editor, then add your admin user to `allowed_admins`.

3. **Install & run**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:5173

## Routes

- `/` — Business (أصحاب المشاريع)
- `/students` — Students (الطلاب)
- `/freelancers` — Freelancers (الفريلانسرز)
- `/admin` — Admin login + leads dashboard

## Build

```bash
npm run build
```
Output in `dist/`. Deploy that folder to any static host.
