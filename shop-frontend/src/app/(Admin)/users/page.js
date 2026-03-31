"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Modal } from 'react-bootstrap';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userHistory, setUserHistory] = useState([]);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            // ดึงรายชื่อผู้ใช้ทั้งหมด (รวมฟิลด์ total_spent จาก Backend)
            const res = await axios.get('http://localhost:8080/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.result) {
                setUsers(res.data.data || []);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'ไม่สามารถดึงข้อมูลได้' });
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        fetchUsers();
    }, []);

    const deleteUser = (id) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (id === currentUser.u_id) {
            alert("ไม่สามารถลบบัญชีผู้ใช้งานได้");
            return;
        }

        if (!confirm('ต้องการลบผู้ใช้งานนี้หรือไม่')) return;
        
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.result) {
                setMessage({ type: 'success', text: 'ลบผู้ใช้งานสำเร็จ' });
                fetchUsers();
            } else {
                setMessage({ type: 'danger', text: res.data.errorMessage });
            }
        }).catch(err => console.error(err));
    };

    const fetchUserHistory = async (user) => {
        setSelectedUser(user);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`http://localhost:8080/api/users/${user.u_id}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.result) {
                setUserHistory(res.data.data || []);
                setShowHistory(true);
            }
        } catch (err) {
            console.error(err);
            alert("ไม่สามารถดึงประวัติการสั่งซื้อได้");
        }
    };

    return (
        <div>
            <h1>การจัดการผู้ใช้งาน</h1>
            {message && <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>{message.text}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Role</th>
                        <th>ยอดซื้อสะสม</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.u_id}>
                            <td>{u.u_id}</td>
                            <td>{u.username}</td>
                            <td>{u.f_name}</td>
                            <td>{u.l_name}</td>
                            <td>{u.role}</td>
                            <td>{u.total_spent.toLocaleString()} บาท</td>
                            <td>
                                <Button variant="info" size="sm" className="me-2" onClick={() => fetchUserHistory(u)}>ประวัติการสั่งซื้อ</Button>
                                <Button variant="danger" size="sm" onClick={() => deleteUser(u.u_id)} disabled={JSON.parse(localStorage.getItem('user'))?.u_id === u.u_id}>ลบผู้ใช้งาน</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showHistory} onHide={() => setShowHistory(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>ประวัติการสั่งซื้อ: {selectedUser?.f_name} {selectedUser?.l_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {userHistory.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>สินค้า</th>
                                    <th>จำนวน</th>
                                    <th>ราคาที่ซื้อ</th>
                                    <th>วันที่</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userHistory.map((h) => (
                                    <tr key={h.h_id}>
                                        <td>{h.p_name}</td>
                                        <td>{h.quantity}</td>
                                        <td>{h.price_buy.toLocaleString()} บาท</td>
                                        <td>{new Date(h.date).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p className="text-center">ไม่พบประวัติการสั่งซื้อ</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowHistory(false)}>ปิด</Button>
                </Modal.Footer>
            </Modal>
        </div>

        
    );
}
