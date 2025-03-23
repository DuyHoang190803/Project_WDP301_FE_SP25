import React, { useCallback, useEffect, useState } from "react";
import s from "./ManageUsers.module.css";
import { AliwangwangOutlined, TeamOutlined } from "@ant-design/icons";
import { Space, Table, Tag, Input, Button, Modal, Checkbox, Radio } from "antd";
import { Chart } from "react-google-charts";
import UserApi from "../../../api/UserApi";
import AuthApi from "../../../api/AuthApi";
import { roleOptions } from "./constants";

const { Search } = Input;

const ManageUsers = () => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userTable, setUserTable] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false); // Thêm loading state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false); // Modal phân quyền
  const [selectedRoles, setSelectedRoles] = useState([]); // State cho quyền được chọn
  const [reason, setReason] = useState("");

  const fetchUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const { page = 1, pageSize = 10, filters = {}, sort = {} } = params;

      const apiParams = {
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.search && { search: filters.search }), // Đồng bộ với backend
        ...(filters.role && { role: Array.isArray(filters.role) ? filters.role.join(',') : filters.role }),
        ...(filters.status && { isBlocked: filters.status.toString() }),
        ...(sort.field && { sortField: sort.field }),
        ...(sort.order && { sortOrder: sort.order === "ascend" ? "asc" : "desc" }),
      };

      const data = await UserApi.getAllUsers(apiParams);

      const users = data.data?.rows || [];
      setUserTable(users);
      setFilteredUsers(users);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.data?.total || users.length,
      });
    } catch (error) {
      console.error("Lỗi fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers({ page: 1, pageSize: 10 });
  }, [fetchUsers]);

  const handleSearch = useCallback((value) => {
    fetchUsers({
      page: 1,
      pageSize: pagination.pageSize,
      filters: { search: value?.toLowerCase().trim() },
    });
  }, [fetchUsers, pagination.pageSize]);

  const handleTableChange = (paginationConfig, filters, sorter) => {
    const filterParams = {
      role: filters.role,
      status: filters.status,
    };

    const sortParams = {
      field: sorter.field,
      order: sorter.order,
    };

    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      total: paginationConfig.total,
    });

    fetchUsers({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      filters: filterParams,
      sort: sortParams,
    });
  };

  const showModal = (record) => {
    setSelectedUser(record);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      const payload = {
        accountId: selectedUser._id,
        status: { // Sửa lỗi cú pháp: status là một object
          isBlocked: !selectedUser.status.isBlocked,
          reasonBlock: selectedUser.status.isBlocked ? null : reason
        }
      };

      const response = await AuthApi.updateUser(payload);


      if (response.status === 200) { // HttpStatusCode.Ok
        // Refresh danh sách sau khi cập nhật
        await fetchUsers({
          page: pagination.current,
          pageSize: pagination.pageSize,
        });
        setIsModalOpen(false);
        setReason("");
        setSelectedUser(null);
        // Có thể thêm thông báo thành công
        // message.success("Cập nhật trạng thái thành công");
      } else {
        throw new Error(response.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modal phân quyền
  const showRoleModal = (record) => {
    setSelectedUser(record);
    setSelectedRoles(record.role[0] || []); // Load quyền hiện tại của user
    setIsRoleModalOpen(true);
  };

  const handleRoleOk = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const payload = {
        accountId: selectedUser._id,
        role: [selectedRoles], // Gửi mảng quyền đã chọn
      };
      const response = await AuthApi.updateUser(payload); // Cần tạo API này
      if (response.status === 200) {
        await fetchUsers({
          page: pagination.current,
          pageSize: pagination.pageSize,
        });
        setIsRoleModalOpen(false);
        setSelectedUser(null);
        setSelectedRoles([]);
      } else {
        throw new Error(response.message || "Cập nhật quyền thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleCancel = () => {
    setIsRoleModalOpen(false);
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  const handleRoleChange = (checkedValues) => {
    setSelectedRoles(checkedValues);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setReason("");
    setSelectedUser(null);
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: ["user", "fullName"],
      key: "fullName",
      sorter: true,
      render: (text) => <a>{text}</a>,
      width: "20%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "20%",
    },
    {
      title: "Vai trò",
      key: "role",
      dataIndex: "role",
      filters: [
        { text: "User", value: "USER" },
        { text: "Admin", value: "ADMIN" },
        { text: "Employee", value: "EMPLOYEE" },
      ],
      render: (_, { role }) => (
        <Space>
          {role.map((tag) => {
            const color = tag === "ADMIN" ? "green" : "blue";
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </Space>
      ),
      width: "25%",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: ["status", "isBlocked"],
      filters: [
        { text: "Hoạt động", value: false },
        { text: "Bị chặn", value: true },
      ],
      render: (isBlocked) => (
        <Tag color={isBlocked ? "red" : "green"}>
          {isBlocked ? "Bị chặn" : "Hoạt động"}
        </Tag>
      ),
      width: "15%",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type={record.status.isBlocked ? "primary" : "default"}
            danger={!record.status.isBlocked}
            onClick={() => showModal(record)}
            loading={loading && selectedUser?.id === record.id}
            disabled={record.role.includes("ADMIN")} // Vô hiệu hóa nếu role là admin
          >
            {record.status.isBlocked ? "Kích hoạt" : "Chặn"}
          </Button>
          <Button
            type="default"
            onClick={() => showRoleModal(record)}
            disabled={record.role.includes("ADMIN")} // Vô hiệu hóa nếu role là admin
          >
            Phân quyền
          </Button>
        </Space>
      ),
      width: "20%",
    }
  ];

  const dataChart = [
    ["Loại", "Người"],
    ["Đã mua hàng", 93],
    ["Chưa mua hàng", 234],
  ];

  const optionsChart = {
    title: "Phân tích khách mua hàng",
  };

  return (
    <div>
      <h1 className={s["title"]}>Quản lý tài khoản</h1>
      <div className={s["manage-users-container"]}>
        <div className={s["stat-card"]}>
          <AliwangwangOutlined style={{ fontSize: "40px" }} />
          <div className={s["stat-title"]}>Khách hàng: </div>
          <div className={s["stat-value"]}>11,450</div>
          <div className={`${s["stat-change"]} ${s["positive"]}`}>
            + 215 người mới
          </div>
        </div>
        <div className={s["stat-card"]}>
          <TeamOutlined style={{ fontSize: "40px" }} />
          <div className={s["stat-title"]}>Nhân viên: </div>
          <div className={s["stat-value"]}>9</div>
          <div className={`${s["stat-change"]} ${s["positive"]}`}>
            + 2 người mới
          </div>
        </div>
        <div className={s["stat-card-chart"]}>
          <Chart chartType="PieChart" data={dataChart} options={optionsChart} />
        </div>
      </div>

      <div className={s["target-container"]}>
        <h3>Bảng thống kê người dùng</h3>
        <Search
          placeholder="Tìm kiếm theo tên hoặc email..."
          allowClear
          enterButton="Tìm kiếm"
          onSearch={handleSearch}
          className={s["search-input"]}
          disabled={loading}
        />

        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
          onChange={handleTableChange}
          rowKey={(record) => record.id} // Thêm rowKey để tránh warning
        />
      </div>

      <Modal
        title={selectedUser?.status.isBlocked ? "Xác nhận kích hoạt" : "Xác nhận chặn"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <p>
          {selectedUser?.status.isBlocked
            ? "Bạn có chắc chắn muốn kích hoạt tài khoản này không?"
            : "Bạn có chắc chắn muốn chặn tài khoản này không?"}
        </p>
        {!selectedUser?.status.isBlocked && (
          <Input.TextArea
            placeholder="Nhập lý do chặn"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        )}
      </Modal>


      {/* Modal phân quyền */}

      <Modal
        title="Phân quyền cho người dùng"
        open={isRoleModalOpen}
        onOk={handleRoleOk}
        onCancel={handleRoleCancel}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <p>Chọn vai trò cho {selectedUser?.user.fullName || selectedUser?.email}:</p>
        <Radio.Group
          options={roleOptions}
          value={selectedRoles}
          onChange={(e) => handleRoleChange(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ManageUsers;