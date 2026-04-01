"use client";//ทำงานฝั่งbrowser 
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Button, Badge } from 'react-bootstrap';//ถ้ามีการimport รูปไม่ได้ให้ใช้โคดส่วนนี้

export default function History() {
    //สร้างstate เก็บประวัติสั่งซื้อ เริ่ม[]
    const [history, setHistory] = useState([]);

    useEffect(() => {
        //เช็คว่าล็อคอินหรือยัง
        const token = localStorage.getItem('token');
        //ถ้าไม่มีการล็อคอินกลับไปหน้า/sigin
        if (!token) {
            window.location.href = '/signin';
            return;
        }
       
        //ดึงAPI
        axios.get('http://localhost:8080/api/history', { 
            headers: { Authorization: `Bearer ${token}` }// ยืนยันตัวตนกับ backend
        }).then(res => setHistory(res.data.data || []))//สำเร็จเก็บในhistory
          .catch(err => console.error(err));
    }, []);

    //จัดการวันที่
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };

    //เเสดงผลUi
    return (
        <Container className="py-5">
            <div className="mb-4 border-bottom border-dark pb-2">
                <h3 className="fw-bold">ประวัติการสั่งซื้อ</h3>
                <div className="text-secondary small">ทั้งหมด {history.length} รายการ</div>
            </div>

            <div className="border border-dark overflow-hidden">
                <Table bordered hover responsive className="mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="py-2">วันที่/เวลา</th>
                            <th className="py-2">รายการสินค้า</th>
                            <th className="py-2 text-center">จำนวน</th>
                            <th className="py-2 text-end">ราคา</th>
                            <th className="py-2 text-end">ยอดรวม</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item.h_id}>
                                <td className="py-2 small">{formatDate(item.date)}</td>
                                <td className="py-2 fw-bold">{item.p_name}</td>
                                <td className="py-2 text-center">{item.quantity}</td>
                                <td className="py-2 text-end">{item.price_buy} บาท</td>
                                <td className="py-2 text-end fw-bold">{item.price_buy * item.quantity} บาท</td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-5">
                                    -- ยังไม่มีประวัติการสั่งซื้อ --
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
}

