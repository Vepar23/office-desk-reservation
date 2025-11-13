# 📖 Vodič za Korištenje Aplikacije

Detaljan vodič za sve korisnike aplikacije za rezervaciju mjesta u uredu.

## 👤 Za Obične Korisnike

### 1️⃣ Prijava na Sistem

1. Otvorite aplikaciju u web browseru
2. Unesite korisničko ime i lozinku koje vam je dao administrator
3. Kliknite **"Prijavi se"**

### 2️⃣ Pregled Dashboard-a

Nakon prijave, vidjećete tri glavne sekcije:

#### 📅 Lijeva Strana - Kalendar
- **Plava pozadina** sa modernim izgledom
- **Sivi dani** = vikendi (ne mogu se rezervirati)
- **Plavi dan** = trenutno odabrani dan
- **Zelena pozadina** = dan kada već imate rezervaciju

**Kako koristiti:**
- Kliknite na željeni dan da ga odaberete
- Vikendi su automatski blokirani
- Ne možete birati dane u prošlosti

#### 🗺️ Sredina - Mapa Ureda
- Prikazuje plan ureda sa svim stolovima
- Stolovi su obojeni prema statusu:
  - 🟢 **Zeleno** = Slobodno mjesto
  - 🔴 **Crveno** = Već rezervirano
  - ⚫ **Sivo** = Trajno zauzeto (ne može se rezervirati)

**Kako rezervirati:**
1. Odaberite datum u kalendaru
2. Kliknite na **zeleni stol** na mapi
3. Potvrdite rezervaciju
4. Dobit ćete potvrdu o uspješnoj rezervaciji

#### 📋 Desna Strana - Rezervacije

**Gornja sekcija - "Moje Rezervacije"**
- Lista svih vaših rezervacija
- Prikazane po datumu
- Možete otkazati buduće rezervacije klikom na "Otkaži"

**Donja sekcija - "Rezervacije za [datum]"**
- Prikazuje sva zauzeća mjesta za odabrani dan
- Pomaže vam da vidite koja su mjesta slobodna

### 3️⃣ Pravila Rezervacije

⚠️ **VAŽNO:**
- Možete rezervirati **samo jedno mjesto po danu**
- Ne možete rezervirati dva mjesta u istom danu
- Vikendi nisu dostupni za rezervaciju
- Ne možete rezervirati dane u prošlosti
- Trajno zauzeta mjesta (siva) nisu dostupna

### 4️⃣ Otkazivanje Rezervacije

1. Idite na **"Moje Rezervacije"** (desna strana)
2. Pronađite rezervaciju koju želite otkazati
3. Kliknite **"Otkaži"**
4. Potvrdite otkazivanje

**Napomena:** Možete otkazati samo buduće rezervacije!

### 5️⃣ Odjava

1. Kliknite **"Odjavi se"** u gornjem desnom uglu
2. Biće te vraćeni na login stranicu

---

## 👨‍💼 Za Administratore

### 1️⃣ Pristup Admin Panelu

1. Prijavite se sa admin kredencijalima
2. Na Dashboard-u, kliknite **"Admin Panel"** dugme (gornji desni ugao)

### 2️⃣ Tab: Mapa Ureda

#### Upload Mape Ureda

Admin panel sada podržava **2 metode upload-a**:

**Metoda 1: Upload Lokalnog Fajla** (Preporučeno ⭐)

1. Kliknite na **"📁 Upload Fajla"** tab
2. Kliknite na upload područje ili povucite fajl (drag & drop)
3. Odaberite sliku ili PDF sa vašeg računara
4. Vidjet ćete preview uploadane slike
5. Kliknite **"Upload Mapu"**

**Metoda 2: URL Slike**

1. Kliknite na **"🔗 URL Slike"** tab
2. Pronađite javni URL slike mape vašeg ureda
3. Kopirajte URL (mora biti javno dostupan)
4. Zalijepite u polje **"URL Slike"**
5. Kliknite **"Upload Mapu"**

