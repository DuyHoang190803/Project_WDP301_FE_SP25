import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Typography, Button } from 'antd';
import styles from './VNPayReturn.module.css';
import OrderApi from '../../../../api/orderApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function VNPayReturn() {
    const [paymentStatus, setPaymentStatus] = useState('pending'); // Trạng thái: pending, success, failed
    const [orderDetails, setOrderDetails] = useState({});
    const navigate = useNavigate();
    const hasCalledApi = useRef(false); // Sử dụng useRef để theo dõi việc gọi API

    useEffect(() => {
        // Chỉ gọi API nếu chưa gọi trước đó
        if (hasCalledApi.current) return;
        hasCalledApi.current = true;

        // Lấy thông tin từ URL
        const queryParams = new URLSearchParams(window.location.search);
        const vnpParams = {
            amount: queryParams.get('vnp_Amount'),
            orderInfo: queryParams.get('vnp_OrderInfo'),
            payDate: queryParams.get('vnp_PayDate'),
            txnRef: queryParams.get('vnp_TxnRef'),
            responseCode: queryParams.get('vnp_ResponseCode'),
        };

        // Chuyển đổi dữ liệu từ URL thành định dạng hiển thị
        const amountInVND = vnpParams.amount
            ? (parseInt(vnpParams.amount) / 100).toLocaleString('vi-VN') + ' VND'
            : 'N/A';
        const formattedPayDate = vnpParams.payDate
            ? `${vnpParams.payDate.slice(0, 4)}-${vnpParams.payDate.slice(4, 6)}-${vnpParams.payDate.slice(
                6,
                8
            )} ${vnpParams.payDate.slice(8, 10)}:${vnpParams.payDate.slice(10, 12)}:${vnpParams.payDate.slice(
                12,
                14
            )}`
            : 'N/A';

        // Cập nhật dữ liệu để hiển thị
        setOrderDetails({
            totalAmount: amountInVND,
            orderInfo: decodeURIComponent(vnpParams.orderInfo || 'N/A'),
            payDate: formattedPayDate,
            transactionCode: vnpParams.txnRef || 'N/A',
        });

        // Xử lý orderData từ localStorage
        const handleOrderCreation = async () => {
            try {
                const storedOrderData = JSON.parse(localStorage.getItem('orderData'));
                if (!storedOrderData) {
                    throw new Error('Không tìm thấy thông tin đơn hàng trong localStorage');
                }

                // Cập nhật phần payment trong orderData
                storedOrderData.payment = {
                    method: 'CREDIT_CARD',
                    paid: vnpParams.responseCode === '00', // 00 là mã thành công của VNPay
                    paymentId: vnpParams.txnRef,
                    transactionDate: vnpParams.payDate,
                    refunded: false,
                };

                console.log('Dữ liệu đơn hàng:', storedOrderData);

                // Gọi API để tạo đơn hàng
                const response = await OrderApi.createOrder(storedOrderData);
                console.log('Phản hồi từ API:', response);

                // Nếu thành công, cập nhật trạng thái
                if (response) {
                    setPaymentStatus('success');
                    localStorage.removeItem('orderData'); // Xóa orderData sau khi thành công
                }
            } catch (error) {
                console.error('Lỗi khi tạo đơn hàng:', error);
                setPaymentStatus('failed');
            }
        };

        handleOrderCreation();
    }, []); // Dependency array rỗng để chỉ chạy một lần khi component mount

    // Dữ liệu cho bảng
    const dataSource = [
        {
            key: '1',
            label: 'Thông tin đơn hàng',
            value: orderDetails.orderInfo || 'N/A',
        },
        {
            key: '2',
            label: 'Tổng tiền',
            value: orderDetails.totalAmount || 'N/A',
        },
        {
            key: '3',
            label: 'Thời gian thanh toán',
            value: orderDetails.payDate || 'N/A',
        },
        {
            key: '4',
            label: 'Mã giao dịch',
            value: orderDetails.transactionCode || 'N/A',
        },
    ];

    // Cấu hình cột bảng
    const columns = [
        {
            title: 'Thông tin',
            dataIndex: 'label',
            key: 'label',
            width: '40%',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Chi tiết',
            dataIndex: 'value',
            key: 'value',
        },
    ];

    return (
        <div className={styles.container}>
            <Card
                className={styles.paymentCard}
                title={
                    <Title level={2} className={styles.successTitle}>
                        {paymentStatus === 'success'
                            ? 'Thanh toán thành công'
                            : paymentStatus === 'failed'
                                ? 'Thanh toán thất bại'
                                : 'Đang xử lý thanh toán'}
                    </Title>
                }
            >
                <Title level={4}>Chi tiết đơn hàng</Title>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    bordered
                    className={styles.paymentTable}
                />
                <div className={styles.footer}>
                    <Button type="primary" onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default VNPayReturn;