import React from "react";
import { Button, Image, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./ActiveUsers.module.css";

const { Title, Paragraph } = Typography;

const ActiveUsers = () => {
  const navigate = useNavigate();

  // Xử lý chuyển hướng khi bấm nút
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} bordered={false}>
        <Image
          className={styles.image}
          src="/images/tick-image.png"
          alt="Success"
          preview={false}
        />
        <Title level={2} className={styles.title}>
          Account Activated
        </Title>
        <Paragraph className={styles.message}>
          Your account has been activated successfully! <br />
          You can now log in and enjoy our services.
        </Paragraph>
        <Button className={styles.button} onClick={handleLoginRedirect}>
          Continue to Login
        </Button>
      </Card>
    </div>
  );
};

export default ActiveUsers;
