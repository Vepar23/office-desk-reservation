# 🏢 Office Desk Reservation System

Moderna full-stack aplikacija za rezervaciju radnih mjesta u uredu.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)

---

## 📋 Sadržaj

- [Funkcionalnosti](#-funkcionalnosti)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Dokumentacija](#-dokumentacija)
- [Demo](#-demo)
- [License](#-license)

---

## ✨ Funkcionalnosti

### 👤 Za Korisnike:
- 🔐 Sigurna autentifikacija (username/password)
- 📅 Interaktivni kalendar za odabir datuma
- 🗺️ Vizualna mapa ureda sa real-time statusima
- 🎨 Color-coded statusi:
  - 🟢 **Zeleno** - Slobodno
  - 🔴 **Crveno** - Rezervirano
  - ⚫ **Sivo** - Trajno zauzeto
- 📋 Lista svih rezervacija sa imenima korisnika
- 🔄 Brzo otkazivanje rezervacija
- 🔒 Promjena lozinke
- 📱 Mobilna podrška (responsive design)

### 👨‍💼 Za Admine:
- 👥 Upravljanje korisnicima (kreiranje, brisanje)
- 🗺️ Upload mape ureda (slika ili PDF)
- ➕ Dodavanje radnih mjesta na mapu (drag & drop)
- ✏️ Uređivanje pozicija i veličina
- ⌨️ Keyboard kontrole za precizno pozicioniranje
- 🔒 Postavljanje trajno zauzetih mjesta
- 💾 Automatsko spremanje izmjena

---

## 🛠️ Tech Stack

### Frontend:
- **Next.js 14** - React framework sa App Router
- **TypeScript** - Type-safe kod
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management

### Backend:
- **Next.js API Routes** - Serverless API
- **Supabase** - PostgreSQL baza i autentifikacija
- **bcrypt** - Password hashing

### Deployment:
- **Vercel** - Serverless hosting
- **Supabase** - Managed database

---

## 🚀 Quick Start

### 1. Kloniraj Repo

```bash
git clone https://github.com/your-username/office-desk-reservation.git
cd office-desk-reservation
```

### 2. Instaliraj Dependencies

```bash
npm install
```

### 3. Postavi Environment Variables

Kreiraj `.env.local` fajl:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

📖 Više detalja: [`SETUP.md`](./SETUP.md)

### 4. Pokreni Development Server

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000)

### 5. Login

Default admin credentials:
- **Username:** admin
- **Password:** [kreiraj u Supabase]

⚠️ **VAŽNO:** Promijeni admin lozinku odmah nakon prvog logina!

---

## 📚 Dokumentacija

| Dokument | Opis |
|----------|------|
| [**SETUP.md**](./SETUP.md) | Detaljna setup uputstva za lokalni development |
| [**DEPLOYMENT.md**](./DEPLOYMENT.md) | GitHub i Vercel deployment uputstva |
| [**SECURITY.md**](./SECURITY.md) | Security best practices i checklist |
| [**supabase-complete-setup.sql**](./supabase-complete-setup.sql) | SQL script za kreiranje baze |
| [**supabase-security-policies.sql**](./supabase-security-policies.sql) | Row Level Security policies |

---

## 🎯 Kako Koristiti

### Za Korisnike:

1. **Login** - Unesi svoj username i lozinku
2. **Odaberi Datum** - Klikni na datum u kalendaru
3. **Rezerviši Mjesto** - Klikni na zeleno (slobodno) mjesto
4. **Pregledaj Rezervacije** - Vidi sve svoje rezervacije u listi
5. **Otkaži Rezervaciju** - Klikni "Otkaži" pored rezervacije

### Za Admine:

1. **Login kao Admin** - Koristi admin credentials
2. **Admin Panel** - Klikni "Admin" dugme
3. **Upravljaj Korisnicima** - Kreiraj/briši korisnike
4. **Upload Mapu** - Dodaj sliku ureda
5. **Dodaj Mjesta** - Klikni "Dodaj Sto" i pozicioniraj ga
6. **Spremi Izmjene** - Izmjene se automatski spremaju

---

## 🖼️ Demo

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Admin Panel
![Admin](docs/screenshots/admin.png)

---

## 🔒 Security

Aplikacija koristi moderne sigurnosne prakse:

- ✅ **Password Hashing** - bcrypt sa salt rounds
- ✅ **Row Level Security** - Supabase RLS policies
- ✅ **Environment Variables** - Sensitive data nije u kodu
- ✅ **Input Validation** - Username/password validacija
- ✅ **SQL Injection Protection** - Parametrizirani queriji

📖 Više detalja: [`SECURITY.md`](./SECURITY.md)

---

## 📦 Production Deployment

### Brzi Koraci:

1. **Kreiranje Supabase Projekta**
2. **Pokretanje SQL Skripti**
3. **GitHub Push**
4. **Vercel Deployment**
5. **Postavljanje Environment Variables**

📖 Detaljne instrukcije: [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### Problem: Mapa se ne prikazuje na Vercel

**Rješenje:** Upload mapu u Supabase Storage i koristi public URL.

### Problem: "Relation does not exist" greška

**Rješenje:** Pokreni `supabase-complete-setup.sql` u Supabase SQL Editor.

### Problem: Ne mogu se ulogirati

**Rješenje:** 
1. Provjeri `.env.local` fajl
2. Provjeri Supabase credentials
3. Provjeri da li admin korisnik postoji u bazi

---

## 🤝 Contributing

Trenutno ne prihvatamo vanjske contributione, ali možeš forkati projekat za svoj custom development.

---

## 📄 License

MIT License - vidi [LICENSE](./LICENSE) fajl za detalje.

---

## 👨‍💻 Author

Kreirao: **Vaše Ime**  
Kontakt: **email@example.com**

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

## 📊 Verzija

**Trenutna Verzija:** 2.0  
**Datum Posljednje Izmjene:** 16. Novembar 2025

---

## 📞 Support

Za probleme ili pitanja:
1. Provjeri dokumentaciju u `SETUP.md` i `DEPLOYMENT.md`
2. Provjeri sigurnosne upute u `SECURITY.md`
3. Kontaktiraj administratora projekta

---

**Made with ❤️ using Next.js and Supabase**
