# 📝 Changelog

Sve značajne izmjene u projektu će biti dokumentovane u ovom fajlu.

## [1.4.0] - 2025-11-11

### 📱 Mobilna Podrška (MAJOR UPDATE!)

**Responsive Layout**
- ✅ Potpuna prilagodba za sve veličine ekrana (375px - 1920px+)
- ✅ Mobile layout: Kalendar → Mapa Ureda (glavni fokus) → Hamburger Menu
- ✅ Desktop layout: Kalendar (lijevo) | Mapa (centar, 40% šira) | Lista (desno)
- ✅ Glavni breakpoint: `lg` (1024px)

**Hamburger Menu Komponenta** (NOVO!)
- ✅ Fixed pozicija u gornjem desnom kutu
- ✅ Slide-in panel sa desne strane (max-width 85vw)
- ✅ Animirani hamburger icon (3-line → X)
- ✅ Overlay za zatvaranje klikom
- ✅ Prikaz "Moje Rezervacije" i "Rezervacije za Odabrani Dan"
- ✅ Z-index hijerarhija: Button (60), Panel (55), Overlay (50)

**Touch Support**
- ✅ `onTouchStart` i `onTouchEnd` eventi u OfficeMap
- ✅ Touch detection za mjesta na mapi
- ✅ `touch-none` klasa za bolju kontrolu
- ✅ Touch-optimized botuni (min 44x44px)

**Responsive Komponente**
- ✅ Calendar: Adaptive padding (`p-3`/`p-6`), font-size (`text-xs`/`text-sm`)
- ✅ OfficeMap: Adaptive visina (400px/500px/700px), padding (`p-2`/`p-4`)
- ✅ Dashboard Header: Kompaktniji tekst i botuni na mobilnom
  - "Admin Panel" → "Admin"
  - "Odjavi se" → "Odjava"
  - Username sakriven na mobile
- ✅ Legend elementi: Manji na mobilnom (`w-4 h-4` vs `w-6 h-6`)
- ✅ Keyboard kontrole sakrivene na mobilnom

**UI/UX Improvements**
- ✅ Sticky header (z-40) za stalni pristup navigaciji
- ✅ Smooth slide animacije (300ms ease-in-out)
- ✅ Vertical scroll only (bez horizontal scroll-a)
- ✅ Progressive enhancement (desktop features kao bonus)

### 🧪 Testirano na Rezolucijama
- ✅ iPhone SE (375x667)
- ✅ iPhone 12 Pro (390x844)
- ✅ iPhone 14 Pro Max (430x932)
- ✅ iPad Mini (768x1024)
- ✅ iPad Pro (1024x1366)
- ✅ Pixel 5 (393x851)
- ✅ Galaxy S21 (360x800)
- ✅ Desktop HD (1920x1080)

### 📚 Nova Dokumentacija
- ✅ `MOBILE_SUPPORT.md` - Detaljni mobilni vodič
- ✅ `RESPONSIVE_GUIDE.md` - Tehnička dokumentacija responzivnosti
- ✅ `VERSION_1.4_SUMMARY.md` - Summary verzije 1.4.0

### 📦 Nove Datoteke
- `components/HamburgerMenu.tsx` - Hamburger menu komponenta

### 🔄 Promijenjene Datoteke
- `app/dashboard/page.tsx` - Razdvojen mobile/desktop layout
- `components/Calendar.tsx` - Responsive styles
- `components/OfficeMap.tsx` - Touch events + responsive
- `README.md` - Dodata mobilna sekcija
- `CHANGELOG.md` - Verzija 1.4.0 entry

## [1.3.1] - 2025-11-10

### 🐛 Bug Fixes & Improvements

**Drag & Drop Improvements**
- ✅ Precizniji drag offset calculation (container-relative)
- ✅ 1:1 mouse tracking - nema lag-a
- ✅ userSelect: 'none' za sprječavanje text selekcije
- ✅ preventDefault() i stopPropagation() u event handlers
- ✅ cursor-move visual feedback za admin
- ✅ Click ne triggeruje nakon drag-a
- ✅ Bolji state cleanup u handleMouseUp

**Text Corrections**
- ✅ "rezerviši" → "rezerviraj" (gramatički ispravno)

### 🎨 UX Improvements
- Drag & drop sada radi savršeno - stol ostaje tačno pod kursorom
- Nema više "skakanja" kada uhvatiš stol
- Smooth 60fps movement tokom drag-a

## [1.3.0] - 2025-11-10

### ✨ New Features

**Position Sync** (NOVO!)
- Pozicije stolova admin/user view sada 100% identične
- Iste proporcije kontejnera na oba ekrana
- Max-width constraint na admin view
- Info box za admina o sync-u pozicija

**Confirmation Dialog** (NOVO!)
- Moderan custom confirmation dialog prije rezervacije
- "Da/Ne" opcije umjesto native confirm
- Formatted date display (ponedjeljak, 10. studeni)
- Backdrop blur effect
- Smooth animations
- Accessible & user-friendly

**Wider Map Display** (NOVO!)
- User view mapa sada 40% šira (col-span 6→8)
- Kalendar i lista smanjeni (col-span 3→2)
- Veći prostor za interakciju sa mapom
- Max-width 1920px za veće ekrane
- Bolja vidljivost stolova

### 🎨 UI/UX Improvements
- Consistent map sizing across views
- Better proportions & spacing
- Professional confirmation flow
- Enhanced user experience

## [1.2.0] - 2025-11-10

### ✨ New Features

