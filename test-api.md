# 🔍 API Test - Debugging

## Problem
Admin panel ne prikazuje listu stolova i mapu ureda.

## Šta testiram

### 1. Direktan pristup API rutama u browseru:

Otvorite ove URL-ove u browser-u:

- `http://localhost:3000/api/desks`
- `http://localhost:3000/api/office-map`
- `http://localhost:3000/api/users`

**Šta bi trebalo da vidite:**
```json
// Za /api/desks:
{
  "desks": []
}

// Za /api/office-map:
{
  "officeMap": null
}

// Za /api/users:
{
  "users": [...]
}
```

### 2. Testiranje u Admin Panelu

1. Otvorite `http://localhost:3000/admin`
2. Otvorite Developer Tools (F12)
3. Idite na **Console** tab
4. Osvježite stranicu (F5)
5. Pogledajte šta se ispisuje u konzoli

**Očekivano:**
```
📊 Admin Panel - Fetched Data: { desks: [], users: [...], officeMap: null }
```

### 3. Dodavanje stola

1. U Admin Panelu, idite na tab **"Stolovi"**
2. Popunite formu:
   - Broj Stola: `A1`
   - Status: `Dostupno`
3. Kliknite **"Dodaj Stol"**
4. Pogledajte konzolu

**Očekivano:**
- Alert: "Stol uspješno kreiran!"
- Console: Nova fetch poruka sa ažuriranim podacima

### 4. Upload mape ureda

1. U Admin Panelu, idite na tab **"Mapa Ureda"**
2. Odaberite fajl ili unesite URL
3. Kliknite **"Upload Mapu"**
4. Pogledajte konzolu

**Očekivano:**
- Alert: "Mapa ureda uspješno uploadana!"
- Console: Nova fetch poruka sa mapom

---

## Mogući problemi

### ❌ API vraća 404
**Rješenje:** Next.js server nije učitao API rute
- Zaustavite server (Ctrl+C)
- Obrišite `.next` folder: `Remove-Item -Recurse -Force .next`
- Pokrenite ponovo: `npm run dev`

### ❌ API radi, ali Admin Panel ne prikazuje podatke
**Rješenje:** Problem sa React state-om
- Provjerite console.log poruke
- Provjerite da li se `fetchData()` poziva

### ❌ Podaci se dodaju ali se gube nakon restarta
**To je očekivano!** In-memory storage gubi podatke nakon restarta.
Rješenje: Postaviti prave Supabase kredencijale u `.env.local`

---

## Sljedeći koraci

Nakon testiranja, recite mi:
1. Šta vidite kada otvorite `http://localhost:3000/api/desks` u browseru?
2. Šta piše u konzoli kada otvorite Admin Panel?
3. Da li se pojavljuje alert kada dodate stol?


