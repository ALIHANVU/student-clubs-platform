#  СтудКлубы ЧГУ



---

## 🛠️ Технологии

| Технология | Назначение |
|---|---|
| **React 19** | UI-фреймворк |
| **TypeScript** | Типизация |
| **Vite 7** | Сборка |
| **Supabase** | БД + Auth (продакшн) |
| **localStorage** | Демо-режим |
| **Lucide React** | Иконки |
| **CSS Variables** | Тёмная/светлая тема |

---


## 📂 Структура проекта

```
src/
├── components/          # UI-компоненты
│   ├── Layout.tsx       # Общий layout
│   ├── Navigation.tsx   # Навигация (sidebar + mobile bar)
│   └── ProtectedRoute.tsx
├── contexts/            # React Context
│   ├── AuthContext.tsx   # Авторизация
│   ├── DataContext.tsx   # Данные (CRUD, demo/supabase)
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx  # Тёмная/Светлая тема
├── pages/               # Страницы
│   ├── Home.tsx         # Главная панель
│   ├── Clubs.tsx        # Каталог клубов
│   ├── Events.tsx       # Мероприятия
│   ├── Schedule.tsx     # Расписание
│   ├── ClubManage.tsx   # Управление клубом
│   ├── AdminDashboard.tsx # Админ-панель
│   └── Auth.tsx         # Авторизация
├── data/mockData.ts     # Демо-данные
└── lib/supabase.ts      # Клиент Supabase
```

