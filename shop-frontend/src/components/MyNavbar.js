"use client";
import React, { useEffect, useState } from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function MyNavbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/signin';
  };

  return (
    <Navbar expand="lg" fixed="top" className="bg-white border-bottom border-dark border-2">
      <Container>
        <Navbar.Brand as={Link} href="/" className="fw-bold text-dark">
          ดอนบ้านนาค้าขาย
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">หน้าหลัก</Nav.Link>
            {user && (
              <Nav.Link as={Link} href="/cart">
                ตะกร้าสินค้า
              </Nav.Link>
            )}
            {user && (
              <Nav.Link as={Link} href="/history">
                ประวัติการสั่งซื้อ
              </Nav.Link>
            )}
            {user && user.role === 'admin' && (
              <>
                <Nav.Link as={Link} href="/products" className="text-dark">
                  จัดการสินค้า
                </Nav.Link>
                <Nav.Link as={Link} href="/users" className="text-dark">
                  จัดการผู้ใช้
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center">
            {user ? (
              <>
                <Nav.Link disabled className="text-dark me-2">
                  ผู้ใช้งาน: {user.f_name}
                </Nav.Link>
                <Button 
                  variant="outline-dark" 
                  size="sm" 
                  className="rounded-0"
                  onClick={logout}
                >
                  ออกจากระบบ
                </Button>
              </>
            ) : (
              <Button 
                as={Link} 
                href="/signin" 
                variant="dark" 
                className="rounded-0 px-4"
              >
                เข้าสู่ระบบ
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

