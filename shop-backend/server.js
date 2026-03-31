// นำเข้าโมดูลต่างๆ ที่จำเป็นต่อการทำงานของเซิร์ฟเวอร์
const express = require('express');        // เฟรมเวิร์กจัดการ HTTP Request
const bodyParser = require('body-parser');   // ตัวช่วยในการอ่านข้อมูลจาก Body ของ Request (เช่น JSON)
const cors = require('cors');               // ตัวช่วยอนุญาตให้เว็บไซต์อื่นเรียกใช้ API ได้ (Cross-Origin Resource Sharing)
const jwt = require('./libs/jwt');           // โมดูลจัดการ Token ที่เราสร้างไว้ใน libs/jwt.js
const user = require('./models/user');       // โมดูลจัดการข้อมูลผู้ใช้
const product = require('./models/product'); // โมดูลจัดการสินค้า
const cart = require('./models/cart');       // โมดูลจัดการตะกร้าสินค้า
const history = require('./models/history'); // โมดูลจัดการประวัติการซื้อ
const multer = require('multer');          // โมดูลสำหรับจัดการไฟล์อัปโหลด (รูปภาพ)
const path = require('path');              // โมดูลจัดการพาธของไฟล์ในระบบ

// สร้างอินสแตนซ์ของ Express
const app = express();
app.use(cors()); // เปิดใช้งาน CORS เพื่อให้หน้าบ้านติดต่อมาได้
app.use(bodyParser.json()); // ให้อ่านข้อมูล JSON จาก Request Body ได้
app.use(bodyParser.urlencoded({ extended: true })); // ให้อ่านข้อมูลแบบ URL-encoded ได้
// เปิดโฟลเดอร์ uploads/product_images ให้เข้าถึงได้ผ่าน URL (สำหรับดึงรูปภาพไปแสดงผล)
app.use('/product_images', express.static('uploads/product_images'));

// ตั้งค่าการจัดเก็บไฟล์ด้วย Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/product_images'); // กำหนดที่เก็บรูปภาพ
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่โดยเอาเวลาปัจจุบันมาต่อกับนามสกุลไฟล์เดิมเพื่อป้องกันชื่อซ้ำ
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage }); // สร้างตัวช่วยอัปโหลดโดยใช้การตั้งค่าด้านบน

// Middleware สำหรับตรวจสอบความถูกต้องของ Token ก่อนทำงานใน Route ต่างๆ
const checkToken = async (req, res, next) => {
    // ดึง Token จาก Authorization Header หรือพารามิเตอร์อื่นๆ
    let token = req.headers['authorization'] || (req.query && req.query.token) || (req.body && req.body.token);
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // ตัดคำว่า 'Bearer ' ออกเอาแค่ตัวรหัส
    }
    if (token) {
        try {
            // เรียกฟังก์ชันตรวจสอบ Token
            const decoded = await jwt.verify(token);
            req.decoded = decoded; // เก็บข้อมูลผู้ใช้ที่ถอดรหัสออกมาใส่ใน Request
            next(); // ให้ไปทำงานต่อใน Route หลัก
        } catch (err) {
            return res.json({ isError: true, errorMessage: "Token ไม่ถูกต้องหรือหมดอายุ" });
        }
    } else {
        return res.json({ isError: true, errorMessage: "จำเป็นต้องระบุ Token" });
    }
};

// Middleware สำหรับตรวจสอบว่าเป็นผู้ดูแลระบบ (Admin) หรือไม่
const isAdmin = (req, res, next) => {
    if (req.decoded && req.decoded.role === 'admin') {
        next(); // ถ้าเป็น Admin ให้ผ่านไปได้
    } else {
        return res.json({ isError: true, errorMessage: "เฉพาะผู้ดูแลระบบเท่านั้นที่ทำรายการนี้ได้" });
    }
};

// --- ส่วนของ API เส้นต่างๆ (Routes) ---

// 1. เข้าสู่ระบบ (Login)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await user.login(username, password);
    if (result.result) {
        // เมื่อล็อคอินสำเร็จ ให้สร้าง Token ส่งคืนไปให้หน้าบ้าน
        const token = jwt.sign(result.data);
        res.json({ isError: false, result: true, token, user: result.data });
    } else {
        res.json(result);
    }
});

// 2. ลงทะเบียน (Register)
app.post('/api/register', async (req, res) => {
    const { f_name, l_name, username, password, role } = req.body;
    const result = await user.register(f_name, l_name, username, password, role);
    res.json(result);
});

// 3. ดึงสินค้าทั้งหมด
app.get('/api/products', async (req, res) => {
    const result = await product.getAll();
    res.json(result);
});

// 4. ดึงสินค้าแบบระบุ ID
app.get('/api/products/:id', async (req, res) => {
    const result = await product.getById(req.params.id);
    res.json(result);
});

// 5. เพิ่มสินค้า (ต้องมี Token และเป็น Admin)
app.post('/api/products', checkToken, isAdmin, upload.single('image'), async (req, res) => {
    const { p_name, p_price, p_stock } = req.body;
    const p_image = req.file ? req.file.filename : null; // ดึงชื่อไฟล์รูปที่อัปโหลด
    const result = await product.add(p_name, p_price, p_stock, p_image);
    res.json(result);
});

