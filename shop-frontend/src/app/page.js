"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import Link from 'next/link';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        axios.get('http://localhost:8080/api/products')
            .then(res => setProducts(res.data.data || []))
            .catch(err => console.error(err));
    }, []);

    const addToCart = (p_id) => {
        if (!user) {
            setMessage({ type: 'warning', text: 'กรุณาเข้าสู่ระบบก่อนเลือกซื้อสินค้า' });
            return;
        }

        const token = localStorage.getItem('token');
        axios.post('http://localhost:8080/api/cart',
            { p_id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => {
            if (res.data.result) {
                setMessage({ type: 'success', text: 'เพิ่มสินค้าลงในตะกร้าเรียบร้อยแล้ว' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'danger', text: res.data.errorMessage });
            }
        }).catch(err => console.error(err));
    };

    return (
        <div className="pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-dark pb-2">
                <h2 className="mb-0">รายการสินค้า</h2>
                <div className="text-secondary small">
                    มีทั้งหมด {products.length} รายการ
                </div>
            </div>

            {message && (
                <Alert 
                    variant={message.type} 
                    dismissible 
                    onClose={() => setMessage(null)}
                    className="mb-4 border-dark rounded-0"
                >
                    {message.text}
                </Alert>
            )}

            <Row xs={1} sm={2} lg={4} className="g-4">
                {products.map((product) => (
                    <Col key={product.p_id}>
                        <Card className="h-100 border-dark">
                            <div className="bg-light" style={{ height: '150xpx', overflow: 'hidden', borderBottom: '1px solid #000' }}>
                                {product.p_image ? (
                                    <img 
                                        src={`http://localhost:8080/product_images/${product.p_image}`} 
                                        alt={product.p_name}
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small">ยังไม่มีรูปภาพ</div>
                                )}
                            </div>
                            <Card.Body className="p-3 d-flex flex-column">
                                <h6 className="fw-bold text-truncate mb-2">{product.p_name}</h6>
                                <p className="fw-bold mb-3">{product.p_price} บาท</p>
                                
                                <div className="mt-auto d-grid gap-2">
                                    <Button
                                        variant={product.p_stock > 0 ? "dark" : "secondary"}
                                        size="sm"
                                        className="rounded-0"
                                        onClick={() => addToCart(product.p_id)}
                                        disabled={product.p_stock === 0}
                                    >
                                        {product.p_stock === 0 ? "สินค้าหมด" : "หยิบใส่ตะกร้า"}
                                    </Button>
                                    <Button 
                                        as={Link} 
                                        href={`/product/${product.p_id}`} 
                                        variant="outline-dark" 
                                        size="sm"
                                        className="rounded-0"
                                    >
                                        ดูรายละเอียด
                                    </Button>
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-white border-0 py-2 small border-top border-dark">
                                คงเหลือ: {product.p_stock} ชิ้น
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

