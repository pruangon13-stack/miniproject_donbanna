"use client"; // แจ้งว่าคอมโพเนนต์นี้ทำงานที่ฝั่งผู้ใช้ (Client-side)
import React, { useEffect, useState } from 'react'; // นำเข้า React Hooks สำหรับจัดการ State และ Lifecycle
import axios from 'axios'; // นำเข้าไลบรารี Axios สำหรับติดต่อ API ระบบหลังบ้าน
import { Container, Row, Col, Button, Card, Spinner, Alert, Badge } from 'react-bootstrap'; // นำเข้าคอมโพเนนต์ UI จาก Bootstrap
import { useParams, useRouter } from 'next/navigation'; // useParams ใช้ดึง ID จาก URL, useRouter ใช้สำหรับย้อนกลับ

export default function ProductDetail() {
    // ดึงรหัสสินค้า (id) จาก URL พารามิเตอร์
    const { id } = useParams();
    const router = useRouter(); // ตัวช่วยในการย้อนหน้ากลับ
    // State สำหรับเก็บข้อมูลสินค้า ข้อมูลผู้ใช้ สถานะการโหลด และข้อความแจ้งเตือน
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [user, setUser] = useState(null);

    // ทำงานทันทีที่ ID ใน URL เปลี่ยนแปลงหรือโหลดหน้าครั้งแรก
    useEffect(() => {
        // ตรวจสอบสถานะการล็อกอินจาก LocalStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        // ดึงข้อมูลรายระเอียดสินค้าจาก API โดยระบุ ID ของสินค้าที่ต้องการ
        axios.get(`http://localhost:8080/api/products/${id}`)
            .then(res => {
                if (res.data.result) {
                    // หากสำเร็จ ให้เก็บข้อมูลสินค้าไว้ใน State product
                    setProduct(res.data.data);
                } else {
                    // หากไม่สำเร็จ ให้แสดงข้อความแจ้งเตือนความผิดพลาด
                    setMessage({ type: 'danger', text: res.data.errorMessage });
                }
                setLoading(false); // เมื่อโหลดเสร็จให้ปิดสถานะ Loading
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: 'danger', text: 'ไม่สามารถโหลดข้อมูลสินค้าได้' });
                setLoading(false);
            });
    }, [id]);

    // ฟังก์ชันสำหรับเพิ่มสินค้าชิ้นนี้ลงตะกร้า
    const addToCart = () => {
        // ตรวจสอบก่อนว่าล็อกอินหรือยัง
        if (!user) {
            setMessage({ type: 'warning', text: 'กรุณาเข้าสู่ระบบก่อนเลือกซื้อสินค้า' });
            return;
        }

        // ดึง Token มาแนบใน Header เพื่อบอก API ว่าเป็นตะกร้าของใคร
        const token = localStorage.getItem('token');
        axios.post('http://localhost:8080/api/cart',
            { p_id: product.p_id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => {
            if (res.data.result) {
                // แจ้งเตือนเมื่อเพิ่มสำเร็จ
                setMessage({ type: 'success', text: 'เพิ่มสินค้าลงในตะกร้าเรียบร้อยแล้ว' });
            } else {
                // แจ้งเตือนความผิดพลาดจากระบบหลังบ้าน
                setMessage({ type: 'danger', text: res.data.errorMessage });
            }
        }).catch(err => console.error(err));
    };

    // แสดงตัวหมุนรอโหลด (Spinner) ระหว่างที่ข้อมูลยังไม่ส่งกลับมา
    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" variant="primary" />
        </Container>
    );

    // แสดงข้อความ error กรณีไม่พบข้อมูลสินค้า
    if (!product && message) return (
        <Container className="mt-5">
            <Alert variant="danger" className="rounded-4 shadow-sm border-0">{message.text}</Alert>
        </Container>
    );

    return (
        <Container className="py-5">
            {/* ส่วนแสดงข้อความแจ้งเตือน (Alert) */}
            {message && (
                <Alert variant={message.type} dismissible onClose={() => setMessage(null)} className="mb-4 border-dark rounded-0">
                    {message.text}
                </Alert>
            )}
            
            {/* โครงสร้างแสดงข้อมูลสินค้าแบบ 2 คอลัมน์ (ซ้ายรูป - ขวาเนื้อหา) */}
            <Row className="g-0 border border-dark">
                <Col md={6} className="border-end border-dark">
                    {/* ส่วนแสดงรูปภาพสินค้า */}
                    <div className="p-4 bg-light h-100 d-flex align-items-center justify-content-center">
                        {product.p_image ? (
                            <img
                                src={`http://localhost:8080/product_images/${product.p_image}`}
                                alt={product.p_name}
                                className="img-fluid"
                                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
                            />
                        ) : (
                            <div className="bg-white d-flex align-items-center justify-content-center text-muted border border-dark" style={{ width: '200px', height: '200px' }}>
                                ไม่มีรูปภาพ
                            </div>
                        )}
                    </div>
                </Col>
                <Col md={6}>
                    {/* ส่วนแสดงเนื้อหารายละเอียดสินค้า */}
                    <div className="bg-white p-5">
                        <div className="small text-secondary mb-2">รายละเอียดสินค้า</div>
                        <h2 className="fw-bold mb-3">{product.p_name}</h2>
                        <h3 className="fw-bold mb-4">{product.p_price} บาท</h3>
                        <hr className="border-dark" />
                        
                        <div className="my-5">
                            {/* แสดงจำนวนสินค้าคงเหลือในคลัง (ดึงจาก p_stock) */}
                            <div className="mb-2 fw-bold">สถานะสินค้า:</div>
                            {product.p_stock > 0 ? (
                                <div className="text-dark">มีสินค้า ({product.p_stock} ชิ้น)</div>
                            ) : (
                                <div className="text-danger">สินค้าหมดชั่วคราว</div>
                            )}
                        </div>

                        {/* กลุ่มปุ่มคำสั่ง (เพิ่มลงตะกร้า / ย้อนกลับ) */}
                        <div className="d-grid gap-2 mt-5">
                            <Button
                                variant="dark"
                                size="lg"
                                onClick={addToCart}
                                // ปุ่มจะใช้งานไม่ได้ (Disabled) หากสินค้าในสต็อกเป็น 0
                                disabled={product.p_stock === 0}
                                className="rounded-0 py-3 fw-bold"
                            >
                                เพิ่มสินค้าลงตะกร้า
                            </Button>
                            <Button
                                variant="outline-dark"
                                size="lg"
                                // ฟังก์ชันย้อนกลับไปหน้าก่อนหน้า
                                onClick={() => router.back()}
                                className="rounded-0 py-3"
                            >
                                ย้อนกลับ
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
