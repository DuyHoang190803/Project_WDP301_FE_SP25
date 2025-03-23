import React, { useState } from "react";
import { Table, Button } from "antd";
import UserApi from "../../api/UserApi";
// import Header from "../../components/Header/Header";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setUsers([]);
    setLoading(true);
    try {
      const response = await UserApi.getAllUsers();
      setUsers(response.data.rows);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: ["user", "fullName"],
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: ["user", "phone"],
      key: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (roles) => roles.join(", "),
    },
    {
      title: "Địa chỉ",
      dataIndex: ["user", "address"],
      key: "address",
    },
    {
      title: "Ngày tạo",
      dataIndex: ["user", "createdAt"],
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* <Header/> */}
      <Button type="primary" onClick={fetchUsers} loading={loading}>
        Get All Users
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default UserList;
