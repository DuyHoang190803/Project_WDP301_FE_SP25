import React, { useEffect, useState } from 'react';
import { Steps, Card, Divider, Spin, Alert, Button, Modal, Radio, Input as AntInput } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetail } from '../../../../redux/slices/orderSlice';
import styles from './OrderDetail.module.css';
import OrderApi from "../../../../api/OrderApi";
import * as constants from "../../../../constants/index.js";

const OrderDetail = () => {
    const { orderId } = useParams();
    console.log(orderId);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orderDetail, loading, error } = useSelector((state) => state.order);
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [otherReason, setOtherReason] = useState('');

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderDetail(orderId));
        }
    }, [orderId, dispatch]);

    console.log(orderDetail);

    if (loading) return <Spin size="large" className={styles.loading} />;
    if (error) return <Alert message={`Error: ${error}`} type="error" className={styles.alert} />;
    if (!orderDetail) return <p>Không tìm thấy đơn hàng.</p>;

    const statusSteps = {
        PENDING: 0,
        APPROVED: 1,
        DELIVERING: 2,
        DELIVERED: 3,
        CANCELED: -1,
    };
    const currentStep = statusSteps[orderDetail.status] || 0;

    const showCancelModal = () => {
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setCancelReason('');
        setOtherReason('');
        setErrorMessage('');
    };

    const handleConfirmCancel = async () => {
        try {
            if (!cancelReason) {
                setErrorMessage("Vui lòng chọn lý do hủy hàng!");
                return;
            }

            if (cancelReason === "Khác" && (!otherReason || otherReason.trim() === "")) {
                setErrorMessage("Vui lòng nhập lý do hủy hàng!");
                return;
            }

            const finalReason = cancelReason === "Khác" ? otherReason : cancelReason;

            const response = await OrderApi.cancelOrder(orderId, constants.orderStatus.CANCELED, finalReason);

            console.log("Hủy đơn hàng:", orderId, "Lý do:", finalReason);

            handleCancelModal();
            navigate('/account/order');

            return response;
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            setErrorMessage("Hủy đơn hàng thất bại! Vui lòng thử lại!");
        }
    };

    return (
        <div className={styles.orderDetailContainer}>
            {orderDetail.status !== 'CANCELED' && (
                <Card className={styles.orderProgressCard}>
                    <Steps
                        current={currentStep >= 0 ? currentStep : 0}
                        size="default"
                        items={[
                            { title: 'Chờ xác nhận' },
                            { title: 'Đã xác nhận' },
                            { title: 'Đang giao hàng' },
                            { title: 'Đã giao' },
                        ]}
                        className={styles.orderSteps}
                    />
                </Card>
            )}

            {orderDetail.status === 'CANCELED' && (
                <Card className={styles.infoCard}>
                    <Alert
                        message="Đơn hàng đã bị hủy"
                        type="error"
                        showIcon
                        className={styles.alert}
                    />
                    <Divider className={styles.divider} />
                    <div className={styles.infoContent}>
                        <p><strong>Lý do hủy:</strong> {orderDetail.canceledReason}</p>
                        <p><strong>Thời gian hủy đơn:</strong> {new Date(orderDetail.createdAt).toLocaleString()}</p>
                    </div>
                </Card>
            )}

            <Card className={styles.infoCard}>
                <h3 className={styles.sectionTitle}>Địa chỉ nhận hàng</h3>
                <Divider className={styles.divider} />
                <div className={styles.infoContent}>
                    <p><strong>Tên người nhận:</strong> {orderDetail.deliveryAddress.fullName}</p>
                    <p><strong>Số điện thoại:</strong> {orderDetail.deliveryAddress.phone}</p>
                    <p>
                        <strong>Địa chỉ:</strong> {orderDetail.deliveryAddress.address},{' '}
                        {orderDetail.deliveryAddress.ward.wardName},{' '}
                        {orderDetail.deliveryAddress.district.districtName},{' '}
                        {orderDetail.deliveryAddress.province.provinceName}
                    </p>
                    <p>
                        <strong>Thời gian đặt hàng:</strong>{' '}
                        {new Date(orderDetail.createdAt).toLocaleString()}
                    </p>
                </div>
            </Card>

            <Card className={styles.infoCard}>
                <h3 className={styles.sectionTitle}>Thông tin đơn hàng</h3>
                <Divider className={styles.divider} />
                <div className={styles.orderItems}>
                    {orderDetail.items.map((item, index) => (
                        <div key={index} className={styles.orderItem}>
                            <img
                                src={item.briefInfo.image || "https://placehold.co/200x200?text=Product+Image"}
                                alt={item.briefInfo.name}
                                className={styles.productImage}
                                onError={(e) => (e.target.src = "https://placehold.co/200x200?text=Product+Image")}
                            />
                            <div className={styles.productDetails}>
                                <p className={styles.productName}>{item.briefInfo.name}</p>
                                {item.briefInfo.variant && (
                                    <p><strong>Phân loại:</strong> {item.briefInfo.variant}</p>
                                )}
                                <p><strong>Số lượng:</strong> {item.briefInfo.quantity}</p>
                                <p>
                                    <strong>Giá:</strong> {item.briefInfo.price.toLocaleString()} VND
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className={styles.infoCard}>
                <h3 className={styles.sectionTitle}>Thông tin thanh toán</h3>
                <Divider className={styles.divider} />
                <div className={styles.paymentDetails}>
                    <div className={styles.paymentRow}>
                        <span>Phương thức thanh toán:</span>
                        <span className={styles.paymentAmount}>{orderDetail.payment.method}</span>
                    </div>
                    <div className={styles.paymentRow}>
                        <span>Tổng tiền hàng:</span>
                        <span className={styles.paymentAmount}>
                            {(orderDetail.totalPrice - orderDetail.shipping.fee).toLocaleString()} VND
                        </span>
                    </div>
                    <div className={styles.paymentRow}>
                        <span>Phí vận chuyển:</span>
                        <span className={styles.paymentAmount}>
                            {orderDetail.shipping.fee.toLocaleString()} VND
                        </span>
                    </div>
                    <Divider className={styles.divider} />
                    <div className={styles.paymentRow}>
                        <span className={styles.totalLabel}>Thành tiền:</span>
                        <span className={styles.finalAmount}>
                            {orderDetail.totalPrice.toLocaleString()} VND
                        </span>
                    </div>
                    {orderDetail.status === 'PENDING' && (
                        <Button
                            type="primary"
                            danger
                            onClick={showCancelModal}
                            style={{ marginTop: '16px' }}
                        >
                            Hủy đơn
                        </Button>
                    )}
                </div>
            </Card>

            <Modal
                title="Hủy đơn hàng"
                visible={isModalVisible}
                onCancel={handleCancelModal}
                footer={[
                    <Button key="cancel" onClick={handleCancelModal}>
                        Hủy
                    </Button>,
                    <Button key="confirm" type="primary" onClick={handleConfirmCancel}>
                        Xác nhận
                    </Button>,
                ]}
            >
                <p>
                    Nếu bạn xác nhận hủy, toàn bộ đơn hàng sẽ bị hủy. Hãy cho chúng tôi biết tại sao bạn hủy hàng nhé:
                </p>
                <Radio.Group
                    style={{ display: 'flex', flexDirection: 'column' }}
                    onChange={(e) => {
                        setCancelReason(e.target.value);
                        setErrorMessage("");
                    }}
                    value={cancelReason}
                >
                    <Radio value="Không còn nhu cầu mua nữa">Tôi không còn nhu cầu mua nữa</Radio>
                    <Radio value="Không tìm thấy lý do hủy phù hợp">Tôi không tìm thấy lý do hủy phù hợp</Radio>
                    <Radio value="Không muốn tiết lộ">Tôi không muốn tiết lộ</Radio>
                    <Radio value="Thủ tục thanh toán rắc rối">Thủ tục thanh toán rắc rối</Radio>
                    <Radio value="Khác">Khác</Radio>
                </Radio.Group>
                {cancelReason === "Khác" && (
                    <AntInput.TextArea
                        rows={4}
                        placeholder="Vui lòng nhập lý do khác"
                        value={otherReason}
                        onChange={(e) => {
                            setOtherReason(e.target.value);
                            setErrorMessage("");
                        }}
                        style={{ marginTop: 10 }}
                    />
                )}
                {errorMessage && (
                    <p style={{ color: 'red', marginTop: 10 }}>
                        {errorMessage}
                    </p>
                )}
            </Modal>
        </div>
    );
};

export default OrderDetail;