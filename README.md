<p align="center">
  <img src="src/assets/ic_logo.png" alt="Spese logo" width="80"/>
</p>

<h1 align="center">Spese — Frontend</h1>

<p align="center">
  App per la gestione delle spese condivise e delle liste della spesa.<br/>
  Costruita con <strong>Angular 14</strong> e deployata su <strong>Firebase Hosting</strong>.
</p>

<p align="center">
  <a href="https://spese-dc.web.app">🌐 spese-dc.web.app</a>
</p>

---

## Funzionalità

- 📋 **Liste spese condivise** — crea liste, aggiungi partecipanti, registra spese
- 🛒 **Checklist** — liste della spesa collaborative con aggiornamenti in tempo reale
- 👤 **Profilo utente** — immagine profilo con storico, tema chiaro/scuro/auto
- 🔐 **Autenticazione** — login con Google tramite Firebase Auth
- 📊 **Statistiche** — grafici sulle spese per categoria

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Framework | Angular 14 |
| UI | Angular Material + Bootstrap 5 |
| Auth | Firebase Authentication |
| Charts | Chart.js + ng2-charts |
| Backend | [spese-ms](https://github.com/dCurre/spese-ms) |

## Sviluppo locale

```bash
npm install
ng serve
```

L'app sarà disponibile su `http://localhost:4200`.

Assicurati che il backend sia in esecuzione su `http://localhost:5000` oppure modifica `src/environments/environment.ts`.

## Build & Deploy

```bash
ng build --configuration=production
firebase deploy --only hosting
```

## Struttura

```
src/
├── app/
│   ├── core/          # Servizi, interceptor, modelli
│   ├── features/      # Componenti pagina
│   └── shared/        # Componenti riutilizzabili
├── assets/
└── environments/
```
