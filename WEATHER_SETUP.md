# 🌤️ Weather Forecast Setup

Aplikacija prikazuje vremensku prognozu za Zagreb direktno u kalendaru.

---

## 🎯 Funkcionalnosti

- ☀️ **Ikone vremena** - Sunce, oblak, kiša, snijeg, grmljavina, magla
- 🌡️ **Temperatura** - Prosječna dnevna temperatura
- 📍 **Lokacija** - Zagreb (45.8150°N, 15.9819°E)
- 🔄 **Auto-refresh** - Cache 5 minuta
- 💾 **Fallback** - Demo data ako API ne radi

---

## 🔑 Postavljanje API Key-a (Opcionalno)

### Korak 1: Registracija na OpenWeatherMap

1. Idi na: https://openweathermap.org/api
2. Klikni **Sign Up** (besplatno)
3. Potvrdi email
4. Idi na **API keys** tab
5. Kopiraj svoj API key

**Besplatni plan:**
- 1,000 API calls/day
- 5 dana forecast
- 3-hour interval data

### Korak 2: Dodaj u .env.local

```bash
OPENWEATHERMAP_API_KEY=tvoj_api_key_ovdje
```

### Korak 3: Restart Server

```bash
# Zaustavi trenutni server (Ctrl+C)
npm run dev
```

---

## 🚀 Deployment na Vercel

### 1. Dodaj Environment Variable

1. Idi na: https://vercel.com/dashboard
2. Odaberi svoj projekat
3. Settings → Environment Variables
4. Dodaj:
   - **Key:** `OPENWEATHERMAP_API_KEY`
   - **Value:** `tvoj_api_key`
   - **Environments:** Production, Preview, Development

### 2. Redeploy

```bash
git push origin main
```

Ili u Vercel Dashboard:
- Deployments → Latest → ... → Redeploy

---

## 🎨 Kako Izgleda

```
┌─────────┬─────────┬─────────┬─────────┐
│   Pon   │   Uto   │   Sri   │   Čet   │
│    21   │    22   │    23   │    24   │
├─────────┼─────────┼─────────┼─────────┤
│   ☀️    │   ☁️    │   🌧️   │   ❄️    │
│  15°C   │  12°C   │   8°C   │   2°C   │
└─────────┴─────────┴─────────┴─────────┘
```

---

## 🔄 Kako Radi

### API Endpoint: `/api/weather`

**Request:**
```bash
GET /api/weather
```

**Response:**
```json
{
  "forecast": {
    "2024-11-25": {
      "date": "2024-11-25",
      "temp_avg": 15,
      "temp_min": 10,
      "temp_max": 18,
      "weather": "Clear",
      "description": "vedro",
      "icon": "01d"
    }
  }
}
```

### Weather Icons Mapping

| API Response | Emoji | Opis |
|-------------|-------|------|
| `Clear` | ☀️ | Sunčano |
| `Clouds` | ☁️ | Oblačno |
| `Rain` | 🌧️ | Kiša |
| `Snow` | ❄️ | Snijeg |
| `Thunderstorm` | ⛈️ | Grmljavina |
| `Mist/Fog` | 🌫️ | Magla |

---

## 🛡️ Fallback Mehanizam

Ako API key nije postavljen ili API ne radi:

```typescript
// Automatski generira demo podatke
{
  "fallback": true,
  "forecast": {
    // 7 dana demo data sa random vremenskim uslovima
  }
}
```

**Prednosti:**
- ✅ Aplikacija radi i bez API key-a
- ✅ Development ne zahtijeva setup
- ✅ Graceful degradation

---

## 📊 Cache Strategija

- **Cache Duration:** 5 minuta
- **Storage:** In-memory (server-side)
- **Benefit:** Smanjuje API calls (cost optimization)

```typescript
// Cache implementacija
let weatherCache: {
  data: any
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minuta
```

---

## 🔍 Troubleshooting

### Problem: "Weather API key nije postavljen"

**Rješenje:** 
1. Dodaj `OPENWEATHERMAP_API_KEY` u `.env.local`
2. Restart server
3. Ili koristi fallback data (automatski)

### Problem: Prikazuje stare podatke

**Rješenje:**
- Čekaj 5 minuta (cache expiry)
- Ili restartuj server za instant refresh

### Problem: API vraća grešku

**Možući uzroci:**
1. Pogrešan API key
2. Prekoračen daily limit (1000 calls)
3. API je down (koristi se fallback)

**Provjera:**
```bash
curl "https://api.openweathermap.org/data/2.5/forecast?lat=45.8150&lon=15.9819&appid=YOUR_API_KEY&units=metric"
```

---

## 💰 API Pricing

### Free Tier (trenutno)
- ✅ 1,000 calls/day
- ✅ 5 day forecast
- ✅ Current weather
- ✅ 3-hour interval

### Paid Plans (ako trebate više)
- **Startup:** $40/month - 100,000 calls
- **Developer:** $180/month - 1M calls
- **Professional:** $600/month - 5M calls

**Trenutna potrošnja:**
- Cache: 5 minuta
- Max calls/day: ~288 (1 call svakih 5 min)
- ✅ Dobro ispod free tier limita!

---

## 🌍 Promjena Lokacije

Želite prognozu za drugi grad? Promjenite koordinate:

```typescript
// app/api/weather/route.ts

// Zagreb (default)
const ZAGREB_LAT = '45.8150'
const ZAGREB_LON = '15.9819'

// Primjer: Split
const SPLIT_LAT = '43.5147'
const SPLIT_LON = '16.4435'

// Primjer: Rijeka
const RIJEKA_LAT = '45.3271'
const RIJEKA_LON = '14.4422'
```

---

## ✅ Testing Checklist

- [ ] API key postavljen u `.env.local`
- [ ] Server restartovan nakon dodavanja key-a
- [ ] Weather ikone se prikazuju u kalendaru
- [ ] Temperatura je vidljiva
- [ ] Fallback radi ako nema API key-a
- [ ] Cache radi (5 min delay nakon promjene)
- [ ] Environment variable postavljena na Vercel
- [ ] Production deployment radi

---

## 📚 Dodatni Resursi

- **OpenWeatherMap Docs:** https://openweathermap.org/api/one-call-api
- **Weather Condition Codes:** https://openweathermap.org/weather-conditions
- **API FAQ:** https://openweathermap.org/faq

---

**Made with 🌤️ using OpenWeatherMap API**

