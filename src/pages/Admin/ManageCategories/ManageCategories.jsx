import React, { useEffect, useState } from "react";
import s from "../ManageCategories/ManageCategories.module.css";
import CategoryApi from "../../../api/CategoryApi";

const ManageCategories = () => {
  const [resetValue, setResetValue] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [message, setMessage] = useState(""); // Thông báo
  const [messageType, setMessageType] = useState(""); // "success" hoặc "error"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Kiểm soát modal
  const [editCategory, setEditCategory] = useState(null); // Lưu danh mục cần sửa
  const [newCategoryName, setNewCategoryName] = useState(""); // Lưu tên mới
  const handleEditCategory = (category) => {
    setEditCategory(category);
    setNewCategoryName(category.name); // Hiển thị tên cũ trong input
    setIsEditModalOpen(true);
  };

  const handleAddCategory = async (id) => {
    const timestamp = new Date().toLocaleString(); // Lấy ngày giờ hiện tại

    const payload = id
      ? { parentId: id, name: `Danh mục ngày: ${timestamp}` }
      : { name: `Danh mục ngày: ${timestamp}` };

    const data = await CategoryApi.createCategories(payload);

    setResetValue(resetValue + 1);
  };

  const handleDeleteCategory = async (cate) => {
    const warning = await CategoryApi.categoriesIsUsed(cate._id);
    console.log(warning);
    if (warning.data.hasProduct == true) {
      if (cate._id == selectedCategory._id) {
        setSelectedCategory(null);
        setSubCategory(null);
      }
      if (cate._id == subCategory._id) {
        setSubCategory(null);
      }
      const data = await CategoryApi.deleteCategories(cate._id);
    } else {
      if (cate._id == selectedCategory._id) {
        setSelectedCategory(null);
        setSubCategory(null);
      }
      if (cate._id == subCategory._id) {
        setSubCategory(null);
      }
      const data = await CategoryApi.deleteCategories(cate._id);
    }

    setResetValue(resetValue + 1);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage("Tên danh mục không được để trống!");
      setMessageType("error");

      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return;
    }

    const nName = { name: newCategoryName };

    try {
      const data = await CategoryApi.updateCategories(editCategory._id, nName);
      // Nếu cập nhật thành công
      setMessage("Cập nhật danh mục thành công!");
      setMessageType("success");
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        setIsEditModalOpen(false);
      }, 1500);
      setResetValue(resetValue + 1);
    } catch (error) {
      setMessage("Tên của danh mục này đã tồn tại! Vui lòng nhập tên khác.");
      setMessageType("error");

      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);

      console.error("Lỗi cập nhật danh mục:", error);
    }
  };

  // fetch category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryApi.searchCategories(""); // Thêm await
        setCategoriesList(data.data || []); // Đảm bảo không lỗi khi data undefined
        console.log(data.data);

        if (selectedCategory) {
          const foundCategory = data.data.find(
            (cate) => cate.root?._id === selectedCategory._id
          );
          if (foundCategory) {
            setSelectedCategory(foundCategory.root);
          }
        }

        if (subCategory) {
          const foundCategory = data.data.find((cate) =>
            cate.root?.children?.find((cr) => cr?._id === subCategory._id)
          );

          if (foundCategory) {
            const foundSubCategory = foundCategory.root?.children.find(
              (cr) => cr?._id === subCategory._id
            );
            setSubCategory(foundSubCategory);
          }
          console.log("có vào:", foundCategory);
        }
      } catch (error) {
        console.error("Lỗi r các cu ơi:", error);
      }
    };
    fetchCategories();
  }, [resetValue]);

  //Chọn danh mục tầng 1
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSubCategory(null);
  };

  // Chọn danh mục tầng 2
  const handleSelectSubCategory = (sub) => {
    setSubCategory(sub);
  };

  // Đây là search bằng key
  const handleSearchCategory = (sKey) => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryApi.searchCategories(searchKey); // Thêm await
        setCategoriesList(data.data || []); // Đảm bảo không lỗi khi data undefined
        console.log(data.data);
      } catch (error) {
        console.error("Lỗi r các cu ơi:", error);
      }
    };
    fetchCategories();
  };

  return (
    <div className={s["category-container"]}>
      <h1>Quản lý danh mục</h1>
      <div className={s["search-container"]}>
        <input
          type="text"
          className={s["search-input"]}
          placeholder="Tìm kiếm..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
        <button
          onClick={() => handleSearchCategory()}
          className={s["search-button"]}
        >
          🔍
        </button>
      </div>
      <div className={s["category-columns"]}>
        <div className={s["category-section"]}>
          <h2 style={{ height: "65px" }}>Danh mục chủ</h2>
          <ul className={s["category-form-ul"]}>
            {categoriesList?.map((category) => (
              <div
                className={s["category-item-wrapper"]}
                key={category.root?._id}
              >
                <li
                  className={`${s["category-form-li"]} ${
                    selectedCategory?._id === category.root?._id
                      ? s["selected"]
                      : ""
                  }`}
                  onClick={() => handleSelectCategory(category.root)}
                >
                  <span>{category.root?.name}</span>
                </li>
                <div
                  className={s["icon-box"]}
                  onClick={() => handleEditCategory(category.root)}
                >
                  <img
                    src="../../../public/images/admin/EditIcon.png"
                    alt="icon1"
                  />
                </div>
                <div
                  className={s["icon-box"]}
                  onClick={() => handleDeleteCategory(category.root)}
                >
                  <img
                    src="../../../public/images/admin/deleteIconNew.png"
                    alt="icon2"
                  />
                </div>
              </div>
            ))}
            <li
              className={`${s["category-form-li"]} ${s["add-btn"]}`}
              onClick={() => handleAddCategory(null)}
            >
              + Thêm mới danh mục
            </li>
          </ul>
        </div>
        <div className={s["category-section"]}>
          {selectedCategory ? (
            <h2 style={{ height: "65px" }}>{selectedCategory.name}</h2>
          ) : (
            <h2 style={{ height: "65px" }}>Hãy chọn danh mục chủ</h2>
          )}
          {selectedCategory ? (
            <ul className={s["category-form-ul"]}>
              {selectedCategory.children.map((sub) => (
                <div className={s["category-item-wrapper"]} key={sub._id}>
                  <li
                    className={`${s["category-form-li"]} ${
                      subCategory?._id === sub._id ? s["selected"] : ""
                    }`}
                    onClick={() => handleSelectSubCategory(sub)}
                  >
                    <span>{sub.name}</span>
                  </li>
                  <div
                    className={s["icon-box"]}
                    onClick={() => handleEditCategory(sub)}
                  >
                    <img
                      src="../../../public/images/admin/EditIcon.png"
                      alt="icon1"
                    />
                  </div>
                  <div
                    className={s["icon-box"]}
                    onClick={() => handleDeleteCategory(sub)}
                  >
                    <img
                      src="../../../public/images/admin/deleteIconNew.png"
                      alt="icon2"
                    />
                  </div>
                </div>
              ))}
              <li
                className={`${s["category-form-li"]} ${s["add-btn"]}`}
                onClick={() => handleAddCategory(selectedCategory?._id)}
              >
                + Thêm vào {selectedCategory?.name}
              </li>
            </ul>
          ) : (
            <p></p>
          )}
        </div>
        <div className={s["category-section"]}>
          {subCategory ? (
            <h2 style={{ height: "65px" }}>{subCategory.name}</h2>
          ) : (
            <h2 style={{ height: "65px" }}>Hãy chọn danh mục 2</h2>
          )}
          {subCategory ? (
            <ul className={s["category-form-ul"]}>
              {subCategory.children.map((item) => (
                <div className={s["category-item-wrapper"]} key={item._id}>
                  <li className={s["category-form-li"]}>
                    <span>{item.name}</span>
                  </li>
                  <div
                    className={s["icon-box"]}
                    onClick={() => handleEditCategory(item)}
                  >
                    <img
                      src="../../../public/images/admin/EditIcon.png"
                      alt="icon1"
                    />
                  </div>
                  <div
                    className={s["icon-box"]}
                    onClick={() => handleDeleteCategory(item)}
                  >
                    <img
                      src="../../../public/images/admin/deleteIconNew.png"
                      alt="icon2"
                    />
                  </div>
                </div>
              ))}
              <li
                className={`${s["category-form-li"]} ${s["add-btn"]}`}
                onClick={() => handleAddCategory(subCategory?._id)}
              >
                + Thêm vào {subCategory?.name}
              </li>
            </ul>
          ) : (
            <p></p>
          )}
        </div>
      </div>
      {isEditModalOpen && (
        <div className={s["modal"]}>
          <div className={s["modal-content"]}>
            <h2>Chỉnh sửa danh mục</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nhập tên mới..."
              maxLength={35}
            />
            {message && (
              <p
                className={
                  s[
                    messageType === "error"
                      ? "error-message"
                      : "success-message"
                  ]
                }
              >
                {message}
              </p>
            )}
            <div className={s["modal-buttons"]}>
              <button onClick={() => handleSaveCategory()}>Lưu</button>
              <button onClick={() => setIsEditModalOpen(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
