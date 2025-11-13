# 🔒 Security Policy

## Supported Versions

Trenutno podržavamo sljedeće verzije sa security update-ima:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

### ⚠️ KRITIČNO: Ne otvarajte public issue za sigurnosne ranjivosti!

Ako pronađete sigurnosnu ranjivost, molimo vas da je prijavite odgovorno:

### Kako prijaviti:

1. **Email:** Pošaljite detalje na [security@yourcompany.com]
2. **Subject:** "SECURITY: [Kratak opis]"
3. **Sadržaj:**
   - Detaljn opis ranjivosti
   - Koraci za reprodukciju
   - Potencijalni impact
   - Prijedlozi za fix (ako ih imate)

### Šta očekivati:

- ✅ **24h:** Potvrda prijema
- ✅ **48h:** Inicijalna procjena
- ✅ **7 dana:** Status update
- ✅ **30 dana:** Fix i disclosure (ako je moguće)

## Security Best Practices

### Za Administratore

#### 1. Default Credentials
⚠️ **KRITIČNO:** Promijenite default admin lozinku ODMAH nakon instalacije!

```sql
-- Delete default admin nakon kreiranja novog
DELETE FROM users WHERE username = 'admin' AND password_hash = '$2a$10$...';
```

#### 2. Password Policy

- ✅ Minimum 12 znakova za admin accounts
- ✅ Kombinacija velikih/malih slova, brojeva, simbola
- ✅ Nemojte koristiti iste lozinke
- ✅ Rotirajte lozinke svakih 90 dana

**Dobre lozinke:**
```
Офис2025!Безбедност
MyOffice#Desk$2025
Desk-Booking!Secure#123
```

**Loše lozinke:**
```
admin123
password
123456
test123 (default!)
```

#### 3. Environment Variables

**NIKAD ne commitujte:**
```bash
# ❌ BAD
git add .env.local
git commit -m "Added config"

# ✅ GOOD
# Dodajte u .gitignore
echo ".env.local" >> .gitignore
```

**Rotacija Keys:**
```bash
# Svaka 3 mjeseca, regenerirajte:
# - SUPABASE_SERVICE_ROLE_KEY
# - API keys
# - JWT secrets
```

#### 4. Database Access

- ✅ Koristite separate credentials za dev/staging/prod
- ✅ Omogućite RLS (Row Level Security) u Supabase
- ✅ Regular database backups
- ✅ Monitor access logs

#### 5. Admin Accounts

- ✅ Kreirajte najmanje 2 admin accounta (backup)
- ✅ Dokumentujte ko ima admin pristup
- ✅ Disable admin accounte neaktivnih zaposlenih
- ✅ Audit log admin akcija (planirano za v1.1)

### Za Developere

#### 1. Code Security

**Input Validation:**
```typescript
// ✅ GOOD
const username = input.trim().toLowerCase()
if (!/^[a-z0-9_]{3,20}$/.test(username)) {
  throw new Error('Invalid username')
}

// ❌ BAD
const username = input // No validation
```

**SQL Injection Prevention:**
```typescript
// ✅ GOOD - Parametrized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)

// ❌ BAD - String interpolation
const query = `SELECT * FROM users WHERE username = '${username}'`
```

**XSS Prevention:**
```typescript
// ✅ GOOD - React auto-escapes
<div>{userInput}</div>

// ❌ BAD - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

#### 2. Authentication

**Password Hashing:**
```typescript
// ✅ GOOD
import bcrypt from 'bcryptjs'
const hash = await bcrypt.hash(password, 10) // 10 rounds minimum

// ❌ BAD
const hash = md5(password) // NEVER use MD5!
```

**Session Management:**
```typescript
// ✅ GOOD - Secure storage
localStorage.setItem('user', JSON.stringify(sanitizedUser))

// ❌ BAD - Storing sensitive data
localStorage.setItem('password', password) // NEVER!
```

#### 3. API Security

**Rate Limiting:**
```typescript
// Implement rate limiting
// Vercel has built-in, but add custom for sensitive endpoints
```

**CORS:**
```typescript
// Only allow your domains
const allowedOrigins = [
  'https://yourdomain.com',
  'https://yourdomain.vercel.app'
]
```

**Headers:**
```typescript
// Already implemented in middleware.ts
// Don't remove security headers!
```

### Za End Users

#### 1. Account Security

- ✅ Nemojte dijeliti login kredencijale
- ✅ Logout nakon korištenja na shared computerima
- ✅ Prijavite sumnjive aktivnosti
- ✅ Koristite jake lozinke

#### 2. Phishing Prevention

⚠️ **Budite oprezni sa:**
- Email porukama koje traže lozinku
- Sumnjivim linkovima
- Nepoznatim URL-ovima

✅ **Provjravite:**
- URL aplikacije (treba biti vaš domain)
- HTTPS certifikat (zeleni katanac)
- Traženje od vas da unesete lozinku izvan aplikacije

## Known Security Considerations

### Current Implementation

**✅ Implemented:**
- Password hashing (bcryptjs)
- Input validation
- XSS protection (React)
- CSRF tokens (Next.js automatic)
- Security headers
- Environment variables
- SQL injection prevention

**⚠️ To Be Implemented:**
- [ ] Rate limiting (beyond Vercel default)
- [ ] 2FA / MFA
- [ ] Password reset via email
- [ ] Account lockout after failed attempts
- [ ] Audit logging
- [ ] Session timeout
- [ ] IP whitelisting (optional)

### Third-Party Dependencies

Regularly check for vulnerabilities:

```bash
# Check for vulnerable packages
npm audit

# Fix automatically (if possible)
npm audit fix

# Manual fix
npm audit fix --force
```

**Update schedule:**
- Security patches: Immediately
- Minor versions: Monthly
- Major versions: Quarterly (with testing)

## Compliance

### GDPR Considerations

Ako koristite u EU:

1. **Consent:** Dobiti pristanak za storage personal data
2. **Right to Delete:** Implementirati user account deletion
3. **Data Export:** Omogućiti export user data
4. **Privacy Policy:** Dokumentovati kako se podaci koriste

### Data Retention

**Preporuke:**
- Rezervacije: Čuvati 1 godinu
- Inactive users: Delete nakon 6 mjeseci neaktivnosti
- Logs: Rotate nakon 90 dana
- Backups: Keep 30 dana

## Incident Response

### Ako dođe do security breach:

1. **Immediate:**
   - Shutdown affected systems
   - Change all credentials
   - Notify users (ako je potrebno)

2. **Within 24h:**
   - Investigate cause
   - Patch vulnerability
   - Document incident

3. **Within 7 days:**
   - Implement additional safeguards
   - Review security policies
   - Train team on prevention

## Security Checklist

### Before Production Deployment

- [ ] Changed default admin password
- [ ] All environment variables set
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Supabase RLS enabled
- [ ] CORS properly configured
- [ ] Security headers verified
- [ ] Dependencies updated
- [ ] No secrets in code
- [ ] Error messages don't leak info
- [ ] Logging configured
- [ ] Monitoring set up

### Monthly Security Review

- [ ] Check npm audit
- [ ] Review access logs
- [ ] Update dependencies
- [ ] Review user accounts
- [ ] Check backup integrity
- [ ] Review admin activity
- [ ] Test recovery procedures

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

## Contact

Security concerns: [security@yourcompany.com]

**PGP Key:** [Optional - add your PGP public key]

---

**Last Updated:** 2025-11-10  
**Next Review:** 2025-12-10

**Security Status:** 🟢 Good