// 6. แก้ไขสินค้า (ต้องมี Token และเป็น Admin)
app.put('/api/products/:id', checkToken, isAdmin, upload.single('image'), async (req, res) => {
    const { p_name, p_price, p_stock } = req.body;
    const p_image = req.file ? req.file.filename : null;
    const result = await product.update(req.params.id, p_name, p_price, p_stock, p_image);
    res.json(result);
});

// 7. ลบสินค้า (ต้องมี Token และเป็น Admin)
app.delete('/api/products/:id', checkToken, isAdmin, async (req, res) => {
    const result = await product.delete(req.params.id);
    res.json(result);
});

// 8. ดึงข้อมูลตะกร้าสินค้า (ต้องมี Token)
app.get('/api/cart', checkToken, async (req, res) => {
    const result = await cart.getCart(req.decoded.u_id); // ดึงตาม ID ผู้ใช้ที่อยู่ใน Token
    res.json(result);
});

// 9. เพิ่มสินค้าลงตะกร้า (ต้องมี Token)
app.post('/api/cart', checkToken, async (req, res) => {
    const { p_id, quantity } = req.body;
    const result = await cart.addToCart(req.decoded.u_id, p_id, quantity);
    res.json(result);
});

// 10. ลบสินค้าออกจากตะกร้า (ต้องมี Token)
app.delete('/api/cart/:id', checkToken, async (req, res) => {
    const result = await cart.removeFromCart(req.params.id);
    res.json(result);
});

// 11. แก้ไขจำนวนสินค้าในตะกร้า (ต้องมี Token)
app.put('/api/cart/:id', checkToken, async (req, res) => {
    const { quantity } = req.body;
    const result = await cart.updateQuantity(req.params.id, quantity);
    res.json(result);
});

// 12. ชำระเงิน (Checkout) - กระบวนการที่รวมหลายขั้นตอน
app.post('/api/checkout', checkToken, async (req, res) => {
    const u_id = req.decoded.u_id;
    const cartItems = await cart.getCart(u_id); // ดึงของในตะกร้าออกมา
    
    if (cartItems.result && cartItems.data.length > 0) {
        try {
            // วนลูปสินค้าทุกรายการในตะกร้า
            for (const item of cartItems.data) {
                // ตรวจสอบสต็อกสินค้าล่าสุด
                const prod = await product.getById(item.p_id);
                if (prod.result && prod.data.p_stock >= item.quantity) {
                    // ขั้นตอนที่ 1: ลดจำนวนสต็อกสินค้า
                    await product.update(item.p_id, prod.data.p_name, prod.data.p_price, prod.data.p_stock - item.quantity);
                    // ขั้นตอนที่ 2: บันทึกลงตารางประวัติการซื้อ (History)
                    await history.addHistory(u_id, item.p_id, item.quantity, prod.data.p_price);
                } else {
                    // หากสต็อกไม่พอ ให้หยุดและแจ้ง error ทันที
                    return res.json({ isError: true, errorMessage: `สินค้า ${prod.data.p_name} มีจำนวนไม่พอ` });
                }
            }
            // ขั้นตอนที่ 3: ล้างสินค้าทั้งหมดออกจากตะกร้าเมื่อทำรายการสำเร็จ
            await cart.clearCart(u_id);
            res.json({ isError: false, result: true });
        } catch (err) {
            res.json({ isError: true, errorMessage: err.message });
        }
    } else {
        res.json({ isError: true, errorMessage: "ไม่พบสินค้าในตะกร้า" });
    }
});

// 13. ดึงประวัติการซื้อ (ต้องมี Token)
app.get('/api/history', checkToken, async (req, res) => {
    let u_id = req.decoded.u_id; // ค่าเริ่มต้นคือ ID ของตัวเอง
    
    // หากเป็น Admin และมีการระบุ u_id ใน Query String ให้ใช้ค่านั้นแทน (สำหรับดูประวัติผู้อื่น)
    if (req.decoded.role === 'admin' && req.query.u_id) {
        u_id = req.query.u_id;
    }
    
    const result = await history.getHistory(u_id);
    res.json(result);
});

// 14. จัดการข้อมูลผู้ใช้ (เฉพาะ Admin) - ดึงรายชื่อทั้งหมด
app.get('/api/users', checkToken, isAdmin, async (req, res) => {
    const result = await user.getAllUsers();
    res.json(result);
});

// 15. แก้ไขข้อมูลผู้ใช้ (เฉพาะ Admin)
app.put('/api/users/:id', checkToken, isAdmin, async (req, res) => {
    const { f_name, l_name, role } = req.body;
    const result = await user.updateUser(req.params.id, f_name, l_name, role);
    res.json(result);
});

// 16. ลบผู้ใช้ (เฉพาะ Admin)
app.delete('/api/users/:id', checkToken, isAdmin, async (req, res) => {
    const result = await user.deleteUser(req.params.id);
    res.json(result);
});

// 17. ดึงยอดรวมการสั่งซื้อของนักช้อปแต่ละคน (เฉพาะ Admin)
app.get('/api/users/totals', checkToken, isAdmin, async (req, res) => {
    const result = await history.getTotalsPerUser();
    res.json(result);
});

// เริ่มต้นรันเซิร์ฟเวอร์ที่พอร์ต 8080
const port = 8080;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
