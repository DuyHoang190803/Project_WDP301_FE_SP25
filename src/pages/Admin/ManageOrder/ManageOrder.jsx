import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Input, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Chart from "react-google-charts";
import OrderApi from "../../../api/OrderApi";
import s from "./ManageOrder.module.css";

const { Option } = Select;

const statusColors = {
  PENDING: "orange",
  SHIPPING: "blue",
  COMPLETED: "green",
  CANCELED: "red",
};

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await OrderApi.getAllOrder();
        const ordersData = response?.data?.rows || [];

        // Format lại dữ liệu phù hợp với bảng
        const formattedOrders = ordersData.map((order) => ({
          key: order._id,
          orderId: order._id,
          customer: order.deliveryAddress.fullName, // Lấy tên khách hàng từ địa chỉ giao hàng
          status: order.status,
          total: order.totalPrice.toLocaleString() + " đ", // Format tiền tệ
        }));

        setOrders(formattedOrders);
        setDisplayOrders(formattedOrders);
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
      }
    };

    fetchOrders();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const filteredOrders = orders.filter(
      (order) =>
        order.orderId.includes(searchText) ||
        order.customer.toLowerCase().includes(searchText.toLowerCase())
    );
    setDisplayOrders(filteredOrders);
  };

  // Xử lý lọc theo trạng thái
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    if (status) {
      setDisplayOrders(orders.filter((order) => order.status === status));
    } else {
      setDisplayOrders(orders);
    }
  };

  // Xử lý điều hướng khi click vào đơn hàng
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Cột của bảng
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (text, record) => (
        <a onClick={() => handleViewOrder(record.orderId)}>{text}</a>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
    },
  ];

  // Dữ liệu cho biểu đồ tổng quan
  const orderStats = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    { PENDING: 0, SHIPPING: 0, COMPLETED: 0, CANCELED: 0 }
  );

  const dataChart = [
    ["Trạng thái", "Số lượng"],
    ["Chờ xử lý", orderStats.PENDING],
    ["Đang giao", orderStats.SHIPPING],
    ["Hoàn thành", orderStats.COMPLETED],
    ["Đã hủy", orderStats.CANCELED],
  ];

  const optionsChart = {
    title: "Tổng quan Orders",
  };

  return (
    <div className="order-management-container">
      <h1 style={{ textAlign: "left" }}>Quản lý đơn hàng</h1>

      {/* Biểu đồ tổng quan */}
      <div style={{ marginBottom: "20px" }}>
        <Chart
          chartType="PieChart"
          data={dataChart}
          options={optionsChart}
          height={"400px"}
        />
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <Space className={s["filter-bar"]}>
        <Input
          placeholder="Tìm kiếm đơn hàng..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button type="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>
        <Select
          placeholder="Lọc theo trạng thái"
          className={s["status-filter"]}
          onChange={handleStatusChange}
          allowClear
        >
          {Object.keys(statusColors).map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </Space>

      {/* Bảng danh sách đơn hàng */}
      <Table
        columns={columns}
        dataSource={displayOrders}
        className={s["order-table"]}
      />
    </div>
  );
};

export default ManageOrder;
