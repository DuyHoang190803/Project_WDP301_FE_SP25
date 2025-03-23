import React, { useEffect, useState } from "react";
import { Menu, Input, Card, Divider, Spin, Alert, Pagination, Button, Modal, Radio, Input as AntInput } from "antd";
import styles from "./Order.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/slices/orderSlice";
import * as constants from "../../../constants/index.js";
import { useNavigate } from "react-router-dom";
import OrderApi from "../../../api/OrderApi";

const Order = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, totalOrders, page, pageSize, totalPages, loading, error } = useSelector(
    (state) => state.order
  );
  const [status, setStatus] = useState(constants?.orderStatus?.ALL);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(page);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    dispatch(fetchOrders({ status, query, page: currentPage, pageSize: 10 }));
  }, [status, query, currentPage, dispatch]);

  console.log("orders", orders);

  const handleOrderClick = (orderId) => {
    navigate(`/account/order/${orderId}`);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const showCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setCancelReason("");
    setOtherReason("");
    setSelectedOrderId(null);
    setErrorMessage("");
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

      const response = await OrderApi.cancelOrder(selectedOrderId, constants.orderStatus.CANCELED, finalReason);

      console.log("Hủy đơn hàng:", selectedOrderId, "Lý do:", finalReason);

      dispatch(fetchOrders({ status, query, page: currentPage, pageSize: 10 }));
      handleCancelModal();

      return response;
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      setErrorMessage("Hủy đơn hàng thất bại! Vui lòng thử lại!");
    }
  };

  return (
    <div className={styles.orderContainer}>
      <div className={styles.orderFilter}>
        <Menu
          mode="horizontal"
          selectedKeys={[status]}
          onClick={({ key }) => {
            setStatus(key);
            setCurrentPage(1);
          }}
          className={styles.orderMenu}
        >
          <Menu.Item key={constants?.orderStatus?.ALL}>Tất cả</Menu.Item>
          <Menu.Item key={constants?.orderStatus?.PENDING}>Chờ xác nhận</Menu.Item>
          <Menu.Item key={constants?.orderStatus?.APPROVED}>Đã xác nhận</Menu.Item>
          <Menu.Item key={constants?.orderStatus?.DELIVERING}>Đang giao hàng</Menu.Item>
          <Menu.Item key={constants?.orderStatus?.DELIVERED}>Đã giao</Menu.Item>
          <Menu.Item key={constants?.orderStatus?.CANCELED}>Đã hủy</Menu.Item>
        </Menu>
        <div className={styles.searchWrapper}>
          <Input
            id="product-search"
            placeholder="Tìm theo tên sản phẩm..."
            className={styles.searchInput}
            value={query}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading && <Spin size="large" className={styles.loading} />}
      {error && <Alert message={error} type="error" showIcon className={styles.alert} />}

      <div className={styles.productList}>
        {orders.length === 0 && !loading ? (
          <p className={styles.noOrder}>Không có đơn hàng nào.</p>
        ) : (
          orders.map((order) => (
            <Card
              key={order._id}
              className={styles.orderCard}
              onClick={() => handleOrderClick(order._id)}
              hoverable
            >
              <h3 className={styles.orderStatus}>{order.status}</h3>
              <Divider className={styles.divider} />
              {order.items.map((item, index) => (
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
                      <p className={styles.productInfo}>
                        <strong>Phân loại:</strong> {item.briefInfo.variant}
                      </p>
                    )}
                    <p className={styles.productInfo}>
                      <strong>Số lượng:</strong> {item.briefInfo.quantity}
                    </p>
                    <p className={styles.productInfo}>
                      <strong>Giá:</strong> {item.briefInfo.price.toLocaleString()} VND
                    </p>
                  </div>
                </div>
              ))}
              <div className={styles.orderSummary}>
                <p className={styles.summaryText}>
                  <strong>Tổng tiền:</strong> {order.totalPrice.toLocaleString()} VND
                </p>
                {order.status === constants?.orderStatus?.CANCELED && (
                  <div className={styles.cancelInfo}>
                    <p className={styles.cancelReason}>
                      <strong>Lý do hủy:</strong> <span>{order.canceledReason}</span>
                    </p>
                    <p className={styles.cancelTime}>
                      <strong>Thời gian tạo:</strong> <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                )}
                {order.status === constants?.orderStatus?.PENDING && (
                  <Button
                    type="primary"
                    danger
                    onClick={(e) => {
                      e.stopPropagation();
                      showCancelModal(order._id);
                    }}
                    style={{ marginTop: '16px' }}
                  >
                    Hủy đơn
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

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

      {totalOrders > 0 && (
        <div className={styles.paginationContainer}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalOrders}
            onChange={handlePageChange}
            showSizeChanger={false}
            simple={false}
          />
        </div>
      )}
    </div>
  );
};

export default Order;