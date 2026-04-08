import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileNav } from './MobileNav';
import './AppLayout.css';

export const AppLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <MobileNav />
            <main className="main-content">
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
            <BottomNav />
        </div>
    );
};
