import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { viewData } from '../../../redux/slices/productSlice';
import { Card, Col, Pagination, Row } from 'antd';
import CustomCard from '../../../components/Card';
import { useLocation } from 'react-router-dom';
import s from "./styles.module.css";
const ListProductSearch = () => {

    const location = useLocation();
    const dispatch = useDispatch();
    const { productTableData } = useSelector((state) => state.product);

    const query = new URLSearchParams(location.search).get("query") || "";
    const [searchText, setSearchText] = useState(query);
    useEffect(() => {
        setSearchText(query);
    }, [query]);

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(viewData({
            query: query, page: currentPage
        }))
    }, [currentPage, query])

    const handlePageChange = (page) => {
        dispatch(viewData({}))
    }

    return (
        <div style={{ padding: "0 50px" }}>
            <div className={s.headerText}>
                <h2>Tìm kiếm</h2>
                <span>Có<p>{productTableData?.totalItems} sản phẩm</p>cho tìm kiếm</span>
                <div className={s.devider}></div>
            </div>

            <div style={{ margin: "16px 0", fontSize: "20px" }}>
                Kết quả tìm kiếm cho <b>{query}</b>
            </div>

            <Row gutter={[16, 16]}>
                {productTableData && productTableData.totalItems > 0 && productTableData?.items?.map((product) => (
                    <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                        <CustomCard product={product} />
                    </Col>
                ))}
            </Row>

            {productTableData && productTableData.totalItems > 0 && <div style={{ display: 'flex', justifyContent: "center" }}><Pagination
                current={currentPage}
                total={productTableData?.totalItems}
                pageSize={20}
                onChange={handlePageChange}
                className={s.Pagination}
                style={{ marginTop: "20px", textAlign: "center" }}
            /></div>}


        </div>
    )
}

export default ListProductSearch