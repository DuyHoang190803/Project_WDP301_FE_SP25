import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithGoogleAccount } from '../../../redux/slices/authSlice.js';
import AuthApi from '../../../api/AuthApi.js';
import * as constants from '../../../constants/index.js';
import { validateEmail, validatePassword } from '../../../utils/validation.js';
import styles from './Register.module.css';

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo, error } = useSelector((state) => state.user);

  const handleFinish = async (values) => {
    const { fullName, email, password } = values;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 8 characters long and contain at least 1 letter and 1 number.');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthApi.signUp(fullName, email, password);

      if (response?.data && response?.data?.status === constants.httpStatusCodes.HTTP_OK) {
        setSuccessMessage(constants.notificationMessages.SUCCESS_REGISTER);
      }
    } catch (error) {
      if (error.response && error.response?.data?.status === constants.httpStatusCodes.HTTP_CONFLICT) {
        setErrorMessage(constants.notificationMessages.ERROR_EMAIL_REGISTERED);
      } else {
        setErrorMessage('Đã xảy ra lỗi, vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginGoogleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    dispatch(loginWithGoogleAccount(token));
    navigate('/');
    if (error) {
      setErrorMessage(error);
    }
  };

  const handleLoginFailure = () => {
    setErrorMessage('Đăng nhập thất bại');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.registerCard}>
        <div className={styles.formSection}>
          <Title level={3} className={styles.formTitle}>
            Đăng Ký
          </Title>

          {errorMessage && (
            <Alert showIcon description={errorMessage} type="error" className={styles.errorMessage} />
          )}

          {successMessage && (
            <Alert showIcon description={successMessage} type="success" className={styles.successMessage} />
          )}

          <Form name="register" onFinish={handleFinish} layout="vertical" className={styles.authForm}>
            <Form.Item
              label="Họ và Tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              className={styles.formItem}
            >
              <Input
                prefix={<UserOutlined className={styles.inputPrefixIcon} />}
                placeholder="Họ và tên"
                size="large"
                className={styles.formInput}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
              className={styles.formItem}
            >
              <Input
                prefix={<MailOutlined className={styles.inputPrefixIcon} />}
                placeholder="Email"
                size="large"
                className={styles.formInput}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu (8-72 ký tự)"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              className={styles.formItem}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputPrefixIcon} />}
                placeholder="Mật khẩu"
                size="large"
                className={styles.formInput}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className={styles.submitButton}
              >
                Đăng Ký
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.loginPrompt}>
            <Text>
              Đã có tài khoản PetHeaven?{' '}
              <span onClick={() => navigate('/login')} className={styles.loginLink}>
                Đăng Nhập
              </span>
            </Text>
          </div>

          <Divider className={styles.divider}>Hoặc</Divider>

          <GoogleLogin
            onSuccess={handleLoginGoogleSuccess}
            onError={handleLoginFailure}
            className={styles.googleButton}
          />
        </div>

        <div className={styles.imageSection}>
          <img src="../images/petfood_background.jpg" alt="Project Progress" className={styles.sectionImage} />
        </div>
      </div>
    </div>
  );
};

export default Register;