"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Alert, Card, Form, Badge } from 'react-bootstrap';
import Link from 'next/link';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [message, setMessage] = useState(null);

    const fetchCart = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/signin';
            return;
        }

        axios.get('http://localhost:8080/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setCartItems(res.data.data || []))
          .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = (c_id, newQuantity) => {
        if (newQuantity < 1) return;
        const token = localStorage.getItem('token');
        axios.put(`http://localhost:8080/api/cart/${c_id}`, { quantity: newQuantity }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
            fetchCart();
        }).catch(err => {
            console.error("Update failed:", err);
            setMessage({ type: 'danger', text: 'ไม่สามารถปรับจำนวนได้ กรุณาลองใหม่อีกครั้ง' });
        });
    };

    const removeFromCart = (c_id) => {
        if (!confirm('ต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?')) return;
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/cart/${c_id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => fetchCart())
          .catch(err => console.error(err));
    };

    const checkout = () => {
        const token = localStorage.getItem('token');
        axios.post('http://localhost:8080/api/checkout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.result) {
                setMessage({ type: 'success', text: 'สั่งซื้อสินค้าสำเร็จ! ขอบคุณที่ใช้บริการ' });
                setCartItems([]);
            } else {
                setMessage({ type: 'danger', text: res.data.errorMessage });
            }
        }).catch(err => console.error(err));
    };

    const total = cartItems.reduce((acc, item) => acc + (item.p_price * item.quantity), 0);

    return (
        <Container className="py-5">
            <div className="d-flex align-items-center mb-4">
                <h1 className="h2 mb-0 me-3">ตะกร้าของคุณ</h1>
                <Badge bg="light" text="dark" pill className="border">
                    {cartItems.length} รายการ
                </Badge>
            </div>

            {message && (
                <Alert variant={message.type} dismissible onClose={() => setMessage(null)} className="rounded-3 shadow-sm">
                    {message.text}
                </Alert>
            )}
            
            {cartItems.length > 0 ? (
                <Row className="g-0 border border-dark">
                    <Col lg={8} className="border-end border-dark">
                        <div className="bg-white p-3">
                            <h5 className="border-bottom border-dark pb-2 mb-3 fw-bold">ตะกร้าสินค้า</h5>
                            {cartItems.map((item) => (
                                <div key={item.c_id} className="border-bottom py-3 last-child-border-0">
                                    <Row className="align-items-center">
                                        <Col xs={4} md={2}>
                                            <div className="border border-dark bg-light p-1" style={{ width: '60px', height: '60px' }}>
                                                {item.p_image ? (
                                                    <img 
                                                        src={`http://localhost:8080/product_images/${item.p_image}`} 
                                                        alt={item.p_name}
                                                        className="w-100 h-100"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                                                        -
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                        <Col xs={8} md={6}>
                                            <div className="fw-bold">{item.p_name}</div>
                                            <div className="small">{item.p_price} บาท</div>
                                        </Col>
                                        <Col xs={12} md={4} className="mt-3 mt-md-0 d-flex align-items-center justify-content-between">
                                            <div className="input-group input-group-sm rounded-0" style={{ width: '90px' }}>
                                                <Button 
                                                    variant="outline-dark" 
                                                    className="rounded-0"
                                                    onClick={() => updateQuantity(item.c_id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </Button>
                                                <Form.Control 
                                                    readOnly 
                                                    value={item.quantity} 
                                                    className="text-center bg-white border-dark rounded-0" 
                                                />
                                                <Button 
                                                    variant="outline-dark" 
                                                    className="rounded-0"
                                                    onClick={() => updateQuantity(item.c_id, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <Button 
                                                variant="link" 
                                                className="text-dark p-0 text-decoration-underline small"
                                                onClick={() => removeFromCart(item.c_id)}
                                            >
                                                ลบรายการ
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>
                    </Col>
                    
                    <Col lg={4}>
                        <div className="bg-light p-4 h-100">
                            <h5 className="fw-bold mb-4">สรุปยอดเงิน</h5>
                            <div className="d-flex justify-content-between mb-3">
                                <span>ราคารวม:</span>
                                <span>{total} บาท</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-secondary small">
                                <span>ค่าจัดส่ง:</span>
                                <span>ฟรี</span>
                            </div>
                            <hr className="border-dark" />
                            <div className="d-flex justify-content-between mb-5">
                                <h5 className="fw-bold">ยอดสุทธิ:</h5>
                                <h4 className="fw-bold">{total} บาท</h4>
                            </div>
                            <Button 
                                variant="dark" 
                                size="lg" 
                                className="w-100 fw-bold py-3 mb-2 rounded-0" 
                                onClick={checkout}
                            >
                                ยืนยันการสั่งซื้อ
                            </Button>
                            <Button 
                                as={Link}
                                variant="link" 
                                className="w-100 text-dark text-decoration-none small mt-2" 
                                href="/"
                            >
                                เลือกซื้อสินค้าต่อ
                            </Button>
                        </div>
                    </Col>
                </Row>
            ) : (
                <div className="text-center py-5 bg-white rounded-5 shadow-sm">
                    <div className="mb-4" style={{ fontSize: '64px' }}>🛒</div>
                    <h3 className="text-muted fw-light mb-4">ยังไม่มีสินค้าในตะกร้าของคุณ</h3>
                    <Button as={Link} variant="primary" className="rounded-pill px-5 py-2" href="/">ไปเลือกซื้อสินค้า</Button>
                </div>
            )}
        </Container>
    );
}

