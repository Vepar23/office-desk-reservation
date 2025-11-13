# 📁 File Upload Guide

Kompletan vodič za upload mape ureda u admin panelu.

## 🎯 Pregled

Admin panel podržava **2 metode** za upload mape ureda:

1. **📁 Lokalni Upload** - Direktan upload sa vašeg računara
2. **🔗 URL Upload** - Link ka eksternoj slici

## 📁 Metoda 1: Lokalni Upload (Preporučeno)

### Prednosti
- ✅ Brže - nema potrebe za eksternim hostingom
- ✅ Sigurnije - fajlovi ostaju na vašem serveru
- ✅ Jednostavnije - samo odaberite fajl
- ✅ Podržava PDF - koristite detaljne planove

### Kako Uploadovati

#### Korak 1: Pristupite Admin Panelu
```
1. Login kao admin
2. Kliknite "Admin Panel" dugme
3. Idite na "Mapa Ureda" tab
```

#### Korak 2: Odaberite Upload Metodu
```
1. Kliknite na "📁 Upload Fajla" dugme (default je već selektovan)
```

#### Korak 3: Odaberite Fajl

**Opcija A: Klik & Odabir**
```
1. Kliknite na upload područje
2. Browser će otvoriti file picker
3. Pronađite vašu sliku ili PDF
4. Kliknite "Open"
```

**Opcija B: Drag & Drop**
```
1. Otvorite folder sa slikom
2. Povucite (drag) fajl iz foldera
3. Ispustite (drop) na upload područje
```

#### Korak 4: Preview & Potvrda
```
1. Vidjet ćete preview uploadane slike
2. Provjerite da li je to tačna slika
3. Ako treba, možete kliknuti "Ukloni fajl" i odabrati drugu
4. Kliknite "Upload Mapu" dugme
```

#### Korak 5: Uspjeh!
```
✅ Vidjet ćete "Mapa ureda uspješno uploadana!"
✅ Slika će se automatski prikazati u "Trenutna Mapa" sekciji
✅ Mapa će biti vidljiva i korisnicima na Dashboard-u
```

### Podržani Formati

| Format | Ekstenzija | Preporučeno Za |
|--------|-----------|----------------|
| JPEG | .jpg, .jpeg | Fotografije ureda |
| PNG | .png | Transparentne slike, screenshots |
| WEBP | .webp | Moderne, optimizovane slike |
| GIF | .gif | Animirane slike (ne preporučuje se) |
| PDF | .pdf | Detaljni arhitektonski planovi |

### Ograničenja

- **Maksimalna veličina:** 5MB
- **Preporučena rezolucija:** 1200x800px minimum
- **Aspect ratio:** 16:9 ili 4:3 za najbolji prikaz
- **DPI:** 72-150 za web

### Tips & Tricks

💡 **Za Najbolje Rezultate:**

1. **Osvetljenje:** Koristite slike sa dobrim osvetljenjem
2. **Kontrast:** Visok kontrast pomaže vidljivosti
3. **Rezolucija:** Viša rezolucija = bolji prikaz
4. **Format:** PNG za najbolji kvalitet, JPEG za manje fajlove

💡 **Optimizacija Slika:**

Ako je slika prevelika (>5MB):

1. **Online Tools:**
   - TinyPNG - https://tinypng.com
   - Compressor.io - https://compressor.io
   - Squoosh - https://squoosh.app

2. **Desktop Software:**
   - Adobe Photoshop
   - GIMP (besplatan)
   - Paint.NET (besplatan)

3. **Komande (Advanced):**
```bash
# ImageMagick - resize to 1920px width
magick input.jpg -resize 1920x output.jpg

# ImageMagick - compress quality to 85%
magick input.jpg -quality 85 output.jpg
```

## 🔗 Metoda 2: URL Upload

### Prednosti
- ✅ Koristi eksterni hosting (npr. Imgur, Cloudinary)
- ✅ Ne zauzima prostor na serveru
- ✅ Može se mijenjati eksterno

### Nedostaci
- ❌ Zavisi od eksternog servisa
- ❌ Sporije učitavanje
- ❌ Može prestati raditi ako eksterni link padne

### Kako Uploadovati

#### Korak 1: Pripremite Sliku

Upload sliku na neki od besplatnih servisa:

**Imgur** (Najbolji za slike)
```
1. Idite na https://imgur.com
2. Kliknite "New post"
3. Upload sliku
4. Desni klik na sliku → "Copy image address"
```

**Cloudinary** (Za profesionalce)
```
1. Registrujte se na https://cloudinary.com
2. Upload sliku u Media Library
3. Kopirajte public URL
```

**Supabase Storage** (Ako koristite Supabase)
```
1. Idite u Supabase dashboard
2. Storage → Kreirajte bucket "office-maps"
3. Upload sliku
4. Kopirajte public URL
```

#### Korak 2: Upload u Admin Panel

```
1. Idite na Admin Panel → Mapa Ureda tab
2. Kliknite "🔗 URL Slike" dugme
3. Zalijepite URL u input polje
4. Kliknite "Upload Mapu"
```

### Preporučeni Servisi

