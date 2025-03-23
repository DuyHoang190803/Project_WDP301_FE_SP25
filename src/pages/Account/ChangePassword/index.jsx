import React, { useState } from "react";
import styles from "./ChangePassword.module.css";
import { validatePassword } from '../../../utils/validation.js';
import AuthApi from "../../../api/AuthApi.js";
import { Form, Input, Button, Alert } from 'antd';

function ChangePassword() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ // Thêm state để quản lý alert
        show: false,
        type: 'success',
        message: ''
    });

    const handleSubmit = async (values) => {

        setLoading(true);
        setAlert({ show: false }); // Reset alert trước khi gửi request

        console.log('Received values of form: ', values);
        
        try {
            const response = await AuthApi.changePassword(values.oldPassword, values.newPassword);
            if (response) {
                setAlert({
                    show: true,
                    type: 'success',
                    message: 'Đổi mật khẩu thành công!'
                });
                form.resetFields();
            }
        } catch (error) {
            setAlert({
                show: true,
                type: 'error',
                message: error.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.changePasswordContainer}>
            <h1 className={styles.title}>Đổi Mật Khẩu</h1>
            <p className={styles.subtitle}>
                Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu với người khác.
            </p>

            {/* Hiển thị Alert nếu có */}
            {alert.show && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    showIcon
                    closable
                    onClose={() => setAlert({ ...alert, show: false })}
                    style={{ marginBottom: '16px' }}
                />
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className={styles.passwordForm}
            >
                <Form.Item
                    label="Mật khẩu cũ"
                    name="oldPassword"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                    ]}
                >
                    <Input.Password
                        placeholder="Nhập mật khẩu cũ"
                        disabled={loading}
                        className={styles.passwordInput}
                    />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                        {
                            validator: (_, value) =>
                                value && validatePassword(value)
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ cái in hoa, thường và số!")),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder="Nhập mật khẩu mới"
                        disabled={loading}
                        className={styles.passwordInput}
                    />
                </Form.Item>

                <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder="Xác nhận mật khẩu mới"
                        disabled={loading}
                        className={styles.passwordInput}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className={styles.confirmButton}
                    >
                        {loading ? "Đang xử lý..." : "Xác Nhận"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default ChangePassword;