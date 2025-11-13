# 🔄 Prebacivanje Između Storage Verzija

## Pregled

Aplikacija podržava 2 storage moda:
1. **Supabase** (production) - `route.ts`
2. **In-Memory** (local dev) - `route.local.ts`

## Kada Koristiti Koji Mod

### Supabase Mod (`route.ts`)
**Koristi za:**
- ✅ Production deployment
- ✅ Staging environment
- ✅ Testiranje sa pravom bazom
- ✅ Multi-user testiranje
- ✅ Data persistence između restartova

**Zahtjevi:**
- `.env.local` fajl sa Supabase credentials
- Aktivna Supabase baza
- Kreirane tabele (vidi `SUPABASE_SETUP.md`)

### In-Memory Mod (`route.local.ts`)
**Koristi za:**
- ✅ Lokalno testiranje BEZ baze
- ✅ Brzi development
- ✅ Testiranje logike bez network calls
- ✅ Debugging
- ✅ Demo bez setup-a

**Zahtjevi:**
- Nema zahtjeva!
- Samostalan
- Reset nakon svakog restarta

## 🔧 Kako Prebaciti Mod

### Metoda 1: Ručno (Windows)

```cmd
# Prebaci NA in-memory mod
cd app\api\users
ren route.ts route.supabase.ts
ren route.local.ts route.ts

# Prebaci NAZAD na Supabase
cd app\api\users
ren route.ts route.local.ts
ren route.supabase.ts route.ts
```

### Metoda 2: PowerShell Script

Kreiraj `switch-storage.ps1`:

```powershell
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('supabase', 'local')]
    [string]$mode
)

$usersPath = "app\api\users"

if ($mode -eq "local") {
    Write-Host "Switching to IN-MEMORY storage..." -ForegroundColor Yellow
    Rename-Item "$usersPath\route.ts" "route.supabase.ts"
    Rename-Item "$usersPath\route.local.ts" "route.ts"
    Write-Host "✅ Now using IN-MEMORY storage" -ForegroundColor Green
} else {
    Write-Host "Switching to SUPABASE storage..." -ForegroundColor Yellow
    Rename-Item "$usersPath\route.ts" "route.local.ts"
    Rename-Item "$usersPath\route.supabase.ts" "route.ts"
    Write-Host "✅ Now using SUPABASE storage" -ForegroundColor Green
}

Write-Host "Remember to restart your dev server!" -ForegroundColor Cyan
```

**Korištenje:**
```powershell
# Switch to local
.\switch-storage.ps1 -mode local

# Switch to supabase
.\switch-storage.ps1 -mode supabase
```

### Metoda 3: package.json Scripts

Dodaj u `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:local": "node scripts/use-local.js && next dev",
    "dev:supabase": "node scripts/use-supabase.js && next dev"
  }
}
```

Kreiraj `scripts/use-local.js`:
```javascript
const fs = require('fs')
const path = require('path')

const usersPath = path.join(__dirname, '..', 'app', 'api', 'users')

if (fs.existsSync(path.join(usersPath, 'route.ts'))) {
  fs.renameSync(
    path.join(usersPath, 'route.ts'),
    path.join(usersPath, 'route.supabase.ts')
  )
}

fs.renameSync(
  path.join(usersPath, 'route.local.ts'),
  path.join(usersPath, 'route.ts')
)

console.log('✅ Switched to IN-MEMORY storage')
```

## 🔍 Kako Provjeriti Koji Mod Je Aktivan

### Provjera 1: Sadržaj Fajla

```typescript
// Otvori app/api/users/route.ts

// Ako vidiš:
const supabase = createClient(...)
// → Supabase mod

// Ako vidiš:
let users: any[] = []
// → In-memory mod
```

### Provjera 2: Test Restart

```bash
# 1. Pokreni app
npm run dev

# 2. Kreiraj test usera
# 3. Restart server
npm run dev

# 4. Provjeri da li user postoji

# ✅ User postoji → Supabase mod
# ❌ User nestao → In-memory mod
```

### Provjera 3: Console Log

Dodaj log u `route.ts`:

```typescript
console.log('🔍 Storage mode:', users ? 'IN-MEMORY' : 'SUPABASE')
```

## ⚠️ VAŽNO: Ne Zaboravi!

### Prije Commit-a

```bash
# UVIJEK se vrati na Supabase mod prije commit-a
# Provjeri da li je route.ts Supabase verzija

git status
# Trebao bi vidjeti:
#   modified: app/api/users/route.ts (Supabase verzija)
#   untracked: app/api/users/route.local.ts
```

### Prije Deploy-a na Vercel

```bash
# OBAVEZNO koristi Supabase verziju
# In-memory NEĆE raditi u production!

# Provjeri:
cat app/api/users/route.ts | grep "createClient"
# Ako vidiš createClient → OK ✅
```

## 🎯 Best Practices

1. **Default:** Uvijek koristi Supabase mod osim ako explicitly treba in-memory
2. **Testiranje:** Koristi in-memory za brze iteracije
3. **Demo:** In-memory odličan za live demo bez setup-a
4. **Production:** SAMO Supabase mod
5. **Git:** `route.local.ts` može biti tracked (nije secret)

## 📊 Komparacija

| Karakteristika | Supabase | In-Memory |
|----------------|----------|-----------|
| Setup vrijeme | 5-10 min | 0 min |
| Data persistence | ✅ Trajno | ❌ Gubi se |
| Multi-user | ✅ Podržava | ⚠️ Shared memory |
| Performance | Network latency | Instant |
| Production ready | ✅ Da | ❌ Ne |
| Debugging | Teže | Lakše |
| Cost | $0 (free tier) | $0 |

## 🐛 Troubleshooting

### Problem: "Cannot find module 'supabase'"

**Uzrok:** In-memory mod je aktivan ali fajl referencira Supabase import

**Rješenje:**
```bash
# Provjeri koji mod je aktivan
# Swap na correct mod
```

### Problem: Data nestaje

**Uzrok:** In-memory mod je aktivan

**Rješenje:**
```bash
# Switch na Supabase mod
```

### Problem: "Invalid Supabase credentials"

**Uzrok:** Supabase mod aktivan ali `.env.local` nema credentials

**Rješenje:**
1. Dodaj credentials u `.env.local`
2. ILI switch na in-memory mod za testiranje

## 📝 Summary

```bash
# Quick Reference:

# FOR DEVELOPMENT:
route.ts = Supabase (default)
route.local.ts = In-memory (backup)

# TO SWITCH:
# Manual rename ili koristi script

# ALWAYS CHECK przed commit-om:
route.ts = Supabase verzija ✅
```

---

**Pro Tip:** Koristi in-memory mod za brzo testiranje novih features, pa switch na Supabase za finalno testiranje prije commit-a!

