# 🚀 Deployment Guide - Vercel & GitHub

Kompletan vodič za deployment aplikacije na Vercel korištenjem GitHub integracije.

## 📋 Pre-requisiti

Prije početka, provjerite da imate:
- ✅ GitHub account
- ✅ Vercel account (može se registrovati sa GitHub-om)
- ✅ Supabase projekat setup (vidi `SUPABASE_SETUP.md`)
- ✅ Lokalna verzija aplikacije radi bez grešaka

## 🔧 Priprema Projekta

### 1. Provjerite da je sve committed

```bash
# Provjerite status
git status

# Dodajte sve izmjene
git add .

# Commit izmjena
git commit -m "Priprema za deployment"
```

### 2. Provjerite .gitignore

Osigurajte da `.gitignore` uključuje:

```
# dependencies
/node_modules

# next.js
/.next/
/out/

# environment variables
.env*.local
.env

# vercel
.vercel
```

### 3. Test Build Lokalno

```bash
npm run build
npm start
```

Provjerite da aplikacija radi na `http://localhost:3000`

## 📦 GitHub Setup

### 1. Kreirajte GitHub Repozitorij

**Opcija A: Preko GitHub Website**
1. Idite na [github.com/new](https://github.com/new)
2. Repository name: `office-booking` (ili željeno ime)
3. Description: "Aplikacija za rezervaciju mjesta u uredu"
4. Odaberite **Private** ili **Public**
5. **NE** dodavajte README, .gitignore ili licencu (već imate lokalno)
6. Kliknite **"Create repository"**

**Opcija B: Preko Command Line**
```bash
gh repo create office-booking --private --source=. --remote=origin --push
```

### 2. Povežite sa Lokalnim Repozitorijem

Ako ste kreirali repo preko website-a:

```bash
# Dodajte remote origin
git remote add origin https://github.com/YOUR_USERNAME/office-booking.git

# Push kod
git branch -M main
git push -u origin main
```

### 3. Verifikujte Upload

```bash
# Provjerite da je sve pushovano
git log --oneline -5
```

Otvorite GitHub repo u browseru i provjerite da su svi fajlovi uploadani.

## 🌐 Vercel Deployment

### 1. Prijavite se na Vercel

1. Idite na [vercel.com](https://vercel.com)
2. Kliknite **"Sign Up"** ili **"Log In"**
3. Izaberite **"Continue with GitHub"**
4. Autorizujte Vercel da pristupa vašim GitHub repozitorijima

### 2. Import Projekta

1. Na Vercel dashboard-u, kliknite **"Add New..."** → **"Project"**
2. Pronađite `office-booking` repozitorij
3. Kliknite **"Import"**

### 3. Konfiguracija Projekta

**Framework Preset:** Next.js (automatski detektovano)

**Root Directory:** `./` (default)

**Build Command:** `npm run build` (automatski)

**Output Directory:** `.next` (automatski)

### 4. Environment Variables

Kliknite na **"Environment Variables"** i dodajte:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxx...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-preview.vercel.app` | Preview |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |

**Napomena:** Kopirajte vrijednosti iz vašeg Supabase projekta.

### 5. Deploy

1. Kliknite **"Deploy"**
2. Sačekajte 2-5 minuta dok se build završi
3. Nakon uspješnog deploya, dobijete URL aplikacije

### 6. Verifikacija Deploya

1. Kliknite na **"Visit"** da otvorite aplikaciju
2. Testirajte login sa admin kredencijalima:
   - Username: `admin`
   - Password: `test123`

## 🔄 Continuous Deployment

Nakon inicijalnog deploya, svaki push na GitHub će automatski triggerovati novi deploy:

```bash
# Napravite izmjene u kodu
git add .
git commit -m "Dodao novu funkcionalnost"
git push

# Vercel će automatski deployovati novu verziju
```

### Branch Deploys

- **Main branch** → Production deploy
- **Ostale grane** → Preview deploys

```bash
# Kreirajte feature branch
git checkout -b feature/nova-funkcija

# Push feature branch
git push origin feature/nova-funkcija

# Vercel će kreirati preview deploy za ovu granu
```

## ⚙️ Post-Deployment Konfiguracija

### 1. Custom Domain (Opciono)

1. U Vercel projektu, idite na **Settings** → **Domains**
2. Kliknite **"Add"**
3. Unesite vašu domenu (npr. `office.example.com`)
4. Pratite instrukcije za DNS konfiguraciju

### 2. Supabase CORS Configuration

U Supabase dashboard-u:

1. Idite na **Settings** → **API**
2. Dodajte vašu Vercel URL u **Allowed Origins**:
   ```
   https://your-app.vercel.app
   https://your-app-*.vercel.app
   ```

### 3. Analytics (Opciono)

Omogućite Vercel Analytics:

1. U projektu, idite na **Analytics**
2. Kliknite **"Enable"**
3. Dodajte u `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🔒 Sigurnosne Preporuke

### 1. Promijenite Default Admin Password

Nakon deploya, **ODMAH** promijenite default admin lozinku:

1. Prijavite se kao admin
2. Kreirajte novog admin korisnika sa jakom lozinkom
3. Obrišite default `admin` account iz Supabase:

```sql
DELETE FROM users WHERE username = 'admin';
```

### 2. Environment Variables Security

- ✅ Nikad ne commitujte `.env.local` u Git
- ✅ Rotirajte API keys periodično
- ✅ Koristite različite keys za dev/prod
- ✅ Označite osetljive varijable kao "Sensitive" u Vercel-u

### 3. Rate Limiting

Vercel automatski ima rate limiting, ali možete dodati custom pravila:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add rate limiting logic
  return NextResponse.next()
}
```

## 📊 Monitoring & Logs

### Vercel Logs

1. U projektu, idite na **Logs**
2. Filtrirajte po:
   - **All Logs**: Sve
   - **Error**: Samo greške
   - **Function**: Serverless function pozivi

### Real-time Monitoring

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Stream logs
vercel logs your-project-name --follow
```

## 🐛 Troubleshooting

### Build Fails

**Problem:** Build pada sa greškom

**Rješenje:**
1. Provjerite build logs u Vercel
2. Pokrenite `npm run build` lokalno
3. Riješite sve TypeScript/ESLint greške

### Environment Variables Not Working

**Problem:** Aplikacija ne vidi env varijable

**Rješenje:**
1. Provjerite da su sve varijable dodane u Vercel
2. Redeploy nakon dodavanja varijabli
3. Provjerite da imate `NEXT_PUBLIC_` prefix za client-side varijable

### Supabase Connection Error

**Problem:** Ne može se povezati sa Supabase

**Rješenje:**
1. Provjerite da su URL i keys tačni
2. Provjerite CORS settings u Supabase
3. Provjerite da je Supabase projekat aktivan

### 500 Internal Server Error

**Problem:** Aplikacija vraća 500 greške

**Rješenje:**
1. Provjerite Function logs u Vercel
2. Provjerite da su svi API route-ovi pravilno implementirani
3. Dodajte error logging:

```typescript
try {
  // your code
} catch (error) {
  console.error('API Error:', error)
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

## 🔄 Rollback Strategy

Ako novi deploy ima problema:

1. U Vercel, idite na **Deployments**
2. Pronađite prethodni working deploy
3. Kliknite **"..."** → **"Promote to Production"**

Ili preko CLI:

```bash
vercel rollback
```

## 📝 Deployment Checklist

Prije svakog production deploya:

- [ ] Sve izmjene su committed i pushovane
- [ ] Lokalni build radi bez grešaka (`npm run build`)
- [ ] Environment varijable su ažurirane u Vercel
- [ ] Supabase database je pravilno konfigurisan
- [ ] Admin password je promijenjen
- [ ] CORS je konfigurisan u Supabase
- [ ] Sve features su testirane lokalno
- [ ] Linter errors su riješeni
- [ ] TypeScript errors su riješeni

## 🎉 Završetak

Čestitamo! Vaša aplikacija je uspješno deployovana! 🚀

**Production URL:** `https://your-app.vercel.app`

### Sljedeći Koraci:

1. ✅ Testirajte sve funkcionalnosti u production
2. ✅ Kreirajte dokumentaciju za krajnje korisnike
3. ✅ Postavite monitoring i alerting
4. ✅ Planirajte regular backups
5. ✅ Pratite analytics i user feedback

---

**Sretan deployment! 🎊**

