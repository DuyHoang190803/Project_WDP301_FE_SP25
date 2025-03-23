import React from 'react';
import { Layout, Row, Col } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';
import styles from './styles.module.css';

const { Footer } = Layout;

const AppFooter = () => {
    return (
        <Footer className={styles.footer}>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <h3>Công ty thú cưng PetHaven</h3>
                    <p>Địa chỉ: Số 123, Đường ABC, Hà Nội</p>
                    <p>Điện thoại: 0123-456-789</p>
                    <p>Email: info@abcpets.com</p>
                </Col>
                <Col span={8}>
                    <h3>Liên kết hữu ích</h3>
                    <ul>
                        <li><a href="/">Trang chủ</a></li>
                        <li><a href="/san-pham">Sản phẩm</a></li>
                        <li><a href="/lien-he">Liên hệ</a></li>
                    </ul>
                </Col>
                <Col span={8}>
                    <h3>Kết nối với chúng tôi</h3>
                    <p>
                        <FacebookOutlined className={styles.icon} />
                        <TwitterOutlined className={styles.icon} />
                        <InstagramOutlined className={styles.icon} />
                    </p>
                </Col>
            </Row>
            <p className={styles.copyright}>© 2025 Công ty thú cưng PetHaven. Bản quyền thuộc về.</p>
        </Footer>
    );
};

export default AppFooter;