| Servis | Besplatan | Max Size | Preporučeno |
|--------|-----------|----------|-------------|
| Imgur | ✅ Da | 20MB | ⭐⭐⭐⭐⭐ |
| Cloudinary | ✅ Da | 10MB | ⭐⭐⭐⭐ |
| Supabase | ✅ Da | 50MB | ⭐⭐⭐⭐⭐ |
| Dropbox | ✅ Da | 2GB | ⭐⭐⭐ |
| Google Drive | ✅ Da | 15GB | ⭐⭐ (komplikovano) |

## 🔄 Mijenjanje Mape

Želite zamijeniti postojeću mapu?

1. Jednostavno uploadujte novu sliku
2. Nova slika će automatski zamijeniti staru
3. Svi stolovi će ostati na istim pozicijama
4. Korisnici će vidjeti novu mapu odmah

**Napomena:** Stara slika se **ne briše automatski** ako koristite lokalni upload. Možete je ručno obrisati iz `public/uploads/` foldera.

## 🗺️ Gdje se Čuvaju Uploadane Slike?

### Lokalni Upload
```
public/
└── uploads/
    ├── office-map-1699123456789.jpg
    ├── office-map-1699234567890.png
    └── office-map-1699345678901.pdf
```

**Format imena:** `office-map-{timestamp}.{ext}`

### URL Upload
Slike se ne čuvaju lokalno, samo se čuva URL u bazi podataka.

## 🔒 Sigurnost

### Validacija Fajlova

Aplikacija automatski provjerava:

1. **Tip fajla:** Samo dozvolijeni formati (JPG, PNG, WEBP, GIF, PDF)
2. **Veličina:** Maksimum 5MB
3. **MIME type:** Server-side validacija

### Best Practices

✅ **Što Treba:**
- Koristiti zvanične slike ureda
- Provjeriti da li na slici nema osjetljivih informacija
- Redovno ažurirati mapu kada se ured mijenja

❌ **Što Ne Treba:**
- Uploadovati random slike sa interneta
- Koristiti slike sa copyright-om bez dozvole
- Uploadovati slike sa ličnim informacijama zaposlenih

## 🐛 Troubleshooting

### Problem: "Maksimalna veličina fajla je 5MB"

**Rješenje:**
1. Kompresujte sliku (vidi "Optimizacija Slika" gore)
2. Smanjite rezoluciju
3. Promijenite format (PNG → JPEG obično smanjuje veličinu)

### Problem: "Dozvoljen tip fajlova: JPG, PNG, WEBP, GIF, PDF"

**Rješenje:**
1. Provjerite ekstenziju fajla
2. Konvertujte u podržani format
3. Nemojte mijenjati ekstenziju ručno - koristite pravi converter

### Problem: Slika se ne prikazuje nakon upload-a

**Rješenje:**
```
1. Refresh stranicu (Ctrl+F5)
2. Provjerite da li je upload bio uspješan
3. Pogledajte browser console za greške (F12)
4. Provjerite da li fajl postoji u public/uploads/ folderu
```

### Problem: Upload je spor

**Rješenje:**
1. Kompresujte sliku prije upload-a
2. Provjerite internet konekciju
3. Smanjite rezoluciju slike

### Problem: PDF se ne prikazuje kao pozadina

**Napomena:** PDF fajlovi nisu podržani kao pozadinska slika u browser-u. Preporučuje se konvertovati PDF u sliku:

```
Online tools:
- https://pdf2png.com
- https://smallpdf.com/pdf-to-jpg
- https://ilovepdf.com/pdf_to_jpg
```

## 📊 Statistika & Monitoring

Želite znati koje slike su uploadane?

```bash
# Lista uploadanih fajlova
ls -lh public/uploads/

# Veličina uploads foldera
du -sh public/uploads/

# Broj uploadanih fajlova
ls public/uploads/ | wc -l
```

## 🧹 Održavanje

### Čišćenje Starih Fajlova

Periodično obrišite nekorištene slike:

```bash
# List files older than 30 days
find public/uploads/ -type f -mtime +30

# Delete files older than 30 days (BE CAREFUL!)
find public/uploads/ -type f -mtime +30 -delete
```

**UPOZORENJE:** Ovo će obrisati sve fajlove starije od 30 dana!

### Backup

Redovno pravite backup uploads foldera:

```bash
# Backup to zip
zip -r uploads-backup-$(date +%Y%m%d).zip public/uploads/

# Backup to tar.gz
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/
```

## 🚀 Advanced: Supabase Storage Integration

Za production, preporučuje se koristiti Supabase Storage:

### Setup

```typescript
// lib/supabase/storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadToSupabase(file: File) {
  const filename = `office-map-${Date.now()}.${file.name.split('.').pop()}`
  
  const { data, error } = await supabase.storage
    .from('office-maps')
    .upload(filename, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('office-maps')
    .getPublicUrl(filename)

  return publicUrl
}
```

## 📞 Pomoć

Problemi sa upload-om? Provjerite:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [SECURITY.md](SECURITY.md)
- GitHub Issues

---

**Last Updated:** 2025-11-10  
**Version:** 1.1.0 (Added File Upload Feature)