**Keyboard Controls** (NOVO!)
- ⌨️ Arrow keys (←↑↓→) za micanje stolova (1px po koraku)
- ⏩ Shift + Arrow keys za brže micanje (10px po koraku)
- ➕ Plus (+) taster za povećanje stolova
- ➖ Minus (-) taster za smanjivanje stolova
- 🚫 Esc taster za deselect
- 📐 Real-time dimension display kada je stol selektovan

**Mouse Resize Handles** (NOVO!)
- 8 resize handles na selektovanom stolu
- 4 ugaona handle-a (NW, NE, SW, SE)
- 4 ivična handle-a (N, S, E, W)
- Visual feedback sa plavim tačkama
- Live dimension update tokom resize-a
- Min/Max constraint (40-200px)

**Improved Map Display**
- 📏 Povećan container sa 600px na 700px visine
- 🖼️ backgroundSize: 'contain' za bolji fit slike
- 📐 backgroundRepeat: 'no-repeat' za čistu pozadinu
- 🎨 Bolji vizualni prikaz uploadanih slika
- 🔵 Ring indicator na selektovanom stolu

**UI Improvements**
- Info box sa keyboard shortcuts
- Dimension display na selektovanom stolu
- Visual selection state (plavi ring)
- Better cursor indicators
- Responsive resize handles

## [1.1.0] - 2025-11-10

### ✨ New Features

**File Upload System**
- Lokalni upload fajlova za mapu ureda
- Podržani formati: JPG, PNG, WEBP, GIF, PDF
- Maksimalna veličina: 5MB
- Live preview prije upload-a
- Drag & drop funkcionalnost
- Dual metoda: Lokalni fajl ili URL

**Admin Panel Improvements**
- Toggle između file upload i URL metode
- Visual feedback za upload progress
- File size i type display
- Remove file opcija prije upload-a
- Current map preview

**API Enhancements**
- Novi `/api/upload` endpoint
- File validation (type, size)
- Automatic filename generation
- Public URL generation

## [1.0.0] - 2025-11-10

### 🎉 Initial Release

#### ✨ Features

**Autentifikacija**
- Username/password login sistem
- Default admin account (admin/test123)
- Logout funkcionalnost
- LocalStorage session persistence

**Admin Panel**
- Kreiranje i brisanje korisnika
- Upload mape ureda (URL-based)
- Drag & drop stolova na mapi
- Dodavanje/brisanje stolova
- Postavljanje trajno zauzetih mjesta
- Admin-only pristup kontrola

**User Dashboard**
- Interaktivni kalendar sa plavom pozadinom
- Zasivljeni vikendi (nedostupni za rezervaciju)
- Vizualna mapa ureda
- Color-coded stolovi (zeleno/crveno/sivo)
- Lista ličnih rezervacija
- Lista svih rezervacija za odabrani dan
- Otkazivanje rezervacija

**Poslovnа Logika**
- Jedno mjesto po korisniku po danu
- Validacija duplikatnih rezervacija
- Automatsko blokiranje vikenda
- Blokiranje prošlih datuma
- Real-time status ažuriranje

#### 🛡️ Sigurnost

- Password hashing sa bcryptjs
- Input validation (username, password)
- Security headers (X-Frame-Options, CSP, itd.)
- Environment variables za osetljive podatke
- Role-based access control
- SQL injection zaštita

#### 🏗️ Tehničke Karakteristike

- Next.js 14 App Router
- TypeScript za type safety
- Tailwind CSS za styling
- Zustand za state management
- In-memory storage za development
- Supabase-ready database schema
- Vercel deployment ready
- Responsive design

#### 📚 Dokumentacija

- README.md - Opšta dokumentacija
- QUICK_START.md - Brzi vodič za pokretanje
- USAGE_GUIDE.md - Vodič za korištenje
- SUPABASE_SETUP.md - Setup baze podataka
- DEPLOYMENT.md - Deployment na Vercel
- CHANGELOG.md - Historija izmjena

### 🔜 Planirane Funkcionalnosti

Za buduće verzije:

**v1.1.0**
- [ ] Email notifikacije za rezervacije
- [ ] Export rezervacija u CSV/Excel
- [ ] Statistika korištenja mjesta
- [ ] Filter i pretraga stolova

**v1.2.0**
- [ ] Recurring rezervacije (automatsko ponavljanje)
- [ ] Grupne rezervacije (team booking)
- [ ] Korisnički profili sa slikama
- [ ] Preference stolova (favourite desks)

**v1.3.0**
- [ ] Mobile aplikacija (React Native)
- [ ] QR kod check-in sistem
- [ ] Integracija sa Slack/Teams
- [ ] Advanced analytics dashboard

**v2.0.0**
- [ ] Multi-office support
- [ ] Parking mjesto rezervacija
- [ ] Meeting room booking
- [ ] Visitor management

---

## Verzionisanje

Projekt prati [Semantic Versioning](https://semver.org/):
- **MAJOR** verzija za breaking changes
- **MINOR** verzija za nove funkcionalnosti
- **PATCH** verzija za bug fixes

## Git Tag Format

```bash
# Create a new version tag
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

---

**Legend:**
- ✨ Nove funkcionalnosti
- 🐛 Bug fixes
- 🛡️ Sigurnosne izmjene
- 📚 Dokumentacija
- 🎨 UI/UX poboljšanja
- ⚡ Performance optimizacije
- 🔄 Refactoring
- 🗑️ Uklanjanje zastarjelih funkcija

