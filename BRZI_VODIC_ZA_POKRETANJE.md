# ⚡ BRZI VODIČ - Pokretanje Aplikacije

## 🚨 TRI OBAVEZNA KORAKA

### ✅ KORAK 1: Kreirajte `.env.local` fajl

**Lokacija:** Root direktorij projekta (gdje se nalazi `package.json`)

**Sadržaj:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://vaš-projekat.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=vaš_anon_key
SUPABASE_SERVICE_ROLE_KEY=vaš_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Gdje naći kredencijale?**
1. Idite na [supabase.com](https://supabase.com)
2. Odaberite vaš projekat (ili kreirajte novi)
3. **Settings** → **API** → kopirajte keys

📖 **Detaljno uputstvo:** `ENV_SETUP_INSTRUCTIONS.md`

---

### ✅ KORAK 2: Kreirajte Tabele u Supabase

**Gdje:** Supabase Dashboard → **SQL Editor**

**Šta uraditi:**
1. Kliknite **"New Query"**
2. Kopirajte SQL kod iz `SUPABASE_SETUP.md` (linija 52-155)
3. Kliknite **"Run"**

**Tabele:**
- ✅ users
- ✅ office_map
- ✅ desk_elements
- ✅ reservations

📖 **Detaljno uputstvo:** `SUPABASE_SETUP.md`

---

### ✅ KORAK 3: Pokrenite Aplikaciju

```bash
# Restartujte server nakon kreiranja .env.local
npm run dev
```

Aplikacija će biti dostupna na: **http://localhost:3000**

---

## 🎯 Testiranje

### Admin Login:
```
URL: http://localhost:3000/login
Username: admin
Password: test123
```

### Šta testirati:
1. ✅ Upload mape ureda (Tab: "Mapa Ureda")
2. ✅ Dodavanje stolova (Tab: "Stolovi")
3. ✅ Drag & drop stolova na mapi
4. ✅ Kreiranje korisnika (Tab: "Korisnici")

---

## 🆘 Problemi?

### ❌ "Cannot connect to Supabase"
**Rješenje:** Provjerite da li ste **restartovali** server nakon kreiranja `.env.local`

### ❌ "relation 'desk_elements' does not exist"
**Rješenje:** Izvršite SQL kod iz Koraka 2

### ❌ Slike se ne prikazuju
**Rješenje:** 
1. Provjerite da li folder `public/uploads/` postoji
2. Provjerite da li je upload uspješan (F12 → Network tab)

---

## 📚 Detaljna Dokumentacija

- **ENV_SETUP_INSTRUCTIONS.md** - Setup `.env.local` fajla
- **SUPABASE_SETUP.md** - Kreiranje Supabase projekta
- **POPRAVKE_SUMMARY.md** - Šta je popravljeno
- **README.md** - Opšte informacije o projektu

---

**Potrebna pomoć?** Pročitajte gore navedene dokumente za detaljne instrukcije! 🚀

