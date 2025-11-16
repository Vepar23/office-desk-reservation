# 🚀 Deployment Uputstva - Vercel & GitHub

Kompletne instrukcije za deployment aplikacije na Vercel sa GitHub integracijom.

---

## 📋 Preduvjeti

Prije deployment-a, osiguraj da imaš:

- ✅ **GitHub Account** ([Sign up](https://github.com/))
- ✅ **Vercel Account** ([Sign up](https://vercel.com/))
- ✅ **Supabase Projekat** - Već kreiran i konfigurisan
- ✅ **Lokalna Aplikacija** - Radi kako treba (test lokalno prvo!)

---

## 🎯 Deployment Flow

```
Lokalni Kod → Git → GitHub → Vercel → Production
```

---

## 📤 FAZA 1: GitHub Setup

### Korak 1.1: Kreiranje GitHub Repozitorija

1. Idi na [GitHub](https://github.com/)
2. Klikni **"New repository"** (zeleno dugme, gore desno)
3. Unesi:
   - **Repository name:** `office-desk-reservation`
   - **Description:** "Office desk reservation system"
   - **Visibility:** Private (preporučeno) ili Public
   - **DO NOT** initialize with README (već imaš fajlove)
4. Klikni **"Create repository"**

### Korak 1.2: Inicijalizacija Git-a (Ako već nije)

```bash
# U root folderu projekta

# Inicijalizuj Git repo (ako već nije)
git init

# Provjeri da li .gitignore postoji i sadrži:
# .env.local
# node_modules
# .next
cat .gitignore  # ili type .gitignore na Windows

# Dodaj sve fajlove
git add .

# Prvi commit
git commit -m "Initial commit: Office Desk Reservation System"
```

### Korak 1.3: Povezivanje sa GitHub

GitHub će ti pokazati instrukcije nakon kreiranja repo-a. Kopiraj i izvršiti:

```bash
# Dodaj remote (zamijeni sa svojim username/repo)
git remote add origin https://github.com/your-username/office-desk-reservation.git

# Preimenuj branch u main (ako je master)
git branch -M main

# Push kod na GitHub
git push -u origin main
```

### Korak 1.4: GitHub Authentication

Ako dobiješ **authentication error**:

#### Opcija A: GitHub CLI (Preporučeno)

```bash
# Instaliraj GitHub CLI
# Windows: https://cli.github.com/
# Mac: brew install gh
# Linux: Check docs

# Login
gh auth login

# Odaberi:
# - GitHub.com
# - HTTPS
# - Yes (authenticate Git)
# - Login with browser

# Pokušaj ponovo push
git push -u origin main
```

#### Opcija B: Personal Access Token (PAT)

1. Idi na GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Klikni **"Generate new token (classic)"**
3. Unesi:
   - **Note:** "Office Reservation Deploy"
   - **Expiration:** 90 days (ili No expiration)
   - **Scopes:** Selektuj `repo` (sve checkboxove u repo sekciji)
4. Klikni **"Generate token"**
5. **KOPIRAJ TOKEN** (nećeš ga više vidjeti!)

Koristi token u Git URL-u:

```bash
# Ukloni stari remote
git remote remove origin

# Dodaj novi sa tokenom (zamijeni YOUR_TOKEN i your-username)
git remote add origin https://YOUR_TOKEN@github.com/your-username/office-desk-reservation.git

# Push
git push -u origin main
```

---

## 🌐 FAZA 2: Vercel Deployment

### Korak 2.1: Kreiranje Vercel Projekta

1. Idi na [Vercel Dashboard](https://vercel.com/dashboard)
2. Klikni **"Add New..." → Project**
3. **Import Git Repository:**
   - Ako je prvi put, klikni **"Connect GitHub"**
   - Autorizuj Vercel da pristupa GitHub accountu
   - Selektuj `office-desk-reservation` repo
4. Klikni **"Import"**

### Korak 2.2: Konfiguracija Projekta

**Project Name:**
```
office-desk-reservation
```

**Framework Preset:**
```
Next.js (automatically detected)
```

**Root Directory:**
```
./ (default)
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
.next (default)
```

**Install Command:**
```
npm install
```

### Korak 2.3: Environment Variables

**KRITIČNO:** Dodaj environment varijable **PRIJE** deployment-a!

1. U Vercel project settings, idi na **"Environment Variables"**
2. Dodaj **3 varijable:**

| Key | Value | Environment |
|-----|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Production, Preview, Development |

**Gdje naći credentials:**
- Supabase Dashboard → Settings → API
- Kopiraj tačno kako su prikazani (bez razmaka)

3. Klikni **"Add"** za svaku varijablu

### Korak 2.4: Deploy

1. Klikni **"Deploy"** dugme
2. Sačekaj 2-3 minuta dok Vercel:
   - Instalira dependencies
   - Build-uje aplikaciju
   - Deploy-uje na production

### Korak 2.5: Provjera Deployment-a

1. Kada je deploy završen, klikni **"Visit"**
2. URL će biti: `https://office-desk-reservation.vercel.app`
3. Testiraj login i osnovne funkcionalnosti

---

## 🗺️ FAZA 3: Office Map Setup (Produkcija)

⚠️ **VAŽNO:** Lokalni file upload **NE RADI** na Vercel (serverless platform)!

Moraš koristiti **Supabase Storage**.

### Korak 3.1: Upload Mape u Supabase

1. Idi na **Supabase Dashboard → Storage**
2. Ako nemaš `office-maps` bucket:
   - Klikni **"New bucket"**
   - Ime: `office-maps`
   - Public: ✅ (checkbox)
3. Otvori `office-maps` bucket
4. Klikni **"Upload file"**
5. Selektuj sliku office mape (PNG, JPG, WEBP)
6. Nakon upload-a, klikni na fajl
7. Kopiraj **Public URL** (npr. `https://abc123.supabase.co/storage/v1/object/public/office-maps/map.png`)

### Korak 3.2: Postavljanje URL-a u Aplikaciji

1. Login na production aplikaciju kao **admin**
2. Idi na **Admin** panel
3. U **"Office Map URL"** polje, zalepi public URL
4. Klikni **"Set URL"**
5. Mapa bi trebala biti vidljiva!

---

## 🔄 FAZA 4: Automatski Deployments

Vercel je sada povezan sa GitHub-om. Svaki put kada push-uješ kod:

```bash
# Napravi izmjene u kodu
# ...

# Commit
git add .
git commit -m "Update: description of changes"

# Push
git push origin main
```

**Rezultat:**
- Vercel automatski detektuje push
- Pokreće novi build
- Deploy-uje novu verziju
- Obavještava te emailom

---

## 🔧 Troubleshooting

### Problem 1: Build Failed - "MODULE_NOT_FOUND"

**Uzrok:** Dependency nije instaliran.

**Rješenje:**
```bash
npm install missing-package
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push origin main
```

---

### Problem 2: Environment Variables Not Working

**Uzrok:** Env vars nisu postavljene ili su netačne.

**Rješenje:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Provjeri da su sve 3 varijable postavljene
3. Klikni **"Redeploy"** nakon ispravke

---

### Problem 3: Mapa se ne prikazuje

**Uzrok:** Lokalni file path ne radi na Vercel.

**Rješenje:**
1. Upload sliku u **Supabase Storage**
2. Koristi **public URL** umjesto lokalnog path-a

---

### Problem 4: "Relation does not exist" Error

**Uzrok:** Supabase tabele nisu kreirane.

**Rješenje:**
1. Otvori Supabase SQL Editor
2. Pokreni `supabase-complete-setup.sql`

---

### Problem 5: GitHub Push Rejected (403 Error)

**Uzrok:** Nemаš autorizaciju.

**Rješenje:**
- Koristi GitHub CLI (`gh auth login`)
- Ili koristi Personal Access Token

---

## 🔒 Post-Deployment Security

### 1. Promijeni Admin Lozinku

1. Login na production app
2. Klikni "Lozinka"
3. Unesi jaku novu lozinku
4. Spremi

### 2. Rotiraj Supabase Keys (Ako su bili exposed)

Ako su ključevi bili commit-ovani u Git:

1. Supabase Dashboard → Settings → API → Reset Service Role Key
2. Vercel Dashboard → Environment Variables → Update key
3. Redeploy aplikaciju
4. Update lokalni `.env.local`

📖 Detaljne instrukcije: [`SECURITY.md`](./SECURITY.md)

### 3. Omogući RLS Policies

```sql
-- Pokreni u Supabase SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'desk_elements', 'reservations', 'office_map');
```

Ako nisu enabled, pokreni: `supabase-security-policies.sql`

---

## ✅ Deployment Checklist

Prije go-live, provjeri:

- [ ] Supabase tabele kreirane
- [ ] RLS policies omogućeni
- [ ] Environment variables postavljene na Vercel
- [ ] Admin lozinka promijenjena
- [ ] Office mapa upload-ovana u Supabase Storage
- [ ] Login funkcionira
- [ ] Rezervacije rade
- [ ] Admin panel radi
- [ ] Mobilna verzija testirana
- [ ] `.env.local` nije u Git-u

---

## 🎉 Čestitamo!

Tvoja aplikacija je sada **live** i dostupna svijetu! 🚀

---

**Happy Deploying! 🌐**

