# 💾 Storage Configuration Guide

## Quick Overview

Aplikacija podržava **2 storage opcije**:

| Mode | File | Use Case | Persistence |
|------|------|----------|-------------|
| 🌐 **Supabase** | `route.ts` | Production, Testing | ✅ Permanent |
| 🧪 **In-Memory** | `route.local.ts` | Local Dev, Quick Testing | ❌ Resets on restart |

## Current Setup

```
app/api/users/
├── route.ts          ← Active (currently Supabase mode)
└── route.local.ts    ← Backup (in-memory version)
```

## 🚀 Quick Start

### Using Supabase (Current Default)

```bash
# 1. Create .env.local with your Supabase credentials
# 2. Run the app
npm run dev

# ✅ Users will be saved in Supabase database
```

### Using In-Memory (For Quick Testing)

```bash
# 1. Switch storage mode
.\switch-storage.ps1 -mode local

# 2. Run the app
npm run dev

# ⚠️ Users will reset on server restart
```

## 🔄 Switching Between Modes

### PowerShell Script (Recommended)

```powershell
# Switch to in-memory mode
.\switch-storage.ps1 -mode local

# Switch back to Supabase mode
.\switch-storage.ps1 -mode supabase
```

### Manual Method

**To In-Memory:**
```cmd
cd app\api\users
ren route.ts route.supabase.ts
ren route.local.ts route.ts
```

**Back to Supabase:**
```cmd
cd app\api\users
ren route.ts route.local.ts
ren route.supabase.ts route.ts
```

## 📋 When to Use Which

### Use Supabase Mode When:
- ✅ Deploying to production
- ✅ Testing with real database
- ✅ Need data persistence
- ✅ Multi-user testing
- ✅ Want to test database relationships

### Use In-Memory Mode When:
- ✅ Quick local development
- ✅ Don't want to setup database
- ✅ Testing logic without network calls
- ✅ Debugging
- ✅ Live demo without setup
- ✅ Learning the codebase

## 🎯 File Comparison

### `route.ts` (Supabase Version)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET, POST, DELETE methods using Supabase
```

**Features:**
- Real PostgreSQL database
- UUID primary keys
- Automatic timestamps
- Data validation
- Relationships with other tables

### `route.local.ts` (In-Memory Version)

```typescript
let users: any[] = []

// GET, POST, DELETE methods using in-memory array
```

**Features:**
- No external dependencies
- Instant operations
- Simple string IDs (timestamps)
- Resets on restart
- Perfect for development

## 📊 Feature Comparison

| Feature | Supabase | In-Memory |
|---------|----------|-----------|
| **Setup Time** | 5-10 minutes | 0 minutes |
| **Data Persistence** | ✅ Permanent | ❌ Temporary |
| **Performance** | Network latency | Instant |
| **Multi-user Support** | ✅ Full support | ⚠️ Shared memory |
| **Production Ready** | ✅ Yes | ❌ No |
| **Debugging** | More complex | Very simple |
| **Cost** | Free tier available | Free |
| **Relationships** | ✅ Full support | ❌ Basic only |

## ⚠️ Important Notes

### Before Committing to Git

**Always check** that `route.ts` is the Supabase version:

```bash
# Check current version
cat app/api/users/route.ts | grep "createClient"

# Should see: const supabase = createClient(...)
# ✅ Good to commit
```

### Before Deploying to Vercel

**CRITICAL:** Ensure you're using Supabase mode:
- ❌ In-memory will NOT work in production
- ✅ Supabase required for Vercel deployment

### After Switching Modes

**Always restart** your development server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🔍 How to Check Current Mode

### Method 1: File Content
```bash
# Windows
type app\api\users\route.ts | findstr "createClient"

# Linux/Mac
grep "createClient" app/api/users/route.ts
```

- Found "createClient" → Supabase mode ✅
- Not found → In-memory mode 🧪

### Method 2: Test Restart
1. Start app: `npm run dev`
2. Create a test user
3. Restart server
4. Check if user still exists
   - Exists → Supabase ✅
   - Gone → In-memory 🧪

### Method 3: Check Files
```powershell
Get-ChildItem app\api\users\*.ts | Select-Object Name
```

Look for:
- `route.ts` + `route.local.ts` → Supabase active ✅
- `route.ts` + `route.supabase.ts` → In-memory active 🧪

## 🛠️ Troubleshooting

### Problem: "Cannot connect to Supabase"

**Solution:**
1. Check `.env.local` exists and has correct credentials
2. Verify Supabase project is active
3. Or switch to in-memory mode for local testing

### Problem: "Users disappear after restart"

**Solution:**
You're in in-memory mode. Switch to Supabase:
```powershell
.\switch-storage.ps1 -mode supabase
```

### Problem: "Module not found: supabase"

**Solution:**
Install dependencies:
```bash
npm install
```

### Problem: Script execution policy error

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 Additional Resources

- [SWITCHING_STORAGE.md](SWITCHING_STORAGE.md) - Detailed switching guide
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Supabase setup instructions
- [QUICK_START.md](QUICK_START.md) - General quick start guide

## 🎓 Best Practices

1. **Default to Supabase** unless you specifically need in-memory
2. **Use in-memory** for rapid feature development
3. **Test with Supabase** before committing
4. **Never deploy** in-memory to production
5. **Document** which mode teammates should use
6. **Keep both files** in version control

## 📞 Need Help?

If you're unsure which mode to use:
- **New to the project?** → Start with in-memory
- **Ready to test properly?** → Switch to Supabase
- **Deploying?** → Must use Supabase

---

**Current Status:** ✅ `route.ts` is configured for **Supabase mode**

**Last Updated:** Version 1.4.0