**Podržani Formati:**
- 🖼️ Slike: JPG, JPEG, PNG, WEBP, GIF
- 📄 Dokumenti: PDF
- 📏 Maksimalna veličina: 5MB
- 📐 Preporučena rezolucija: Minimum 1200x800px

**Preporuke:**
- Koristite visokokvalitetne slike za bolji prikaz
- PDF format je odličan za detaljne planove
- Lokalni upload je brži i sigurniji od URL metode
- Uploadane slike se čuvaju u `public/uploads/` folderu

**Primjer URL-a (ako koristite URL metodu):**
```
https://i.imgur.com/example123.jpg
https://your-storage.supabase.co/storage/v1/object/public/maps/office.png
```

#### Upravljanje Stolovima na Mapi

**Dodavanje stolova:**
- Stolovi se pojavljuju kao obojeni kvadrati
- Možete ih pomjerati **drag & drop** metodom
- Svaki stol ima svoj broj (npr. A1, B2, C3)

**Pomjeranje stola:**
1. Kliknite i držite stol
2. Povucite ga na željenu poziciju
3. Pustite - promjena se automatski čuva

**Brisanje stola:**
1. Kliknite na **X** dugme u gornjem desnom uglu stola
2. Potvrdite brisanje

### 3️⃣ Tab: Stolovi

#### Kreiranje Novog Stola

1. Unesite **Broj Stola** (npr. A1, Desk-001)
2. Odaberite **Status:**
   - **Dostupno** - normalan stol koji se može rezervirati
   - **Trajno zauzeto** - stol koji nije dostupan za rezervacije
3. Kliknite **"Dodaj Stol"**
4. Novi stol će se pojaviti na mapi na defaultnoj poziciji (100, 100)
5. Pomjerite ga na željeno mjesto drag & drop metodom

#### Lista Stolova

- Prikazuje sve stolove sa pozicijama
- Možete obrisati bilo koji stol
- **UPOZORENJE:** Brisanje stola će obrisati i sve njegove rezervacije!

### 4️⃣ Tab: Korisnici

#### Kreiranje Novog Korisnika

1. Unesite **Korisničko Ime** (minimum 3 znaka, samo slova, brojevi i _)
2. Unesite **Lozinku** (minimum 6 znakova)
3. Označite **"Admin privilegije"** ako želite da korisnik bude administrator
4. Kliknite **"Kreiraj Korisnika"**

**Najbolje prakse:**
- Koristite jedinstvena korisnička imena
- Kreirajte jake lozinke
- Dajte admin prava samo pouzdanim osobama
- Redovno pregledajte listu korisnika

#### Brisanje Korisnika

1. Pronađite korisnika u listi
2. Kliknite **"Obriši"**
3. Potvrdite brisanje

**UPOZORENJE:** 
- Ova akcija je nepovratna!
- Sve rezervacije tog korisnika će biti obrisane
- Korisnik će odmah izgubiti pristup sistemu

### 5️⃣ Best Practices za Administratore

#### Sigurnost

✅ **DO:**
- Promijenite default admin lozinku ODMAH
- Kreirajte backup administratora
- Redovno pregledajte listu korisnika
- Obrišite neaktivne korisnike
- Koristite jake lozinke

❌ **DON'T:**
- Ne dijelite admin kredencijale
- Ne koristite jednostavne lozinke
- Ne ostavljajte default admin account aktivan u produkciji
- Ne dajte admin prava svima

#### Organizacija Stolova

**Preporuke za numeraciju:**
- Koristite logički sistem (A1, A2, A3...)
- Grupirajte po zonama (A-zona lijevo, B-zona desno)
- Dodajte opis ako treba (Window-A1, Corner-B3)

