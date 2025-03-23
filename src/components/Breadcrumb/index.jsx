import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import s from "./styles.module.css";

const CommonBreadcrumb = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className={s.breadcrumb}>
            {items.map((item, index) => (
                <div key={index} className={s.breadcrumbItem}>
                    {item.link ? (
                        <Link to={item.link} className={s.breadcrumbLink}>
                            {item.label || item.text}
                        </Link>
                    ) : (
                        <span className={s.breadcrumbText}>{item.label || item.text}</span>
                    )}
                    {index < items.length - 1 && <ChevronRight className={s.breadcrumbIcon} />}
                </div>
            ))}
        </nav>
    );
};

export default CommonBreadcrumb;