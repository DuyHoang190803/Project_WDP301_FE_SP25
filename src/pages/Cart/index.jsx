import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import s from "./styles.module.css"
import { Col, Row, Typography } from "antd";
import { fetchCart, removeFromCart, updateCartItem } from "../../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.user);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedItemsForCheckout, setSelectedItemsForCheckout] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [note, setNote] = useState("");


    const { cartItems } = useSelector((state) => state.cart);

    useEffect(() => {
        let newTotalPrice = 0;
        if (selectedItemsForCheckout.length > 0) {
            newTotalPrice = selectedItemsForCheckout.reduce(
                (total, item) => {
                    const price = item.variantId?.price ?? item.productId?.price ?? 0;
                    return total + item.quantity * price;
                },
                0
            );
        }
        setTotalPrice(newTotalPrice);
    }, [selectedItemsForCheckout, cartItems]);


    const handleOpenDeleteModal = (productId, variantId) => {
        setSelectedItem({ productId, variantId });
        setShowModal(true);
    };

    const handleConfirmDelete = () => {
        if (selectedItem) {
            dispatch(removeFromCart({ item: selectedItem }));
            setSelectedItemsForCheckout((prevSelectedItems) =>
                prevSelectedItems.filter(
                    (item) =>
                        !(
                            item.productId._id === selectedItem.productId &&
                            item.variantId._id === selectedItem.variantId
                        )
                )
            );
        }

        setShowModal(false);
    };




    const handleSelectItemForCheckout = (item) => {
        const isItemSelected = selectedItemsForCheckout.some(
            (selectedItem) =>
                selectedItem.productId._id === item.productId._id &&
                (!selectedItem?.variantId || selectedItem?.variantId._id === item?.variantId?._id)
        );

        if (isItemSelected) {
            setSelectedItemsForCheckout((prevSelectedItems) =>
                prevSelectedItems.filter(
                    (selectedItem) =>
                        !(
                            selectedItem.productId._id === item.productId._id &&
                            (!selectedItem?.variantId || selectedItem?.variantId._id === item?.variantId?._id)
                        )
                )
            );
        } else {
            setSelectedItemsForCheckout((prevSelectedItems) => [...prevSelectedItems, item]);
        }
    };

    const handleQuantityChange = (productId, variantId, quantity) => {
        if (quantity === 0) {
            dispatch(removeFromCart({ item: { productId, variantId } }));
            setSelectedItemsForCheckout((prevSelectedItems) =>
                prevSelectedItems.filter(
                    (item) =>
                        !(
                            item.productId._id === selectedItem.productId &&
                            item.variantId._id === selectedItem.variantId
                        )
                )
            );
            return;
        }
        dispatch(updateCartItem({ item: { productId, variantId, quantity } }));
        dispatch(fetchCart());

        setSelectedItemsForCheckout((prevSelectedItems) =>
            prevSelectedItems.map((item) => {
                const isMatch =
                    item.productId._id === productId &&
                    (!variantId || !item?.variantId || item?.variantId._id === variantId);
                return isMatch ? { ...item, quantity } : item;
            })
        );
    };

    const handleInputQuantityChange = (productId, variantId, e) => {
        const newQuantity = parseInt(e.target.value, 10);
        handleQuantityChange(productId, variantId, newQuantity);

    };

    return (
        <div className={s.cartContainer}>
            <Row md={24} >
                <Col md={16} className={s.sectionLeft}>
                    <Typography className={s.title}>Giỏ hàng của bạn</Typography>
                    <div className={s['divider']}></div>
                    <div className={s.cartItems}>
                        {cartItems && cartItems.length > 0 ? (
                            cartItems.map((item, index) => {
                                const optionIndexes = item.variantId?.optionIndex || [];
                                const productOptions = item.productId?.options || [];
                                const optionImage = item.variantId
                                    ? (
                                        item.productId?.options[0]?.values?.[item.variantId.optionIndex[0]]?.image?.url ||
                                        item.productId?.thumbnail?.url ||
                                        "https://placehold.co/100x100"
                                    )
                                    : item.productId?.thumbnail?.url || "https://placehold.co/100x100";
                                const selectedOptionsText = optionIndexes.length > 0
                                    ? optionIndexes
                                        .map((optIdx, i) => {

                                            if (item?.productId && productOptions[i] && productOptions[i].values?.[optIdx]) {
                                                return `${productOptions[i].values[optIdx].name}`;
                                            }
                                            return null; // Nếu không có dữ liệu, trả về null
                                        })
                                        .filter(Boolean) // Lọc bỏ các giá trị null
                                        .join(", ")
                                    : item.s?.map((sItem) => sItem.name).join(", ") || "No options available";
                                const price = item?.variantId?.price || item?.productId?.price || 0;

                                return (
                                    <div key={index} className={s.cartItem}>
                                        <button
                                            className={s.deleteIcon}
                                            onClick={() => handleOpenDeleteModal(item.productId._id, item?.variantId?._id)}
                                        >
                                            Xóa
                                        </button>
                                        <div className={s.itemImage}>
                                            <img src={optionImage} alt={item.productId.name} className={s.optionImage} />
                                        </div>
                                        <div className={s.itemInfo}>
                                            <div>
                                                <span className={s.itemTitle}>{item.productId.name}</span>
                                                <p className={s.optionValues}>{selectedOptionsText}</p>
                                                <p className={s.optionValues}>Đơn giá: {price.toLocaleString()} ₫</p>

                                            </div>
                                            <div className={s.itemPrice}>
                                                <span style={{ fontWeight: 'bold' }}>{(price * item.quantity).toLocaleString()}₫</span>
                                                <div className={s.quantityControl}>
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                item.productId?._id,
                                                                item?.variantId?._id,
                                                                item.quantity - 1
                                                            )
                                                        }
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        className={s.quantityInput}
                                                        type="number"
                                                        value={item.quantity}
                                                        min="1"
                                                        onChange={(e) =>
                                                            handleInputQuantityChange(
                                                                item.productId?._id,
                                                                item?.variantId?._id,
                                                                e
                                                            )
                                                        }
                                                    />

                                                    {/* Nút tăng số lượng */}
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                item.productId?._id,
                                                                item?.variantId?._id,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedItemsForCheckout.some(
                                                (selectedItem) =>
                                                    selectedItem.productId._id === item.productId._id &&
                                                    (!selectedItem?.variantId || selectedItem?.variantId?._id === item?.variantId?._id)
                                            )}
                                            onChange={() => handleSelectItemForCheckout(item)}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <div className={s.cartTextEmpty}>Giỏ hàng của bạn đang trống</div>
                        )}
                        {/* {cartItems && cartItems.length > 0 && (
                            <div className={s.noteSection}>
                                <label htmlFor="orderNote">Ghi chú đơn hàng:</label>
                                <textarea
                                    id="orderNote"
                                    className={s.noteInput}
                                    placeholder="Nhập ghi chú của bạn (ví dụ: Giao hàng sau 18h)"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        )} */}
                    </div>
                </Col>

                <Col md={8} className={s.sectionRight}>
                    <Typography className={s.title}>Thông tin dịch vụ đơn hàng</Typography>
                    <div className={s['divider']}></div>

                    <div className={s.orderSummary}>
                        <div className={s.total}>
                            <span className={s.totalText}>Tổng tiền</span>
                            <span className={s.totalPrice}>{totalPrice.toLocaleString()}₫</span>
                        </div>
                        <div className={s['divider']}></div>
                        <ul>
                            <li className={s.infoText}>Ưu đãi phí ship 10.000VND cho mọi đơn hàng</li>
                            <li className={s.infoText}>Giao hàng hỏa tốc trong vòng 4 giờ, áp dụng tại khu vực nội thành Hà Nội</li>
                        </ul>

                        <button
                            className={s.checkoutButton}
                            onClick={() => {
                                navigate("/checkout", {
                                    state: {
                                        cartItems: selectedItemsForCheckout.length > 0 ? selectedItemsForCheckout : cartItems, note, totalPrice
                                    },
                                });
                            }}
                            disabled={totalPrice <= 0}
                        >
                            Thanh toán
                        </button>
                    </div>
                </Col>
            </Row>
            {showModal && (
                <div className={s.modal}>
                    <div className={s.modalContent}>
                        <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
                        <button onClick={() => setShowModal(false)}>Hủy</button>
                        <button onClick={handleConfirmDelete} className={s.confirmDelete}>Xác nhận</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
