import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Space, Divider, Modal, Alert } from "antd";
import storage from "../../../utils/storage";
import styles from "./myAddress.module.css"; // Đảm bảo import đúng CSS module
import CreateAddressModal from "../../../components/Address/Modal/CreateAddress";
import EditAddressModal from "../../../components/Address/Modal/EditAddress";
import { useDispatch, useSelector } from "react-redux";
import { listAddresses, setDefaultAddress, deleteAddress, createAddress, editAddress } from "../../../redux/actions/addressActions.js";

function MyAddress() {
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    const dispatch = useDispatch();
    const { addresses, loading, error } = useSelector((state) => state.addresses);

    console.log(addresses);

    useEffect(() => {
        dispatch(listAddresses());
    }, [dispatch]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleDelete = async (id) => {
        dispatch(deleteAddress(id));
    };

    const handleSetDefault = async (id) => {
        dispatch(setDefaultAddress(id));
    };

    const handleCreateAddress = async (values) => {
        dispatch(createAddress(values));
    };

    const handleEditAddress = (address) => {
        setAddressToEdit(address);
        setEditModalVisible(true);
    };

    const handleUpdateAddress = async (addressId, updatedAddress) => {
        dispatch(editAddress(addressId, updatedAddress));
    };

    const handleCloseCreateModal = () => {
        setCreateModalVisible(false);
        setAddressToEdit(null);
    };

    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setAddressToEdit(null);
    };

    const openDeleteModal = (address) => {
        setAddressToDelete(address);
        setDeleteModalVisible(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalVisible(false);
        setAddressToDelete(null);
    };

    const confirmDeleteAddress = () => {
        if (addressToDelete) {
            handleDelete(addressToDelete._id);
            closeDeleteModal();
        }
    };

    return (
        <div className={styles.addressContainer}>
            {/* Header */}
            <div className={styles.header}>
                <h1>Địa chỉ của tôi</h1>
                <Button type="primary" onClick={() => setCreateModalVisible(true)}>
                    Thêm địa chỉ mới
                </Button>
            </div>

            {/* Danh sách địa chỉ */}
            <div className={styles.addressList}>
                {addresses.length > 0 ? (
                    addresses.map((address, index) => (
                        <div key={address._id} className={styles.addressItem}>
                            <Card className={styles.addressCard}>
                                <div className={styles.addressContent}>
                                    <p className={styles.fullName}>
                                        <strong>{address.fullName}</strong>
                                        {address.isDefault && (
                                            <Tag color="green" style={{ marginLeft: 8 }}>
                                                ✅ Địa chỉ mặc định
                                            </Tag>
                                        )}
                                    </p>
                                    <p className={styles.addressDetails}>
                                        {address.address}, {address.ward?.wardName}, {address.district?.districtName}, {address.province?.provinceName}
                                    </p>
                                    <p className={styles.phone}>{address.phone}</p>
                                </div>
                                <div className={styles.addressActions}>
                                    <Space>
                                        {address.isDefault ? (
                                            <Button type="primary" onClick={() => handleEditAddress(address)}>
                                                Cập nhật
                                            </Button>
                                        ) : (
                                            <>
                                                <Button type="primary" onClick={() => handleEditAddress(address)}>
                                                    Cập nhật
                                                </Button>
                                                <Button danger onClick={() => openDeleteModal(address)}>
                                                    Xoá
                                                </Button>
                                                <Button onClick={() => handleSetDefault(address._id)}>
                                                    Thiết lập mặc định
                                                </Button>
                                            </>
                                        )}
                                    </Space>
                                </div>
                            </Card>
                            {index < addresses.length - 1 && <Divider />}
                        </div>
                    ))
                ) : (
                    <Alert
                        description="Bạn chưa có địa chỉ nào."
                        type="info"
                        showIcon
                        className={styles.noAddressAlert}
                    />
                )}
            </div>

            {/* Create Address Modal */}
            <CreateAddressModal
                visible={createModalVisible}
                onClose={handleCloseCreateModal}
                onCreate={handleCreateAddress}
            />

            {/* Edit Address Modal */}
            <EditAddressModal
                visible={editModalVisible}
                onClose={handleCloseEditModal}
                onEdit={handleUpdateAddress}
                address={addressToEdit}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                title="Xác nhận xóa địa chỉ"
                visible={deleteModalVisible}
                onCancel={closeDeleteModal}
                onOk={confirmDeleteAddress}
                okText="Xoá"
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn xóa địa chỉ này không?</p>
            </Modal>
        </div>
    );
}

export default MyAddress;