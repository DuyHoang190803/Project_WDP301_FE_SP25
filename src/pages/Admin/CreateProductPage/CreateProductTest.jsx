import React, { useState, useEffect } from "react";
import {
    Button,
    Input,
    Card,
    Form,
    Table,
    Upload,
    Modal,
    Checkbox,
    Radio,
    message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CategoryApi from "../../../api/CategoryApi";
import { Tree } from "antd";
import ProductApi from "../../../api/ProductApi";
import { useNavigate } from "react-router-dom";
import "./CreateProductPage.css";
import { toast } from "react-toastify";

const ProductForm = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [fileList, setFileList] = useState([]);
    const [thumbnailFileList, setThumbnailFileList] = useState([]);
    const [imageVariants, setImageVariants] = useState({});
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [categoriesList, setCategoriesList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showVariants, setShowVariants] = useState(false);
    const [numOfVariant, setNumOfVariant] = useState(1);
    const [variant1, setVariant1] = useState({ name: "", values: [""] });
    const [variant2, setVariant2] = useState({ name: "", values: [""] });
    const [variantCombinations, setVariantCombinations] = useState([]);
    const [errorsTable, setErrorsTable] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    const fetchCategories = async () => {
        try {
            const data = await CategoryApi.searchCategories("");
            setCategoriesList(data.data || []);
        } catch (error) {
            console.error("Lỗi khi fetch Categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
        form.setFieldsValue({
            variant1Name: "",
            variant1Values: [""],
            variant2Name: "",
            variant2Values: [""],
        });
    }, []);

    useEffect(() => {
        generateCombinations();
    }, [variant1, variant2]);

    const validateTableData = () => {
        let newErrors = {};
        let isValid = true;

        variantCombinations.forEach((item) => {
            if (!item.price || item.price === "") {
                newErrors[item.key] = { ...newErrors[item.key], price: true };
                isValid = false;
                message.error(`Giá của biến thể "${item.combination}" không được để trống!`);
            }
            if (!item.quantity || item.quantity === "") {
                newErrors[item.key] = { ...newErrors[item.key], quantity: true };
                isValid = false;
                message.error(`Số lượng của biến thể "${item.combination}" không được để trống!`);
            }
        });

        setErrorsTable(newErrors);
        return isValid;
    };

    // Xử lý Tree danh mục
    const transformDataToTree = (data) => {
        return data.map((item) => ({
            title: item.root.name,
            key: item.root._id,
            children: item.root.children
                ? item.root.children.map((child) => ({
                    title: child.name,
                    key: child._id,
                    children: child.children
                        ? child.children.map((subChild) => ({
                            title: subChild.name,
                            key: subChild._id,
                        }))
                        : [],
                }))
                : [],
        }));
    };

    const onSelect = (selectedKeys, info) => {
        if (selectedKeys.length > 0) {
            const selectedNode = info.node;
            setSelectedCategory(selectedNode);
            form.setFieldsValue({ category: selectedNode.key });
        } else {
            setSelectedCategory(null);
            form.setFieldsValue({ category: undefined });
        }
    };

    // Xử lý Upload ảnh
    const handlePreview = async (file) => {
        setPreviewImage(file.url || file.thumbUrl);
        setPreviewVisible(true);
    };

    const handleThumbnailChange = ({ fileList }) => {
        setThumbnailFileList(fileList);
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };
    const handleChangeVariant = (valueIndex, { fileList }) => {
        setImageVariants((prev) => ({
            ...prev,
            [valueIndex]: fileList,
        }));
    };

    const handleRemove = (file) => {
        if (thumbnailFileList.some((item) => item.uid === file.uid)) {
            setThumbnailFileList((prev) => prev.filter((item) => item.uid !== file.uid));
        }

        if (fileList.some((item) => item.uid === file.uid)) {
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
        }

        form.validateFields(["images"]);
    };

    const handleRemoveVariant = (valueIndex, file) => {
        setImageVariants((prev) => ({
            ...prev,
            [valueIndex]:
                prev[valueIndex]?.filter((item) => item.uid !== file.uid) || [],
        }));
    };

    // Xử lý biến thể
    const handleNameChange = (variantKey, value) => {
        if (variantKey === "variant1") {
            setVariant1((prev) => ({ ...prev, name: value }));
        } else {
            setVariant2((prev) => ({ ...prev, name: value }));
        }
    };

    const handleValueChange = (variantKey, index, value) => {
        if (variantKey === "variant1") {
            setVariant1((prev) => {
                const newValues = [...prev.values];
                newValues[index] = value;
                return { ...prev, values: newValues };
            });
        } else {
            setVariant2((prev) => {
                const newValues = [...prev.values];
                newValues[index] = value;
                return { ...prev, values: newValues };
            });
        }
    };

    const handleBlurOrEnter = (variantKey, index, value) => {
        if (value.trim() === "") {
            handleRemoveValue(variantKey, index);
        }
        if (variantKey === "variant1") {
            if (
                variant1.values[index] !== "" &&
                index === variant1.values.length - 1
            ) {
                setVariant1((prev) => ({ ...prev, values: [...prev.values, ""] }));
            }
        } else {
            if (
                variant2.values[index] !== "" &&
                index === variant2.values.length - 1
            ) {
                setVariant2((prev) => ({ ...prev, values: [...prev.values, ""] }));
            }
        }
    };

    const handleRemoveValue = (variantKey, valueIndex) => {
        if (variantKey === "variant1") {
            setVariant1((prev) => {
                let newValues = [...prev.values];
                newValues.splice(valueIndex, 1);
                if (newValues.length === 0) newValues = [""];
                if (newValues[newValues.length - 1].trim() !== "") newValues.push("");
                return { ...prev, values: newValues };
            });
        } else {
            setVariant2((prev) => {
                let newValues = [...prev.values];
                newValues.splice(valueIndex, 1);
                if (newValues.length === 0) newValues = [""];
                if (newValues[newValues.length - 1].trim() !== "") newValues.push("");
                return { ...prev, values: newValues };
            });
        }
    };

    const generateCombinations = () => {
        const uniqueVariantValues = (values) =>
            values
                .map((v, index) => (v.trim() !== "" ? { value: v, index } : null))
                .filter((item) => item !== null)
                .filter(
                    (item, idx, self) =>
                        self.findIndex((v) => v.value === item.value) === idx
                );

        const variantLists = [variant1.values, variant2.values].map(
            uniqueVariantValues
        );

        if (variantLists.every((list) => list.length === 0)) {
            setVariantCombinations([]);
            return;
        }

        let formattedCombinations = [];

        if (variantLists[0].length > 0 && variantLists[1].length > 0) {
            const allCombinations = cartesianProduct(variantLists);
            formattedCombinations = allCombinations.map((combination) => ({
                key: combination.map((c) => c.value).join("-"),
                combination: combination.map((c) => c.value).join(" - "),
                optionIndex: combination.map((c) => c.index),
                price: "",
                quantity: "",
            }));
        } else {
            const singleVariantList = variantLists.find((list) => list.length > 0);
            formattedCombinations = singleVariantList.map((item) => ({
                key: item.value,
                combination: item.value,
                optionIndex: [item.index],
                price: "",
                quantity: "",
            }));
        }

        setVariantCombinations(formattedCombinations);
    };

    const cartesianProduct = (arrays) => {
        return arrays.reduce((a, b) =>
            a.flatMap((d) => b.map((e) => [d, e].flat()))
        );
    };

    const handleTableChange = (key, field, value) => {
        const updatedVariants = variantCombinations.map((item) =>
            item.key === key ? { ...item, [field]: value } : item
        );
        setVariantCombinations(updatedVariants);
    };

    const columns = [
        { title: "Biến thể", dataIndex: "combination", key: "combination" },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (text, record) => (
                <Input
                    type="number"
                    min={0}
                    value={text}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                            handleTableChange(
                                record.key,
                                "price",
                                value === "" ? 0 : Number(value)
                            );
                        }
                    }}
                    onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    addonAfter="VND"
                    status={errorsTable[record.key]?.price ? "error" : ""}
                />
            ),
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (text, record) => (
                <Input
                    type="number"
                    min={0}
                    value={text}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                            handleTableChange(
                                record.key,
                                "quantity",
                                value === "" ? 0 : Number(value)
                            );
                        }
                    }}
                    onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    addonAfter="Sản phẩm"
                    status={errorsTable[record.key]?.quantity ? "error" : ""}
                />
            ),
        },
    ];

    const beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const size = Math.min(img.width, img.height);
                    const canvas = document.createElement("canvas");
                    canvas.width = canvas.height = size;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(
                        img,
                        (img.width - size) / 2,
                        (img.height - size) / 2,
                        size,
                        size,
                        0,
                        0,
                        size,
                        size
                    );
                    canvas.toBlob((blob) => {
                        const croppedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                        });
                        resolve(croppedFile);
                    }, "image/jpeg");
                };
                img.onerror = () => reject(new Error("Không thể tải ảnh!"));
            };
            reader.onerror = () => reject(new Error("Không thể đọc file!"));
        });
    };

    // Xử lý gửi form
    const handleSendProduct = async () => {
        try {
            const values = await form.validateFields();

            if (showVariants && !validateTableData()) {
                return;
            }

            const formattedVariant1 = {
                name: values.variant1Name,
                values: values.variant1Values.map((value, index) => ({
                    name: value,
                    image: imageVariants[index]?.length > 0
                        ? reHandleFileVariants(imageVariants[index])
                        : null,
                })),
            };

            const formattedVariant2 = numOfVariant === 2
                ? {
                    name: values.variant2Name,
                    values: values.variant2Values.map((value) => ({ name: value })),
                }
                : null;

            if (formattedVariant1.values[formattedVariant1.values.length - 1]?.name === "") {
                formattedVariant1.values.pop();
            }
            if (formattedVariant2 && formattedVariant2.values[formattedVariant2.values.length - 1]?.name === "") {
                formattedVariant2.values.pop();
            }

            const finalP = {
                name: values.productName,
                categoryId: selectedCategory?.key,
                description: values.productDes,
                price: showVariants ? 1 : values.productPrice || 1,
                quantity: showVariants ? 1 : values.productQuantity || 1,
                thumbnail: thumbnailFileList[0]?.response,
                images: reHandleFile(fileList),
                ...(showVariants &&
                    variantCombinations.length > 0 && {
                    variants: removeKeys(variantCombinations),
                }),
                ...(showVariants && {
                    options: numOfVariant === 2
                        ? [formattedVariant1, formattedVariant2]
                        : [formattedVariant1],
                }),
            };

            const response = await ProductApi.createProducts(finalP);
            console.log(response);

            if (response.status === 200) {
                message.success("Tạo sản phẩm thành công!");
                navigate("/admin/products");
            } else {
                message.error("Tạo sản phẩm thất bại!");
            }
        } catch (error) {
            console.error("Lỗi xảy ra:", error);
            message.error("Có lỗi xảy ra! Vui lòng kiểm tra lại thông tin.");
        }
    };

    const transformVariant = (variant, imageVariants, shouldIncludeImage) => {
        return {
            name: variant.name,
            values: variant.values.map((value, index) => {
                let variantObject = { name: value };
                if (shouldIncludeImage && imageVariants[index]) {
                    variantObject.image = reHandleFileVariants(imageVariants[index]);
                }
                return variantObject;
            }),
        };
    };

    const reHandleFile = (array) =>
        array.map((item) => ({
            public_id: item.response.public_id,
            url: item.response.url,
        }));

    const reHandleFileVariants = (array) =>
        array?.length > 0
            ? { public_id: array[0].response.public_id, url: array[0].response.url }
            : null;

    const removeKeys = (data) =>
        data.map(({ key, combination, ...rest }) => rest);

    const [quickPrice, setQuickPrice] = useState("");
    const [quickQuantity, setQuickQuantity] = useState("");

    const handleUpdateAllPrice = () => {
        if (quickPrice.trim() === "" || Number(quickPrice) < 0) return;
        const updatedVariants = variantCombinations.map((item) => ({
            ...item,
            price: Number(quickPrice),
        }));
        setVariantCombinations(updatedVariants);
    };

    const handleUpdateAllQuantity = () => {
        if (quickQuantity.trim() === "" || Number(quickQuantity) < 0) return;
        const updatedVariants = variantCombinations.map((item) => ({
            ...item,
            quantity: Number(quickQuantity),
        }));
        setVariantCombinations(updatedVariants);
    };

    // Xử lý modal xác nhận
    const handleShowVariantsChange = (e) => {
        const willShowVariants = e.target.checked;
        const hasVariantData = (
            variant1.name ||
            variant1.values.some(v => v.trim() !== "") ||
            variant2.name ||
            variant2.values.some(v => v.trim() !== "") ||
            variantCombinations.length > 0
        );

        // Nếu có thay đổi trạng thái và đã có dữ liệu biến thể
        if (hasVariantData) {
            setModalAction(() => () => setShowVariants(willShowVariants));
            setModalVisible(true);
        } else {
            setShowVariants(willShowVariants);
        }
    };

    const handleNumOfVariantChange = (e) => {
        if ((variant1.name || variant1.values.some(v => v.trim() !== "") || variant2.name || variant2.values.some(v => v.trim() !== ""))) {
            setModalAction(() => () => {
                setNumOfVariant(e.target.value);
                if (e.target.value === 1) {
                    setVariant2({ name: "", values: [""] });
                    form.setFieldsValue({ variant2Name: "", variant2Values: [""] });
                }
            });
            setModalVisible(true);
        } else {
            setNumOfVariant(e.target.value);
            if (e.target.value === 1) {
                setVariant2({ name: "", values: [""] });
                form.setFieldsValue({ variant2Name: "", variant2Values: [""] });
            }
        }
    };

    const handleModalConfirm = () => {
        // Reset giá trị cũ
        setVariant1({ name: "", values: [""] });
        setVariant2({ name: "", values: [""] });
        setImageVariants({});
        setVariantCombinations([]);
        form.setFieldsValue({
            variant1Name: "",
            variant1Values: [""],
            variant2Name: "",
            variant2Values: [""],
        });

        // Thực hiện hành động được chọn
        modalAction();
        setModalVisible(false);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <Card title="Thêm sản phẩm mới" className="rounded-lg border-gray-200">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSendProduct}
                >
                    <Form.Item
                        label="Tên sản phẩm"
                        name="productName"
                        rules={[
                            { required: true, message: "Tên sản phẩm không được để trống!" },
                            { min: 3, message: "Tên sản phẩm phải có ít nhất 3 ký tự!" },
                            { max: 40, message: "Tên sản phẩm không được vượt quá 40 ký tự!" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Thumbnail"
                        name="thumbnail"
                        rules={[
                            {
                                required: true,
                                validator: () =>
                                    thumbnailFileList.length === 1
                                        ? Promise.resolve()
                                        : Promise.reject("Thumbnail không được để trống!"),
                            },
                        ]}
                    >
                        <Upload
                            action="http://localhost:3000/api/v1/upload/single"
                            listType="picture-card"
                            fileList={thumbnailFileList}
                            onPreview={handlePreview}
                            onChange={handleThumbnailChange}
                            onRemove={handleRemove}
                            multiple={false}
                            beforeUpload={beforeUpload}
                            maxCount={1}
                        >
                            {thumbnailFileList.length >= 1 ? null : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                        <Modal
                            open={previewVisible}
                            footer={null}
                            onCancel={() => setPreviewVisible(false)}
                        >
                            <img alt="preview" style={{ width: "100%" }} src={previewImage} />
                        </Modal>
                    </Form.Item>

                    <Form.Item
                        label="Hình ảnh sản phẩm"
                        name="images"
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (fileList.length === 0) {
                                        return Promise.resolve();
                                    }
                                    if (fileList.length > 9) {
                                        return Promise.reject("Tối đa 9 ảnh!");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Upload
                            action="http://localhost:3000/api/v1/upload/single"
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChange}
                            onRemove={handleRemove}
                            multiple={true}
                            beforeUpload={(file) => {
                                if (thumbnailFileList.length === 0) {
                                    toast.error("Vui lòng tải lên thumbnail trước!");
                                    return Upload.LIST_IGNORE;
                                }
                                return beforeUpload(file);
                            }}
                        >
                            {fileList.length >= 9 ? null : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                        <Modal
                            open={previewVisible}
                            footer={null}
                            onCancel={() => setPreviewVisible(false)}
                        >
                            <img alt="preview" style={{ width: "100%" }} src={previewImage} />
                        </Modal>
                    </Form.Item>

                    <Form.Item
                        label="Mô tả sản phẩm"
                        name="productDes"
                        rules={[
                            {
                                required: true,
                                message: "Mô tả sản phẩm không được để trống!",
                            },
                            { max: 1000, message: "Mô tả không được vượt quá 1000 ký tự!" },
                        ]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        label="Danh mục"
                        name="category"
                        rules={[
                            {
                                required: true,
                                message: "Hãy chọn một danh mục!"
                            },
                        ]}
                    >
                        <Tree
                            treeData={transformDataToTree(categoriesList)}
                            defaultExpandAll
                            onSelect={onSelect}
                        />
                    </Form.Item>

                    {selectedCategory && (
                        <p>
                            <strong>Bạn đã chọn:</strong> {selectedCategory.title}
                        </p>
                    )}

                    <Checkbox
                        onChange={handleShowVariantsChange}
                        checked={showVariants}
                        style={{ marginBottom: "20px" }}
                    >
                        Bật variants sản phẩm
                    </Checkbox>

                    {!showVariants && (
                        <>
                            <Form.Item
                                label="Giá mặc định"
                                name="productPrice"
                                rules={[
                                    {
                                        pattern: /^\d+$/,
                                        message: "Chỉ được nhập số nguyên!",
                                    },
                                    { required: true, message: "Giá không được để trống!" },
                                    {
                                        validator: (_, value) => {
                                            if (isNaN(value) || value < 0 || value > 10000000) {
                                                return Promise.reject("Giá phải từ 0 đến 10,000,000 VND!");
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Input
                                    type="number"
                                    addonAfter="VND"
                                    min={0}
                                    max={10000000}
                                    step={1000}
                                    onChange={(e) => {
                                        let sanitizedValue = e.target.value.replace(/[^0-9]/g, "");
                                        if (Number(sanitizedValue) > 10000000) {
                                            sanitizedValue = "10000000";
                                        }
                                        else if (sanitizedValue && sanitizedValue % 1000 !== 0) {
                                            sanitizedValue = Math.floor(sanitizedValue / 1000) * 1000 || 1000;
                                            message.error("Giá trị phải là bội số của 1,000 VND!");
                                        }
                                        e.target.value = sanitizedValue;
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Số lượng mặc định"
                                name="productQuantity"
                                rules={[
                                    { required: true, message: "Số lượng không được để trống!" },
                                    {
                                        type: "number",
                                        min: 0,
                                        max: 10000000,
                                        message: "Số lượng phải lớn hơn hoặc bằng 0!",
                                        transform: (value) => Number(value),
                                    },
                                    {
                                        validator: (_, value) => {
                                            if (value && !/^\d+$/.test(value)) {
                                                return Promise.reject("Chỉ được nhập số nguyên, không có chữ cái hoặc dấu chấm!");
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Input type="number" addonAfter="Sản phẩm" />
                            </Form.Item>
                        </>
                    )}

                    {showVariants && (
                        <div className="gap-8">
                            <Radio.Group
                                onChange={handleNumOfVariantChange}
                                value={numOfVariant}
                            >
                                <Radio value={1}>Dùng 1 Variant</Radio>
                                <Radio value={2}>Dùng Variant kép</Radio>
                            </Radio.Group>

                            {/* Biến thể 1 */}
                            <div
                                style={{
                                    border: "1px solid gray",
                                    borderRadius: "20px",
                                    padding: "10px",
                                    margin: "20px",
                                }}
                            >
                                <Form.Item
                                    label="Nhập tên biến thể"
                                    name="variant1Name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Hãy nhập tên của biến thể thứ nhất!",
                                        },
                                        {
                                            min: 2,
                                            message: "Tên biến thể phải có ít nhất 2 ký tự!",
                                        },
                                    ]}
                                >
                                    <Input
                                        type="text"
                                        placeholder="VD: Màu sắc"
                                        onChange={(e) => handleNameChange("variant1", e.target.value)}
                                    />
                                </Form.Item>

                                <Form.Item label="Giá trị">
                                    <Form.List name="variant1Values">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map(({ key, name, fieldKey }, valueIndex) => (
                                                    <div
                                                        key={key}
                                                        style={{
                                                            display: "flex",
                                                            padding: "10px",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <Upload
                                                            action="http://localhost:3000/api/v1/upload/single"
                                                            listType="picture-card"
                                                            fileList={imageVariants[valueIndex] || []}
                                                            onPreview={handlePreview}
                                                            onChange={(info) =>
                                                                handleChangeVariant(valueIndex, info)
                                                            }
                                                            onRemove={(file) =>
                                                                handleRemoveVariant(valueIndex, file)
                                                            }
                                                            beforeUpload={beforeUpload}
                                                        >
                                                            {imageVariants[valueIndex]?.length > 0 ? null : (
                                                                <div>
                                                                    <PlusOutlined />
                                                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                                                </div>
                                                            )}
                                                        </Upload>
                                                        <Form.Item
                                                            name={name}
                                                            fieldKey={fieldKey}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: "Hãy nhập giá trị!",
                                                                },
                                                                {
                                                                    min: 1,
                                                                    message: "Giá trị phải có ít nhất 1 ký tự!",
                                                                },
                                                            ]}
                                                            noStyle
                                                        >
                                                            <Input
                                                                style={{ height: "40px", marginLeft: "20px" }}
                                                                type="text"
                                                                placeholder="VD: Đỏ"
                                                                onChange={(e) =>
                                                                    handleValueChange(
                                                                        "variant1",
                                                                        valueIndex,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                onBlur={(e) =>
                                                                    handleBlurOrEnter(
                                                                        "variant1",
                                                                        valueIndex,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                onKeyPress={(e) =>
                                                                    e.key === "Enter" &&
                                                                    handleBlurOrEnter(
                                                                        "variant1",
                                                                        valueIndex,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </Form.Item>
                                                        {fields.length > 1 && (
                                                            <Button
                                                                onClick={() => {
                                                                    remove(name);
                                                                    handleRemoveValue("variant1", valueIndex);
                                                                }}
                                                                style={{ marginLeft: "10px" }}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button
                                                    type="dashed"
                                                    onClick={() => add("")}
                                                    block
                                                    style={{ marginTop: "10px" }}
                                                >
                                                    Thêm giá trị
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                </Form.Item>
                            </div>

                            {/* Biến thể 2 (nếu có) */}
                            {numOfVariant === 2 && (
                                <div
                                    style={{
                                        border: "1px solid gray",
                                        borderRadius: "20px",
                                        padding: "10px",
                                        margin: "20px",
                                    }}
                                >
                                    <Form.Item
                                        label="Nhập tên biến thể"
                                        name="variant2Name"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Hãy nhập tên của biến thể thứ hai!",
                                            },
                                            {
                                                min: 2,
                                                message: "Tên biến thể phải có ít nhất 2 ký tự!",
                                            },
                                        ]}
                                    >
                                        <Input
                                            type="text"
                                            placeholder="VD: Kích thước"
                                            onChange={(e) => handleNameChange("variant2", e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item label="Giá trị">
                                        <Form.List name="variant2Values">
                                            {(fields, { add, remove }) => (
                                                <>
                                                    {fields.map(({ key, name, fieldKey }, valueIndex) => (
                                                        <div key={key} style={{ margin: "4px 0" }}>
                                                            <Form.Item
                                                                name={name}
                                                                fieldKey={fieldKey}
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: "Hãy nhập giá trị!",
                                                                    },
                                                                    {
                                                                        min: 1,
                                                                        message: "Giá trị phải có ít nhất 1 ký tự!",
                                                                    },
                                                                ]}
                                                                noStyle
                                                            >
                                                                <Input
                                                                    type="text"
                                                                    placeholder="VD: L"
                                                                    onChange={(e) =>
                                                                        handleValueChange(
                                                                            "variant2",
                                                                            valueIndex,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    onBlur={(e) =>
                                                                        handleBlurOrEnter(
                                                                            "variant2",
                                                                            valueIndex,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    onKeyPress={(e) =>
                                                                        e.key === "Enter" &&
                                                                        handleBlurOrEnter(
                                                                            "variant2",
                                                                            valueIndex,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </Form.Item>
                                                            {fields.length > 1 && (
                                                                <Button
                                                                    onClick={() => {
                                                                        remove(name);
                                                                        handleRemoveValue("variant2", valueIndex);
                                                                    }}
                                                                    style={{ marginLeft: "10px" }}
                                                                >
                                                                    Xóa
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="dashed"
                                                        onClick={() => add("")}
                                                        block
                                                        style={{ marginTop: "10px" }}
                                                    >
                                                        Thêm giá trị
                                                    </Button>
                                                </>
                                            )}
                                        </Form.List>
                                    </Form.Item>
                                </div>
                            )}
                            <div style={{ width: "100%" }}>
                                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                    <Input
                                        placeholder="Nhập giá nhanh"
                                        type="number"
                                        addonAfter="VND"
                                        min={0}
                                        max={10000000}
                                        onChange={(e) => {
                                            let sanitizedValue = e.target.value.replace(/[^0-9]/g, "");
                                            setQuickPrice(sanitizedValue);
                                            e.target.value = sanitizedValue;
                                        }}
                                    />
                                    <Button type="primary" onClick={handleUpdateAllPrice}>
                                        Fill
                                    </Button>
                                    <Input
                                        type="number"
                                        placeholder="Nhập số lượng nhanh"
                                        value={quickQuantity}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) {
                                                setQuickQuantity(value);
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        addonAfter="Sản phẩm"
                                        min={0}
                                    />
                                    <Button type="primary" onClick={handleUpdateAllQuantity}>
                                        Fill
                                    </Button>
                                </div>

                                <Table
                                    columns={columns}
                                    dataSource={variantCombinations}
                                    pagination={false}
                                />
                            </div>
                        </div>
                    )}

                    <Form.Item style={{ textAlign: "right", marginTop: "20px" }}>
                        <Button type="primary" htmlType="submit">
                            Lưu & Hiển thị
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* Modal xác nhận */}
            <Modal
                title="Xác nhận thay đổi"
                open={modalVisible}
                onOk={handleModalConfirm}
                onCancel={handleModalCancel}
                okText="Đồng ý"
                cancelText="Hủy"
            >
                <p>Thay đổi này sẽ xóa toàn bộ dữ liệu biến thể hiện tại. Bạn có chắc chắn muốn tiếp tục?</p>
            </Modal>
        </div>
    );
};

export default ProductForm;