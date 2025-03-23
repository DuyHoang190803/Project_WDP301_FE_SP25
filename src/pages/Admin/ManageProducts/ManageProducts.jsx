import React, { useEffect, useState } from "react";
import s from "./ManageProducts.module.css";
import { Table, Input, Select, Button, Space, Tag, Image, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ProductApi from "../../../api/ProductApi";
import { toast } from "react-toastify";
import { removeUndefinedFields } from "../../../utils/removeUndefinedFields";

const { Search } = Input;
const { Option } = Select;



const ManageProducts = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // Modal cho xóa

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = async (filters = {}) => {
    try {
      // Thêm các tham số phân trang vào filters
      const paginationFilters = {
        ...filters,
        page: currentPage,
        pageSize: pageSize, // Hoặc pageSize, tùy API của bạn
      };
      const data = await ProductApi.getAllProductsAdmin(paginationFilters);
      // Giả sử API trả về { rows: [], count: total }
      setProductList(data.rows || []);
      setTotalItems(data.count || 0); // Tổng số sản phẩm từ API
    } catch (error) {
      console.error("Lỗi r các cu ơi:", error);
    }
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span>{text}</span>,
      width: "25%",
      align: "center", // Căn giữa header và nội dung
    },
    {
      title: "Ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (thumbnail) => <Image width={60} src={thumbnail.url} />,
      width: "10%",
      align: "center",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => `${price.toLocaleString()}đ`,
      width: "15%",
      align: "center",
    },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (categoryId) =>
        categoryId ? categoryId.name : "Không có danh mục",
      width: "20%",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "isHide",
      key: "isHide",
      filters: [
        { text: "Đang hoạt động", value: "Đang hoạt động" },
        { text: "Đang ẩn", value: "Đang ẩn" },
      ],
      onFilter: (value, record) =>
        (!record.isHide ? "Đang hoạt động" : "Đang ẩn") === value,
      render: (isHide) => (
        <Tag color={!isHide ? "green" : "red"}>
          {!isHide ? "Đang hoạt động" : "Đang ẩn"}
        </Tag>
      ),
      width: "15%",
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate("/admin/update-product/" + record._id)}
            title="Sửa"
            style={{ color: '#fadb14' }} // Màu vàng của Ant Design, hoặc dùng mã màu khác như '#ffeb3b'
          />

          <Button
            type="link"
            icon={record.isHide ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => showConfirmModal(record)} // Gọi modal xác nhận
            title={record.isHide ? "Hiển thị" : "Ẩn"}
          />
          <Button
            type="link"
            icon={<DeleteOutlined size={24} />}
            onClick={() => showDeleteModal(record)} // Gọi modal xóa
            title="Xóa"
            danger
          />
        </Space>
      ),
      width: "15%",
      align: "center",
      fixed: "right",
    },
  ];


  useEffect(() => {
    fetchProducts({ query: searchText }); // Truyền searchText như một filter
  }, [searchText]);

  const handleSearch = (value) => {
    setSearchText(value.toLowerCase());
    setCurrentPage(1); // Reset về trang 1 khi search
  };
  const navigate = useNavigate();
  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const showConfirmModal = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (selectedProduct) {
      try {
        const response = await ProductApi.updateProducts(selectedProduct._id, {
          isHide: !selectedProduct.isHide,
        });
        toast.success("Cập nhật trạng thái thành công");
        fetchProducts();
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
      }
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalVisible(true);
  };


  const handleDeleteOk = async () => {
    if (selectedProduct) {
      try {
        await ProductApi.deleteProduct(selectedProduct._id); // Giả sử có API delete
        toast.success("Xóa sản phẩm thành công");
        fetchProducts();
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        toast.error("Xóa sản phẩm thất bại");
      }
    }
    setIsDeleteModalVisible(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
  };

  const handleDelete = (record) => {
    showDeleteModal(record);
  };



  return (
    <div>
      <h1 className={s["title"]}>Quản lý sản phẩm</h1>

      <div className={s["filter-container"]}>
        <Search
          placeholder="Tìm kiếm theo tên..."
          allowClear
          enterButton="Tìm kiếm"
          onSearch={handleSearch}
          className={s["search-input"]}
        />
        <Button type="primary" onClick={() => navigate("/admin/add-product")}>
          Tạo sản phẩm
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={productList}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: true, // Hiển thị tùy chọn thay đổi pageSize
          pageSizeOptions: ["10", "20", "50"], // Các tùy chọn số lượng mục mỗi trang
        }}
        onChange={handleTableChange} // Xử lý khi thay đổi trang hoặc pageSize
      />
      <Modal
        title="Xác nhận"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn{" "}
          {selectedProduct?.isHide ? "hiển thị" : "ẩn"} sản phẩm này không?
        </p>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        visible={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa sản phẩm "{selectedProduct?.name}" không?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
};

export default ManageProducts;
