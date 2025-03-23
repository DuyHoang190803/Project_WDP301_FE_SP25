import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Card, Alert, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ResetPassword.module.css";
import AuthApi from "../../../api/AuthApi";
import * as constants from '../../../constants/index.js';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isSuccess, setIsSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      message.error("Token không hợp lệ!");
      setIsTokenValid(false);
      setIsCheckingToken(false);
      return;
    }

    const checkToken = async () => {
      try {
        const response = await AuthApi.checkResetTokenExprided(token);
        console.log(response?.data?.email);

        if (response?.status === 200) {
          setIsTokenValid(true);
          setUserEmail(response?.data?.email || "");
        } else {
          setIsTokenValid(false);
        }
      } catch (error) {
        setIsTokenValid(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!validatePassword(newPassword)) {
      setErrorMessage("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu không khớp!");
      return;
    }

    if (!token) {
      setErrorMessage("Token không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const response = await AuthApi.resetPassword(token, newPassword);
      if (response.data.status === 201) {
        setIsSuccess(constants.notificationMessages.SUCCESS_PASSWORD_RESET);
        form.resetFields();
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title level={3} className={styles.title}>
          Đặt lại mật khẩu của bạn
        </Title>

        {isCheckingToken ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
          </div>
        ) : isTokenValid === false ? (
          <Alert
            message={constants.notificationMessages.ERROR_RESET_TOKEN_INVALID}
            type="error"
            showIcon
            style={{ marginBottom: "20px" }}
          />
        ) : isSuccess ? (
          <div style={{ textAlign: "center" }}>
            <Alert
              message={isSuccess}
              type="success"
              showIcon
              style={{ marginBottom: "20px" }}
            />
            <Button type="primary" onClick={handleContinueToLogin} size="large">
              Tiếp tục đăng nhập
            </Button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                style={{ marginBottom: "20px" }}
              />
            )}
            <Text className={styles.subText}>
              Thay đổi mật khẩu cho tài khoản: <strong>{userEmail}</strong>
            </Text>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                  { max: 72, message: "Mật khẩu không được vượt quá 72 ký tự!" },
                  {
                    validator: (_, value) => {
                      if (!value || validatePassword(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số!"));
                    },
                  },
                ]}
                className={styles.formItem}
              >
                <Input.Password
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                    },
                  }),
                ]}
                className={styles.formItem}
              >
                <Input.Password
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.button}
                  loading={loading}
                >
                  Thay đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
