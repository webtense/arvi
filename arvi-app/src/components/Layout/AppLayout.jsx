import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import './AppLayout.css';

export const AppLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
            <BottomNav />
        </div>
    );
};
