# 📐 Responsive Design Vodič

## Pregled Responzivnosti

Aplikacija koristi Tailwind CSS responsive utilities za prilagodbu svim veličinama ekrana.

## Breakpoints

```javascript
// tailwind.config.ts default breakpoints
{
  'sm': '640px',   // Tablet portrait
  'md': '768px',   // Tablet landscape  
  'lg': '1024px',  // Desktop (glavni breakpoint)
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large desktop
}
```

## Layout Strategy

### Mobile-First Approach

```jsx
// Base style - mobile
<div className="p-2 text-xs">

// Desktop overrides
<div className="p-2 text-xs lg:p-6 lg:text-base">
```

### Conditional Rendering

```jsx
// Prikaži samo na mobile
<div className="lg:hidden">Mobile Content</div>

// Prikaži samo na desktop
<div className="hidden lg:block">Desktop Content</div>
```

## Komponenta po Komponenta

### 1. Dashboard Layout

#### Mobile (<1024px)
```jsx
<main>
  <div className="lg:hidden space-y-4">
    {/* Calendar above map */}
    <Calendar />
    
    {/* Map - main focus */}
    <OfficeMap />
  </div>
</main>

{/* Hamburger menu for reservations */}
<HamburgerMenu />
```

#### Desktop (≥1024px)
```jsx
<main>
  <div className="hidden lg:grid lg:grid-cols-12 gap-6">
    <div className="lg:col-span-2">
      <Calendar />
    </div>
    
    <div className="lg:col-span-8">
      <OfficeMap />
    </div>
    
    <div className="lg:col-span-2">
      <ReservationsList />
    </div>
  </div>
</main>
```

### 2. Header

```jsx
<header className="sticky top-0 z-40">
  <h1 className="text-lg sm:text-2xl">
    Rezervacija Mjesta
  </h1>
  
  <div className="flex items-center gap-2 sm:gap-4">
    {/* Username - hide on mobile */}
    <span className="hidden sm:inline">
      Dobrodošli, {username}
    </span>
    
    {/* Buttons - compact on mobile */}
    <button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-base">
      <span className="hidden sm:inline">Admin Panel</span>
      <span className="sm:hidden">Admin</span>
    </button>
  </div>
</header>
```

### 3. Calendar

```jsx
<div className="p-3 sm:p-6">
  {/* Navigation buttons */}
  <button className="p-1 sm:p-2">
    <svg className="w-5 h-5 sm:w-6 sm:h-6" />
  </button>
  
  {/* Title */}
  <h2 className="text-base sm:text-xl">
    {monthName} {year}
  </h2>
  
  {/* Days grid */}
  <div className="grid grid-cols-7 gap-1 sm:gap-2">
    <button className="p-1 sm:p-2 text-xs sm:text-sm" />
  </div>
  
  {/* Legend */}
  <div className="mt-3 sm:mt-6">
    <div className="w-3 h-3 sm:w-4 sm:h-4" />
    <span className="text-xs">Label</span>
  </div>
</div>
```

### 4. Office Map

```jsx
<div className="p-2 sm:p-4">
  <div className="min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] touch-none">
    {/* Map content */}
  </div>
  
  {/* Legend */}
  <div className="mt-2 sm:mt-4 gap-2 sm:gap-4 text-xs sm:text-sm">
    <div className="w-4 h-4 sm:w-6 sm:h-6" />
  </div>
  
  {/* Keyboard controls - desktop only */}
  <div className="hidden sm:block">
    Keyboard shortcuts
  </div>
</div>
```

### 5. Hamburger Menu

```jsx
// Button - fixed position, mobile only
<button className="fixed top-4 right-4 z-[60] lg:hidden">
  {/* Hamburger icon */}
</button>

// Overlay
<div className="fixed inset-0 z-[50] lg:hidden" />

// Panel - slide from right
<div className="fixed top-0 right-0 w-80 max-w-[85vw] z-[55] lg:hidden">
  {/* Content */}
</div>
```

## Responsive Patterns

### Pattern 1: Scaling Values

```jsx
// Padding scale
p-2      // mobile
sm:p-4   // small screens
lg:p-6   // desktop

// Font size scale
text-xs  // mobile
sm:text-sm // small screens
lg:text-base // desktop

// Gap scale
gap-1    // mobile
sm:gap-2 // small screens
lg:gap-4 // desktop
```

