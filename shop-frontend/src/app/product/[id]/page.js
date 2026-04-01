"use client"; 
import React, { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { Container, Row, Col, Button, Card, Spinner, Alert, Badge } from 'react-bootstrap';  
import { useParams, useRouter } from 'next/navigation'; 

export default function ProductDetail() {
    //จัดการstate
    const { id } = useParams();//ดึงพารามิเตอร์
    const router = useRouter(); 
    const [product, setProduct] = useState(null);//รายละเอียดสินค้าโหลดมาจากapi
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);//เเจ้งเตือนปัญหา
    const [user, setUser] = useState(null);//เก็บuserที่ล็อคอินอยู่

    
    //ดึงข้อมูลเข้าหน้าเว็บ
    useEffect(() => {
         //มีการล็อคอินไหม
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        axios.get(`http://localhost:8080/api/products/${id}`)//ดึงid
            .then(res => {
                if (res.data.result) {
                    setProduct(res.data.data);
                } else {
                    
                    setMessage({ type: 'danger', text: res.data.errorMessage });
                }
                setLoading(false); 
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: 'danger', text: 'ไม่สามารถโหลดข้อมูลสินค้าได้' });
                setLoading(false);
            });
    }, [id]);

    
    //ฟังก์ชั่นทำงาน
    const addToCart = () => {
        if (!user) {
            setMessage({ type: 'warning', text: 'กรุณาเข้าสู่ระบบก่อนเลือกซื้อสินค้า' });
            return;
        }


        const token = localStorage.getItem('token');
        axios.post('http://localhost:8080/api/cart',
            { p_id: product.p_id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => {
            if (res.data.result) {
                setMessage({ type: 'success', text: 'เพิ่มสินค้าลงในตะกร้าเรียบร้อยแล้ว' });
            } else {
                setMessage({ type: 'danger', text: res.data.errorMessage });
            }
        }).catch(err => console.error(err));
    };

   
    //เเสดงผลUi
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
            
           
            <Row className="g-0 border border-dark">
                <Col md={6} className="border-end border-dark">
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
                   
                    <div className="bg-white p-5">
                        <div className="small text-secondary mb-2">รายละเอียดสินค้า</div>
                        <h2 className="fw-bold mb-3">{product.p_name}</h2>
                        <h3 className="fw-bold mb-4">{product.p_price} บาท</h3>
                        <hr className="border-dark" />
                        
                        <div className="my-5">
                            <div className="mb-2 fw-bold">สถานะสินค้า:</div>
                            {product.p_stock > 0 ? (
                                <div className="text-dark">มีสินค้า ({product.p_stock} ชิ้น)</div>
                            ) : (
                                <div className="text-danger">สินค้าหมดชั่วคราว</div>
                            )}
                        </div>

                      
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
