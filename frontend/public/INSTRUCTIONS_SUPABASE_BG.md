# PartyPixels + Supabase - Пълни инструкции

## Какво ще направим:
1. Създаваме безплатен Supabase акаунт (базата данни в облака)
2. Създаваме таблиците и зареждаме продуктите
3. Свързваме сайта със Supabase
4. Качваме сайта на Vercel (безплатен хостинг)

**Резултат:** Сайтът ще е достъпен от цял свят с линк, без нищо на твоя компютър.

---

## СТЪПКА 1: Създай Supabase акаунт и проект

1. Отвори: **https://supabase.com**
2. Натисни **"Start your project"** (зеленият бутон)
3. Влез с **GitHub акаунт** (ако нямаш, направи си безплатен на github.com)
4. След като влезеш, натисни **"New Project"**
5. Попълни:
   - **Name:** `partypixels`
   - **Database Password:** измисли парола (запиши си я!)
   - **Region:** избери най-близкия до теб (например `Central EU - Frankfurt`)
6. Натисни **"Create new project"**
7. Изчакай 1-2 минути докато се създаде

---

## СТЪПКА 2: Създай таблиците и зареди продуктите

1. В Supabase Dashboard, натисни **"SQL Editor"** (от лявото меню - иконка с код)
2. Натисни **"New Query"**
3. Отвори файла `supabase_setup.sql` от ZIP-а с Notepad
4. **Копирай ЦЕЛИЯ текст** от файла (Ctrl+A, Ctrl+C)
5. **Постави** го в SQL Editor-а (Ctrl+V)
6. Натисни зеления бутон **"Run"** (или Ctrl+Enter)
7. Трябва да видиш **"Success. No rows returned"** - това е ОК!

**Провери:** Натисни **"Table Editor"** от лявото меню. Трябва да видиш 3 таблици:
- `products` (6 реда - твоите лампи)
- `carts` (празна)
- `cart_items` (празна)

---

## СТЪПКА 3: Вземи ключовете за свързване

1. В Supabase Dashboard, натисни **"Project Settings"** (зъбчатката долу вляво)
2. Натисни **"API"** от менюто
3. Ще видиш 2 важни неща:

   **Project URL** - изглежда така:
   ```
   https://abcdefghij.supabase.co
   ```

   **anon public key** - дълъг текст, започващ с `eyJ...`:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
   ```

4. **Копирай ги и ги запази** - ще ти трябват в следващата стъпка!

---

## СТЪПКА 4: Свържи сайта със Supabase

1. Отвори файла `frontend/.env` с Notepad
2. Замени тези 2 реда с твоите стойности:

```
REACT_APP_SUPABASE_URL=https://ТВОЕТО-PROJECT-ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=ТВОЯТ-ANON-KEY-ТУК
```

Пример (НЕ ползвай тези - те са фалшиви):
```
REACT_APP_SUPABASE_URL=https://abcdefghij.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```

3. Запази файла.

---

## СТЪПКА 5: Качи сайта на Vercel (безплатно)

### 5.1 Качи кода в GitHub

1. Отвори **https://github.com** и влез
2. Натисни **"+"** горе вдясно → **"New repository"**
3. **Name:** `partypixels`
4. Избери **Public**
5. Натисни **"Create repository"**
6. Ще видиш инструкции. За сега ги остави.

На компютъра си:
1. Отвори команден ред (`Win+R` → `cmd`)
2. Навигирай до `frontend` папката:
   ```
   cd C:\Users\ТвоетоИме\Desktop\PartyPixels\frontend
   ```
3. Напиши тези команди една по една:
   ```
   git init
   git add .
   git commit -m "PartyPixels site"
   git branch -M main
   git remote add origin https://github.com/ТВОЕТО-ИМЕ/partypixels.git
   git push -u origin main
   ```
   (Замени `ТВОЕТО-ИМЕ` с GitHub потребителското ти име)

### 5.2 Свържи с Vercel

1. Отвори **https://vercel.com**
2. Натисни **"Sign Up"** → влез с **GitHub**
3. Натисни **"Add New..."** → **"Project"**
4. Ще видиш твоето repo `partypixels` - натисни **"Import"**
5. **ВАЖНО!** Преди да натиснеш Deploy, добави Environment Variables:
   - Натисни **"Environment Variables"**
   - Добави:
     | Name | Value |
     |------|-------|
     | `REACT_APP_SUPABASE_URL` | https://ТВОЕТО-ID.supabase.co |
     | `REACT_APP_SUPABASE_ANON_KEY` | eyJ... (твоят ключ) |
6. Натисни **"Deploy"**
7. Изчакай 1-2 минути
8. Vercel ще ти даде линк: **https://partypixels-XXXX.vercel.app**

**Готово! Сайтът е на живо!** 🎉

---

## Обобщение - какво къде е:

| Компонент | Къде е | Цена |
|-----------|--------|------|
| **База данни** (продукти, колички) | Supabase | Безплатно (до 500MB) |
| **Сайт** (фронтенд) | Vercel | Безплатно |
| **Домейн** | vercel.app | Безплатно (или купи свой) |

---

## Ако нещо не работи:

**Сайтът зарежда, но няма продукти:**
→ Провери дали URL и ключът в `.env` / Vercel са правилни
→ Провери дали си пуснал SQL-а в Supabase

**Количката не работи:**
→ Отвори Supabase → Table Editor → `carts` и `cart_items` трябва да съществуват
→ Провери RLS policies: Authentication → Policies → трябва да има по 1+ policy за всяка таблица

**Грешка 401 или "permission denied":**
→ SQL-ът от стъпка 2 създава нужните RLS policies. Пусни го отново.
