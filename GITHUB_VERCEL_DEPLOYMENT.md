# 🚀 GitHub & Vercel Deployment Vodič

Ovaj vodič će vas provesti kroz proces povezivanja projekta sa GitHub-om i deployovanja na Vercel.

---

## 📋 Pre-requisites

Potrebno je da imate:
- ✅ GitHub nalog ([github.com](https://github.com))
- ✅ Vercel nalog ([vercel.com](https://vercel.com)) - možete se ulogovati sa GitHub-om
- ✅ Supabase projekat (već imate)

---

## 1️⃣ KORAK 1: Inicijalizuj Git Repo (Lokalno)

Otvori terminal u projektu i izvršite sledeće komande:

```bash
# Inicijalizuj git repo
git init

# Dodaj sve fajlove
git add .

# Kreiraj prvi commit
git commit -m "Initial commit - Office Desk Reservation System"
```

**✅ Rezultat**: Lokalni git repozitorijum je kreiran

---

## 2️⃣ KORAK 2: Kreiraj GitHub Repository

### Opcija A: Preko GitHub Web Interfejsa (Preporučeno)

1. **Idi na GitHub**: [github.com/new](https://github.com/new)
2. **Popuni detalje**:
   - **Repository name**: `office-desk-reservation` (ili nešto slično)
   - **Description**: `Office desk reservation system with Next.js and Supabase`
   - **Visibility**: 
     - ✅ **Private** (ako želite da projekat bude privatan)
     - ⚪ **Public** (ako želite da ga podelite)
   - **DON'T** dodajte README, .gitignore ili license (već imate lokalno)
3. **Click**: "Create repository"

### Opcija B: Preko GitHub CLI (Napredni)

```bash
gh repo create office-desk-reservation --private --source=. --remote=origin --push
```

**✅ Rezultat**: GitHub repozitorijum je kreiran

---

## 3️⃣ KORAK 3: Poveži Lokalni Projekat sa GitHub-om

Nakon što kreirate GitHub repo, GitHub će vam dati URL. Izvršite:

```bash
# Dodaj remote (ZAMENITE sa vašim GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/office-desk-reservation.git

# Prebaci na main branch (ako je potrebno)
git branch -M main

# Push kod na GitHub
git push -u origin main
```

**Primer**:
```bash
git remote add origin https://github.com/marko123/office-desk-reservation.git
git branch -M main
git push -u origin main
```

**✅ Rezultat**: Kod je sada na GitHub-u!

---

## 4️⃣ KORAK 4: Vercel Deployment

### 4.1 Prijava na Vercel

1. Idi na [vercel.com](https://vercel.com)
2. Klikni "Sign Up" ili "Login"
3. **Preporučeno**: Uloguj se sa GitHub nalogom
4. Odobri Vercel pristup GitHub-u

### 4.2 Import Projekta

1. Na Vercel Dashboard-u, klikni **"Add New Project"**
2. Klikni **"Import Git Repository"**
3. Pronadji svoj repo: `office-desk-reservation`
4. Klikni **"Import"**

### 4.3 Konfigurisanje Projekta

**Framework Preset**: Next.js (automatski detektovan)

**Root Directory**: `.` (ostavi prazno)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

**Install Command**: `npm install` (default)

---

## 5️⃣ KORAK 5: Environment Varijable na Vercel-u

⚠️ **VAŽNO**: Morate dodati Supabase kredencijale na Vercel-u!

### Kako dodati environment varijable:

1. U Vercel projektu, idi na **"Settings"** → **"Environment Variables"**
2. Dodaj sledeće varijable:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key_here` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_supabase_service_role_key_here` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |

**Gde naći Supabase kredencijale:**
1. Idi na [supabase.com/dashboard](https://supabase.com/dashboard)
2. Izaberi svoj projekat
3. Idi na **Settings** → **API**
4. Kopiraj:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 5.1 Dodavanje Varijabli (Komande)

Alternativno, možete koristiti Vercel CLI:

```bash
# Instaliraj Vercel CLI (ako već nije)
npm install -g vercel

# Login
vercel login

# Link projekat
vercel link

# Dodaj environment varijable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
```

**✅ Rezultat**: Environment varijable su podešene

---

## 6️⃣ KORAK 6: Deploy!

### Prvo Deployovanje:

1. Na Vercel-u, klikni **"Deploy"**
2. Sačekaj 2-5 minuta dok se projekat build-uje
3. 🎉 **Projekat je live!**

### URL-ovi:

- **Production**: `https://office-desk-reservation.vercel.app`
- **Preview**: Automatski za svaki branch/PR

---

## 7️⃣ KORAK 7: Testiraj Deployment

1. Otvori production URL
2. Uloguj se sa: `admin` / `test123`
3. Kreiraj test rezervaciju
4. Proveri da sve radi!

---

## 🔄 Buduća Ažuriranja

Kada želite da deploy-ujete nove promene:

```bash
# Napravi promene u kodu
# ...

# Commit promene
git add .
git commit -m "Opis promena"

# Push na GitHub
git push origin main
```

**Vercel će automatski deploy-ovati nove promene!** 🚀

---

## 📱 Vercel CLI (Opcionalno)

Za brže deployovanje direktno sa komandne linije:

```bash
# Instaliraj Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

---

## ⚙️ Dodatne Konfiguracije

### Dodaj Custom Domain (Opcionalno)

1. U Vercel projektu → **Settings** → **Domains**
2. Dodaj svoj domain (npr. `desk.mojatvrtka.com`)
3. Prati Vercel instrukcije za DNS konfiguraciju

### Supabase URL Whitelisting (Preporučeno)

1. Idi na Supabase Dashboard → **Settings** → **API**
2. Dodaj Vercel URL u **Site URL**
3. Dodaj Vercel URL u **Redirect URLs**

---

## 🐛 Troubleshooting

### Problem: Build Failed

**Rešenje**: Proveri build logs u Vercel dashboardu i ispravi greške

### Problem: Environment Varijable ne rade

**Rešenje**: 
- Proveri da ste stavili tačne vrednosti
- Redeploy projekat nakon dodavanja varijabli

### Problem: 500 Error na produkciji

**Rešenje**:
- Proveri Vercel logs: **Deployments** → **Functions** → **View logs**
- Najčešće je problem sa Supabase kredencijalima

---

## 📚 Korisni Linkovi

- [Vercel Dokumentacija](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase + Vercel Guide](https://supabase.com/docs/guides/hosting/vercel)
- [GitHub Documentation](https://docs.github.com)

---

## ✅ Checklist

Pre deployovanja, proverite:

- [ ] `.env.local` **NIJE** commit-ovan (u `.gitignore`)
- [ ] Svi paketi su u `package.json`
- [ ] Build radi lokalno (`npm run build`)
- [ ] GitHub repo je kreiran
- [ ] Kod je push-ovan na GitHub
- [ ] Environment varijable su dodane na Vercel-u
- [ ] Supabase je dostupan (proveri u dashboard-u)
- [ ] Admin login radi lokalno

---

## 🎉 Gotovo!

Vaša aplikacija je sada live na Vercel-u! 🚀

Ako imate bilo kakvih problema, pogledajte Troubleshooting sekciju ili logs na Vercel-u.

