# RIZY LAND - Telegram Mini App

Детская платформа для чтения книг и прослушивания аудиокниг в Telegram.

## Быстрый запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер:
```bash
npm start
```

3. Откройте браузер: `http://localhost:3000`

## Развертывание на Render.com

1. Загрузите эти файлы в GitHub репозиторий
2. Создайте новый Web Service в Render.com
3. Настройте команды:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Добавьте переменную окружения:
   - **TELEGRAM_BOT_TOKEN:** `7191911445:AAE3KVC8tMmsRm9qOkCbqmT0p774fZO9P2M`

## API Endpoints

- `GET /api/categories` - Категории книг
- `GET /api/books` - Список книг
- `GET /api/audiobooks` - Аудиокниги
- `GET /api/shop` - Товары в магазине
- `GET /api/search?q=query` - Поиск
- `GET /health` - Проверка работы сервера

## Структура проекта

- `server.js` - Express сервер с API
- `package.json` - Зависимости проекта
- `schema.ts` - Схема базы данных
- `public/` - Статические файлы
- `README.md` - Документация

## Настройка Telegram Bot

1. Найдите @BotFather в Telegram
2. Используйте команду `/setmenubutton`
3. Укажите URL развернутого приложения
4. Настройте Web App для вашего бота