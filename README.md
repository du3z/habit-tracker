# Habit Tracker с аналитикой

Веб-приложение для трекинга привычек: создание привычек, отметка выполнения по дням,
расчёт стриков, статистика и графики.

## Стек

- **Frontend:** React, React Router, Zustand, Axios, Recharts, Tailwind
- **Backend:** Node.js, Express, JWT, bcrypt, Zod
- **DB:** PostgreSQL

## Структура репозитория

```
habit-tracker/
├── server/   # Node.js + Express + PostgreSQL backend
├── client/   # React frontend
└── docker-compose.yml
```

## Запуск локально

### 1. База данных (Docker)

```bash
docker compose up -d
```
Поднимет PostgreSQL на порту 5432 (db: `habit_tracker`, user/pass: `postgres`/`postgres`).

### 2. Backend

```bash
cd server
cp .env.example .env
npm install
npm run migrate   # создаёт таблицы
npm run seed       # тестовый пользователь + привычки + логи
npm run dev         # http://localhost:4000
```

### 3. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
```

## Тестовые данные

После `npm run seed` доступен тестовый пользователь:

```
email:    test@example.com
password: password123
```
У него уже есть 4 активные привычки с историей за ~90 дней (это покрывает несколько месяцев —
удобно проверить сравнение по месяцам в аналитике) и 1 архивная привычка для проверки раздела архива.
Данные не случайны "в лоб" — у «Тренировки» выше вероятность выполнения по будням и ниже в выходные
(чтобы был виден паттерн на графике «по дням недели»), а у «Учить английский» есть провал в середине
периода — наглядный пример брошенной и восстановленной привычки.

## Дополнительные фичи

- **Тёмная/светлая тема** — переключатель в навбаре (иконка солнце/луна), предпочтение сохраняется в `localStorage`, по умолчанию подхватывается системная тема.
- **Архив привычек** — кнопка 🗄 на карточке привычки переносит её в архив без удаления данных; раздел «Показать архив» на дашборде позволяет восстановить привычку или удалить её навсегда.
- **Поиск и фильтрация** — поле поиска по названию и выпадающий список по типу привычки (`daily` / `weekly` / `custom`) над списком привычек, фильтрация выполняется на backend (`GET /api/habits?search=&type=&archived=`).

## ERD (схема БД)

```
┌──────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   users      │        │     habits       │        │   habit_logs     │
├──────────────┤        ├──────────────────┤        ├──────────────────┤
│ id (PK)      │1      *│ id (PK)          │1      *│ id (PK)           │
│ email        ├────────┤ user_id (FK)     ├────────┤ habit_id (FK)     │
│ password_hash│        │ title            │        │ date              │
│ created_at   │        │ description      │        │ completed         │
└──────────────┘        │ type             │        │ created_at        │
                        │ color            │        └──────────────────┘
                        │ target_days      │
                        │ start_date       │
                        │ created_at       │
                        └──────────────────┘
```

- `users 1—N habits`: один пользователь — много привычек.
- `habits 1—N habit_logs`: одна привычка — много отметок выполнения (по датам).
- Уникальность: `habit_logs(habit_id, date)` — одна отметка на день.

## API

### Auth
```
POST   /api/auth/register   { email, password }
POST   /api/auth/login      { email, password } -> { token, user }
GET    /api/auth/me         (Bearer token)
```

### Habits
```
GET    /api/habits
POST   /api/habits          { title, description, type, color, target_days, start_date }
PUT    /api/habits/:id
DELETE /api/habits/:id
POST   /api/habits/:id/toggle   { date }
GET    /api/habits/:id/logs
```

### Stats
```
GET /api/stats/overview
GET /api/stats/:habitId
```

## Use Case (основные сценарии)

1. Пользователь регистрируется → логинится → попадает на Dashboard.
2. Пользователь создаёт привычку «Читать 30 минут» (тип: ежедневная).
3. Пользователь отмечает выполнение за сегодня на Dashboard или странице привычки.
4. Пользователь открывает «Аналитика» и видит графики выполнения и тепловую карту.
5. Backend на каждый запрос статистики пересчитывает текущий/лучший стрик и % выполнения.
