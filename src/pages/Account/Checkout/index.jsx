import React, { useState, useEffect } from "react";
import styles from "./Checkout.module.css";
import { Card, Col, Row, Button, Modal, Divider } from "antd";
import { CreditCard, Truck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createAddress, editAddress, listAddresses } from "../../../redux/actions/addressActions";
import CreateAddressModal from "../../../components/Address/Modal/CreateAddress";
import EditAddressModal from "../../../components/Address/Modal/EditAddress";
import OrderApi from "../../../api/OrderApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [qrCodeURL, setQrCodeURL] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);

    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { cartItems, totalPrice, note } = location.state || {};
    const { userInfo } = useSelector((state) => state.user);
    const { addresses, loading, error } = useSelector((state) => state.addresses);


    useEffect(() => {
        dispatch(listAddresses());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedAddress && addresses) {
            const defaultAddr = addresses.find((address) => address.isDefault);
            setSelectedAddress(defaultAddr);
        }
    }, [addresses, selectedAddress]);

    const defaultAddress = selectedAddress || addresses?.find((address) => address.isDefault);

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleCreateAddress = () => {
        setCreateModalVisible(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModalVisible(false);
    };

    const handleCreateAddressSubmit = async (values) => {
        dispatch(createAddress(values));
        setCreateModalVisible(false);
    };

    const handleEditAddress = (address) => {
        setAddressToEdit(address);
        setEditModalVisible(true);
    };

    const handleCloseEditModal = () => {
        setEditModalVisible(false);
    };

    const handleUpdateAddress = async (addressId, updatedAddress) => {
        dispatch(editAddress(addressId, updatedAddress));
        setEditModalVisible(false);
    };

    const handleChangeAddress = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        setIsModalVisible(false);
    };

    const shippingFee = 10000;
    const totalAmount = totalPrice + shippingFee;

    const handleCreateOrder = async () => {
        try {
            const now = new Date();
            const transactionDate =
                now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, "0") +
                now.getDate().toString().padStart(2, "0") +
                now.getHours().toString().padStart(2, "0") +
                now.getMinutes().toString().padStart(2, "0") +
                now.getSeconds().toString().padStart(2, "0");

            console.log("Thông tin đơn hàng:", cartItems);


            const orderData = {
                items: cartItems.map((item) => {
                    const hasVariant = item.variantId &&
                        item.productId.options &&
                        Array.isArray(item.productId.options) &&
                        item.productId.options.length > 0;

                    const briefInfo = {
                        quantity: item.quantity,
                        price: item.variantId?.price || item.productId.price,
                        name: item.productId.name,
                    };

                    if (hasVariant && item.variantId?.optionIndex) {
                        const variantNames = item.productId.options
                            .map((option, index) => {
                                const optionIdx = item.variantId.optionIndex[index];
                                return option?.values &&
                                    Array.isArray(option.values) &&
                                    option.values[optionIdx]
                                    ? option.values[optionIdx].name
                                    : "";
                            })
                            .filter(Boolean)
                            .join(", ");

                        if (variantNames) {
                            briefInfo.variant = variantNames;
                        }
                    }

                    return {
                        productId: item.productId._id,
                        ...(item.variantId && { variantId: item.variantId._id }),
                        briefInfo,
                    };
                }),
                deliveryAddress: {
                    fullName: selectedAddress.fullName,
                    phone: selectedAddress.phone,
                    address: selectedAddress.address,
                    province: {
                        provinceId: selectedAddress.province.provinceId,
                        provinceName: selectedAddress.province.provinceName,
                    },
                    district: {
                        districtId: selectedAddress.district.districtId,
                        districtName: selectedAddress.district.districtName,
                    },
                    ward: {
                        wardId: selectedAddress.ward.wardId,
                        wardName: selectedAddress.ward.wardName,
                    },
                },
                payment: {
                    method: paymentMethod,
                    paid: false,
                    refunded: false,
                    transactionDate: transactionDate,
                },
                shipping: {
                    method: "STANDARD",
                    fee: shippingFee,
                },
                status: "PENDING",
                totalPrice: totalAmount,
            };

            console.log("Thông tin đơn hàng:", orderData);

            if (paymentMethod === "COD") {
                const response = await OrderApi.createOrder(orderData);
                console.log("Phản hồi từ API:", response);

                toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm!", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                setTimeout(() => navigate("/"), 3000);

                return response;
            } else if (paymentMethod === "bankTransfer") {
                const response = await OrderApi.createPaymentUrl(totalAmount, "NCB", "vi");
                console.log("Phản hồi từ API:", response?.data?.paymentUrl);

                if (response?.data?.paymentUrl) {
                    localStorage.setItem("orderData", JSON.stringify(orderData));
                    window.open(response?.data?.paymentUrl, "_blank");

                    toast.info("Vui lòng hoàn tất thanh toán trong tab mới!", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else {
                    throw new Error("Không nhận được URL thanh toán từ API");
                }
            }


        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);

            toast.error("Đặt hàng thất bại! Vui lòng thử lại!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            throw error;
        }
    };

    return (
        <div className={`${styles.checkoutContainer} container`}>
            <h1 className={styles.checkoutTitle}>Thông tin giao hàng</h1>

            {/* Product List */}
            <div className={styles.productList}>
                <Card className={styles.orderInfoCard}>
                    <h3 className={styles.sectionTitle}>Thông Tin Đơn Hàng</h3>
                    <div>
                        {cartItems && cartItems.length > 0 ? (
                            cartItems.map((item, index) => {
                                const productOptions = item.productId.options || [];
                                const optionIndexes = item.variantId?.optionIndex || [];
                                const optionImage =
                                    productOptions.length > 0 &&
                                        optionIndexes.length > 0 &&
                                        productOptions[0]?.values[optionIndexes[0]]?.image?.url
                                        ? productOptions[0].values[optionIndexes[0]].image.url
                                        : item.productId.thumbnail?.url || "https://placehold.co/100x100";

                                return (
                                    <Row
                                        key={index}
                                        gutter={16}
                                        align="middle"
                                        className={styles.orderItem}
                                    >
                                        <Col span={3} className={styles.productImageCol}>
                                            <img
                                                src={optionImage}
                                                alt={item.productId.name}
                                                className={styles.productImage}
                                            />
                                        </Col>
                                        <Col span={9} className={styles.productDetails}>
                                            <p className={styles.productName}>{item.productId.name}</p>
                                            <p className={styles.productPrice}>
                                                <strong>Đơn giá:</strong>{" "}
                                                {(item.variantId?.price || item.productId.price).toLocaleString()} VND
                                            </p>
                                            {productOptions.length > 0 ? (
                                                productOptions.map((option, optionIndex) => (
                                                    <div key={optionIndex}>
                                                        <strong>{option.name}: </strong>
                                                        <span>
                                                            {option.values[optionIndexes[optionIndex]]?.name || "Không xác định"}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>Không có tùy chọn</p>
                                            )}
                                        </Col>
                                        <Col span={6} className={styles.quantityCol}>
                                            <p className={styles.largeText}>
                                                <strong>Số lượng:</strong> {item.quantity}
                                            </p>
                                        </Col>
                                        <Col span={6} className={styles.totalPriceCol}>
                                            <p className={styles.largeText}>
                                                <strong>Thành tiền:</strong>{" "}
                                                {((item.variantId?.price || item.productId.price) * item.quantity).toLocaleString()} VND
                                            </p>
                                        </Col>
                                    </Row>
                                );
                            })
                        ) : (
                            <p>Không có sản phẩm nào trong giỏ hàng.</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Address Info */}
            <div className={styles.addressInfo}>
                <Card className={styles.addressInfoCard}>
                    <h3 className={styles.sectionTitle}>Địa chỉ nhận hàng</h3>
                    {defaultAddress ? (
                        <div className={styles.addressContainer}>
                            <div>
                                <p>
                                    <strong>Họ và tên:</strong> {defaultAddress.fullName}
                                </p>
                                <p>
                                    <strong>Số điện thoại:</strong> {defaultAddress.phone}
                                </p>
                                <p>
                                    <strong>Địa chỉ:</strong> {defaultAddress.address},{" "}
                                    {defaultAddress.ward.wardName}, {defaultAddress.district.districtName},{" "}
                                    {defaultAddress.province.provinceName}
                                </p>
                            </div>
                            <Button className={styles.changeAddressButton} onClick={handleChangeAddress}>
                                Thay đổi
                            </Button>
                        </div>
                    ) : (
                        <div className={styles.noAddressContainer}>
                            <p>Chưa có địa chỉ nào được thêm.</p>
                            <Button type="primary" onClick={handleCreateAddress}>
                                Thêm địa chỉ
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Payment Method */}
            <div className={styles.paymentMethod}>
                <Card className={styles.paymentMethodCard}>
                    <h3 className={styles.sectionTitle}>Phương thức thanh toán</h3>
                    <div className={styles.paymentOptions}>
                        <label className={styles.option}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked={paymentMethod === "COD"}
                                onChange={handlePaymentMethodChange}
                            />
                            <Truck className={styles.icon} />
                            Thanh toán khi giao hàng (COD)
                        </label>
                        <label className={styles.option}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="bankTransfer"
                                checked={paymentMethod === "bankTransfer"}
                                onChange={handlePaymentMethodChange}
                            />
                            <CreditCard className={styles.icon} />
                            Thanh toán bằng ví VNPay
                        </label>
                    </div>

                    {paymentMethod === "bankTransfer" && qrCodeURL && (
                        <div className={styles.qrCodeContainer}>
                            <h3 className={styles.qrCodeTitle}>Mã QR thanh toán</h3>
                            <img src={qrCodeURL} alt="QR Code" className={styles.qrCodeImage} />
                        </div>
                    )}

                    <Divider />
                    {/* Payment Summary */}
                    <div className={styles.paymentSummary}>
                        <Card className={styles.paymentSummaryCard}>
                            <h3 className={styles.sectionTitle}>Tổng Tiền</h3>
                            <div className={styles.summaryItems}>
                                <Row className={styles.summaryRow}>
                                    <Col span={12}>
                                        <strong>Tổng tiền hàng:</strong>
                                    </Col>
                                    <Col span={12} className={styles.amount}>
                                        {totalPrice.toLocaleString()} VND
                                    </Col>
                                </Row>
                                <Row className={styles.summaryRow}>
                                    <Col span={12}>
                                        <strong>Tổng tiền phí vận chuyển:</strong>
                                    </Col>
                                    <Col span={12} className={styles.amount}>
                                        {shippingFee.toLocaleString()} VND
                                    </Col>
                                </Row>
                                <Row className={styles.summaryRow}>
                                    <Col span={12}>
                                        <strong>Tổng thanh toán:</strong>
                                    </Col>
                                    <Col span={12} className={styles.amount}>
                                        {totalAmount.toLocaleString()} VND
                                    </Col>
                                </Row>
                            </div>
                            <Divider />
                            <div className={styles.completeOrderButtonContainer}>
                                <button
                                    className={styles.completeOrderButton}
                                    onClick={handleCreateOrder}
                                    disabled={!defaultAddress} // Disable nút nếu không có địa chỉ
                                >
                                    Đặt hàng
                                </button>
                            </div>
                        </Card>
                    </div>
                </Card>
            </div>

            {/* Create Address Modal */}
            <CreateAddressModal
                visible={createModalVisible}
                onClose={handleCloseCreateModal}
                onCreate={handleCreateAddressSubmit}
            />

            {/* Edit Address Modal */}
            <EditAddressModal
                visible={editModalVisible}
                onClose={handleCloseEditModal}
                onEdit={handleUpdateAddress}
                address={addressToEdit}
            />

            {/* Modal to select address */}
            <Modal
                title="Chọn địa chỉ giao hàng"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                className={styles.addressModal}
            >
                <div className={styles.addressList}>
                    {addresses?.map((address) => (
                        <Card
                            key={address._id}
                            className={`${styles.addressCard} ${address.isDefault ? styles.defaultAddress : ""} ${selectedAddress?._id === address._id ? styles.selectedAddress : ""}`}
                            onClick={() => handleSelectAddress(address)}
                        >
                            <p>
                                <strong>Họ và tên:</strong> {address.fullName}
                            </p>
                            <p>
                                <strong>Số điện thoại:</strong> {address.phone}
                            </p>
                            <p>
                                <strong>Địa chỉ:</strong> {address.address}, {address.ward.wardName},{" "}
                                {address.district.districtName}, {address.province.provinceName}
                            </p>
                            {address.isDefault && <span className={styles.defaultTag}>Mặc định</span>}
                            <Button
                                type="link"
                                className={styles.editButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAddress(address);
                                }}
                            >
                                Chỉnh sửa
                            </Button>
                        </Card>
                    ))}
                    <Button
                        type="primary"
                        onClick={handleCreateAddress}
                        className={styles.addNewAddressButton}
                    >
                        Thêm địa chỉ mới
                    </Button>
                </div>
            </Modal>

            {/* Thêm ToastContainer */}
            <ToastContainer />
        </div>
    );
}

export default Checkout;