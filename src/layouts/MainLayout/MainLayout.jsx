import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from '../../components/Header';
import s from './styles.module.css';
import { breadcrumbMap } from './BreadCrumbData';
import CommonBreadcrumb from '../../components/Breadcrumb';
import AppFooter from '../../components/Footer';
const MainLayout = () => {
    const location = useLocation();
    const breadcrumbItems = breadcrumbMap[location.pathname] || [];
    return (
        <div className="main-layout">
            <AppHeader className={s['header-sticky']} />
            <main className={`container`} >
                <CommonBreadcrumb items={breadcrumbItems} />
                <Outlet />
            </main>
            <AppFooter />
        </div>
    )
};

export default MainLayout;