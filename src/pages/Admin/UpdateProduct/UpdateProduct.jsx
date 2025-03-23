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
import { useNavigate, useParams } from "react-router-dom";
import "./UpdateProduct.css";
const UpdateProduct = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [productName, setProductName] = useState("");
  const [productDes, setProductDes] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [variant1, setVariant1] = useState({ name: "", values: [""] });
  const [variant2, setVariant2] = useState({ name: "", values: [""] });
  const [variantCombinations, setVariantCombinations] = useState([]);
  const [oldTableValue, setOldTableValue] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [imageVariants, setImageVariants] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showVariants, setShowVariants] = useState(false);
  const [numOfVariant, setNumOfVariant] = useState(1);
  const [oldProduct, setOldProduct] = useState({});
  const [finalProduct, setFinalProduct] = useState({});
  const [firstIn, setFirstIn] = useState(0);
  const { id } = useParams();
  const [isClick, setIsClick] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryApi.searchCategories("");
        const pData = await ProductApi.getProductsById(id);
        setCategoriesList(data.data || []);
        setOldProduct(pData.data || {});
        setProductName(pData.data.product.name);
        setProductDes(pData.data.product.description);
        setFileList(pData.data.product.images);
        setSelectedCategory(pData.data.product.categoryId);
        setProductPrice(pData.data.product.price);
        setProductQuantity(pData.data.product.quantity);
        setOldTableValue(pData.data.variants);
        if (pData.data.variants.length > 0) {
          setShowVariants(true);
          if (pData.data.product.options.length > 1) {
            const transformedVariant1 = {
              name: pData.data.product.options[0].name,
              values: pData.data.product.options[0].values.map((v) => v.name),
            };
            const transformedVariant2 = {
              name: pData.data.product.options[1].name,
              values: pData.data.product.options[1].values.map((v) => v.name),
            };
            const imageVariants1 = pData.data.product.options[0].values.reduce(
              (acc, v, index) => {
                acc[index] = v.image ? [v.image] : []; // Lưu ảnh theo index của giá trị variant
                return acc;
              },
              {}
            );

            setNumOfVariant(2);
            setVariant1(transformedVariant1);
            setVariant2(transformedVariant2);
            console.log("ảnh: ", imageVariants1);

            setImageVariants(imageVariants1);
          }
          if (pData.data.product.options.length == 1) {
            const transformedVariant1 = {
              name: pData.data.product.options[0].name,
              values: pData.data.product.options[0].values.map((v) => v.name),
            };
            const imageVariants1 = pData.data.product.options[0].values.reduce(
              (acc, v, index) => {
                acc[index] = v.image ? [v.image] : []; // Lưu ảnh theo index của giá trị variant
                return acc;
              },
              {}
            );
            setNumOfVariant(1);
            setVariant1(transformedVariant1);
            setImageVariants(imageVariants1);
          }
          setFirstIn(firstIn + 1);
        }
      } catch (error) {
        console.error("Lỗi khi fetch Categories hoặc product:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    generateCombinations();
  }, [variant1, variant2]);
  const updateVariantCombinations = (newVariants) => {
    setVariantCombinations((prevCombinations) => {
      // Tạo một bản sao của danh sách hiện tại
      let updatedCombinations = [...prevCombinations];

      newVariants.forEach(({ optionIndex, price, quantity }) => {
        const existingIndex = updatedCombinations.findIndex(
          (comb) =>
            JSON.stringify(comb.optionIndex) === JSON.stringify(optionIndex)
        );

        if (existingIndex !== -1) {
          // Nếu đã tồn tại, cập nhật giá trị
          updatedCombinations[existingIndex] = {
            ...updatedCombinations[existingIndex],
            price,
            quantity,
          };
        } else {
          // Nếu chưa tồn tại, thêm mới vào bảng
          updatedCombinations.push({
            key: optionIndex.join("-"),
            combination: optionIndex.join(" - "),
            optionIndex,
            price,
            quantity,
          });
        }
      });

      return updatedCombinations;
    });
  };

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
    setSelectedCategory(info.node);
  };
  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    console.log(file);
    setPreviewVisible(true);
  };

  const handleChange = ({ fileList }) => setFileList(fileList);
  const handleChangeVariant = (valueIndex, { fileList }) => {
    setImageVariants((prev) => ({
      ...prev,
      [valueIndex]: fileList, // Gán ảnh theo valueIndex
    }));
  };

  const handleRemove = (file) => {
    setFileList(fileList.filter((item) => item.uid !== file.uid));
  };

  const handleRemoveVariant = (valueIndex, file) => {
    setImageVariants((prev) => ({
      ...prev,
      [valueIndex]:
        prev[valueIndex]?.filter((item) => item.uid !== file.uid) || [],
    }));
  };

  const handleNameChange = (variantKey, value) => {
    if (variantKey === "variant1") {
      setVariant1((prev) => ({ ...prev, name: value }));
    } else {
      setVariant2((prev) => ({ ...prev, name: value }));
    }
  };
  // sửa ở đây là 1
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

  // sửa ở đây là 2
  const handleBlurOrEnter = (variantKey, index, value) => {
    if (value.trim() === "") {
      handleRemoveValue(variantKey, index); // Nếu giá trị rỗng, gọi hàm xóa
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
  // sửa ở đây là 3
  const handleRemoveValue = (variantKey, valueIndex) => {
    if (variantKey === "variant1") {
      setVariant1((prev) => {
        let newValues = [...prev.values];
        newValues.splice(valueIndex, 1); // Xóa giá trị tại vị trí cụ thể

        // Nếu danh sách rỗng, giữ lại một ô nhập trống
        if (newValues.length === 0) {
          newValues = [""];
        }

        // Nếu ô cuối cùng không trống, thêm một ô trống vào cuối
        if (newValues[newValues.length - 1].trim() !== "") {
          newValues.push("");
        }

        return { ...prev, values: newValues };
      });
    } else {
      setVariant2((prev) => {
        let newValues = [...prev.values];
        newValues.splice(valueIndex, 1);

        if (newValues.length === 0) {
          newValues = [""];
        }

        if (newValues[newValues.length - 1].trim() !== "") {
          newValues.push("");
        }

        return { ...prev, values: newValues };
      });
    }
  };

  const generateCombinations = () => {
    // Loại bỏ các giá trị trùng nhau trong từng variant
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

    // Nếu cả hai bảng đều không có giá trị thì không tạo tổ hợp
    if (variantLists.every((list) => list.length === 0)) {
      setVariantCombinations([]);
      return;
    }

    let formattedCombinations = [];

    if (variantLists[0].length > 0 && variantLists[1].length > 0) {
      // Trường hợp cả hai bảng đều có giá trị -> tạo tổ hợp
      const allCombinations = cartesianProduct(variantLists);

      formattedCombinations = allCombinations.map((combination) => ({
        key: combination.map((c) => c.value).join("-"),
        combination: combination.map((c) => c.value).join(" - "),
        optionIndex: combination.map((c) => c.index),
        price: "",
        quantity: "",
      }));
    } else {
      // Chỉ có một bảng có giá trị -> giữ nguyên danh sách đó
      const singleVariantList = variantLists.find((list) => list.length > 0);

      formattedCombinations = singleVariantList.map((item) => ({
        key: item.value,
        combination: item.value,
        optionIndex: [item.index], // Lưu index vào một mảng
        price: "",
        quantity: "",
      }));
    }

    // Cập nhật state với danh sách tổ hợp đã tạo
    setVariantCombinations(formattedCombinations);
    console.log(formattedCombinations);
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
          min={0} // Không cho phép nhập số âm
          value={text}
          onChange={(e) => {
            const value = e.target.value.trim() === "" ? "0" : e.target.value; // Nếu trống, mặc định là 0
            handleTableChange(record.key, "price", Math.max(0, Number(value)));
          }}
          addonAfter="VND"
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
          min={0} // Không cho phép nhập số âm
          value={text}
          onChange={(e) => {
            const value = e.target.value.trim() === "" ? "0" : e.target.value; // Nếu trống, mặc định là 0
            handleTableChange(
              record.key,
              "quantity",
              Math.max(0, Number(value))
            );
          }}
          addonAfter="Sản phẩm"
        />
      ),
    },
  ];

  function reHandleFile(array) {
    return array.map((item) => ({
      public_id: item?.response?.public_id || item.public_id,
      url: item?.response?.url || item.url,
    }));
  }
  function reHandleFileVariants(array) {
    console.log("test 1:", array[0]);

    if (!array || array.length === 0) return null; // Trả về null nếu mảng rỗng hoặc undefined

    const item = array[0]; // Lấy phần tử đầu tiên
    return {
      public_id: item?.response?.public_id || item.public_id,
      url: item?.response?.url || item.url,
    };
  }

  const transformVariant = (
    variant,
    imageVariants,
    shouldIncludeImage = false
  ) => {
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
  const removeKeys = (data) => {
    return data.map(({ key, combination, ...rest }) => rest);
  };

  const handleSendProduct = async () => {
    try {
      // Chuẩn bị dữ liệu variants
      const formattedVariant1 = transformVariant(variant1, imageVariants, true);
      const formattedVariant2 = transformVariant(variant2 || {}, [], false);

      // Xóa phần tử cuối cùng trong values của variants
      formattedVariant1.values.pop();
      formattedVariant2.values.pop();

      // Chuẩn bị object dữ liệu gửi đi
      const finalP = {
        name: productName,
        categoryId: selectedCategory.key || selectedCategory._id,
        description: productDes,
        price: productPrice || 1,
        quantity: productQuantity || 1,
        thumbnail: fileList[0].response,
        images: reHandleFile(fileList),
        ...(variantCombinations.length > 0 && {
          variants: removeKeys(variantCombinations),
        }),
        ...(!(
          formattedVariant1?.name === 0 ||
          (Array.isArray(formattedVariant1?.values) &&
            formattedVariant1.values.length === 0)
        ) ||
        !(
          formattedVariant2?.name === 0 ||
          (Array.isArray(formattedVariant2?.values) &&
            formattedVariant2.values.length === 0)
        )
          ? {
              options: [formattedVariant1, formattedVariant2],
            }
          : {}),
      };

      console.log(finalP);
      // Gọi API
      const response = await ProductApi.updateProducts(id, finalP);

      // Kiểm tra nếu API trả về thành công (status 200)
      if (response.status === 200) {
        console.log("Sản phẩm đã được update thành công!");

        // Hiển thị thông báo thành công
        message.success("Update sản phẩm thành công!");

        // Chuyển hướng (ví dụ: về trang danh sách sản phẩm)
        navigate("/admin/products");
      } else {
        console.error("Lỗi khi tạo sản phẩm:", response);
        message.error("Tạo sản phẩm thất bại! Vui lòng thử lại.");
      }
    } catch (error) {
      setIsClick(true);
      console.error("Lỗi xảy ra:", error);
      message.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
    }
  };
  const beforeUpload = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const size = Math.min(img.width, img.height); // Lấy kích thước nhỏ nhất để crop
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
              lastModified: Date.now(),
            });

            resolve(croppedFile);
          }, "image/jpeg");
        };
      };
    });
  };
  const [quickPrice, setQuickPrice] = useState("");
  const [quickQuantity, setQuickQuantity] = useState("");

  // Hàm cập nhật toàn bộ giá của bảng
  const handleUpdateAllPrice = () => {
    if (quickPrice.trim() === "" || Number(quickPrice) < 0) return;
    const updatedVariants = variantCombinations.map((item) => ({
      ...item,
      price: Number(quickPrice),
    }));
    setVariantCombinations(updatedVariants);
  };

  // Hàm cập nhật toàn bộ số lượng của bảng
  const handleUpdateAllQuantity = () => {
    if (quickQuantity.trim() === "" || Number(quickQuantity) < 0) return;
    const updatedVariants = variantCombinations.map((item) => ({
      ...item,
      quantity: Number(quickQuantity),
    }));
    setVariantCombinations(updatedVariants);
  };
  return (
    <div
      className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg"
      style={{ display: "flex", justifyContent: "space-around" }}
    >
      <Card
        style={{ width: "48%" }}
        title="Thêm sản phẩm mới"
        className="rounded-lg border-gray-200"
      >
        <Form layout="vertical">
          <Form.Item
            label="Hình ảnh sản phẩm"
            validateStatus={isClick ? "error" : ""}
            help={
              fileList.length == 0
                ? "Cần ít nhất 1 ảnh!"
                : fileList.length >= 9
                ? "Tối đa 9 ảnh!"
                : ""
            }
          >
            <Upload
              action="http://localhost:3000/api/v1/upload/single"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              onRemove={handleRemove}
              multiple={true}
              beforeUpload={beforeUpload}
            >
              {fileList.length >= 9 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
            <Modal
              visible={previewVisible}
              footer={null}
              onCancel={() => setPreviewVisible(false)}
            >
              <img alt="preview" style={{ width: "100%" }} src={previewImage} />
            </Modal>
          </Form.Item>

          <Form.Item
            label="Tên sản phẩm"
            className="font-semibold custom-help-text"
            validateStatus={isClick ? "error" : ""}
            help={
              !productName
                ? "Tên sản phẩm không được để trống!"
                : productName.length < 3
                ? "Tên sản phẩm phải có ít nhất 3 ký tự!"
                : productName.length > 40
                ? "Tên sản phẩm không được vượt quá 40 ký tự!"
                : ""
            }
          >
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả sản phẩm"
            className="font-semibold custom-help-text"
            validateStatus={isClick ? "error" : ""}
            help={
              !productDes
                ? "Mô tả sản phẩm không được để trống!"
                : productDes.length < 3
                ? "Mô tả sản phẩm phải ít hơn 1000 kí tự!"
                : ""
            }
          >
            <Input.TextArea
              rows={4}
              value={productDes}
              onChange={(e) => setProductDes(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            className="font-semibold custom-help-text"
            validateStatus={isClick ? "error" : ""}
            help={!selectedCategory ? "Hãy chọn 1 danh mục cho sản phẩm!" : ""}
          >
            <Tree
              treeData={transformDataToTree(categoriesList)}
              defaultExpandAll
              onSelect={onSelect}
            />
          </Form.Item>

          {selectedCategory && (
            <p>
              <strong>Danh mục cũ:</strong>{" "}
              {selectedCategory.name || selectedCategory.title}
            </p>
          )}
          <Checkbox
            checked={showVariants}
            onChange={(e) => setShowVariants(e.target.checked)}
            style={{ marginBottom: "20px" }}
          >
            Bật variants sản phẩm
          </Checkbox>
          {!showVariants && (
            <div>
              <Form.Item label="Giá mặc định" className="font-semibold custom-help-text">
                <Input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  addonAfter="VND"
                />
              </Form.Item>
              <Form.Item label="Số lượng mặc định" className="font-semibold custom-help-text">
                <Input
                  type="number"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                  addonAfter="Sản phẩm"
                />
              </Form.Item>
            </div>
          )}
          {showVariants && (
            <div className="gap-8">
              <Radio.Group
                onChange={(e) => {
                  setNumOfVariant(e.target.value);
                  if (e.target.value == 1) {
                    setVariant2({ name: "", values: [""] });
                  }
                }}
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
                  className="font-semibold custom-help-text"
                  validateStatus={isClick ? "error" : ""}
                  help={
                    variant1.name.length == 0
                      ? "Hãy nhập tên của biến thể thứ nhất!"
                      : ""
                  }
                >
                  <Input
                    type="text"
                    placeholder="VD: Màu sắc"
                    value={variant1.name}
                    onChange={(e) =>
                      handleNameChange("variant1", e.target.value)
                    }
                  />
                </Form.Item>

                <Form.Item label="Giá trị" className="font-semibold custom-help-text">
                  {variant1.values.map((value, valueIndex) => (
                    <div
                      style={{
                        display: "flex",
                        padding: "10px",
                        alignItems: "center",
                      }}
                    >
                      <Upload
                        action="http://localhost:3000/api/v1/upload/single"
                        listType="picture-card"
                        fileList={imageVariants[valueIndex] || []} // Lấy ảnh theo valueIndex
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

                      <Modal
                        visible={previewVisible}
                        footer={null}
                        onCancel={() => setPreviewVisible(false)}
                      >
                        <img
                          alt="preview"
                          style={{ width: "100%" }}
                          src={previewImage}
                        />
                      </Modal>
                      <Input
                        style={{ height: "40px" }}
                        key={valueIndex}
                        type="text"
                        placeholder="VD: Đỏ"
                        value={value}
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
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleBlurOrEnter(
                              "variant1",
                              valueIndex,
                              e.target.value
                            );
                          }
                        }}
                      />
                    </div>
                  ))}
                </Form.Item>
              </div>

              {/* Biến thể 2 */}
              {numOfVariant == 2 && (
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
                    className="font-semibold custom-help-text"
                    validateStatus={isClick ? "error" : ""}
                    help={
                      variant2.name.length == 0
                        ? "Hãy nhập tên của biến thể thứ 2!"
                        : ""
                    }
                  >
                    <Input
                      type="text"
                      placeholder="VD: Kích thước"
                      value={variant2.name}
                      onChange={(e) =>
                        handleNameChange("variant2", e.target.value)
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Giá trị" className="font-semibold custom-help-text">
                    {variant2.values.map((value, valueIndex) => (
                      <Input
                        key={valueIndex}
                        type="text"
                        placeholder="VD: L"
                        value={value}
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
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleBlurOrEnter(
                              "variant2",
                              valueIndex,
                              e.target.value
                            );
                          }
                        }}
                      />
                    ))}
                  </Form.Item>
                </div>
              )}
            </div>
          )}
          <div style={{ textAlign: "right", marginTop: "20px" }}>
            {showVariants ? (
              <></>
            ) : (
              <Button onClick={() => handleSendProduct()} type="primary">
                Lưu & Hiển thị
              </Button>
            )}
          </div>
        </Form>
      </Card>
      <div style={{ width: "48%" }}>
        {showVariants && (
          <div>
            {/* Ô nhập giá nhanh và số lượng nhanh */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <Input
                type="number"
                placeholder="Nhập giá nhanh"
                value={quickPrice}
                onChange={(e) => setQuickPrice(e.target.value)}
                addonAfter="VND"
                min={0}
              />
              <Button type="primary" onClick={handleUpdateAllPrice}>
                Fill
              </Button>

              <Input
                type="number"
                placeholder="Nhập số lượng nhanh"
                value={quickQuantity}
                onChange={(e) => setQuickQuantity(e.target.value)}
                addonAfter="Sản phẩm"
                min={0}
              />
              <Button type="primary" onClick={handleUpdateAllQuantity}>
                Fill
              </Button>
            </div>

            {/* Bảng hiển thị biến thể */}
            <Table
              columns={columns}
              dataSource={variantCombinations}
              pagination={false}
            />

            {/* Nút lưu & hiển thị */}
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <Button onClick={() => handleSendProduct()} type="primary">
                Lưu & Hiển thị
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateProduct;
