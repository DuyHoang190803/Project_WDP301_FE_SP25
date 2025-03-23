import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Form, Select } from "antd";
import AddressApi from "../../../../api/AddressApi";
import { validatePhoneNumber, trimValidator, validateMinLength3 } from "../../../../utils/validation";

function EditAddressModal({ visible, onClose, onEdit, address }) {
  const [form] = Form.useForm();

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const addressId = address?._id;

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await AddressApi.getAllCity();
        if (response?.data) {
          setCities(response.data);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  // Initialize form and fetch related data when address changes
  useEffect(() => {
    if (visible && address) {
      const initializeForm = async () => {
        // Set city and fetch districts
        const cityData = {
          cityId: address.province?.provinceId,
          name: address.province?.provinceName
        };
        setSelectedCity(cityData);

        if (address.province?.provinceId) {
          try {
            const districtResponse = await AddressApi.getAllDistrictByCityId(address.province.provinceId);
            setDistricts(districtResponse?.data || []);
          } catch (error) {
            console.error("Error fetching districts:", error);
          }
        }

        // Set district and fetch wards
        const districtData = {
          districtId: address.district?.districtId,
          name: address.district?.districtName
        };
        setSelectedDistrict(districtData);

        if (address.district?.districtId) {
          try {
            const wardResponse = await AddressApi.getAllWardByDistrictId(address.district.districtId);
            setWards(wardResponse?.data || []);
          } catch (error) {
            console.error("Error fetching wards:", error);
          }
        }

        // Set ward
        setSelectedWard({
          wardId: address.ward?.wardId,
          name: address.ward?.wardName
        });

        // Set form values
        form.setFieldsValue({
          fullName: address.fullName,
          address: address.address,
          phone: address.phone,
          city: address.province?.provinceId,
          district: address.district?.districtId,
          ward: address.ward?.wardId
        });
      };

      initializeForm();
    } else if (!visible) {
      // Reset form when modal is closed
      form.resetFields();
      setSelectedCity(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);
    }
  }, [visible, address, form]);

  // Handle city change
  const handleCityChange = async (value) => {
    const city = cities.find(c => c.cityId === value);
    setSelectedCity(city);
    setSelectedDistrict(null);
    setSelectedWard(null);
    form.setFieldsValue({ district: undefined, ward: undefined });

    try {
      const response = await AddressApi.getAllDistrictByCityId(value);
      setDistricts(response?.data || []);
      setWards([]);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    }
  };

  // Handle district change
  const handleDistrictChange = async (value) => {
    const district = districts.find(d => d.districtId === value);
    setSelectedDistrict(district);
    setSelectedWard(null);
    form.setFieldsValue({ ward: undefined });

    try {
      const response = await AddressApi.getAllWardByDistrictId(value);
      setWards(response?.data || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWards([]);
    }
  };

  // Handle ward change
  const handleWardChange = (value) => {
    const ward = wards.find(w => w.wardId === value);
    setSelectedWard(ward);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // Trim tất cả các giá trị là chuỗi trong values
      const trimmedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ])
      );
      const fullAddress = {
        ...trimmedValues,
        province: selectedCity,
        district: selectedDistrict,
        ward: selectedWard
      };


      await onEdit(addressId, fullAddress);
      onClose();
    } catch (error) {
      console.error("Error processing address:", error);
    }
  };

  return (
    <Modal
      title="Cập nhật địa chỉ"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Cập nhật
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[
            { validator: validateMinLength3 },
            { validator: trimValidator },
            { required: true, message: "Vui lòng nhập họ và tên!" }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            { validator: trimValidator },
            { required: true, message: "Vui lòng nhập địa chỉ!" }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { validator: validatePhoneNumber }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Thành phố"
          name="city"
          rules={[{ required: true, message: "Vui lòng chọn thành phố!" }]}
        >
          <Select
            value={selectedCity?.cityId}
            onChange={handleCityChange}
          >
            {cities.map((city) => (
              <Select.Option key={city.cityId} value={city.cityId}>
                {city.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Quận/Huyện"
          name="district"
          rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
        >
          <Select
            value={selectedDistrict?.districtId}
            onChange={handleDistrictChange}
            disabled={!selectedCity}
          >
            {districts.map((district) => (
              <Select.Option key={district.districtId} value={district.districtId}>
                {district.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Phường/Xã"
          name="ward"
          rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
        >
          <Select
            value={selectedWard?.wardId}
            onChange={handleWardChange}
            disabled={!selectedDistrict}
          >
            {wards.map((ward) => (
              <Select.Option key={ward.wardId} value={ward.wardId}>
                {ward.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditAddressModal;