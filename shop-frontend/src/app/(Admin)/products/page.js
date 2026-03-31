"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';

export default function Products() {
    //stateเก็บข้อมูล
    const [products, setProducts] = useState([]);
    const [show, setShow] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ p_id: '', p_name: '', p_price: '', p_stock: '' });
    const [isEdit, setIsEdit] = useState(false);

    //ดึงข้อมูลสินค้าทั้งหมด (Read)
    const fetchProducts = () => {
        axios.get('http://localhost:8080/api/products')
            .then(res => setProducts(res.data.data || []))
            .catch(err => console.error(err));
    };

    //ทำงานทันทีเมื่อโหลดหน้านี้
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        //ถ้าเป็นเเอดมินดึงข้อมูลมาเเสดง
        fetchProducts();
    }, []);

    //หน้าต่างpop-up
    //ปิดmodel
    const handleClose = () => {
        setShow(false);
        setCurrentProduct({ p_id: '', p_name: '', p_price: '', p_stock: '' });
    };

    //เปิดmodel,เพิ่ม/เเก้ไข
    const handleShow = (prod = null) => {
        setIsEdit(!!prod);
        if (prod) setCurrentProduct(prod);
        setShow(true);
    };


    //บันทึกจากการ add,edit
    const saveProduct = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');//ดึง t ยืนยัน api
        const headers = { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        };
        
        //ส่งไปapi
        const formData = new FormData();
        formData.append('p_name', currentProduct.p_name);
        formData.append('p_price', currentProduct.p_price);
        formData.append('p_stock', currentProduct.p_stock);
        if (currentProduct.image) {
            formData.append('image', currentProduct.image);
        }

        const url = isEdit ? `http://localhost:8080/api/products/${currentProduct.p_id}` : 'http://localhost:8080/api/products';
        const method = isEdit ? 'put' : 'post';

        axios[method](url, formData, { headers })
            .then(() => {
                fetchProducts();//บันทึกละอัพเดตตาราง
                handleClose();
            }).catch(err => console.error(err));
    };

    //delete
    const deleteProduct = (id) => {
        if (!confirm('คุณต้องการลบสินค้าใช่หรือไม่')) return;
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => fetchProducts())//ลบเเล้วนำข้อมูลมาอัพเดตตาราง
          .catch(err => console.error(err));
    };
    
    //เเสดงผล Ui
    return (
        <div>
            <div className="d-flex justify-content-between mb-3">
                <h1>แก้ไขสินค้าและอัปเดตสินค้า</h1>
                <Button variant="primary" onClick={() => handleShow()}>เพิ่มรายการสินค้า</Button>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>รูปสินค้า</th>
                        <th>ชื่อ</th>
                        <th>ราคา</th>
                        <th>สต็อก</th>
                        <th>สำหรับแก้ไขและลบสินค้า</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.p_id}>
                            <td>{p.p_id}</td>
                            <td>
                                {p.p_image && <img src={`http://localhost:8080/product_images/${p.p_image}`} alt={p.p_name} style={{ width: '50px' }} />}
                            </td>
                            <td>{p.p_name}</td>
                            <td>${p.p_price}</td>
                            <td>{p.p_stock}</td>
                            <td>
                                <Button variant="warning" size="sm" className="me-2" onClick={() => handleShow(p)}>แก้ไขสินค้า</Button>
                                <Button variant="danger" size="sm" onClick={() => deleteProduct(p.p_id)}>ลบสินค้า</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/*ปุ่มเพิ่ม,เเก้ไขสินค้าหน้าเว็บ*/}
            <Modal show={show} onHide={handleClose}> 
                <ModalHeader closeButton>
                    <ModalTitle>{isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Form id="productForm" onSubmit={saveProduct}>
                        <Form.Group className="mb-3">
                            <Form.Label>ชื่อสินค้า</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={currentProduct.p_name} 
                                onChange={(e) => setCurrentProduct({...currentProduct, p_name: e.target.value})} 
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>ราคา</Form.Label>
                            <Form.Control 
                                type="number" 
                                value={currentProduct.p_price} 
                                onChange={(e) => setCurrentProduct({...currentProduct, p_price: e.target.value})} 
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>สต็อก</Form.Label>
                            <Form.Control 
                                type="number" 
                                value={currentProduct.p_stock} 
                                onChange={(e) => setCurrentProduct({...currentProduct, p_stock: e.target.value})} 
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>รูปสินค้า</Form.Label>
                            <Form.Control 
                                type="file" 
                                onChange={(e) => setCurrentProduct({...currentProduct, image: e.target.files[0]})} 
                            />
                        </Form.Group>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="primary" type="submit" form="productForm">บันทึก</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
