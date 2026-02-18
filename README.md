## Mimi CRM — AI Global Promo Helper (Kopi Kita)

Mini CRM untuk Mimi (Kopi Kita) yang menyimpan customer interests lalu memakai AI untuk merekomendasikan **global promo ideas** berdasarkan keseluruhan customer base.

### Fitur (sesuai brief)

- **Login**: sederhana pakai cookie session (ADMIN_EMAIL/ADMIN_PASSWORD).
- **Customer List (CRUD)**:
  - fields: name, contact (optional), favorite drink/product, interest tags, notes
  - add/edit/delete
  - search by name/favorite/notes/tags
  - filter by interest tag
- **Promo Ideas (Global AI Promo)**:
  - generate 2–3 promo themes
  - tiap theme: segment, why now (trend-based), ready message + CTA, optional best time window
  - **prompts disimpan di repo**: `ai/prompts.ts`
- **Dashboard**:
  - total customers
  - top interests (counts)
  - this week’s suggested campaigns (hasil generate terakhir)
- **AI Chatbot (data-aware)**:
  - ngobrol tentang promo/segment/customer dengan konteks data yang ada
- **Seed data**: otomatis disiapkan saat pertama kali run (untuk demo)

### Tech Stack

- Next.js (App Router) + Tailwind + shadcn-style components
- Prisma + Postgres (Neon / Supabase)
- AI: OpenRouter (recommended) atau Groq (opsional)

### Setup (Local)

1) Install dependencies

```bash
npm install
```

2) Buat file `.env.local` berdasarkan `env.example`

Minimal yang dibutuhkan:
- `DATABASE_URL`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `OPENROUTER_API_KEY` (atau `GROQ_API_KEY`)

3) Prisma generate + migrate

```bash
npm run prisma:generate
npm run prisma:migrate
```

4) (Opsional) Seed manual

```bash
npm run db:seed
```

5) Run dev server

```bash
npm run dev
```

Buka `http://localhost:3000` → akan diarahkan ke `/login`, lalu ke dashboard.

### Setup (Local) — Docker Compose (recommended)

1) Copy env template:

```bash
copy env.docker.example .env.docker
```

2) Run containers:

```bash
docker compose up --build
```

- App: `http://localhost:3000`
- Postgres: `localhost:5432`
- pgAdmin: `http://localhost:5050` (login default: `admin@local.test` / `admin`)

Catatan:
- Container `web` otomatis menjalankan: `prisma generate` → `prisma db push` → seed (`prisma/seed.cjs`) → `next dev`.
- Kalau kamu ubah schema Prisma, cukup restart container `web`.

### Setup (Local) — DB di Docker, Web di Windows (opsional)

Kalau kamu mau Postgres tetap di Docker tapi Next.js jalan di Windows (`npm run dev`), gunakan:

- `DATABASE_URL="postgresql://postgres:root@localhost:5432/mimi_crm_db?schema=public"`

### AI Prompts

- **Global promo generator** dan **chatbot** prompts ada di `ai/prompts.ts`.

### Deployment

- **DB**: Neon / Supabase (Postgres)
- **Hosting**: Vercel / Netlify
- Isi env vars sesuai `env.example` di dashboard deployment provider.

### Neon notes (penting)

- Copy connection string dari Neon, lalu pastikan **password di-URL-encode** kalau ada karakter spesial seperti `@` atau `:` (ini penyebab umum error “invalid port number”).
- Format yang aman:
  - `postgresql://USER:URL_ENCODED_PASSWORD@HOST/DB?sslmode=require`
