# 🔐 Account Lock & Password Reset - Uputstva

**Verzija:** 2.1  
**Datum:** 16. Novembar 2025

---

## 🎯 Nove Funkcionalnosti

### 1. ✅ Automatsko Lockanje Accounta
Nakon **5 krivih pokušaja** logina, account se automatski zaključava.

### 2. ✅ Admin Reset Password
Admin može resetovati lozinku bilo kojeg korisnika.

### 3. ✅ Admin Unlock Account
Admin može otključati lockane accounte.

---

## 📋 SETUP - Za Postojeće Baze

Ako već imaš kreiran Supabase projekat sa users tabelom, trebaš dodati nove kolone.

### Korak 1: Otvori Supabase SQL Editor

1. Idi na [Supabase Dashboard](https://supabase.com/dashboard)
2. Odaberi svoj projekat
3. Klikni **"SQL Editor"** (lijevi meni)
4. Klikni **"New Query"**

### Korak 2: Pokreni Migration SQL

Otvori fajl `supabase-add-account-lock.sql` iz projekta i kopiraj SVE linije.

Zalepi u SQL Editor i klikni **"Run"**.

**Rezultat:**
```sql
-- Trebao bi vidjeti poruku: Success
-- I tabelu sa kolonama:
username | is_admin | locked | failed_login_attempts | last_login_attempt
```

### Korak 3: Verifikacija

Pokreni u SQL Editor-u:
```sql
SELECT 
  username, 
  locked, 
  failed_login_attempts 
FROM users;
```

**Očekivani rezultat:**
- Svi korisnici imaju `locked = false`
- Svi korisnici imaju `failed_login_attempts = 0`

✅ **GOTOVO!** Aplikacija će automatski početi trackati failed attempts.

---

## 🔒 Kako Radi Account Lock

### Za Obične Korisnike:

1. **Uspješan Login:**
   - `failed_login_attempts` se resetuje na `0`
   - Account ostaje otključan

2. **Failed Login (pogrešna lozinka):**
   - `failed_login_attempts` se povećava za 1
   - Korisnik vidi poruku:
     ```
     Neispravno korisničko ime ili lozinka
     Preostalo pokušaja: 4
     ```

3. **5. Failed Login:**
   - Account se automatski **lockuje** (`locked = true`)
   - Korisnik više NE MOŽE pristupiti accountu
   - Vidi poruku:
     ```
     Account je zaključan zbog previše neuspjelih pokušaja logina.
     Kontaktiraj administratora.
     ```

### Locked Account Login Attempt:

Čak i ako korisnik unese **tačnu lozinku**, neće moći pristupiti sve dok admin ne otključa account.

---

## 👨‍💼 Admin Funkcionalnosti

### 1. Pregled Statusa Korisnika

Admin panel prikazuje status svakog korisnika:

| Status | Badge | Opis |
|--------|-------|------|
| **Normalan** | - | Bez badge-a, sve ok |
| **Upozorenje** | 🟡 `⚠️ 3/5 pokušaja` | Korisnik je imao failed login attempts |
| **Locked** | 🔴 `🔒 Zaključan` | Account je lockovan |

---

### 2. Reset Password

**Koraci:**

1. **Login kao admin** na aplikaciju
2. Klikni **"Admin"** dugme
3. Idi na **"Korisnici"** tab
4. Pronaći korisnika u listi
5. Klikni **"🔑 Lozinka"** dugme pored korisnika
6. U dialogu:
   - Unesi **novu lozinku** (min 6 znakova)
   - Klikni **"✅ Potvrdi"**
7. **Done!** Lozinka je resetovana

**Korisnik može odmah da se uloguje sa novom lozinkom.**

**Use Case:**
- Korisnik zaboravio lozinku
- Admin kreirao korisnika sa default lozinkom i želi da postavi novu
- Security breach - hitno mijenjanje lozinki

---

### 3. Unlock Account

**Koraci:**

1. **Login kao admin**
2. Idi na **Admin → Korisnici**
3. Lockani korisnici imaju **🔴 crveni badge** "🔒 Zaključan"
4. Klikni **"🔓 Otključaj"** dugme pored korisnika
5. Potvrdi action
6. **Done!** Account je otključan

**Account se automatski:**
- Otključava (`locked = false`)
- Resetuje failed attempts counter (`failed_login_attempts = 0`)

**Korisnik može odmah da se uloguje.**

---

## 🧪 Testiranje

### Test 1: Account Lock

1. Kreiraj test korisnika (npr. `testuser`)
2. Pokušaj login sa **pogrešnom lozinkom** 5 puta
3. Na 5. pokušaju, trebao bi vidjeti:
   ```
   Account je zaključan zbog previše neuspjelih pokušaja.
   Kontaktiraj administratora.
   ```
4. Pokušaj login sa **tačnom lozinkom** - i dalje ne radi ✅

---

### Test 2: Admin Unlock

1. Login kao **admin**
2. Idi na **Admin → Korisnici**
3. Vidiš `testuser` sa **🔴 🔒 Zaključan** badge-om
4. Klikni **"🔓 Otključaj"**
5. Potvrdi
6. Badge nestaje ✅
7. Logout i login kao `testuser` sa tačnom lozinkom - radi! ✅

---

### Test 3: Admin Reset Password

1. Login kao **admin**
2. Admin → Korisnici
3. Klikni **"🔑 Lozinka"** za bilo kojeg korisnika
4. Unesi novu lozinku (npr. `newpass123`)
5. Potvrdi
6. Logout
7. Login sa tim korisnikom sa **novom lozinkom** - radi! ✅
8. Pokušaj sa **starom lozinkom** - ne radi ✅

---

## 📊 Admin Panel UI

### Prije (Stari UI):
```
┌────────────────────────────────────────────┐
│  jankovic123         [Obriši]               │
└────────────────────────────────────────────┘
```

### Poslije (Novi UI):
```
┌─────────────────────────────────────────────────────────┐
│  jankovic123  🟡 ⚠️ 2/5 pokušaja                         │
│  Korisnik                                                │
│  [🔑 Lozinka]  [🗑️ Obriši]                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  marko  🔴 🔒 Zaključan                                   │
│  Korisnik                                                │
│  [🔓 Otključaj]  [🔑 Lozinka]  [🗑️ Obriši]               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Benefits

### ✅ Što smo dobili:

1. **Brute Force Protection**
   - Automatska zaštita od dictionary/brute force napada
   - 5 pokušaja = lock (standard u industriji)

2. **Admin Control**
   - Admin ima punu kontrolu nad accountima
   - Može resetovati lozinke bez znanja starih
   - Može otključati lockane accounte

3. **User Experience**
   - Korisnici vide preostale pokušaje
   - Jasne error poruke
   - Admin podrška za zaboravljene lozinke

4. **Audit Trail**
   - `last_login_attempt` timestamp za tracking
   - `failed_login_attempts` counter
   - `locked` status flag

---

## 🚨 Important Notes

### Za Admina:

⚠️ **Admin accounti se TAKOĐER mogu lockati!**
- Ako admin unese 5x pogrešnu lozinku, account će biti lockovan
- Drugi admin može ga otključati
- **Preporuka:** Imati najmanje 2 admin accounta

### Za Database:

⚠️ **Migracija je neopoziva!**
- Nakon što dodaš kolone, nemoj ih ručno brisati
- Aplikacija zavisi od ovih kolona

### Za Production:

✅ **Deployment na Vercel:**
- Git push će automatski deployati izmjene
- Uradi migration u Supabase PRIJE nego što deploy-uješ
- Testiraj na development prije production deploy-a

---

## 📞 Troubleshooting

### Problem 1: "Column does not exist" error

**Uzrok:** Nisi pokrenuo migration SQL.

**Rješenje:**
1. Otvori Supabase SQL Editor
2. Pokreni `supabase-add-account-lock.sql`
3. Restartuj aplikaciju

---

### Problem 2: Svi korisnici su locked

**Uzrok:** Nepoznato (možda bug ili manual update).

**Rješenje:**
```sql
-- Otključaj sve korisnike
UPDATE users SET locked = false, failed_login_attempts = 0;
```

---

### Problem 3: Admin ne može resetovati lozinku

**Provjeri:**
1. Da li je ulogovan korisnik zaista admin? (`is_admin = true`)
2. Da li target korisnik postoji u bazi?
3. Provjeri browser console za greške (F12)

---

## 🎉 Zaključak

Aplikacija sada ima **enterprise-level** account security:
- ✅ Automatsko lockanje nakon 5 failed attempts
- ✅ Admin može resetovati lozinke
- ✅ Admin može otključati accounte
- ✅ Vizualni prikaz statusa u admin panelu

**Next Steps:**
- Testiraj sve feature-e
- Deploy na production (Vercel)
- Informiši korisnike o novim funkcionalnostima

---

**Made with 🔒 Security in Mind**

