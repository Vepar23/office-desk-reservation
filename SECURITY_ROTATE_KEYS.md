# 🔐 HITNO: Rotacija Supabase Ključeva

## ⚠️ PROBLEM

GitHub je detektovao exposed Supabase kredencijale u commit istoriji. 
**MORAJU se rotirati odmah** jer su javno vidljivi!

---

## 🚨 Šta Treba Uraditi ODMAH

### Korak 1: Resetuj Supabase API Ključeve

1. **Idi na**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Izaberi projekat**: `gsrvcotpczxiojwwwszs`
3. **Idi na**: Settings → API
4. **Klikni**: "Reset API Keys" ili "Generate New Keys"
5. **KOPIRAJ nove ključeve** (prikazaće se samo jednom!)

### Korak 2: Ažuriraj Environment Varijable

#### A) Na Vercel-u

1. **Idi na**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Otvori**: `office-desk-reservation` projekat
3. **Settings** → **Environment Variables**
4. **Ažuriraj sledeće** sa NOVIM ključevima:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. **Klikni**: "Save"
6. **Redeploy**: Deployments → Latest → "Redeploy"

#### B) Lokalno

1. **Ažuriraj** `.env.local` fajl sa novim ključevima:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gsrvcotpczxiojwwwszs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=NEW_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=NEW_SERVICE_ROLE_KEY_HERE
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **NIKAD nemoj commit-ovati** `.env.local` fajl!

### Korak 3: Provera

1. **Testiraj Vercel app** - da li login radi?
2. **Testiraj lokalno** - `npm run dev`
3. **Ako sve radi** - stari ključevi su bezbedno zamenjeni ✅

---

## 🛡️ Prevencija za Budućnost

### ✅ Uvek koristi Placeholders u Dokumentaciji

**LOŠE** ❌:
```env
NEXT_PUBLIC_SUPABASE_URL=https://gsrvcotpczxiojwwwszs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real_key_here
```

**DOBRO** ✅:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### ✅ Fajlovi u `.gitignore`

Ovi fajlovi su **automatski blokirani**:
- `.env.local`
- `.env`
- `vercel-env-import.txt`

### ✅ GitHub Secret Scanning

GitHub automatski skenira commit-ove za exposed secrets.
Ako dobiješ alert - **rotuj ključeve odmah**!

---

## 📋 Checklist

Pre nego što nastaviš:

- [ ] Resetovao sam Supabase API ključeve
- [ ] Ažurirao sam environment varijable na Vercel-u
- [ ] Ažurirao sam `.env.local` lokalno
- [ ] Testirao sam da aplikacija radi sa novim ključevima
- [ ] Redeploy-ovao sam Vercel app
- [ ] Vercel app radi ispravno
- [ ] Lokalni dev server radi ispravno

---

## 🆘 Ako Nešto Ne Radi

1. **Login ne radi** → Proveri da li su novi ključevi tačno kopirani
2. **"Invalid API key"** → Ključevi nisu ažurirani ili ima typo
3. **403 Forbidden** → Service role key nije ispravan
4. **Vercel app down** → Redeploy projekat nakon što dodaš env vars

---

## ✅ Kada Je Gotovo

Nakon što sve radi, **obriši ovaj fajl**:

```bash
rm SECURITY_ROTATE_KEYS.md
git add .
git commit -m "Remove security rotation guide after key rotation completed"
git push origin main
```

---

## 🔒 Dodatna Bezbednost

### Supabase RLS (Row Level Security)

Proveri da su RLS policy-i aktivni:
1. Supabase Dashboard → Authentication → Policies
2. Proveri da svaki user može da vidi samo svoje rezervacije
3. Admin može da vidi sve

### Vercel Environment Variables

- **Production** - samo za produkciju
- **Preview** - za preview deployments
- **Development** - za lokalni dev

---

**⚠️ VAŽNO**: Nakon rotacije ključeva, **ODMAH testiraj** da sve radi!

