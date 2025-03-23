import React from "react";
import { Popover, Button, Flex } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import s from "./styles.module.css";
import { formatPrice } from "../../utils/formatPrice";

const Cart = ({ cartItems = [], onViewCart }) => {
    const content = (
        <div className={s.cartContainer}>
            <h3 className={s.title}>GIỎ HÀNG</h3>

            {cartItems && cartItems.length > 0 ? (
                <ul className={s.cartList} >
                    {cartItems?.slice(0, 3).map((item, index) => {
                        const optionIndexes = item?.variantId?.optionIndex || [];
                        const productOptions = item?.productId?.options || [];
                        const optionImage = item.variantId
                            ? (
                                item.productId?.options[0]?.values?.[item.variantId.optionIndex[0]]?.image?.url ||
                                item.productId?.thumbnail?.url ||
                                "https://placehold.co/100x100"
                            )
                            : item.productId?.thumbnail?.url || "https://placehold.co/100x100";
                        // Lấy danh sách các tùy chọn đã chọn
                        const selectedOptionsText = optionIndexes
                            .map((optIdx, i) => {
                                if (productOptions[i] && productOptions[i].values[optIdx]) {
                                    return `${productOptions[i].name}: ${productOptions[i].values[optIdx].name}`;
                                }
                                return null;
                            })
                            .filter(Boolean)
                            .join(", ");
                        return (
                            <li key={index} className={s.cartItem}>
                                <img src={optionImage} alt={item.productId.name} className={s.itemImage} />
                                <div className={s.itemInfo}>
                                    <p className={s.itemName}>{item.productId.name}</p>
                                    <p className={s.optionValues}>{selectedOptionsText}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ margin: 0 }}>Số lượng: {item.quantity}</p>
                                        <span className={s.itemPrice}>{item.variantId?.price ? formatPrice(item.variantId.price) : formatPrice(item.productId.price)}đ</span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                    {cartItems.length > 3 && (
                        <li className={s.moreItems}>
                            <span>...</span>
                        </li>
                    )}

                </ul>
            ) : (
                <div className={s.emptyCart}>
                    <ShoppingCartOutlined className={s.cartIcon} />
                    <p>Hiện chưa có sản phẩm</p>
                </div>
            )}

            <div className={s.cartFooter}>
                <span className={s.totalLabel}>TỔNG TIỀN:</span>
                <span className={s.totalPrice}>
                    {cartItems?.length > 0
                        ? cartItems.reduce((total, item) => {
                            // Sử dụng giá từ variantId nếu có, nếu không thì dùng giá từ productId
                            const price = item?.variantId?.price || item?.productId?.price || 0;
                            return total + (item?.quantity || 0) * price;
                        }, 0).toLocaleString()
                        : 0}đ
                </span>
            </div>

            <Button type="primary" block className={s.viewCartButton} onClick={onViewCart}>
                XEM GIỎ HÀNG
            </Button>
        </div>
    );

    return (
        <Popover content={content} trigger="click" placement="bottomRight">
            <div className={s.cartIconWrapper}>
                <ShoppingCartOutlined className={s.cartIcon} />
                {cartItems.length > 0 && <span className={s.cartCount}>{cartItems.length}</span>}
                <div className={s.iconLabel}>Giỏ hàng</div>
            </div>
        </Popover>
    );
};

export default Cart;
