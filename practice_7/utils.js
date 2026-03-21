// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const bcrypt = require("bcrypt");
const { users, products } = require('./database.js');

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

module.exports = {
    findProductOr404,
    findUserOr404,
    findProductIndexOr404,
    hashPassword,
    verifyPassword,
    users,
    products
}