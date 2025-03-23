// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Nếu bạn sử dụng React Router
import s from './styles.module.css'; // File CSS module (nếu cần)

const NotFoundPage = () => {
    return (
        <div className={s.errorPage}>
            <h1>404 - Not Found</h1>
            <p>Trang bạn đang tìm kiếm không tồn tại.</p>
            <Link to="/" className={s.homeLink}>
                Quay lại trang chủ
            </Link>
        </div>
    );
};

export default NotFoundPage;