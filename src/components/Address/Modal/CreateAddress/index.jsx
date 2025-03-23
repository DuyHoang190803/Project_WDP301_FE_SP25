import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Form, Select } from "antd";
import AddressApi from "../../../../api/AddressApi";
import { validatePhoneNumber, trimValidator, validateMinLength3 } from "../../../../utils/validation";

function CreateAddressModal({ visible, onClose, onCreate }) {
  const [form] = Form.useForm();

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  // Reset form and selections when modal visibility changes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedCity(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
    }
  }, [visible, form]);

  // Fetch cities on component mount
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

  // Fetch districts when city changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedCity?.cityId) {
        try {
          const response = await AddressApi.getAllDistrictByCityId(selectedCity.cityId);
          setDistricts(response?.data || []);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      } else {
        setDistricts([]);
      }
      // Reset district and ward selections
      setSelectedDistrict(null);
      setSelectedWard(null);
      form.setFieldsValue({ district: undefined, ward: undefined });
    };
    fetchDistricts();
  }, [selectedCity, form]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict?.districtId) {
        try {
          const response = await AddressApi.getAllWardByDistrictId(selectedDistrict.districtId);
          setWards(response?.data || []);
        } catch (error) {
          console.error("Error fetching wards:", error);
        }
      } else {
        setWards([]);
      }
      // Reset ward selection
      setSelectedWard(null);
      form.setFieldsValue({ ward: undefined });
    };
    fetchWards();
  }, [selectedDistrict, form]);

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
        city: selectedCity,
        district: selectedDistrict,
        ward: selectedWard,
      };

      await onCreate(fullAddress);
      onClose();
    } catch (error) {
      console.error("Error processing address:", error);
    }
  };

  return (
    <Modal
      title="Thêm địa chỉ mới"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Thêm
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
            onChange={(value) => {
              const city = cities.find(c => c.cityId === value);
              setSelectedCity(city);
            }}
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
            onChange={(value) => {
              const district = districts.find(d => d.districtId === value);
              setSelectedDistrict(district);
            }}
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
            onChange={(value) => {
              const ward = wards.find(w => w.wardId === value);
              setSelectedWard(ward);
            }}
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

export default CreateAddressModal;