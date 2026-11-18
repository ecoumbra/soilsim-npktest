# AgroSim: Якісні реакції з визначення добрив

Навчальний вебсимулятор якісного аналізу мінеральних добрив (React + TypeScript + Vite).

```bash
npm install
npm run dev      # розробка
npm run check    # tsc + eslint + vitest + production build
```

Розгортання на GitHub Pages: зібрати `npm run build` і опублікувати `dist/` (у `vite.config.ts` `base: './'`).

Структура: `src/data` (хімічна база) · `src/engine` (логіка) · `src/components` (UI) · `src/i18n` · `tests` · `docs`.

**Cursor:** відкрийте папку проєкту; правила підхоплюються з `.cursor/rules/`. Поточний статус і TODO — у `docs/PROGRESS.md`.

**Прогрес студента** зберігається в `localStorage` браузера (префікс `agrosim.v1.`); кнопка «Скинути весь прогрес» у «Довідці» очищає його. Звіт можна надрукувати або зберегти як .txt.
