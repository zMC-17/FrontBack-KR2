
const express = require('express')
const router = express.Router()
const { findUserOr404,
    findProductOr404,
    hashPassword,
    verifyPassword,
    users,
    products,
    findProductIndexOr404
} = require('./utils');
const { nanoid } = require("nanoid");


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
    isAuthentethicated = await verifyPassword(password,
        user.hashedPassword);
    if (isAuthentethicated) {
        res.status(200).json({ login: true });
    }
    else {
        res.status(401).json({ error: "not authentethicated" })
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

router.get("/products", (req, res) => {
    res.json(products);
});

router.get("/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    res.json(product);
});

router.put("/products/:id", (req, res) => {
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

router.delete("/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res)
    if (!product) return
    products = products.filter((u) => u.id !== id);
    res.status(204).end();

});


module.exports = router