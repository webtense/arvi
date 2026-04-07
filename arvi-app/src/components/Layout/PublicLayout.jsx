import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import './PublicLayout.css';

export const PublicLayout = ({ children }) => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            window.scrollTo(0, 0);
        } else {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [pathname, hash]);

    return (
        <div className="landing-page">
            <PublicHeader />
            <main className="public-content">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
};
