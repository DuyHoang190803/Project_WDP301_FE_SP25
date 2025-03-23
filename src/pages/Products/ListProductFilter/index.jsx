import React, { useEffect, useState } from 'react';
import styles from "./styles.module.css"; // Import CSS module
import { useLocation } from 'react-router-dom';
import { viewData } from '../../../redux/slices/productSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Checkbox, Col, Radio, Row, Select, Space, Tag } from 'antd';
import { priceRanges } from './constant';
import { searchCategories, searchCategoriesChildren } from '../../../redux/slices/cateSlice';
import CustomCard from '../../../components/Card';
import { Loading3QuartersOutlined } from '@ant-design/icons';

const { Option } = Select;

const ListProductFilter = () => {
    const location = useLocation();
    const { cate } = location.state || {};

    const dispatch = useDispatch();
    const { productTableData } = useSelector((state) => state.product);
    const { categories, cateChildren } = useSelector((state) => state.categoryReducer);

    const [sortOption, setSortOption] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        // Trường hợp không có bộ lọc, chỉ lấy theo cate
        if (cate && selectedCategories.length === 0 && !selectedPriceRanges) {
            setLoading(true);
            try {
                await Promise.all([
                    dispatch(viewData({ categoryIds: cate._id, pageSize: 4 })),
                    dispatch(searchCategoriesChildren(cate.slug)),
                ]);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
            } finally {
                setLoading(false);
            }
        }
        // Trường hợp có bộ lọc (selectedCategories hoặc selectedPriceRanges)
        else if (selectedCategories.length > 0 || selectedPriceRanges) {
            setCurrentPage(1);
            fetchProducts(1, false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [cate, selectedCategories, selectedPriceRanges, sortOption]);

    const fetchProducts = async (page, loadMore = false) => {
        setLoading(true);
        try {
            await dispatch(
                viewData({
                    sort: sortOption,
                    categoryIds:
                        selectedCategories.length > 0
                            ? selectedCategories.join(",")
                            : cate?._id || "",
                    selectedPriceRanges,
                    page,
                    pageSize: 8,
                    loadMore,
                })
            );
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };



    const handleCategoryChange = (categoryId, checked) => {
        const category = findCategoryById(categoryId, cateChildren[0]?.root?.children || []);
        const allChildIds = getAllChildIds(category);

        let updatedSelectedCategories;
        if (checked) {
            updatedSelectedCategories = [...selectedCategories, categoryId, ...allChildIds];
        } else {
            updatedSelectedCategories = selectedCategories.filter(
                (id) => id !== categoryId && !allChildIds.includes(id)
            );
        }

        setSelectedCategories(updatedSelectedCategories);
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    const handlePriceRangeChange = (range) => {
        setSelectedPriceRanges(range);
        setCurrentPage(1);

    }

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedPriceRanges([]);
        setCurrentPage(1);
        fetchProducts(1);
    };

    const handleSortChange = (value) => {
        setSortOption(value);
        setCurrentPage(1);
    };



    const toggleCategory = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const getAllChildIds = (category) => {
        let childIds = [];
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                childIds.push(child._id);
                childIds = childIds.concat(getAllChildIds(child));
            });
        }
        return childIds;
    };

    const findCategoryById = (categoryId, categories) => {
        for (const category of categories) {
            if (category._id === categoryId) {
                return category;
            }
            if (category.children && category.children.length > 0) {
                const found = findCategoryById(categoryId, category.children);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };


    const renderCategories = (categories) => {
        if (!categories || categories.length === 0 || !categories[0]?.root?.children) {
            return null;
        }

        return categories[0].root.children.map((cate) => (
            <div key={cate._id} className={styles.categoryItem}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {cate.children && cate.children.length > 0 && (
                        <span
                            style={{ marginRight: 8, cursor: 'pointer' }}
                            onClick={() => toggleCategory(cate._id)}
                        >
                            {expandedCategories[cate._id] ? '▼' : '►'}
                        </span>
                    )}
                    <span style={{ marginRight: 8 }}>{cate.name}</span>
                    <Checkbox
                        checked={selectedCategories.includes(cate._id)}
                        onChange={(e) => handleCategoryChange(cate._id, e.target.checked)}
                        className={styles.checkbox}
                    />
                </div>
                {expandedCategories[cate._id] && cate.children && cate.children.length > 0 && (
                    <div style={{ marginLeft: 16 }}>
                        {renderCategories([{ root: cate }])}
                    </div>
                )}
            </div>
        ));
    };

    // useEffect(() => {
    //     if (cate && selectedCategories.length === 0) {
    //         dispatch(viewData({ categoryIds: cate._id, pageSize: 4 }));
    //         dispatch(searchCategoriesChildren(cate.slug));
    //     }
    // }, [cate, dispatch, selectedCategories]);



    // useEffect(() => {
    //     if (selectedCategories.length > 0 || selectedPriceRanges !== null) {
    //         setCurrentPage(1);
    //         console.log(selectedPriceRanges);

    //         dispatch(viewData({
    //             sort: sortOption,
    //             categoryIds: selectedCategories.length > 0 ? selectedCategories.join(',') : cate._id,
    //             selectedPriceRanges,
    //             page: 1,
    //             pageSize: 20,
    //             loadMore: false,
    //         }));
    //     }

    // }, [sortOption, selectedCategories, selectedPriceRanges, dispatch]);

    if (!cate) {
        return <div>Loading...</div>;
    }

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchProducts(nextPage, true);
    };
    return productTableData && productTableData?.items ? (
        <div style={{ margin: "10px" }}>
            <div className={styles.header}>
                <h2 style={{ marginLeft: "30px" }}>{cate?.name}</h2>
                <Space>
                    <span>Sắp xếp theo:</span>
                    <Select defaultValue="" style={{ width: 150 }} onChange={handleSortChange}>
                        <Option value="">Mới nhất</Option>
                        <Option value="price">Giá tăng dần</Option>
                        <Option value="-price">Giá giảm dần</Option>
                        <Option value="best_selling">Bán chạy nhất</Option>
                    </Select>
                </Space>
            </div>
            <Row md={24} className={styles.content}>
                <Col md={7} xs={24} sm={8}>
                    <Card title="BỘ LỌC" className={styles.filterCard}>
                        <div className={styles.filterSection}>
                            <h4>Lọc category</h4>
                            {cateChildren && cateChildren[0]?.root?.children.length > 0 ? renderCategories(cateChildren) : "Không có danh mục con"}
                        </div>

                        <div className={styles.filterSection}>
                            <h4>Lọc giá</h4>
                            {priceRanges.map((range) => (
                                <div key={range.label} className={styles.priceRangeItem}>
                                    <Radio
                                        checked={selectedPriceRanges.label === range.label}
                                        onChange={() => handlePriceRangeChange(range)}
                                        className={styles.radio}
                                    >
                                        {range.label}
                                    </Radio>
                                </div>
                            ))}
                        </div>

                        {/* <div className={styles.selectedFilters}>
                            {selectedPriceRanges &&
                                <Tag closable onClose={() => handlePriceRangeChange(selectedPriceRanges, false)}>
                                    {selectedPriceRanges.label}
                                </Tag>
                            }
                        </div> */}

                        <Button type="link" className={styles.clearButton} onClick={clearAllFilters}>
                            Reset
                        </Button>
                    </Card>
                </Col>

                <Col md={17} xs={24} sm={16}>
                    <Row gutter={[16, 16]}>
                        {productTableData && productTableData.totalItems > 0 ? (
                            productTableData.items.map((product) => (
                                <Col key={product._id} md={6} xs={12}><CustomCard product={product} /></Col>
                            ))
                        ) : (
                            <div>Không có sản phẩm nào.</div>
                        )}
                    </Row>
                    {productTableData && productTableData.items.length < productTableData.totalItems && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Button className={styles.loadMoreButton} onClick={handleLoadMore} loading={loading}>
                                Xem thêm sản phẩm
                            </Button>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    ) : <Loading3QuartersOutlined />;
};

export default ListProductFilter;