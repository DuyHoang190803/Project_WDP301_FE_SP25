import React from "react";
import { Outlet } from "react-router-dom";
import AdminTab from "../../components/AdminTab";
import { LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

const AdminLayout = () => {
  const { userInfo } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const handleLogout = () => {

    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  return (
    <div style={{ display: "flex", overflow: "hidden" }}>
      <AdminTab />
      <div style={{ flex: 1, marginLeft: "230px" }}>
        <div
          className="header-admin"
          style={{
            height: "100px",
            backgroundColor: "#34495e",
            position: "fixed",
            top: 0,
            left: "220px",
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            color: "white",
            zIndex: 1000,
          }}
        >
          <span style={{ fontSize: "18px" }}>Xin chào, {userInfo.fullName}!</span>
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "white",
            }}
            onClick={handleLogout}
          >
            <LogOut size={24} />
          </button>
        </div>
        <div style={{ padding: "120px 20px 20px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
