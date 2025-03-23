import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/common/AdminTab.css"; // Import file CSS

const AdminTab = () => {
  return (
    <div className="admin-tab">
      <h2 className="admin-title">
        <Link to="/admin/dashboard" className="dashboard-link">DashBoard</Link>
      </h2>
      <ul className="admin-menu">
        <li className="admin-item"><Link to="/admin/users">Tài khoản</Link></li>
        <li className="admin-item"><Link to="/admin/categories">Danh mục</Link></li>
        <li className="admin-item"><Link to="/admin/products">Sản phẩm</Link></li>
        <li className="admin-item"><Link to="/admin/orders">Đơn hàng</Link></li>
      </ul>
    </div>
  );
};

export default AdminTab;
