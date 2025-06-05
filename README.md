# KlassenarbeitAI 🚀

**Von Klassenarbeit zu interaktivem Quiz in Sekunden**

Eine KI-powered Web-App, die automatisch aus Klassenarbeiten interaktive Quizzes generiert.

## Features ✨

- 📝 **Einfacher Upload**: Text eingeben oder Datei hochladen
- 🤖 **KI-Generation**: Automatische Quiz-Erstellung mit Claude AI
- 🎯 **Interaktive Quizzes**: Multiple Choice, True/False, Kurzantworten
- 📊 **Sofortige Auswertung**: Detailliertes Feedback und Themen-Analyse
- 🔗 **Einfaches Teilen**: Jedes Quiz bekommt eine eigene URL
- ⚡ **Blitzschnell**: Von Klassenarbeit zu Quiz in unter 30 Sekunden

## Setup 🛠️

### 1. Supabase Datenbank einrichten

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Kopiere deine `URL` und `anon key` aus den Projekt-Einstellungen
3. Führe das SQL-Script aus `supabase-schema.sql` in deinem Supabase SQL Editor aus

### 2. Environment Variables

Bearbeite die `.env.local` Datei:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url_hier
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_supabase_anon_key_hier

# AI Configuration (Claude API)
CLAUDE_API_KEY=dein_claude_api_key_hier

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Installation & Start

```bash
npm install
npm run dev
```

Die App läuft auf `http://localhost:3000`

## Verwendung 📚

### Für Lehrer:

1. **Quiz erstellen**: 
   - Titel eingeben
   - Klassenarbeit als Text eingeben oder Datei hochladen
   - "Quiz generieren" klicken

2. **Teilen**: 
   - Du erhältst eine URL für dein Quiz
   - Teile diese URL mit deinen Schülern

### Für Schüler:

1. **Quiz öffnen**: URL vom Lehrer öffnen
2. **Antworten**: Fragen beantworten und sofortiges Feedback erhalten
3. **Auswertung**: Detaillierte Ergebnisse und Themen-Analyse

## Tech Stack 🔧

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **Hosting**: Vercel (empfohlen)

## Demo Quiz 🎮

Nach dem Setup ist automatisch ein Demo-Quiz verfügbar:
`http://localhost:3000/quiz/demo-math-quiz`

## Nächste Schritte 🎯

### Kurzfristig:
- [ ] PDF-Upload Unterstützung
- [ ] Benutzer-Authentifizierung
- [ ] Quiz-Archiv für Lehrer
- [ ] Erweiterte Analytics

### Mittelfristig:
- [ ] Mobile App (React Native)
- [ ] Echte Subdomain-Unterstützung
- [ ] Multiplayer-Quiz-Modus
- [ ] Integration mit Schul-Systemen

### Langfristig:
- [ ] KI-Tutoring System
- [ ] Adaptive Lernpfade
- [ ] Gamification Features
- [ ] White-Label Lösungen

## Deployment 🚀

### Vercel (Empfohlen)

1. Repository zu GitHub pushen
2. Mit Vercel verbinden
3. Environment Variables in Vercel eintragen
4. Deploy!

## Kosten 💰

**Geschätzte monatliche Kosten für 1000 Quizzes:**

- Supabase: 0€ (Free Tier reicht)
- Claude API: ~25€ (je nach Token-Verbrauch)
- Vercel: 0€ (Free Tier reicht)

**Total: ~25€/Monat für 1000 generierte Quizzes**

---

**Viel Erfolg mit deiner KlassenarbeitAI App! 🎉**
