"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Alert, Nav, Container } from 'react-bootstrap';

export default function Signin() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [f_name, setFname] = useState('');
    const [l_name, setLname] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isLogin ? 'http://localhost:8080/api/login' : 'http://localhost:8080/api/register';
        const data = isLogin ? { username, password } : { username, password, f_name, l_name };

        axios.post(url, data)
            .then(res => {
                if (res.data.result) {
                    if (isLogin) {
                        localStorage.setItem('token', res.data.token);
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                        window.location.href = '/';
                    } else {
                        setIsLogin(true);
                        setError({ type: 'success', text: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ' });
                    }
                } else {
                    setError({ type: 'danger', text: res.data.errorMessage || 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
                }
            }).catch(err => setError({ type: 'danger', text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' }));
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '450px', borderRadius: '15px' }}>
                <Card.Header className="bg-transparent border-0 pt-4">
                    <Nav variant="pills" className="justify-content-center mb-3">
                        <Nav.Item>
                            <Nav.Link 
                                active={isLogin} 
                                onClick={() => setIsLogin(true)}
                                style={{ cursor: 'pointer', borderRadius: '20px' }}
                            >
                                เข้าสู่ระบบ
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={!isLogin} 
                                onClick={() => setIsLogin(false)}
                                style={{ cursor: 'pointer', borderRadius: '20px' }}
                            >
                                สมัครสมาชิก
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <h3 className="text-center fw-bold mt-2">
                        {isLogin ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีใหม่'}
                    </h3>
                </Card.Header>
                <Card.Body className="px-4 pb-5">
                    {error && <Alert variant={error.type} className="rounded-3 px-3 py-2 small mb-4">{error.text}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="row g-2 mb-3">
                                <div className="col">
                                    <Form.Label className="small text-muted">ชื่อจริง</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="ชื่อ"
                                        value={f_name} 
                                        onChange={(e) => setFname(e.target.value)} 
                                        required 
                                        className="rounded-3"
                                    />
                                </div>
                                <div className="col">
                                    <Form.Label className="small text-muted">นามสกุล</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="นามสกุล"
                                        value={l_name} 
                                        onChange={(e) => setLname(e.target.value)} 
                                        required 
                                        className="rounded-3"
                                    />
                                </div>
                            </div>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted">ชื่อผู้ใช้</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Username"
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                className="rounded-3"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="small text-muted">รหัสผ่าน</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Password"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="rounded-3"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 rounded-pill py-2 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                            {isLogin ? 'เข้าสู่ระบบ' : 'ลงชื่อเข้าใช้งาน'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

