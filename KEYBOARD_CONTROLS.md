# ⌨️ Keyboard Controls - Admin Panel

Kompletan vodič za keyboard kontrole stolova u admin panelu.

## 🎯 Pregled

Admin može kontrolisati stolove na mapi korištenjem:
- ⌨️ **Keyboard** - Strelice i +/- tasteri
- 🖱️ **Mouse** - Drag & drop i resize handles
- 🎨 **Oboje** - Kombinacija za najbolje rezultate!

---

## ⌨️ Keyboard Kontrole

### Aktivacija

**Korak 1:** Kliknite na stol koji želite kontrolisati
- Stol će biti označen sa plavim ring-om
- Vidjet ćete dimenzije stola (npr. 80x80)

**Korak 2:** Koristite tastere za kontrolu

### Micanje Stola

| Taster | Akcija | Brzina |
|--------|--------|--------|
| `←` | Micanje lijevo | 1px |
| `→` | Micanje desno | 1px |
| `↑` | Micanje gore | 1px |
| `↓` | Micanje dolje | 1px |

### Brže Micanje

| Taster | Akcija | Brzina |
|--------|--------|--------|
| `Shift + ←` | Brzo lijevo | 10px |
| `Shift + →` | Brzo desno | 10px |
| `Shift + ↑` | Brzo gore | 10px |
| `Shift + ↓` | Brzo dolje | 10px |

💡 **Tip:** Držite Shift za brže pozicioniranje!

### Promjena Veličine

| Taster | Akcija | Promjena |
|--------|--------|----------|
| `+` ili `=` | Povećaj stol | +5px |
| `-` ili `_` | Smanji stol | -5px |

**Ograničenja:**
- Minimum: 40x40px
- Maximum: 200x200px

### Deselect

| Taster | Akcija |
|--------|--------|
| `Esc` | Deselektuj stol |

---

## 🖱️ Mouse Kontrole

### Drag & Drop

**Micanje stola:**
1. Kliknite na stol (bilo gdje na površini)
2. Držite klik
3. Povucite stol na željenu poziciju
4. Pustite klik

### Resize Handles

Kada je stol selektovan, vidjet ćete 8 plavih ručkica oko njega:

```
    NW    N    NE
      ●───●───●
      │       │
    W ●       ● E
      │       │
      ●───●───●
    SW    S    SE
```

**Uglovi (4 handle):**
- **NW** (Northwest) - Gornji lijevi ugao
- **NE** (Northeast) - Gornji desni ugao
- **SW** (Southwest) - Donji lijevi ugao
- **SE** (Southeast) - Donji desni ugao

**Ivice (4 handle):**
- **N** (North) - Gornja ivica
- **S** (South) - Donja ivica
- **E** (East) - Desna ivica
- **W** (West) - Lijeva ivica

**Kako koristiti:**
1. Kliknite na handle
2. Držite klik
3. Povucite u željenom smjeru
4. Pustite klik

💡 **Tip:** Uglovi mijenjaju obje dimenzije, ivice samo jednu!

---

## 🎨 Vizualni Indikatori

### Stanje Stola

**Normal (nije selektovan):**
```
┌──────────┐
│    A1    │
└──────────┘
```

**Selektovan:**
```
    ●───●───●
    │       │
  ● │  A1   │ ●
    │ 80x80 │
    ●───●───●
    Ring: Plavi
    Dimenzije prikazane
```

**Tokom drag-a:**
```
┌──────────┐
│    A1    │  ← Prati kursor
└──────────┘
```

**Tokom resize-a:**
```
    ●───●───●
    │       │
  ● │  A1   │ ● ← Mijenja veličinu
    │ 95x95 │
    ●───●───●
```

---

## 📐 Precizno Pozicioniranje

### Grid Alignment

**Praktičan trik za alignement:**

1. Koristite keyboard za precizno micanje (1px po 1px)
2. Koristite Shift + strelice za grubi positioning
3. Fine-tune sa normalnim strelicama

**Primjer workflow:**
```
1. Shift + ↓ (pomjeri dolje 10px)
2. Shift + ↓ (pomjeri dolje još 10px)
3. ↓ ↓ ↓ (fine-tune 3px dolje)
✅ Perfektno poravnat!
```

### Dimenzije

**Standardne veličine stolova:**
- **Mala:** 60x60px
- **Srednja:** 80x80px (default)
- **Velika:** 100x100px
- **Extra velika:** 120x120px

**Kako postići:**
```
Default: 80x80
+ + + + (4x) → 100x100
- - (2x) → 90x90
```

---

## 🎯 Use Cases

### Scenario 1: Kreiranje Reda Stolova

**Cilj:** 5 stolova u redu, svaki 100px dalje

```
1. Kreiraj prvi stol (A1) na poziciji (50, 100)
2. Kreiraj drugi stol (A2)
3. Selektuj A2
4. Shift + → (10x) - pomjeri 100px desno
5. Repeat za A3, A4, A5
✅ Perfektan red!
```

### Scenario 2: Grid Layout (3x3)

**Cilj:** 9 stolova u 3x3 gridu

