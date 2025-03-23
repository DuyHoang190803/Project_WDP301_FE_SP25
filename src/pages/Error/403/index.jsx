// src/pages/ForbiddenPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Nếu bạn sử dụng React Router
import s from './styles.module.css'; // File CSS module (nếu cần)

const ForbiddenPage = () => {
    return (
        <div className={s.errorPage}>
            <h1>403 - Forbidden</h1>
            <p>Bạn không có quyền truy cập vào trang này.</p>
            <Link to="/" className={s.homeLink}>
                Quay lại trang chủ
            </Link>
        </div>
    );
};

export default ForbiddenPage;