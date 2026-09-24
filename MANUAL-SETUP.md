# Что нужно сделать руками (Supabase + Google OAuth)

## 1. Создать проект в Supabase
- Зайди на https://supabase.com/dashboard, создай новый проект
- Запомни: Project URL, Anon Key, Service Role Key, Database URL

## 2. Настроить Google OAuth
- Google Cloud Console > APIs & Services > Credentials
- Создай OAuth 2.0 Client ID (Web application)
- Authorized redirect URIs добавь:
  - `http://localhost:3000/auth/callback`
  - `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
  - (позже) `https://<vercel-domain>/auth/callback`
- Скопируй Client ID и Client Secret

## 3. Включить Google в Supabase Auth
- Supabase Dashboard > Authentication > Providers > Google
- Включи, вставь Client ID и Client Secret из шага 2

## 4. Создать .env.local
В корне /Users/yakubka/ketmon/ создай файл .env.local:

```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

## 5. Применить Prisma миграцию
После .env.local:
```bash
npx prisma migrate dev --name init
npm run seed
```

## 6. Запустить
```bash
npm run dev
```

## 7. (Позже) Деплой на Vercel
- Подключи репо yakubka/ketmon
- Добавь все env переменные из .env.local
- Добавь Vercel домен в Supabase Redirect URLs и Google OAuth redirect URIs
