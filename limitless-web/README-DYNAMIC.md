# Limitless Web — wersja dynamiczna (Cloudflare Pages + Functions + D1)

Ta paczka przerabia sekcję **Realizacje** na dynamiczną listę z bazy D1 oraz dodaje **panel admina** (`/admin`) do edycji projektów.

## Co w środku
- `index.html` — sekcja Realizacje ładuje projekty z `/api/projects` (publiczne GET).
- `admin/` — panel admina (logowanie, lista, dodawanie/edycja/usuwanie).
- `functions/` — Cloudflare Pages Functions (API + logowanie).
- `migrations/0001_init.sql` — schemat bazy D1.
- `data/initial-projects.json` — przykładowe dane do zseedowania.
- `wrangler.toml` — konfiguracja pomocnicza do lokalnych testów i wiązań (uzupełnij `database_id`).

## Wymagania
- Konto Cloudflare (Pages + D1)
- Repozytorium GitHub z tym katalogiem jako root projektu (`limitless-web/` może być w root lub przenieś pliki wyżej — ważne, by na Pages wskazać poprawny folder build output).
- Node nie jest wymagany do działania; to czyste HTML/CSS/JS + Functions.

## Szybkie wdrożenie (Cloudflare Pages)
1. **GitHub → nowe repozytorium** i wrzuć te pliki (folder `limitless-web/` jest gotowym outputem).
2. W Cloudflare: **Pages → Create project → Connect to GitHub** i wskaż repo.
3. **Build settings**:
   - Framework preset: **None**
   - Build command: *(puste)*
   - Build output directory: `limitless-web`
4. Po pierwszym buildzie wejdź w zakładkę **Functions** projektu i przejdź do **D1**.

## Utworzenie i podpięcie bazy D1
1. W panelu Cloudflare utwórz **D1 Database** (np. `limitlessweb`). Zanotuj **Database ID**.
2. W ustawieniach projektu Pages **Bindings → D1 databases → Add binding**:
   - Binding name: **DB**
   - Database: wybierz utworzoną bazę
3. Zaaplikuj **migracje**:
   - W terminalu lokalnie (opcjonalnie): `npm i -g wrangler` → `wrangler d1 migrations apply limitlessweb`
   - Lub w panelu D1 → **Query** i wklej zawartość `migrations/0001_init.sql` (jednorazowo).
4. (Opcjonalnie) Zseeduj dane:
   - Zaloguj się do panelu (`/admin`), a następnie **POST** do `/api/seed` — endpoint pobierze `data/initial-projects.json` i wstawi rekordy.

## Zmienne środowiskowe (Pages → Settings → Environment variables)
- `ADMIN_USER` — login do panelu (np. `admin`)
- `ADMIN_PASS` — hasło do panelu
- `SESSION_SECRET` — długi losowy sekret (np. wygenerowanym menadżerem haseł)

> **Uwaga:** GET `/api/projects` jest publiczny (front go używa). Operacje zapisu (POST/PUT/DELETE) wymagają sesji ustawionej przez `/api/admin/login` (cookie HttpOnly).

## Endpoints API
- `GET /api/projects` — lista projektów
- `POST /api/projects` — *auth* — dodaj projekt `{title, description?, imageUrl?, linkUrl?, order_num?}`
- `GET /api/projects/:id` — szczegóły projektu
- `PUT /api/projects/:id` — *auth* — aktualizacja dowolnych pól
- `DELETE /api/projects/:id` — *auth* — usuń
- `POST /api/admin/login` — body `{username, password}` → cookie `session`
- `POST /api/admin/logout` — czyści sesję
- `GET /api/admin/me` — status logowania (200/401)
- `POST /api/seed` — *auth* — import z `data/initial-projects.json` (dev-only)

## Dodanie domeny (custom domain)
1. Wejdź do **Pages → Twój projekt → Custom domains** i kliknij **Set up a custom domain**.
2. Wpisz swoją domenę (np. `limitlessweb.pl`). Jeśli domena jest w Cloudflare → potwierdź i gotowe (rekordy dodadzą się same).
3. Jeśli domena jest u innego rejestratora, ustaw **DNS** tak, by strefa była w Cloudflare (zmień NS na Cloudflare) **albo** dodaj ręcznie rekord **CNAME** wskazujący na subdomenę `.pages.dev` projektu.

## Development lokalny
- `wrangler pages dev limitless-web` — uruchomi statyczne pliki i Functions lokalnie (wymaga wrangler).
