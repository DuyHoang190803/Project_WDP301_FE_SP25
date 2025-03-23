import React, { use, useEffect, useState } from 'react';
import { ShoppingCartOutlined, SearchOutlined, UserOutlined, ProfileOutlined, LogoutOutlined, UserAddOutlined, LoginOutlined, MenuOutlined, HomeOutlined } from '@ant-design/icons';
import { Row, Col, Menu, Dropdown } from 'antd'
import s from './Header.module.css';
import logo from '../../assets/images/dog-food-logo.png';
import { useNavigate } from "react-router-dom";
import Cart from '../Cart';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../../redux/slices/cartSlice';
import { logout } from '../../redux/slices/authSlice';
import { searchCategories } from '../../redux/slices/cateSlice';


const renderMenuItems = (items, navigate) => {
    return items.map((item) => {
        const { _id, name, slug, children } = item;

        if (children && children.length > 0) {
            return (
                <Menu.SubMenu key={_id} title={name} className={s.SubMenu}>
                    {renderMenuItems(children, navigate)}
                </Menu.SubMenu>
            );
        }
        return (
            <Menu.Item key={_id} onClick={() => navigate(`/collections/${slug}`, {
                state: {
                    categoryId: _id
                }
            })} className={s.Menu}>
                {name}
            </Menu.Item>
        );
    });
};
const MenuCategory = ({ categories }) => {
    const navigate = useNavigate();
    return (
        <Menu mode="vertical" className={s['category-menu']}>
            {categories && categories.length > 0 && renderMenuItems(categories.map((data) => data.root), navigate)}
        </Menu>
    );
};


const UserMenu = ({ navigate }) => {
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
        <Menu>
            <Menu.Item
                key="profile"
                icon={<ProfileOutlined />}
                onClick={() => navigate('/account/profile')}
            >
                Profile
            </Menu.Item>
            <Menu.Item
                key="logout"
                icon={<LogoutOutlined />}
                onClick={handleLogout} // Gắn hàm handleLogout vào onClick
            >
                Đăng xuất
            </Menu.Item>
        </Menu>
    );
};

const LoginMenu = ({ navigate }) => (
    <Menu>
        <Menu.Item key="profile" icon={<LoginOutlined />} onClick={() => navigate("login")}>
            Đăng nhập
        </Menu.Item>
        <Menu.Item key="logout" icon={<UserAddOutlined />} onClick={() => navigate("register")}>
            Đăng ký
        </Menu.Item>
    </Menu>
);




const AppHeader = () => {
    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState('home');
    const [level1Categories, setLevel1Categories] = useState([]);
    const [searchText, setSearchText] = useState("");

    const { userInfo } = useSelector((state) => state.user);
    const { categories } = useSelector((state) => state.categoryReducer);
    const { cartItems } = useSelector((state) => state.cart);

    const dispatch = useDispatch();
    const [cartVisible, setCartVisible] = useState(false);
    const onViewCart = () => {
        navigate("/cart");
    }

    useEffect(() => {
        dispatch(searchCategories());
    }, [])

    useEffect(() => {
        if (userInfo?.accountId) {
            dispatch(fetchCart(userInfo.accountId));
        }
    }, [userInfo, dispatch]);

    useEffect(() => {
        if (categories && categories.length > 0) {
            const filteredCategories = categories.filter((cate) => cate.root.level === 1);
            setLevel1Categories(filteredCategories);
        }
    }, [categories]);

    const handleSearch = () => {
        const trimmedText = searchText.trim();
        if (trimmedText) {
            navigate(`/search?query=${encodeURIComponent(trimmedText)}`);
        } else {
            navigate("/search");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return categories && level1Categories && level1Categories.length > 0 ? (
        <div style={{ display: "flex", flexDirection: 'column', justifyContent: 'center' }}>
            <Row md={24} className={`${s['app-header']}`}>
                <Col md={6} sm={4} className={s['menu']}>
                    {/* <Col md={4} className={s['menu-icon']}>
                        <Dropdown overlay={<MenuCategory categories={categories} />} trigger={['click']}>
                            <MenuOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
                        </Dropdown>
                    </Col> */}
                    <Row className={s["section-left"]} md={24}>
                        <Col className={s['logo']} md={24} onClick={() => navigate("/")}>
                            <img src={logo} alt="Pet Shop Logo" className={s['logo-img']} />
                            <span className={s['logo-text']}>PetHaven</span>
                        </Col>
                    </Row>
                </Col>
                <Col md={13} sm={12}>
                    <Row className={s["section-left"]} md={24}>
                        <Col className={s["search-bar"]} md={16}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className={s["search-input"]}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button className={s["search-button"]} onClick={handleSearch}>
                                <SearchOutlined />
                            </button>
                        </Col>
                    </Row>
                </Col>
                <Col md={5} sm={8}>
                    <Row className={s["section-right"]} md={24}>
                        <Col className={s['header-actions']} md={24}>
                            <div className={s['divider']}></div>
                            <Dropdown overlay={!userInfo ? <LoginMenu navigate={navigate} /> : <UserMenu navigate={navigate} />} trigger={['click']}>
                                <div className={s['user-avatar']}>
                                    <UserOutlined />
                                    {userInfo && userInfo?.fullName ? <div className={s['icon-label']}>{userInfo?.fullName}</div> : <div className={s['icon-label']}>Tài khoản</div>}
                                </div>
                            </Dropdown>
                            <div className={s['divider']}></div>
                            <Cart visible={cartVisible} onClose={() => setCartVisible(false)} cartItems={cartItems} onViewCart={onViewCart} />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <div md={24} className={s['header-home']}>
                <Col md={2} className={s['logo-header']}><HomeOutlined className={s['logo']} /></Col>
                <Col md={22}>
                    <ul className={s['menu-cate']}>
                        {level1Categories.map((cate) => (
                            <li
                                key={cate.root._id}
                                className={s['menu-item']}
                                onClick={() => navigate(`/collections/${cate.root.slug}`, {
                                    state: { cate: cate.root }
                                })}
                            >
                                {cate.root.name}
                            </li>
                        ))}
                    </ul>
                </Col>
            </div>
        </div>

    ) : <div>Loading...</div>;
};

export default AppHeader;
