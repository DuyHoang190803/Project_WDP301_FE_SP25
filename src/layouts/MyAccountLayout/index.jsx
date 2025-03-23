import React from "react";
import { Col, Layout, Menu, Row, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import AppHeader from "../../components/Header";
// import "./MyAccountLayout.module.css";
import styles from './MyAccountLayout.module.css';

const items = [

    {
        key: 'sub4',
        label: 'Tài khoản của tôi',
        icon: <SettingOutlined />,
        children: [
            {
                key: 'Hồ Sơ',
                label: 'Hồ Sơ',
            },
            {
                key: 'Địa Chỉ',
                label: 'Địa Chỉ',
            },
            {
                key: 'Đổi Mật Khẩu',
                label: 'Đổi Mật Khẩu',
            }
            ,
            {
                key: 'Đơn mua',
                label: 'Đơn mua',
            }
        ],
    }

];

const MyAccountLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();  // Lấy thông tin URL hiện tại

    // Xử lý khi click vào một mục trong Menu
    const onClick = (e) => {
        console.log('click ', e);

        if (e.key === 'Hồ Sơ') {
            navigate("/account/profile");
        } else if (e.key === 'Địa Chỉ') {
            navigate("/account/address");
        } else if (e.key === 'Đổi Mật Khẩu') {
            navigate("/account/change-password");
        } else if (e.key === 'Đơn mua') {
            navigate("/account/order");
        }
    };

    // Lấy key của mục Menu dựa trên URL hiện tại
    let selectedKey = '';
    if (location.pathname === '/account/address') {
        selectedKey = 'Địa Chỉ';
    } else if (location.pathname === '/account/profile') {
        selectedKey = 'Hồ Sơ';
    } else if (location.pathname === '/account/change-password') {
        selectedKey = 'Đổi Mật Khẩu';
    } else if (location.pathname === '/account/order') {
        selectedKey = 'Đơn mua';
    }

    return (
        <div className="my-account-layout ">
            <AppHeader />

            <Col span={22} offset={1} className='container' style={{ paddingTop: "60px" }} >
                <Row gutter={[16, 16]} >

                    {/* Sidebar */}
                    <Col xs={24} sm={6} md={4} lg={4}>
                        <Menu
                            onClick={onClick}
                            selectedKeys={[selectedKey]}
                            defaultOpenKeys={['sub4']}
                            mode="inline"
                            items={items}
                        />
                    </Col>

                    <Col xs={24} sm={18} md={20} lg={20}>
                        <Outlet />
                    </Col>

                </Row>
            </Col>

        </div>
    );
};

export default MyAccountLayout;
