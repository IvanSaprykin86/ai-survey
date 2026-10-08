# Опрос «Как вы пользуетесь ИИ?»

Статический сайт (Next.js export) для **GitHub Pages**: лендинг, пошаговый опрос, `session id` и прогресс в `localStorage`, ответы в **Google Sheets** через **Google Apps Script**.

## Локально

```bash
cp .env.example .env.local
npm install
npm run dev
```

Если после `npm run build` в dev видите **500** на `/survey` — сбросьте кэш и перезапустите:

```bash
npm run dev:clean
```

Для проверки production-сборки локально используйте `npm run preview` (статика из `out/`), а не `next start` — проект экспортируется на GitHub Pages.

Без `NEXT_PUBLIC_SURVEY_SYNC_URL` ответы только в консоли браузера (dev).

Проверка сборки как на Pages (подставьте имя репозитория):

```bash
NEXT_PUBLIC_BASE_PATH=/vpn npm run build
npx serve out
```

## Google Sheets (Apps Script)

На GitHub Pages нет сервера, поэтому запись в таблицу идёт через веб-приложение Apps Script.

1. Создайте Google Таблицу, лист `Responses`.
2. **Расширения → Apps Script**, вставьте код из [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. В скрипте укажите `SPREADSHEET_ID` (из URL таблицы).
4. **Развернуть → Новое развёртывание → Веб-приложение**:
   - Выполнять от имени: **Я**
   - Доступ: **Все**
5. Скопируйте URL вида `https://script.google.com/macros/s/.../exec`.

## GitHub Pages

1. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions** → секрет `SURVEY_SYNC_URL` = URL веб-приложения Apps Script.
3. Пуш в `main` (или `master`) запускает [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

Сайт будет по адресу:

`https://<user>.github.io/<имя-репозитория>/`

`NEXT_PUBLIC_BASE_PATH` в CI задаётся автоматически как `/<имя-репозитория>`.

### Пользовательский домен / корень `username.github.io`

Если репозиторий называется `<user>.github.io`, в workflow замените `NEXT_PUBLIC_BASE_PATH` на пустую строку или заведите отдельную ветку с `NEXT_PUBLIC_BASE_PATH=` в секретах/vars.

## Поведение данных

| Что | Где |
|-----|-----|
| ID сессии | `localStorage` → `ai_survey_session_id` |
| Прогресс | `localStorage` → `ai_survey_state` |
| Ответы в таблице | одна строка на `session_id`, при изменении ответа строка **перезаписывается** |

Колонки: `session_id`, `created_at`, `updated_at`, `status`, `current_step`, `q1` … `q12`.

### Защита данных

- Пока человек печатает, ответы отправляются с задержкой (1,2 с), и в полёте всегда не больше одного запроса — строки в таблице не перезаписываются старыми данными.
- `Code.gs` экранирует значения, начинающиеся с `= + - @` (иначе таблица выполнила бы их как формулы), ограничивает размер запроса и ячеек, проверяет `session_id` и сериализует запись через `LockService`.
- После изменения `Code.gs` в Apps Script сделайте **Развернуть → Управление развёртываниями → Изменить → Новая версия**, иначе будет работать старый код.

Одностраничные версии (`*-standalone.html`, `npm run build:standalone`) собираются отдельным скриптом и этих правок не содержат.
