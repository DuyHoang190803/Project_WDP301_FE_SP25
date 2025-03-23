import { useEffect, useState } from "react";
import { Button, Row, Col } from "antd";
import { Loading3QuartersOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import s from "./styles.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { viewDataDetail, viewData } from "../../../redux/slices/productSlice";
import { addToCart } from "../../../redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import ProductImageSlider from "../../../components/ProductImagesSlider";
import CustomCard from "../../../components/Card";
import { formatPrice } from "../../../utils/formatPrice";
import { toast, ToastContainer } from "react-toastify";

const ProductDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { productDetailData, productTableData } = useSelector((state) => state.product);
    const [selectedOptionIndexs, setSelectedOptionIndexs] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [products, setProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const { userInfo } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const { cartItems, status, error } = useSelector((state) => state.cart);

    const handleOptionSelect = (optionIndex, valueIndex) => {
        if (!productDetailData?.product?.options?.length || !productDetailData?.variants?.length) {
            return;
        }
        const newSelectedOptions = [...selectedOptionIndexs];
        newSelectedOptions[optionIndex] = valueIndex;
        setSelectedOptionIndexs(newSelectedOptions);
        const matchedVariant = productDetailData.variants.find(variant => {
            const variantString = JSON.stringify(variant.optionIndex);
            const selectedString = JSON.stringify(newSelectedOptions);
            return variantString === selectedString;
        });
        if (matchedVariant) {
            setSelectedVariant(matchedVariant);
            const selectedOption = productDetailData.product.options[optionIndex];
            if (selectedOption?.values[valueIndex]?.image?.url) {
                setSelectedImage(selectedOption.values[valueIndex].image);
            }
        } else {
            setSelectedVariant(null);
            setSelectedImage(null);
        }
    };

    useEffect(() => {
        dispatch(viewDataDetail(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (productDetailData?.product?.categoryId?._id) {
            dispatch(viewData({ categoryIds: productDetailData.product.categoryId._id, page: 1, pageSize: 4 }));
            setSelectedOptions(productDetailData.product.options?.[0] || null);
        }

        if (productDetailData?.product?.options?.length) {
            const defaultSelectedOptions = Array(productDetailData.product.options.length).fill(0);
            setSelectedOptionIndexs(defaultSelectedOptions);

            const matchedVariant = productDetailData.variants?.find((variant) =>
                JSON.stringify(variant.optionIndex || []) === JSON.stringify(defaultSelectedOptions)
            );

            if (matchedVariant) {
                setSelectedVariant(matchedVariant);
            } else {
                setSelectedVariant(null);
            }


            if (productDetailData.product.options[0]?.values[0]?.image?.url) {
                setSelectedImage(productDetailData.product.options[0].values[0].image);
            } else if (productDetailData?.product?.thumbnail?.url) {
                setSelectedImage(productDetailData.product.thumbnail);
            }
        } else if (productDetailData?.product?.thumbnail?.url) {

            setSelectedImage(productDetailData.product.thumbnail);
            setSelectedOptionIndexs([]); // Reset options nếu không có
            setSelectedVariant(null); // Reset variant nếu không có
        }
    }, [productDetailData, dispatch]);

    useEffect(() => {
        if (productTableData?.items) {
            setProducts(productTableData.items);
        }
    }, [productTableData]);

    useEffect(() => {
        if (productDetailData?.product?.thumbnail?.url && !selectedImage) {
            setSelectedImage(productDetailData.product.thumbnail);
        }
    }, [productDetailData, selectedImage]);

    if (!productDetailData || !productDetailData.product) {
        return <div>Loading...</div>;
    }
    const handleAddToCart = () => {

        if (!userInfo?.accountId) {
            navigate("/login");
            return;
        }
        if (selectedVariant) {
            dispatch(
                addToCart({
                    item: { productId: productDetailData.product._id, variantId: selectedVariant._id, quantity },
                })
            );
        } else {
            dispatch(
                addToCart({
                    item: { productId: productDetailData.product._id, quantity },
                })
            );
        }

    };
    return productDetailData && productDetailData.product.name ? (

        <div className={s.containerFather}>
            <div className={s.container}>
                <div className={s.left}>
                    {productDetailData && productDetailData?.product?.thumbnail &&
                        <ProductImageSlider
                            images={productDetailData?.product?.images || []}
                            options={productDetailData?.product?.options || []}
                            thumbnail={productDetailData?.product?.thumbnail || {}}
                            onImageSelect={setSelectedImage}
                            selectedImageOnDetail={selectedImage}
                        />
                    }
                </div>

                <div className={s.right}>
                    <h1 className={s.title}>{productDetailData?.product?.name}</h1>
                    <div>
                        <span className={s.statusQuantity}>
                            <p className={s.label}>Tình trạng:&nbsp;</p>
                            <p className={s.value}>
                                {selectedVariant
                                    ? selectedVariant.quantity > 0
                                        ? `Còn ${selectedVariant.quantity} sản phẩm`
                                        : "Hết hàng"
                                    : productDetailData.product.quantity > 0
                                        ? `Còn ${productDetailData.product.quantity} sản phẩm`
                                        : "Hết hàng"
                                }
                            </p>
                        </span>
                    </div>

                    <p className={s.price}>
                        {selectedVariant?.price ? formatPrice(selectedVariant.price) : formatPrice(productDetailData?.product?.price)}₫
                    </p>
                    {productDetailData.product?.options?.length > 0 &&
                        productDetailData.product.options?.map((option, optionIndex) => (
                            <div key={`option-${optionIndex}`} className={s.options}>
                                <h4>{option.name}:</h4>
                                {option.values?.map((value, valueIndex) => (
                                    <button
                                        key={`value-${valueIndex}`}
                                        className={`${s.optionBtn} ${selectedOptionIndexs[optionIndex] === valueIndex ? s.active : ""
                                            }`}
                                        onClick={() => handleOptionSelect(optionIndex, valueIndex)}
                                        disabled={!value || selectedOptionIndexs[optionIndex] === valueIndex}
                                    >
                                        {value?.name || "Không có giá trị"}
                                    </button>
                                ))}
                            </div>
                        ))}

                    <div className={s.cartAction}>
                        <div className={s.quantity}>
                            <button
                                onClick={() => setQuantity(q => Math.max(q - 1, 1))}
                                disabled={selectedVariant?.quantity === 0}
                            >
                                -
                            </button>
                            <input
                                className={s.quantityInput}
                                type="text"
                                value={quantity}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (/^\d*$/.test(newValue)) {
                                        setQuantity(newValue);
                                    }
                                }}
                            />

                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                disabled={selectedVariant?.quantity === 0}
                            >
                                +
                            </button>
                        </div>

                        <Button
                            className={s.addToCart}
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={handleAddToCart}
                            disabled={
                                productDetailData.product?.options?.length > 0
                                    ? selectedVariant?.quantity === 0 || quantity > selectedVariant?.quantity
                                    : productDetailData.product?.quantity === 0 || quantity > productDetailData.product?.quantity
                            }
                        >
                            {productDetailData.product?.options?.length > 0
                                ? quantity > selectedVariant?.quantity && selectedVariant?.quantity > 0
                                    ? "Tạm thời hết hàng"
                                    : "Thêm vào giỏ"
                                : quantity > productDetailData.product?.quantity && productDetailData.product?.quantity > 0
                                    ? "Tạm thời hết hàng"
                                    : "Thêm vào giỏ"
                            }
                        </Button>
                    </div>
                    {productDetailData.product?.description}
                </div>
            </div>
            <div className={s.relatedProducts}>
                <h2 className={s.titleRelatedProducts}>Sản phẩm liên quan</h2>
                <Row className={s.productList}>
                    {products.map((product) => (
                        <Col span={5} key={product._id} style={{ margin: " 0 4px" }}>
                            <CustomCard product={product} />
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    ) : <Loading3QuartersOutlined />;
};

export default ProductDetail;
