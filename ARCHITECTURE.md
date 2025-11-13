# 🏗️ Architecture Documentation

Tehnička arhitektura Office Desk Booking System aplikacije.

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Login Page  │  │  Dashboard   │  │  Admin Panel │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│          │                 │                  │                  │
│          └─────────────────┴──────────────────┘                 │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Next.js App   │
                    │   Router 14    │
                    └───────┬────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                    SERVER LAYER                                   │
│                            │                                      │
│  ┌─────────────────────────▼──────────────────────────┐         │
│  │              API Routes (Serverless)                │         │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │         │
│  │  │  Auth  │ │ Users  │ │ Desks  │ │Reserv. │      │         │
│  │  └────────┘ └────────┘ └────────┘ └────────┘      │         │
│  └────────────────────────┬────────────────────────────┘         │
│                            │                                      │
│  ┌─────────────────────────▼──────────────────────────┐         │
│  │              Business Logic Layer                   │         │
│  │  • Authentication (bcryptjs)                        │         │
│  │  • Validation (Zod)                                 │         │
│  │  • Authorization (Role-based)                       │         │
│  └────────────────────────┬────────────────────────────┘         │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                     DATA LAYER                                    │
│                            │                                      │
│         ┌──────────────────┴──────────────────┐                 │
│         │                                      │                 │
│  ┌──────▼──────┐                     ┌────────▼────────┐        │
│  │ In-Memory   │                     │    Supabase     │        │
│  │  (Dev)      │                     │  (Production)   │        │
│  │             │                     │                 │        │
│  │ • Users     │                     │ • PostgreSQL    │        │
│  │ • Desks     │                     │ • Row Level     │        │
│  │ • Reserv.   │                     │   Security      │        │
│  └─────────────┘                     │ • Real-time     │        │
│                                      │ • Storage       │        │
│                                      └─────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### User Reservation Flow

```
User clicks desk
      │
      ▼
┌─────────────────┐
│  OfficeMap.tsx  │ (Client Component)
└────────┬────────┘
         │ onDeskClick()
         ▼
┌─────────────────┐
│ dashboard/page  │ (handleDeskClick)
└────────┬────────┘
         │ fetch('/api/reservations', POST)
         ▼
┌─────────────────────┐
│ /api/reservations   │
│                     │
│ 1. Validate input   │
│ 2. Check conflicts  │
│ 3. Create booking   │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│   Database          │
│                     │
│ INSERT INTO         │
│ reservations        │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│   Response          │
│   { success: true } │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│   Update UI         │
│   • Refresh data    │
│   • Show success    │
└─────────────────────┘
```

### Admin Desk Creation Flow

```
Admin fills form
      │
      ▼
┌─────────────────┐
│  admin/page.tsx │
└────────┬────────┘
         │ handleCreateDesk()
         ▼
┌─────────────────────┐
│ /api/desks (POST)   │
│                     │
│ 1. Validate admin   │
│ 2. Validate input   │
│ 3. Create desk      │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│   Database          │
│                     │
│ INSERT INTO         │
│ desk_elements       │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│   OfficeMap.tsx     │
│                     │
│ Renders new desk    │
│ at position (x,y)   │
└─────────────────────┘
```

## 🗂️ Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
│   └── children
│       ├── page.tsx (Redirect Logic)
│       ├── login/page.tsx
│       ├── dashboard/page.tsx
│       │   ├── <Calendar />
│       │   ├── <OfficeMap />
│       │   └── Reservations List
│       └── admin/page.tsx
│           ├── Tab: Map
│           │   └── <OfficeMap isAdmin={true} />
│           ├── Tab: Desks
│           └── Tab: Users
```

## 💾 State Management

### Zustand Stores

**useAuthStore:**
```typescript
{
  user: {
    id: string
    username: string
    is_admin: boolean
  } | null,
  setUser: (user) => void,
  logout: () => void
}
```

**useReservationStore:**
```typescript
{
  reservations: Reservation[],
  selectedDate: Date,
  setReservations: (reservations) => void,
  setSelectedDate: (date) => void,
  addReservation: (reservation) => void,
  removeReservation: (id) => void
}
```

### State Flow

```
┌──────────────┐
│ LocalStorage │ (Persistence)
│   "user"     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ useAuthStore │ (Global State)
└──────┬───────┘
       │
       ├──► Dashboard
       ├──► Admin Panel
       └──► API Requests
```

## 🔐 Authentication Flow

```
User enters credentials
         │
         ▼
┌────────────────────┐
│  login/page.tsx    │
└─────────┬──────────┘
          │ POST /api/auth/login
          ▼
┌────────────────────────┐
│ /api/auth/login        │
│                        │
│ 1. Find user by username│
│ 2. Verify password     │
│ 3. Return user data    │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│ Client Side            │
│                        │
│ 1. Store in localStorage│
│ 2. Set auth store      │
│ 3. Redirect dashboard  │
└────────────────────────┘
```

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │◄────┐
│ username        │     │
│ password_hash   │     │
│ is_admin        │     │
│ created_at      │     │
└─────────────────┘     │
                        │
┌─────────────────┐     │
│  reservations   │     │
├─────────────────┤     │
│ id (PK)         │     │
│ user_id (FK)    │─────┘
│ desk_id (FK)    │─────┐
│ date            │     │
│ created_at      │     │
└─────────────────┘     │
                        │
┌─────────────────┐     │
│ desk_elements   │     │
├─────────────────┤     │
│ id (PK)         │◄────┘
│ x, y            │
│ width, height   │
│ desk_number     │
│ status          │
└─────────────────┘

┌─────────────────┐
│  office_map     │
├─────────────────┤
│ id (PK)         │
│ image_url       │
│ created_at      │
└─────────────────┘
```

### Constraints

**UNIQUE Constraints:**
- users.username
- desk_elements.desk_number
- (reservations.user_id, reservations.date)
- (reservations.desk_id, reservations.date)

**Foreign Keys:**
- reservations.user_id → users.id (CASCADE DELETE)
- reservations.desk_id → desk_elements.id (CASCADE DELETE)

**Check Constraints:**
- desk_elements.status IN ('available', 'reserved', 'permanently_occupied')

## 🎨 UI Component Structure

### Calendar Component

```typescript
<Calendar>
  ├── Header (Month/Year + Navigation)
  │   ├── <button> Previous
  │   ├── <h2> Current Month
  │   └── <button> Next
  ├── Day Names Row
  │   └── [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  └── Calendar Grid
      └── Days
          ├── Empty (before month start)
          ├── Regular days
          ├── Weekends (disabled)
          ├── Selected day (highlighted)
          └── Days with reservations (marked)
```

### OfficeMap Component

```typescript
<OfficeMap>
  ├── Container (with background image)
  │   └── Desks (positioned absolutely)
  │       └── <div> Each Desk
  │           ├── Desk Number
  │           ├── Color (green/red/gray)
  │           ├── Drag handlers (admin only)
  │           └── Delete button (admin only)
  └── Legend
      ├── Green = Available
      ├── Red = Reserved
      └── Gray = Permanently Occupied
```

## 🔄 API Endpoints

### Authentication

**POST /api/auth/login**
- Body: `{ username, password }`
- Returns: `{ user: {...} }`
- Errors: 400, 401, 500

### Users

**GET /api/users**
- Returns: `{ users: [...] }`
- Auth: Admin only

**POST /api/users**
- Body: `{ username, password, is_admin }`
- Returns: `{ user: {...} }`
- Auth: Admin only

**DELETE /api/users?id={id}**
- Returns: `{ success: true }`
- Auth: Admin only

### Desks

**GET /api/desks**
- Returns: `{ desks: [...] }`

**POST /api/desks**
- Body: `{ x, y, width, height, desk_number, status }`
- Returns: `{ desk: {...} }`
- Auth: Admin only

**PUT /api/desks**
- Body: `{ id, x, y, width, height, desk_number, status }`
- Returns: `{ desk: {...} }`
- Auth: Admin only

**DELETE /api/desks?id={id}**
- Returns: `{ success: true }`
- Auth: Admin only

### Reservations

**GET /api/reservations?userId={id}&date={date}**
- Returns: `{ reservations: [...] }`

**POST /api/reservations**
- Body: `{ user_id, desk_id, date }`
- Returns: `{ reservation: {...} }`
- Validates: No duplicate bookings

**DELETE /api/reservations?id={id}**
- Returns: `{ success: true }`

### Office Map

**GET /api/office-map**
- Returns: `{ officeMap: {...} }`

**POST /api/office-map**
- Body: `{ image_url }`
- Returns: `{ officeMap: {...} }`
- Auth: Admin only

## 🚀 Deployment Architecture

### Vercel Deployment

```
┌─────────────────────────────────────────┐
│           Vercel Edge Network           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Next.js Application        │   │
│  │                                 │   │
│  │  ├─ Static Pages (cached)      │   │
│  │  ├─ API Routes (serverless)    │   │
│  │  └─ Assets (CDN)               │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │    Supabase     │
        │                 │
        │  • Database     │
        │  • Storage      │
        │  • Auth         │
        └─────────────────┘
```

### Environment Variables Flow

```
GitHub Repo
    │
    ├── .env.local (local dev) - gitignored
    ├── .env.local.example (template) - committed
    │
    └── Push to GitHub
            │
            ▼
        Vercel Dashboard
            │
            ├── Environment Variables (configured)
            │   ├── Production
            │   ├── Preview
            │   └── Development
            │
            └── Auto Deploy
                    │
                    ▼
                Live App
```

## 🔒 Security Layers

### Layer 1: Client Side
- Input validation
- XSS prevention (React)
- HTTPS only

### Layer 2: API Layer
- Request validation
- Rate limiting (Vercel)
- CORS configuration

### Layer 3: Business Logic
- Authentication check
- Authorization (role-based)
- Data validation (Zod)

### Layer 4: Database
- Parametrized queries
- Row Level Security (RLS)
- Encrypted connections

### Layer 5: Infrastructure
- Security headers (middleware)
- Environment variables
- Vercel security features

## 📈 Performance Optimizations

### Client Side
- React Server Components
- Code splitting (automatic)
- Image optimization
- CSS minification

### Server Side
- Serverless functions (fast cold start)
- Edge caching
- Database indexing
- Connection pooling (Supabase)

### Network
- CDN for static assets
- Compressed responses
- HTTP/2
- Lazy loading

## 🧪 Testing Strategy

### Unit Tests (Planned)
- Utility functions
- Validation logic
- State management

### Integration Tests (Planned)
- API endpoints
- Database operations
- Authentication flow

### E2E Tests (Planned)
- User booking flow
- Admin operations
- Edge cases

### Manual Testing Checklist
- See USAGE_GUIDE.md

---

**Last Updated:** 2025-11-10  
**Architecture Version:** 1.0

