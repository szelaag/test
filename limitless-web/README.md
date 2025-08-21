# Limitless Web — strona firmowa (v3)

Dodatkowe poprawki:
- Ikony w sekcji zaufania: większe, bez punktorów, czytelny piktogram „check”.
- „Dane kontaktowe” teraz obok formularza: nagłówek span na dwie kolumny, wyrównanie do góry.
- „Realizacje”: 4 projekty w jednym rzędzie (responsywne przełamania do 3/2/1 kolumn).
- Zachowane poprzednie zmiany (kontrast, brak cen, FAQ +3, usunięta mapa).

## Deploy (Cloudflare Pages)
- Podłącz repo, build: brak, output: `/`.
- Podmień domenę `example.com` w `index.html`, `robots.txt`, `sitemap.xml`.

## Formularz
- Ustaw w `assets/script.js` swój endpoint:
```js
const FORMSPREE_ENDPOINT = "https://formspree.io/f/yourId";
```
