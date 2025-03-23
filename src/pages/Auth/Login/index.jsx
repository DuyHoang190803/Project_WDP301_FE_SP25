import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Alert, Modal } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginWithGoogleAccount } from '../../../redux/slices/authSlice.js';
import AuthApi from '../../../api/AuthApi.js';
import * as constants from '../../../constants/index.js';
import Cookies from 'js-cookie';
import { validateEmail, validatePassword } from '../../../utils/validation.js';
import styles from './Login.module.css';



const { Title, Text } = Typography;

const Login = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  useEffect(() => {
    if (userInfo && Object.keys(userInfo).length > 0) {
      const userRole = userInfo.role;
      console.log(userRole);

      if (userRole.includes(constants.userRoles.ROLE_ADMIN) || userRole.includes(constants.userRoles.ROLE_EMPLOYEE)) {
        navigate('/admin/dashboard');
      } else if (userRole.includes(constants.userRoles.ROLE_USER)) {
        navigate('/');
      }
    }
  }, [userInfo, navigate]);

  const handleFinish = async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const { email, password } = values;

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 8 characters long and contain at least 1 letter and 1 number.');
      return;
    }



    setErrorMessage(null);
    setSuccessMessage(null);
    dispatch(login({ email, password }));
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Vui lòng nhập email.');
      return;
    }

    try {
      const response = await AuthApi.forgotPassword(forgotPasswordEmail);
      if (response.data.status === constants.httpStatusCodes.HTTP_OK) {
        setSuccessMessage('Email khôi phục mật khẩu đã được gửi!');
        setIsForgotPasswordVisible(false);
      }
    } catch (error) {
      setForgotPasswordError('Email không tồn tại trong hệ thống hoặc có lỗi xảy ra.');
    }
  };

  const handleLoginGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      await dispatch(loginWithGoogleAccount(token)).unwrap();
      // setSuccessMessage('Google login successful!');
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.formSection}>
          <Title level={3} className={styles.formTitle}>
            Đăng nhập
          </Title>

          {successMessage && <Alert showIcon message={successMessage} type="success" className={styles.successMessage} />}
          {errorMessage && <Alert showIcon message={errorMessage} type="error" className={styles.errorMessage} />}

          <Form name="login" onFinish={handleFinish} layout="vertical" className={styles.authForm}>
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
              label="Password"
              name="password"
              onChange={() => setErrorMessage(null)}
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

            <div className={styles.forgotPassword} >
              <a className={styles.forgotPasswordLink} onClick={() => setIsForgotPasswordVisible(true)}>
                Quên mật khẩu?
              </a>
            </div>



            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className={styles.submitButton}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.signupPrompt}>
            <Text>
              Bạn mới sử dụng PetHeaven?{' '}
              <span onClick={() => navigate('/register')} className={styles.signupLink}>
                Đăng ký
              </span>
            </Text>
          </div>

          <Divider className={styles.divider}>Hoặc</Divider>

          <GoogleLogin
            onSuccess={handleLoginGoogleSuccess}
            onError={() => setErrorMessage('Đăng nhập thất bại')}
            className={styles.googleButton}
          />
        </div>

        <div className={styles.imageSection}>
          <img src="../images/petfood_background.jpg" alt="Project Progress" className={styles.sectionImage} />
        </div>
      </div>

      <Modal
        title="Quên mật khẩu"
        open={isForgotPasswordVisible}
        onCancel={() => setIsForgotPasswordVisible(false)}
        onOk={handleForgotPassword}
        okText="Gửi email"
        cancelText="Hủy"
      >
        <p>Nhập địa chỉ email bạn dùng trên hệ thống. Chúng tôi sẽ gửi bạn một email để đặt lại mật khẩu.</p>
        <Input
          prefix={<MailOutlined />}
          placeholder="Nhập email của bạn"
          size="large"
          value={forgotPasswordEmail}
          onChange={(e) => {
            setForgotPasswordEmail(e.target.value);
            setForgotPasswordError(null);
          }}
        />
        {forgotPasswordError && <Text type="danger" style={{ fontSize: 14 }}>{forgotPasswordError}</Text>}
      </Modal>
    </div>
  );
};

export default Login;