```
Row 1: (100, 100), (200, 100), (300, 100)
Row 2: (100, 200), (200, 200), (300, 200)
Row 3: (100, 300), (200, 300), (300, 300)

Workflow:
1. Kreiraj svih 9 stolova na bilo kojoj poziciji
2. Koristi keyboard da pomjeriš svaki na tačnu poziciju
3. Shift + strelice za grubi positioning
4. Normalne strelice za fine-tuning
```

### Scenario 3: Različite Veličine

**Cilj:** Manager desk (veći) i worker desks (manji)

```
Manager desk:
- Selektuj stol
- + + + + + (5x) → 105x105

Worker desks:
- Selektuj stol
- - - - (4x) → 60x60
```

---

## 💡 Pro Tips

### Tip 1: Brzo Pozicioniranje
```
Koristi Shift + strelice za brzo micanje
Pa normalne strelice za fine-tuning
= Brzo i precizno!
```

### Tip 2: Simetrija
```
Kreiraj prvi stol na (100, 100)
Kreiraj drugi stol na (200, 100)
= Jednaka udaljenost = profesionalan izgled
```

### Tip 3: Resize sa Shift
```
Držite Shift dok resize-ujete za održavanje aspect ratio-a
(Trenutno nije implementirano ali može biti u budućoj verziji)
```

### Tip 4: Preview prije save
```
Keyboard kontrole update-uju instantno
Ali sve se čuva automatski u in-memory storage
= Nema potrebe za "Save" dugme!
```

### Tip 5: Esc za deselect
```
Pritisnite Esc kad završite sa edit-om
= Jasno vidite rezultat bez selection ring-a
```

---

## 🔒 Ograničenja

### Boundary Detection

**Stolovi ne mogu:**
- ❌ Izaći van granica mape (automatski clamp-ovano)
- ❌ Biti manji od 40x40px
- ❌ Biti veći od 200x200px

**Ako pokušate:**
```
Stol na poziciji (950, 500), veličina 80x80
Container width: 1000px

→ key → stol se pomjera desno
→ key → stol se pomjera desno
→ key → stol se ZAUSTAVLJA na 920px (1000 - 80)
```

### Overlap Detection

**Trenutno:**
- Stolovi mogu biti overlapped
- Nema automatske collision detection

**Buduća verzija:**
- Snap-to-grid
- Collision detection
- Auto-alignment

---

## 📊 Keyboard Shortcuts Cheat Sheet

Brzi pregled svih kontrola:

```
┌─────────────────────────────────────┐
│       KEYBOARD KONTROLE             │
├─────────────────────────────────────┤
│                                     │
│  MICANJE:                           │
│  ← → ↑ ↓         1px step           │
│  Shift + ←→↑↓    10px step          │
│                                     │
│  VELIČINA:                          │
│  +  =            Povećaj (+5px)     │
│  -  _            Smanji (-5px)      │
│                                     │
│  OSTALO:                            │
│  Esc             Deselect           │
│  Click           Select             │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎓 Video Tutorial (Tekst Verzija)

### Lekcija 1: Osnove

**1.1 Selektovanje stola**
```
Akcija: Klik na stol
Rezultat: Plavi ring oko stola
Stanje: Spreman za keyboard kontrole
```

**1.2 Micanje sa strelicama**
```
Akcija: ↓ ↓ ↓ (3x dolje)
Rezultat: Stol pomjeren 3px dolje
Vizualno: Real-time preview
```

**1.3 Brže micanje**
```
Akcija: Shift + ↓ (drži Shift, pritisni ↓)
Rezultat: Stol pomjeren 10px dolje
Korisno: Grubi positioning
```

### Lekcija 2: Resize

**2.1 Keyboard resize**
```
Akcija: + + +
Rezultat: Stol povećan za 15px (3x5px)
Nova veličina: 80x80 → 95x95
```

**2.2 Mouse resize**
```
Akcija: Drag SE (donji desni) handle
Rezultat: Stol se povećava/smanjuje
Live preview: Vidite dimenzije dok resize-ujete
```

### Lekcija 3: Advanced

**3.1 Kombinovani workflow**
```
1. Mouse drag za grubi positioning
2. Keyboard za fine-tuning
3. Mouse resize handles za veličinu
4. Esc za deselect
✅ Perfektno pozicioniran stol!
```

---

## 🐛 Troubleshooting

### Problem: Strelice ne rade

**Mogući razlozi:**
1. Stol nije selektovan - kliknite na stol prvo
2. Focus nije na mapi - kliknite bilo gdje na mapu
3. Drugi element ima focus - kliknite na stol ponovo

### Problem: Stol ne može dalje

**Razlog:** Dostigao granicu containera
**Rješenje:** To je normalno - boundary detection radi!

### Problem: Resize handles se ne vide

**Razlog:** Stol nije selektovan
**Rješenje:** Kliknite na stol da vidite handles

### Problem: Keyboard shortcuts conflict

**Ako browser shortcuts override app shortcuts:**
```
Chrome: Arrow keys mogu scrollovati stranicu
Fix: Klik na mapu da dobije focus
```

---

## 📞 Pomoć

Za dodatna pitanja:
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - Opšte uputstvo
- [README.md](README.md) - Glavna dokumentacija
- GitHub Issues - Reportuj bugove

---

**Last Updated:** 2025-11-10  
**Version:** 1.2.0 (Keyboard Controls)

**Uživajte u novim kontrolama! ⌨️🖱️**

