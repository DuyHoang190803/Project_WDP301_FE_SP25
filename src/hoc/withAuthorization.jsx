import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { restoreUserFromToken } from "../redux/slices/authSlice";
import { setRestoringComplete } from "../redux/slices/authSlice";

const withAuthorization = (allowedRoles) => (WrappedComponent) => {
  const WithAuthorization = (props) => {
    const { userInfo, isAuthenticated, isRestoring, loading } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
      // Khởi động khôi phục user từ token nếu chưa làm
      if (isRestoring && !loading) {
        dispatch(restoreUserFromToken())
          .unwrap()
          .catch(() => dispatch(setRestoringComplete())); // Đặt isRestoring = false nếu thất bại
      }
    }, [dispatch, isRestoring, loading]);

    // Chờ khôi phục hoàn tất trước khi kiểm tra quyền
    if (isRestoring) {
      return null; // Hoặc hiển thị loading spinner
    }

    const userRoles = userInfo?.role || [];
    if (!isAuthenticated || !allowedRoles.some((role) => userRoles.includes(role))) {
      return <Navigate to="/unauthorized" />;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthorization;
};

export default withAuthorization;