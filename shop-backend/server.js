const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('./libs/jwt');
const user = require('./models/user');
const product = require('./models/product');
const cart = require('./models/cart');
const history = require('./models/history');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/product_images', express.static('uploads/product_images'));

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/product_images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const checkToken = async (req, res, next) => {
    let token = req.headers['authorization'] || (req.query && req.query.token) || (req.body && req.body.token);
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    if (token) {
        try {
            const decoded = await jwt.verify(token);
            req.decoded = decoded;
            next();
        } catch (err) {
            return res.json({ isError: true, errorMessage: "Invalid token" });
        }
    } else {
        return res.json({ isError: true, errorMessage: "Token is required" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.decoded && req.decoded.role === 'admin') {
        next();
    } else {
        return res.json({ isError: true, errorMessage: "Admin access required" });
    }
};

// Auth
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await user.login(username, password);
    if (result.result) {
        const token = jwt.sign(result.data);
        res.json({ isError: false, result: true, token, user: result.data });
    } else {
        res.json(result);
    }
});

app.post('/api/register', async (req, res) => {
    const { f_name, l_name, username, password, role } = req.body;
    const result = await user.register(f_name, l_name, username, password, role);
    res.json(result);
});

// Products
app.get('/api/products', async (req, res) => {
    const result = await product.getAll();
    res.json(result);
});

app.get('/api/products/:id', async (req, res) => {
    const result = await product.getById(req.params.id);
    res.json(result);
});

app.post('/api/products', checkToken, isAdmin, upload.single('image'), async (req, res) => {
    const { p_name, p_price, p_stock } = req.body;
    const p_image = req.file ? req.file.filename : null;
    const result = await product.add(p_name, p_price, p_stock, p_image);
    res.json(result);
});

app.put('/api/products/:id', checkToken, isAdmin, upload.single('image'), async (req, res) => {
    const { p_name, p_price, p_stock } = req.body;
    const p_image = req.file ? req.file.filename : null;
    const result = await product.update(req.params.id, p_name, p_price, p_stock, p_image);
    res.json(result);
});

app.delete('/api/products/:id', checkToken, isAdmin, async (req, res) => {
    const result = await product.delete(req.params.id);
    res.json(result);
});

// Cart
app.get('/api/cart', checkToken, async (req, res) => {
    const result = await cart.getCart(req.decoded.u_id);
    res.json(result);
});

app.post('/api/cart', checkToken, async (req, res) => {
    const { p_id, quantity } = req.body;
    const result = await cart.addToCart(req.decoded.u_id, p_id, quantity);
    res.json(result);
});

app.delete('/api/cart/:id', checkToken, async (req, res) => {
    const result = await cart.removeFromCart(req.params.id);
    res.json(result);
});

app.put('/api/cart/:id', checkToken, async (req, res) => {
    const { quantity } = req.body;
    const result = await cart.updateQuantity(req.params.id, quantity);
    res.json(result);
});

// Checkout
app.post('/api/checkout', checkToken, async (req, res) => {
    const u_id = req.decoded.u_id;
    const cartItems = await cart.getCart(u_id);
    
    if (cartItems.result && cartItems.data.length > 0) {
        try {
            for (const item of cartItems.data) {
                // Check stock
                const prod = await product.getById(item.p_id);
                if (prod.result && prod.data.p_stock >= item.quantity) {
                    // Update stock
                    await product.update(item.p_id, prod.data.p_name, prod.data.p_price, prod.data.p_stock - item.quantity);
                    // Add to history
                    await history.addHistory(u_id, item.p_id, item.quantity, prod.data.p_price);
                } else {
                    return res.json({ isError: true, errorMessage: `Insufficient stock for ${prod.data.p_name}` });
                }
            }
            await cart.clearCart(u_id);
            res.json({ isError: false, result: true });
        } catch (err) {
            res.json({ isError: true, errorMessage: err.message });
        }
    } else {
        res.json({ isError: true, errorMessage: "Cart is empty" });
    }
});

// History
app.get('/api/history', checkToken, async (req, res) => {
    const result = await history.getHistory(req.decoded.u_id);
    res.json(result);
});

// User Management (Admin only)
app.get('/api/users', checkToken, isAdmin, async (req, res) => {
    const result = await user.getAllUsers();
    res.json(result);
});

app.delete('/api/users/:id', checkToken, isAdmin, async (req, res) => {
    const result = await user.deleteUser(req.params.id);
    res.json(result);
});

app.get('/api/users/:id/history', checkToken, isAdmin, async (req, res) => {
    const result = await history.getHistory(req.params.id);
    res.json(result);
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
