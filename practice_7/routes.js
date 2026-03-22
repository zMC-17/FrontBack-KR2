
const express = require('express')
const router = express.Router()
const { nanoid } = require("nanoid");
const {
    findUserOr404,
    findProductOr404,
    hashPassword,
    verifyPassword,
    findProductIndexOr404,
    generateAccessToken,
    generateRefreshToken
} = require('./utils');
const { users, products, refreshTokens } = require('./database')
const { authMiddleware } = require("./middleware")




// --- ПОЛЬЗОВАТЕЛЬ ---
router.post("/auth/register", async (req, res) => {
    const { email, first_name, last_name, password } = req.body;
    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({
            error: "username, password and age are required"
        });
    }
    const newUser = {
        id: nanoid(),
        username: email,
        first_name: first_name,
        last_name: last_name,
        hashedPassword: await hashPassword(password)
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

router.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            error: "username and password are required"
        });
    }
    const user = findUserOr404(username, res);
    if (!user) return;

    const isAuthenticated = await verifyPassword(password, user.hashedPassword);
    if (isAuthenticated) {
        // JWT
        const access_token = generateAccessToken(user);
        const refresh_token = generateAccessToken(user);

        refreshTokens.add(refreshTokens);

        res.status(200).json({ "accessToken": access_token, "refreshToken": refresh_token });
    }
    else {
        res.status(401).json({ error: "not authentethicated" })
    }
});

router.get("/api/auth/me", authMiddleware, (req, res) => {
    // sub мы положили в токен при login
    const userId = req.user.sub;
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({
            error: "User not found",
        });
    }
    // никогда не возвращаем passwordHash
    res.json({
        id: user.id,
        username: user.username,
    });
});

router.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            error: "refreshToken is required",
        });
    }
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: "Invalid refresh token",
        });
    }
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find((u) => u.id === payload.sub);
        if (!user) {
            return res.status(401).json({
                error: "User not found",
            });
        }
        // Ротация refresh-токена:
        // старый удаляем, новый создаём
        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired refresh token",
        });
    }
});

// --- ТОВАРЫ ---
router.post("/products", (req, res) => {
    const { title, category, description, price } = req.body;
    const newProduct = {
        id: nanoid(),
        title: title.trim(),
        category: category,
        description: description ?? "",
        price: Number(price)
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

router.get("/products", authMiddleware, (req, res) => {

    res.json(products);
});

router.get("/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    res.json(product);
});

router.put("/products/:id", authMiddleware, (req, res) => {
    const id = req.params.id;
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({
            error: "All fields (title, category, description, price) are required"
        });
    }

    const index = findProductIndexOr404(id, res);
    if (index === -1) return
    const updatedProduct = {
        id: products[index].id, // сохраняем старый id
        title: title.trim(),
        category: category,
        description: description ?? "",
        price: Number(price)
    }
    products[index] = updatedProduct;
    res.json(updatedProduct);

});

router.delete("/products/:id", authMiddleware, (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res)
    if (!product) return
    products = products.filter((u) => u.id !== id);
    res.status(204).end();

});


module.exports = router