import React from 'react';
import { Card } from 'antd';
import s from './styles.module.css';
import { ShoppingCartOutlined } from "@ant-design/icons";
import { formatPrice } from '../../utils/formatPrice';
import { useNavigate } from 'react-router-dom';

const CustomCard = ({ product }) => {
    const navigate = useNavigate();
    return (
        <Card
            className={s['product-item']}
            hoverable
            cover={
                <div
                    className={s['image-container']}
                    onClick={() => navigate(`/products/${product._id}`)}
                >
                    <img
                        alt="example"
                        src={product.thumbnail.url}
                        className={s['product-image']}
                    />
                    <img
                        alt="example-hover"
                        src={product.images.length > 0 ? product.images[0].url : product.thumbnail.url}
                        className={s['product-image-hover']}
                    />
                </div>
            } actions={[<div className={s['action']} onClick={() => { navigate(`/products/${product._id}`); window.scrollTo(0, 0); }}><ShoppingCartOutlined
            /> Chọn mua</div>]}
        >
            <Card.Meta title={product.name} description={`${formatPrice(product.price)} đ`} />
        </Card>
    )
}

export default CustomCard