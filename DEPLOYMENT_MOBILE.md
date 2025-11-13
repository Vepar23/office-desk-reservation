# 📱 Deployment - Mobilna Optimizacija

## Pregled

Ovaj dokument pokriva dodatne korake i provjere potrebne za deployment mobilne verzije aplikacije.

## Pre-Deployment Checklist

### 1. Responsive Testing

Prije deploymenta, testirajte na svim target rezolucijama:

```bash
# Chrome DevTools
# Otvorite: F12 → Toggle Device Toolbar (Ctrl+Shift+M)

Testirajte:
- [ ] iPhone SE (375px) - najmanja mobilna rezolucija
- [ ] iPhone 12 Pro (390px) - prosječna mobilna
- [ ] iPhone 14 Pro Max (430px) - velika mobilna
- [ ] iPad Mini (768px) - mali tablet
- [ ] iPad Pro (1024px) - tablet/desktop boundary
- [ ] Desktop (1280px) - standardni desktop
- [ ] Large Desktop (1920px) - Full HD
```

### 2. Performance Optimizacije

#### Image Optimization

```javascript
// next.config.js - provjerite da su ovi settingsi tamo
module.exports = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}
```

#### Font Loading

Aplikacija koristi system fontove za brže učitavanje na mobilnim uređajima.

### 3. Touch Events Validation

Provjerite da li touch eventi rade:

```typescript
// OfficeMap.tsx
onTouchStart={(e) => {
  // Touch logic
}}
onTouchEnd={() => {
  // Touch end logic
}}
```

### 4. Viewport Meta Tag

Provjerite da li je viewport tag postavljen (u `app/layout.tsx`):

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
```

## Vercel Deployment

### 1. Environment Variables

Dodajte u Vercel dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 3. Framework Preset

- Framework: **Next.js**
- Auto-detect: **Enabled**

## Post-Deployment Testing

### Desktop Testing

1. Otvori deployed URL u browseru
2. Testiraj sve funkcionalnosti
3. Provjeri da li desktop layout radi

### Mobile Testing

#### Simulator Testing

```bash
# Chrome DevTools
1. F12
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Odaberi "iPhone 12 Pro"
4. Testiraj:
   - Login
   - Kalendar scroll
   - Tap na mjesto
   - Hamburger menu
   - Rezervacije
```

#### Real Device Testing

1. **iOS (Safari)**
   - Otvori URL na iPhone
   - Testiraj touch events
   - Provjeri scroll behavior
   - Testiraj hamburger menu

2. **Android (Chrome)**
   - Otvori URL na Android device
   - Testiraj touch events
   - Provjeri scroll behavior
   - Testiraj hamburger menu

### Test Checklist

```markdown
Desktop (≥1024px):
- [ ] 3-column layout vidljiv
- [ ] Kalendar lijevo, Mapa centar, Lista desno
- [ ] Keyboard kontrole vidljive (admin)
- [ ] Svi elementi pristupačni

Mobile (<1024px):
- [ ] Kalendar iznad mape
- [ ] Mapa zauzima većinu ekrana
- [ ] Hamburger button vidljiv (gornji desni kut)
- [ ] Tap otvara hamburger menu
- [ ] Lista rezervacija u hamburger meniju
- [ ] Touch events rade na mjestima
- [ ] Bez horizontal scroll-a
- [ ] Sticky header radi
- [ ] Svi botuni dovoljno veliki za touch

Funkcionalnost:
- [ ] Login radi
- [ ] Kalendar radi
- [ ] Rezervacije rade
- [ ] Touch selection radi
- [ ] Confirmation dialog radi
- [ ] Logout radi
- [ ] Admin panel pristupačan (desktop)
```

## Performance Monitoring

### Lighthouse Audit

Nakon deploymenta, pokrenite Lighthouse:

```bash
# Chrome DevTools
1. F12
2. Lighthouse tab
3. Odaberite:
   - Performance
   - Accessibility
   - Best Practices
   - SEO
4. Device: Mobile & Desktop
5. Run audit
```

### Target Scores

```
Performance:    90+
Accessibility:  95+
Best Practices: 90+
SEO:            90+
```

### Common Issues i Fixes

#### Issue: Low Performance Score na Mobile

**Problem:** Large images, unoptimized assets

**Fix:**
```javascript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/office-map.jpg"
  width={800}
  height={600}
  alt="Office Map"
  priority
/>
```

#### Issue: Touch events ne rade nakon deploya

**Problem:** Event listeners nisu properly set

**Fix:**
```typescript
// Dodaj touch-action CSS
className="touch-none"
```

#### Issue: Hamburger menu ne slide-in smooth

**Problem:** Transform nije hardware-accelerated

**Fix:**
```css
/* Dodaj will-change */
.hamburger-panel {
  will-change: transform;
  transform: translateZ(0);
}
```

## PWA (Progressive Web App) - Opciono

Za najbolje mobile iskustvo, možete dodati PWA support:

### 1. Install next-pwa

```bash
npm install next-pwa
```

### 2. Configure next.config.js

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // Vaša existing konfiguracija
})
```

### 3. Add manifest.json

```json
{
  "name": "Office Desk Reservation",
  "short_name": "Desk Booking",
  "description": "Rezervacija mjesta u uredu",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Monitoring

### Error Tracking

Integrirajte error tracking servis:

- **Sentry** - Best za production
- **LogRocket** - Dobre replay funkcije
- **Vercel Analytics** - Built-in

### Analytics

Pratite mobile usage:

```typescript
// Google Analytics 4
gtag('event', 'mobile_view', {
  device_type: isMobile ? 'mobile' : 'desktop',
  screen_width: window.innerWidth,
})
```

## Rollback Plan

Ako mobilna verzija ima problema:

### 1. Quick Fix

```bash
# Vercel automatski čuva previous deployment
# Idite na Vercel Dashboard → Deployments
# Kliknite na previous working deployment
# Kliknite "Promote to Production"
```

### 2. Feature Flag

Za future updates, koristite feature flag:

```typescript
const ENABLE_MOBILE = process.env.NEXT_PUBLIC_ENABLE_MOBILE === 'true'

{ENABLE_MOBILE ? <MobileLayout /> : <DesktopOnlyMessage />}
```

## Security na Mobilnom

### HTTPS Only

Vercel automatski forsira HTTPS. Provjerite:

```bash
curl -I http://your-app.vercel.app
# Trebate vidjeti redirect na https://
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

## Support

### Poznati Browser Issues

#### iOS Safari

- **Issue:** Touch delay od 300ms
- **Fix:** Automatski riješeno sa `touch-action: none`

#### Android Chrome

- **Issue:** Viewport height sa virtual keyboard
- **Fix:** Koristimo `vh` units pažljivo

### Compatibility

Aplikacija podržava:
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Firefox Mobile 90+
- ✅ Samsung Internet 14+

## Finalni Checklist

Prije go-live:

```markdown
- [ ] Sve testne URLs zamijenjene production URLs
- [ ] Environment varijable postavljene u Vercel
- [ ] Database migracije izvršene
- [ ] Default admin user kreiran
- [ ] Backup plan postavljen
- [ ] Error tracking enabled
- [ ] Analytics postavljen
- [ ] Lighthouse score 90+
- [ ] Real device testing completed
- [ ] Team training completed
- [ ] Documentation updated
```

---

**Ready to Deploy!** 🚀

Sretno sa deploymentom mobilne verzije aplikacije!

