# 🤝 Contributing Guide

Hvala što želite doprinijeti ovom projektu! Evo kako možete pomoći.

## 🎯 Kako Doprinijeti

### 1. Reportovanje Bugova

Ako pronađete bug:

1. Provjerite da već nije [reportovan](../../issues)
2. Kreirajte novi Issue sa:
   - **Naslov:** Kratak opis problema
   - **Opis:** Detaljno objašnjenje
   - **Koraci za reprodukciju:** Kako reproducirati bug
   - **Očekivano ponašanje:** Šta bi trebalo da se desi
   - **Stvarno ponašanje:** Šta se dešava
   - **Screenshots:** Ako je moguće
   - **Environment:** Browser, OS, verzija aplikacije

### 2. Sugestije za Nove Funkcionalnosti

1. Otvorite Issue sa labelom `enhancement`
2. Detaljno opišite funkcionalnost
3. Objasnite zašto bi bila korisna
4. Dodajte mockups ili primjere ako je moguće

### 3. Pull Requests

#### Prije nego počnete:

1. **Fork** repozitorij
2. **Clone** vaš fork lokalno
3. Kreirajte novu **branch** za vašu izmjenu

```bash
git checkout -b feature/nova-funkcionalnost
# ili
git checkout -b fix/ime-buga
```

#### Tokom developmenta:

1. **Pišite čist kod:** Pratite postojeći coding style
2. **Testirajte:** Osigurajte da sve radi
3. **Commit često:** Sa jasnim commit porukama
4. **Pull latest changes:** Održavajte branch ažurnim

```bash
git pull origin main
```

#### Submitting Pull Request:

1. Push vašu branch:
```bash
git push origin feature/nova-funkcionalnost
```

2. Otvorite Pull Request na GitHub-u
3. Popunite PR template:
   - Šta mijenja ovaj PR?
   - Zašto je potrebna ova izmjena?
   - Kako ste testirali?
   - Screenshots (ako je UI change)

4. Povežite relevantne Issues:
```
Closes #123
Fixes #456
```

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ GOOD
interface User {
  id: string
  username: string
  isAdmin: boolean
}

const handleSubmit = async (data: User): Promise<void> => {
  // implementation
}

// ❌ BAD
const handleSubmit = (data: any) => {
  // implementation
}
```

### React Components

```typescript
// ✅ GOOD - Named export, typed props
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export default function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// ❌ BAD - Any types, no interface
export default function Button(props: any) {
  return <button>{props.label}</button>
}
```

### File Naming

- **Components:** PascalCase - `UserProfile.tsx`
- **Utilities:** camelCase - `formatDate.ts`
- **Pages:** lowercase - `dashboard/page.tsx`
- **API Routes:** lowercase - `api/users/route.ts`

### Commit Messages

Pratite [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(auth): add password reset functionality
fix(calendar): correct weekend highlighting
docs(readme): update installation instructions
style(button): improve hover states
refactor(api): simplify user creation logic
test(reservations): add unit tests for booking logic
chore(deps): update dependencies
```

**Types:**
- `feat`: Nova funkcionalnost
- `fix`: Bug fix
- `docs`: Dokumentacija
- `style`: Formatting, styling
- `refactor`: Code refactoring
- `test`: Dodavanje testova
- `chore`: Maintenance tasks

## 🧪 Testing

Prije submitting PR-a:

1. **Manual Testing:**
   ```bash
   npm run dev
   # Testirajte sve funkcionalnosti
   ```

2. **Build Test:**
   ```bash
   npm run build
   npm start
   # Provjerite da production build radi
   ```

3. **Linting:**
   ```bash
   npm run lint
   # Riješite sve warnings/errors
   ```

## 📁 Struktura Projekta

```
EREZ/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (pages)/           # Page routes
│   └── layout.tsx         # Root layout
├── components/            # React komponente
├── lib/                   # Utility funkcije
├── store/                 # State management
├── public/                # Statički fajlovi
└── docs/                  # Dodatna dokumentacija
```

### Gdje dodati novi kod:

- **Nova stranica:** `app/naziv-stranice/page.tsx`
- **Nova komponenta:** `components/NovaKomponenta.tsx`
- **Novi API endpoint:** `app/api/endpoint/route.ts`
- **Nova utility funkcija:** `lib/utils.ts` ili `lib/novaUtil.ts`
- **Novi Zustand store:** `store/useNoviStore.ts`

## 🎨 UI/UX Guidelines

### Boje

Držite se postojeće color palette:

```css
/* Primary Blue */
--blue-50: #eff6ff
--blue-500: #3b82f6
--blue-600: #2563eb

/* Success Green */
--green-500: #22c55e

/* Error Red */
--red-500: #ef4444

/* Gray */
--gray-50: #f9fafb
--gray-500: #6b7280
```

### Komponente

- Koristite Tailwind classes konzistentno
- Održavajte responsive design
- Accessibility je prioritet (ARIA labels, keyboard navigation)

## 🐛 Debugging

### Development Tools

```bash
# Enable verbose logging
export DEBUG=*
npm run dev

# Check build output
npm run build -- --debug
```

### Common Issues

**"Module not found"**
```bash
rm -rf node_modules .next
npm install
```

**"Port already in use"**
```bash
npm run dev -- -p 3001
```

## 📄 License

Doprinosom ovom projektu, slažete se da će vaš kod biti licenciran pod MIT License.

## 💬 Questions?

- 📧 Email: [your-email@example.com]
- 💬 Discord: [link]
- 🐦 Twitter: [@yourhandle]

---

**Hvala vam na doprinosu! 🙏**

Svaki doprinos, bilo veliki ili mali, je cijenjen i pomaže projektu da bude bolji.

