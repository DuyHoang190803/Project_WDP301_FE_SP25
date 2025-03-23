import React, { useEffect, useState } from 'react';
import s from './styles.module.css';
import { Layout, Row, Menu, Carousel, Col } from 'antd';
import { HomeOutlined, Loading3QuartersOutlined } from '@ant-design/icons';
const { Header, Content } = Layout;
import { Link, useNavigate } from 'react-router-dom';
import CustomCard from '../../components/Card';
import { useDispatch, useSelector } from 'react-redux';
import { viewData } from '../../redux/slices/productSlice';

const Home = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { productTableData } = useSelector((state) => state.product);

    useEffect(() => {
        dispatch(viewData({ page: 1, pageSize: 4 }));
    }, [])


    if (!productTableData) {
        return <div>Loading...</div>
    }

    return (<>
        {productTableData && productTableData.totalItems > 0 ? <Content >
            <Carousel autoplay className={s['banner']} arrows draggable={true} infinite={false}>
                <div >
                    <img
                        // src="https://static.vecteezy.com/system/resources/previews/007/796/719/non_2x/cute-african-baby-animals-on-jungle-background-funny-children-s-characters-elephant-monkey-zebra-flamingo-leopard-in-a-beautiful-blank-for-banners-posters-and-diplomas-vector.jpg"
                        src="../images/home_image.jpeg"
                        alt="Banner 1"
                        style={{ width: "100%", height: "400px", objectFit: "cover" }}
                    />
                </div>
                <div>
                    <img
                        // src="https://static.vecteezy.com/system/resources/previews/007/796/719/non_2x/cute-african-baby-animals-on-jungle-background-funny-children-s-characters-elephant-monkey-zebra-flamingo-leopard-in-a-beautiful-blank-for-banners-posters-and-diplomas-vector.jpg"
                        src="../images/home_image.jpeg"
                        alt="Banner 2"
                        style={{ width: "100%", height: "400px", objectFit: "cover" }}
                    />
                </div>
            </Carousel>
            <Row className={s['best-seller']}>
                <p className={s['best-seller-text']}>Sản phẩm bán chạy</p>
            </Row>
            <Row className={s['menu-product']} gutter={[16, 16]}>
                {
                    productTableData && productTableData.totalItems > 0 ? productTableData.items.map((item, index) =>
                        <Col md={6} key={index}>
                            <CustomCard className={s['product-item']} product={item} /></Col>) : <>No data</>
                }
            </Row>
        </Content> : <Loading3QuartersOutlined />}

    </>)
}

export default Home;