// utils/validation.js

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Password phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và có thể chứa các ký tự đặc biệt
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};


export const trimValidator = (rule, value) => {
  if (!value || typeof value !== "string") {
    return Promise.resolve();
  }

  const trimmedValue = value.trim();

  console.log("trimmedValue:", trimmedValue);

  if (!trimmedValue) {
    return Promise.reject(new Error(rule.message || "Trường này không được để trống!"));
  }

  return Promise.resolve(trimmedValue);
};

export const validatePhoneNumber = (_, value) => {
  const trimmedValue = value && typeof value === "string" ? value.trim() : value;

  if (!trimmedValue) {
    return Promise.reject("Vui lòng nhập số điện thoại!");
  }

  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(trimmedValue)) {
    return Promise.reject("Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số!");
  }

  return Promise.resolve();
};


export const validateMinLength3 = (_, value) => {
  const trimmedValue = value && typeof value === "string" ? value.trim() : value;
  console.log("trimmedValue:", trimmedValue);
  

  if (trimmedValue.length < 3) {
    return Promise.reject("Giá trị phải có ít nhất 3 ký tự!");
  }

  return Promise.resolve();
};