**Primjeri numeracije:**
```
Opcija 1 - Po redovima:
A1, A2, A3, A4
B1, B2, B3, B4
C1, C2, C3, C4

Opcija 2 - Po zonama:
Zone1-01, Zone1-02
Zone2-01, Zone2-02

Opcija 3 - Opisno:
Window-01, Window-02
Center-01, Center-02
Corner-01, Corner-02
```

#### Trajno Zauzeta Mjesta

Koristite status "Trajno zauzeto" za:
- Stolove koji su rezervirani za specifične osobe
- Mjesta u održavanju
- Mjesta koja nisu dostupna iz drugih razloga

---

## 🎯 Use Cases (Primjeri Korištenja)

### Scenario 1: Novi Zaposlenik
**Problem:** Novi zaposlenik počinje raditi i treba mu pristup sistemu.

**Rješenje:**
1. Admin kreira novi account za zaposlenika
2. Zaposleniku se šalju kredencijali
3. Zaposlenik se prijavljuje i rezervira mjesto za prvi dan

### Scenario 2: Planiranje Nedjelje
**Problem:** Zaposlenik želi rezervirati mjesto za cijelu sljedeću nedjelju.

**Rješenje:**
1. Odabere ponedjeljak u kalendaru
2. Rezervira željeno mjesto
3. Ponovi za utorak, srijedu, četvrtak, petak
4. Vikend je automatski preskočen

### Scenario 3: Renoviranje Dijela Ureda
**Problem:** Dio ureda se renovira i stolovi nisu dostupni.

**Rješenje:**
1. Admin ide u Admin Panel → Stolovi
2. Pronađe stolove u tom dijelu
3. Ili ih privremeno obriše, ili promijeni status u "Trajno zauzeto"

### Scenario 4: Otkazivanje Zbog Bolesti
**Problem:** Zaposlenik je rezervirao mjesto ali se razbolio.

**Rješenje:**
1. Ode na Dashboard
2. U "Moje Rezervacije", klikne "Otkaži" za taj dan
3. Mjesto postaje dostupno za druge

---

## ❓ FAQ (Često Postavljana Pitanja)

### Za Korisnike

**Q: Mogu li rezervirati mjesto za kolegu?**
A: Ne, svaki korisnik može rezervirati samo za sebe.

**Q: Šta ako zaboravim lozinku?**
A: Kontaktirajte administratora da vam resetuje lozinku.

**Q: Mogu li vidjeti ko je rezervirao određeno mjesto?**
A: Ne, iz privatnosti vidite samo da je mjesto zauzeto, ali ne i ko ga je rezervirao.

**Q: Do kada mogu otkazati rezervaciju?**
A: Možete otkazati bilo kada prije datuma rezervacije.

**Q: Mogu li rezervirati mjesto za nekoliko mjeseci unaprijed?**
A: Da, nema ograničenja koliko unaprijed možete rezervirati.

### Za Administratore

**Q: Mogu li promijeniti lozinku postojećem korisniku?**
A: Trenutno ne direktno. Najbolje je obrisati stari account i kreirati novi.

**Q: Šta se dešava sa rezervacijama kada obrišem stol?**
A: Sve rezervacije za taj stol se automatski brišu.

**Q: Mogu li undo-ovati brisanje korisnika?**
A: Ne, brisanje je permanentno. Budite pažljivi!

**Q: Koliko administratora mogu imati?**
A: Neograničeno, ali preporučuje se 2-3 za sigurnost.

**Q: Mogu li exportovati listu rezervacija?**
A: Trenutno ne direktno iz aplikacije, ali možete pristupiti podacima iz Supabase-a.

---

## 📞 Podrška

Za dodatna pitanja ili pomoć:

1. **Korisnici:** Kontaktirajte svog administratora
2. **Administratori:** Pogledajte `README.md` ili `DEPLOYMENT.md`
3. **Tehnička pitanja:** Provjerite GitHub Issues

---

**Sretno korištenje! 🎉**

