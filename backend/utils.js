// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const { users, products } = require('./database.js');

const ACCESS_SECRET = "jwt-secret"
const REFRESH_SECRET = "jwt-secret"
const ACCESS_EXPIRES_IN = '15m'
const REFRESH_EXPIRES_IN = '7d'

// Проверка в бд
function findUserOr404(username, res) {
    const user = users.find(u => u.username == username);
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return null;
    }
    return user;
}
function findProductOr404(id, res) {
    const product = products.find(u => u.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}
function findProductIndexOr404(id, res) {
    const index = products.findIndex(p => p.id == id);
    if (index === -1) {
        res.status(404).json({ error: "Product not found" });
        return -1;
    }
    return index;
}

// Хеширование и проверка
async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}
async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

// Создание токенов
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}

module.exports = {
    findProductOr404,
    findUserOr404,
    findProductIndexOr404,
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken
}