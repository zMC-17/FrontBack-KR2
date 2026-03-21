const express = require("express");

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const port = 3000;



const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Настраиваем Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,           // добавляет выпадающий список для выбора версий
    swaggerOptions: {
        docExpansion: 'none', // сворачивает все эндпоинты по умолчанию
        filter: true,         // добавляет поле поиска
        persistAuthorization: true, // сохраняет авторизацию при обновлении
    },
    customSiteTitle: 'My API Documentation', // заголовок страницы
}));

// Опционально: отдаем JSON спецификацию
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
});


// --- MIDDLEWARE ---
app.use(express.json());

// Middleware логгирование по окончании каждого запроса
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}]
${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method ===
            'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});


// ПОДКЛЮЧЕНИЕ РОУТЕРОВ
app.use('/api', require('./routes'))


// 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок (чтобы сервер не падал)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера на порте
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});

// /api/auth/register POST - Регистрация (создание) пользователя
// /api/auth/login POST - Вход в систему
// /api/products POST - Создать товар
// /api/products GET - Получить список товаров
// /api/products/:id GET - Получить товар по id
// /api/products/:id PUT - Обновить параметры товара
// /api/products/:id DELETE - Удалить товар