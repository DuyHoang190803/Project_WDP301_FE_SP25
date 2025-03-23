// utils/passwordValidator.js

// Kiểm tra mật khẩu phải có ít nhất 8 ký tự
const validateLength = (password) => {
    return password.length >= 8;
  };
  
  // Kiểm tra mật khẩu phải có ít nhất 1 chữ cái và 1 số
  const validatePasswordComplexity = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  };
  
  // Kiểm tra mật khẩu
  const validatePassword = (password) => {
    if (!validateLength(password)) {
      return false;  // Mật khẩu không đủ dài
    }
    if (!validatePasswordComplexity(password)) {
      return false;  // Mật khẩu không có chữ cái và số
    }
    return true;  // Mật khẩu hợp lệ
  };
  
  export { validatePassword };
  