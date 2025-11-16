# ⚡ HITNA AKCIJA POTREBNA - Nove Funkcionalnosti

**DATUM:** 16. Novembar 2025  
**STATUS:** 🚨 **OBAVEZNO PRIJE KORIŠTENJA**

---

## 🎯 ŠTA SE DODALO:

### ✨ 2 Nove Funkcionalnosti:

1. **🔒 Automatsko Lockanje Accounta**
   - Nakon 5 krivih pokušaja logina → account se lockuje
   - Korisnik NE MOŽE pristupiti accountu dok admin ne otključa

2. **👨‍💼 Admin Kontrola:**
   - Admin može **resetovati lozinku** bilo kojeg korisnika
   - Admin može **otključati** lockane accounte
   - Vizualni prikaz locked statusa u admin panelu

---

## ✅ MORAŠ URADITI (OBAVEZNO):

### KORAK 1: Update Supabase Bazu

**GDJE:** Supabase Dashboard → SQL Editor

**ŠTA:**
1. Otvori fajl `supabase-add-account-lock.sql` iz projekta
2. Kopiraj **SVE** linije
3. Zalepi u Supabase SQL Editor
4. Klikni **"Run"**

**REZULTAT:** ✅ Success (trebao bi vidjeti "Success. No rows returned")

**ŠTO TO RADI:**
- Dodaje 3 nove kolone u `users` tabelu:
  - `locked` - Da li je account zakjučan
  - `failed_login_attempts` - Broj failed login pokušaja
  - `last_login_attempt` - Timestamp posljednjeg pokušaja

---

### KORAK 2: Test Lokalno (Optional ali preporučeno)

```bash
# Restartuj dev server
npm run dev
```

1. Login kao admin
2. Idi na Admin → Korisnici
3. Trebaš vidjeti **nova dugmad**:
   - 🔑 **Lozinka** - Reset password
   - 🔓 **Otključaj** - Unlock account (samo za lockane)

---

### KORAK 3: Deploy na Produkciju

Kod je već push-ovan na GitHub ✅

**Vercel će AUTOMATSKI deploy-ovati** novu verziju.

**PROVJERI:**
1. Idi na Vercel Dashboard
2. Vidiš novi deployment (trebao bi biti "Building" ili "Ready")
3. Sačekaj 2-3 minuta
4. Test na production URL-u

---

## 🧪 KAKO TESTIRATI:

### Test 1: Account Lock ✅

1. Kreiraj test korisnika (npr. `test123`)
2. Logout
3. Pokušaj login sa **pogrešnom lozinkom** 5 puta
4. Na 5. pokušaj → vidiš: **"Account je zaključan"**
5. Pokušaj sa **tačnom lozinkom** → i dalje ne možeš ✅

### Test 2: Admin Unlock ✅

1. Login kao **admin**
2. Idi na **Admin → Korisnici**
3. Vidiš `test123` sa **🔴 🔒 Zaključan** badge-om
4. Klikni **"🔓 Otključaj"**
5. Badge nestaje
6. Logout i login kao `test123` → **RADI!** ✅

### Test 3: Reset Password ✅

1. Login kao **admin**
2. Admin → Korisnici
3. Klikni **"🔑 Lozinka"** za bilo kojeg korisnika
4. Unesi novu lozinku: `newpass123`
5. Potvrdi
6. Logout i login sa tim korisnikom → **nova lozinka radi!** ✅

---

## 📋 CHECKLIST:

Prije nego što kažeš "Gotovo", provjeri:

- [ ] ✅ SQL migration pokrenut u Supabase
- [ ] ✅ Vercel deployment završen
- [ ] ✅ Test: Account lock radi
- [ ] ✅ Test: Admin unlock radi
- [ ] ✅ Test: Reset password radi
- [ ] ✅ Admin panel prikazuje badge-ove za locked accounte

---

## 🚨 VAŽNO UPOZORENJE:

⚠️ **ADMIN ACCOUNTI SE TAKOĐER MOGU LOCKATI!**

Ako se admin uloguje **5x sa pogrešnom lozinkom**, account će biti lockovan!

**PREPORUKA:**
- Imaj **najmanje 2 admin accounta**
- Nikad nemoj zaboraviti admin lozinku
- Ili kreiraj "super admin" account za backup

---

## 📞 AKO NEŠTO NE RADI:

### Greška: "Column does not exist"

**Rješenje:**
- Nisi pokrenuo SQL migration
- Otvori Supabase SQL Editor
- Pokreni `supabase-add-account-lock.sql`

### Greška: Admin ne može resetovati lozinku

**Rješenje:**
- Provjeri da li je korisnik zaista admin (`is_admin = true`)
- Refresh stranicu (F5)
- Provjeri browser console (F12) za greške

### Greška: Svi korisnici su locked

**Rješenje (Hitno):**
```sql
-- Pokreni u Supabase SQL Editor
UPDATE users SET locked = false, failed_login_attempts = 0;
```

---

## 📚 DETALJNA DOKUMENTACIJA:

Za sve detalje, vidi: **`ACCOUNT_LOCK_GUIDE.md`**

---

## ✅ KADA JE SVE GOTOVO:

1. ✅ SQL migration pokrenut
2. ✅ Vercel deployment ready
3. ✅ Sve testove prošlo
4. ✅ Admin panel radi

**→ MOŽEŠ KORISTITI APLIKACIJU! 🎉**

Nove funkcionalnosti su **LIVE** i dostupne za korištenje.

---

**Procijenjeno vrijeme:** 5-10 minuta  
**Težina:** ⭐⭐☆☆☆ (Lako)

---

**Uživaj u novim funkcionalnostima! 🚀🔒**

