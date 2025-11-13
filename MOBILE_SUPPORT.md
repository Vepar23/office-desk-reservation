# 📱 Mobilna Podrška

## Pregled

Aplikacija je potpuno optimizovana za mobilne uređaje sa prilagođenim layoutom i intuitivnom navigacijom.

## Mobilni Layout

### 📐 Struktura

**Desktop (≥1024px):**
```
┌─────────────────────────────────────────┐
│           Header (sticky)                │
├───────┬─────────────────────┬───────────┤
│       │                     │           │
│ Kalen-│   Mapa Ureda        │ Lista     │
│  dar  │    (40% šira)       │ Rezerv.   │
│       │                     │           │
└───────┴─────────────────────┴───────────┘
```

**Mobile (<1024px):**
```
┌─────────────────────────────────────────┐
│   Header (sticky) + Hamburger Menu 🍔   │
├─────────────────────────────────────────┤
│          Kalendar (scrollable)          │
├─────────────────────────────────────────┤
│                                         │
│         Mapa Ureda (glavni fokus)       │
│           (500px min visina)            │
│                                         │
└─────────────────────────────────────────┘
```

### 🍔 Hamburger Menu

**Lokacija:** Gornji desni kut (fixed position)  
**Funkcionalnost:**
- Slide-in panel sa desne strane
- Prikazuje listu rezervacija
- Overlay za zatvaranje
- Animirani hamburger icon (3-line → X)

**Sadržaj:**
1. **Moje Rezervacije** - Lista svih rezervacija korisnika
2. **Rezervacije za Odabrani Dan** - Filtrirana lista

## Touch Podrška

### 📲 Touch Events

```typescript
onTouchStart - Detektuje touch na mjesto
onTouchEnd   - Aktivira klik na mjesto
```

### ✨ Features

- ✅ Touch-friendly botuni (veći klikovi)
- ✅ Scroll omogućen na cijeloj stranici
- ✅ Zoom disabled za bolju kontrolu (`touch-none`)
- ✅ No text selection tokom interakcije

## Responsive Breakpoints

```css
/* Tailwind CSS breakpoints */
sm:  640px  - Mali ekrani
md:  768px  - Srednji ekrani
lg:  1024px - Desktop view (glavni breakpoint)
xl:  1280px - Large desktop
2xl: 1536px - Extra large desktop
```

## Prilagođeni Elementi

### Header
- **Desktop:** Full tekst, veliki botuni
- **Mobile:** Kompaktniji tekst, manji botuni
  - "Admin Panel" → "Admin"
  - "Odjavi se" → "Odjava"
  - Username sakriven na mobilnom

### Kalendar
- **Desktop:** `p-6` padding, veći fonti
- **Mobile:** `p-3` padding, manji fonti
  - Dugmad: `w-6 h-6` → `w-5 h-5`
  - Fonti: `text-sm` → `text-xs`
  - Gap: `gap-2` → `gap-1`

### Mapa Ureda
- **Desktop:** `min-h-[700px]`
- **Mobile:** `min-h-[400px]` (tablet: `500px`)
- Keyboard kontrole sakrivene na mobilnom
- Legend ikone: `w-6 h-6` → `w-4 h-4`

### Lista Rezervacija
- **Desktop:** Uvijek vidljiva u desnoj koloni
- **Mobile:** Dostupna kroz hamburger menu

## Testiranje

### 📱 Testirane Rezolucije

- **iPhone SE:** 375 x 667
- **iPhone 12 Pro:** 390 x 844
- **iPhone 14 Pro Max:** 430 x 932
- **iPad Mini:** 768 x 1024
- **iPad Pro:** 1024 x 1366
- **Android (Pixel 5):** 393 x 851
- **Android (Galaxy S21):** 360 x 800

### 🧪 Test Checklist

- [ ] Svi elementi vidljivi bez horizontal scroll-a
- [ ] Hamburger menu se otvara i zatvara
- [ ] Touch events rade na mjestima
- [ ] Kalendar omogućava scroll
- [ ] Mapa ureda pravilno prikazana
- [ ] Botuni dovoljno veliki za touch
- [ ] Text čitljiv na malim ekranima
- [ ] Sticky header ostaje na vrhu

## Problemi i Rješenja

### Problem: Elementi preširoki
**Rješenje:** `max-w-[85vw]` za hamburger menu

### Problem: Touch ne reaguje
**Rješenje:** `touch-none` klasa + explicit touch eventi

### Problem: Text selection tokom drag-a
**Rješenje:** `userSelect: 'none'`, `WebkitUserSelect: 'none'`

### Problem: Kalendar prezahtevan
**Rješenje:** Smanjenje padding-a i font veličina

## Best Practices

1. **Sticky Header** - Uvijek dostupan logout i admin
2. **Hamburger Menu** - Standardna navigacija za mobile
3. **Larger Touch Targets** - Min 44x44px za botune
4. **Vertical Scroll Only** - Bez horizontal scroll-a
5. **Optimized Images** - `backgroundSize: 'contain'`
6. **Z-Index Hijerarhija:**
   - Header: `z-40`
   - Hamburger Button: `z-60`
   - Hamburger Panel: `z-55`
   - Overlay: `z-50`

## Budući Razvoj

### Planirane Features
- [ ] Swipe gestures za kalendar (prev/next mjesec)
- [ ] Pull-to-refresh za rezervacije
- [ ] Vibration feedback na rezervaciju
- [ ] Dark mode podrška
- [ ] PWA instalacija
- [ ] Offline mode

## Zaključak

Aplikacija je potpuno funkcionalna na svim modernim mobilnim uređajima sa intuitivnim UI-em i smooth interakcijama.

