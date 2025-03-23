import React, { useState, useEffect } from "react";
import { Row, Col, Button, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import styles from "./Profile.module.css"; // Import CSS module
import { useSelector } from "react-redux";
import UserApi from "../../../api/userApi";

function MyProfile() {
  const [userData, setUserData] = useState(null);
  const { userInfo } = useSelector((state) => state.user);

  // Lấy accountId từ userInfo
  const accountId = userInfo?.accountId;

  // Gọi API để lấy thông tin người dùng khi component mount
  useEffect(() => {
    if (accountId) {
      UserApi.getUserById(accountId)
        .then((response) => {
          const data = response?.data?.data;
          console.log("User data:", data?.email);

          setUserData({
            email: data?.email,
            fullName: data?.userId?.fullName,
          });
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [accountId]);

  return (
    <div className={styles.profileContainer}>
      <Row>
        <Col>
          <h1 className={styles.title}>Hồ Sơ Của Tôi</h1>
          <Divider className={styles.divider} />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Thông tin người dùng */}
        <Col xs={24} md={12}>
          <div className={styles.profileInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Họ và tên</span>
              <span className={styles.value}>
                {userData?.fullName || "Chưa cập nhật"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>
                {userData?.email || "Chưa cập nhật"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Số điện thoại</span>
              <span className={styles.value}>
                {userData?.phone || "Chưa cập nhật"}
              </span>
            </div>
          </div>
        </Col>

        {/* Ảnh đại diện mặc định */}
        <Col xs={24} md={12}>
          <div className={styles.imageUploadSection}>
            <div className={styles.avatarWrapper}>
              <UserOutlined style={{ fontSize: "50px", color: "#a3a3a3" }} />
              <div className={styles.uploadHint}>Ảnh mặc định</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Nút lưu */}
      <Row justify="end" className={styles.saveButtonRow}>
        <Button type="primary" size="large" className={styles.saveButton}>
          Lưu
        </Button>
      </Row>
    </div>
  );
}

export default MyProfile;