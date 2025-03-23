import React, { useEffect, useState } from "react";
import { Card, Button, Descriptions, Tag, Space, message } from "antd";
import {
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import OrderApi from "../../../api/OrderApi";
import s from "./DetailOrder.module.css";

const statusColors = {
  PENDING: "orange",
  SHIPPING: "blue",
  COMPLETED: "green",
  CANCELED: "red",
};

const DetailOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await OrderApi.getOrderDetail(orderId);
        setOrder(response?.data || {});
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        message.error("Không thể lấy thông tin đơn hàng.");
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const updateStatus = async (newStatus) => {
    try {
      await OrderApi.updateOrderStatus(orderId, { status: newStatus });
      setOrder((prev) => ({ ...prev, status: newStatus }));
      message.success(`Cập nhật trạng thái đơn hàng thành: ${newStatus}`);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      message.error("Cập nhật trạng thái thất bại.");
    }
  };

  const printOrder = () => {
    window.print();
  };

  if (loading) return <p>Đang tải...</p>;
  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  return (
    <div className={s["detail-order-container"]}>
      <Card title={`Chi tiết đơn hàng: ${order._id}`} bordered>
        <Descriptions bordered>
          <Descriptions.Item label="Mã đơn hàng">{order._id}</Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {order.deliveryAddress.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusColors[order.status] || "default"}>
              {order.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sản phẩm">
            {order.items
              .map(
                (item) =>
                  `${item.briefInfo.name} (${item.briefInfo.variant}) x${item.briefInfo.quantity}`
              )
              .join(", ")}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {order.totalPrice.toLocaleString()} đ
          </Descriptions.Item>
          <Descriptions.Item label="Ngày đặt hàng">
            {new Date(order.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">
            {order.payment.method}
          </Descriptions.Item>
          <Descriptions.Item label="Đã thanh toán">
            {order.payment.paid ? "Có" : "Không"}
          </Descriptions.Item>
          <Descriptions.Item label="Phí vận chuyển">
            {order.shipping.fee.toLocaleString()} đ
          </Descriptions.Item>
          <Descriptions.Item label="Hình thức vận chuyển">
            {order.shipping.method}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng">
            {`${order.deliveryAddress.address}, ${order.deliveryAddress.ward.wardName}, ${order.deliveryAddress.district.districtName}, ${order.deliveryAddress.province.provinceName}`}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {order.deliveryAddress.phone}
          </Descriptions.Item>
        </Descriptions>
        <Space className={s["action-buttons"]}>
          <Button
            className={s["print-button"]}
            type="primary"
            icon={<PrinterOutlined />}
            onClick={printOrder}
          >
            In đơn hàng
          </Button>
          {order.status === "PENDING" && (
            <Button
              className={s["processing-button"]}
              type="default"
              icon={<SyncOutlined />}
              onClick={() => updateStatus("SHIPPING")}
            >
              Chuyển sang Đang giao
            </Button>
          )}
          {order.status === "SHIPPING" && (
            <Button
              className={s["complete-button"]}
              type="success"
              icon={<CheckCircleOutlined />}
              onClick={() => updateStatus("COMPLETED")}
            >
              Hoàn thành
            </Button>
          )}
          {order.status !== "CANCELED" && order.status !== "COMPLETED" && (
            <Button
              className={s["cancel-button"]}
              type="danger"
              icon={<CloseCircleOutlined />}
              onClick={() => updateStatus("CANCELED")}
            >
              Hủy đơn hàng
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default DetailOrder;