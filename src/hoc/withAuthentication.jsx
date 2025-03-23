import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const withAuthentication = (WrappedComponent) => {
  const WithAuthentication = (props) => {
    const { userInfo } = useSelector((state) => state.user);
    if (!userInfo) {
      // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
      return <Navigate to="/login" />;
    }

    // Nếu người dùng đã đăng nhập, render component được bảo vệ
    return <WrappedComponent {...props} />;
  };

  return WithAuthentication;
};

export default withAuthentication;