# ⚡ Quick Start Guide

Brzi vodič za pokretanje aplikacije u **5 minuta**!

## 🎯 Cilj

Pokrenuti aplikaciju lokalno i početi koristiti odmah.

## 📋 Preduslovi

Samo 3 stvari vam trebaju:
- ✅ **Node.js 18+** ([Download](https://nodejs.org))
- ✅ **Git** ([Download](https://git-scm.com))
- ✅ **Code Editor** (VS Code, Cursor, itd.)

## 🚀 5 Koraka do Pokretanja

### Korak 1: Klonirajte Projekat

```bash
cd Desktop/WEB
cd EREZ
```

*Već ste u ovom folderu! ✅*

### Korak 2: Instalirajte Zavisnosti

```bash
npm install
```

Ovo će instalirati sve potrebne pakete (~2 minute).

### Korak 3: Konfigurišite Environment

Kreiran je `.env.local.example` fajl. Za brzi start sa in-memory storage, **ništa ne morate mijenjati**!

Aplikacija će raditi bez Supabase-a za development.

### Korak 4: Pokrenite Aplikaciju

```bash
npm run dev
```

### Korak 5: Otvorite u Browseru

Idite na: **http://localhost:3000**

## 🎉 Uspješno pokrenuto!

### Default Login Kredencijali

**Username:** `admin`  
**Password:** `test123`

### Šta Sada?

1. **Prijavite se** sa default admin kredencijalima
2. **Kreirajte korisnike** u Admin Panelu
3. **Uploadujte mapu ureda** (koristite bilo koji javni URL slike)
4. **Dodajte stolove** i počnite testirati rezervacije!

## 📝 In-Memory vs Supabase

### In-Memory Mode (Default - Odmah radi!)

✅ **Prednosti:**
- Nema setup-a
- Radi instant
- Idealno za testiranje

❌ **Nedostaci:**
- Podaci se brišu na restart
- Samo za development
- Ne dijeli se između uređaja

### Supabase Mode (Za Production)

✅ **Prednosti:**
- Podaci se čuvaju trajno
- Radi na bilo kojem uređaju
- Production-ready
- Besplatan tier dostupan

📖 **Setup:** Pogledajte `SUPABASE_SETUP.md`

## 🆘 Problemi?

### "npm command not found"
**Rješenje:** Instalirajte Node.js sa [nodejs.org](https://nodejs.org)

### "Port 3000 already in use"
**Rješenje:** 
```bash
# Koristite drugi port
npm run dev -- -p 3001
```

### "Module not found" errors
**Rješenje:**
```bash
# Obrišite node_modules i reinstalirajte
rm -rf node_modules
npm install
```

### Aplikacija ne učitava
**Rješenje:** 
1. Provjerite konzolu za greške (F12)
2. Restartujte dev server (Ctrl+C, pa `npm run dev`)

## 📚 Sljedeći Koraci

Nakon što radi lokalno:

1. 📖 Pročitajte `USAGE_GUIDE.md` - kako koristiti sve funkcionalnosti
2. 🗄️ Setup Supabase - `SUPABASE_SETUP.md`
3. 🚀 Deploy na Vercel - `DEPLOYMENT.md`
4. 🎨 Customizujte - izmijenite boje, layout, itd.

## 🎬 Video Tutorial

Ne postoji još, ali koraci su dovoljno jednostavni! 😊

## 💡 Pro Tips

- Koristite **Ctrl+C** u terminalu da zaustavite server
- Koristi `npm run build` da testirate production build
- Aplikacija automatski reloaduje kada mijenjate kod
- Otvorite http://localhost:3000 u incognito modu ako imate cache probleme

---

**Ready to build! 🚀**

Imate pitanja? Pogledajte `README.md` za detaljnu dokumentaciju.