### Pattern 2: Show/Hide

```jsx
// Hide on mobile, show on desktop
<div className="hidden lg:block" />

// Show on mobile, hide on desktop
<div className="lg:hidden" />

// Inline version
<span className="hidden sm:inline" />
<span className="sm:hidden" />
```

### Pattern 3: Grid Columns

```jsx
// Mobile: 1 column, Desktop: 12 columns
<div className="grid grid-cols-1 lg:grid-cols-12">
  <div className="lg:col-span-2" />  // 2/12 columns
  <div className="lg:col-span-8" />  // 8/12 columns
  <div className="lg:col-span-2" />  // 2/12 columns
</div>
```

### Pattern 4: Conditional Text

```jsx
<button>
  <span className="hidden sm:inline">Full Text</span>
  <span className="sm:hidden">Short</span>
</button>
```

## Z-Index Hijerarhija

```javascript
// Globalna hijerarhija
{
  'base': 0,           // Default
  'header': 40,        // Sticky header
  'overlay': 50,       // Modal overlays
  'hamburger-panel': 55, // Slide-in menu
  'hamburger-button': 60, // Menu button (iznad svega)
  'modal': 9999        // Modali (najviše)
}
```

## Touch Optimizacije

### Minimum Touch Target

```jsx
// Botuni moraju biti min 44x44px za touch
<button className="min-w-[44px] min-h-[44px]" />

// Ili koristi padding za povećanje touch area
<button className="p-3" /> // 12px * 2 + content = larger target
```

### Touch Events

```jsx
<div
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  className="touch-none" // Disable browser touch gestures
>
```

## Performance

### Lazy Loading

```jsx
// Load components only when needed
const HamburgerMenu = dynamic(() => import('./HamburgerMenu'), {
  ssr: false
})
```

### CSS Optimizacije

```css
/* Use transform umjesto top/left za animacije */
.slide-in {
  transform: translateX(0);
  transition: transform 300ms ease-in-out;
}

/* Use will-change za smooth animacije */
.animate-element {
  will-change: transform;
}
```

## Testiranje

### Chrome DevTools

1. Otvori DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Odaberi device preset ili custom resolution
4. Test touch events sa "Toggle device toolbar"

### Responsive Test Checklist

```markdown
- [ ] iPhone SE (375px) - Smallest mobile
- [ ] iPhone 12 (390px) - Average mobile
- [ ] iPhone Pro Max (430px) - Large mobile
- [ ] iPad Mini (768px) - Small tablet
- [ ] iPad Pro (1024px) - Tablet/desktop boundary
- [ ] Desktop (1280px) - Standard desktop
- [ ] Large Desktop (1920px) - Full HD
```

## Common Issues

### Problem: Horizontal scroll pojavljuje se

**Rješenje:**
```jsx
// Koristi max-w i overflow-hidden
<div className="max-w-full overflow-x-hidden">
```

### Problem: Text prebre na dva reda

**Rješenje:**
```jsx
// Conditional text ili truncate
<span className="truncate">Long text...</span>
// ili
<span className="hidden md:inline">Desktop Text</span>
<span className="md:hidden">Mobile</span>
```

### Problem: Touch events ne rade

**Rješenje:**
```jsx
// Dodaj touch-none i explicit touch handlers
<div 
  className="touch-none"
  onTouchStart={handler}
  onTouchEnd={handler}
>
```

### Problem: Elementi preklapaju

**Rješenje:**
```jsx
// Provjeri z-index hijerarhiju
// Lower level elements = lower z-index
<div className="relative z-10" /> // Lower
<div className="relative z-20" /> // Higher
```

## Best Practices

1. ✅ **Mobile-First:** Piši base styles za mobile, override za desktop
2. ✅ **Semantic Breakpoints:** Koristi `lg` za glavni mobile/desktop split
3. ✅ **Touch Targets:** Min 44x44px za sve interaktivne elemente
4. ✅ **Conditional Rendering:** Izbjegavaj skrivanje velikih komponenti, bolje conditional render
5. ✅ **Performance:** Koristi `transform` umjesto `top`/`left` za animacije
6. ✅ **Accessibility:** Testiraj sa screen readers na mobilnom
7. ✅ **Testing:** Testiraj na pravim uređajima, ne samo u simulatoru

## Resursi

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Web.dev Responsive Design](https://web.dev/responsive-web-design-basics/)

