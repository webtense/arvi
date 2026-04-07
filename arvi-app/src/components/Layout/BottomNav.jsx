import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardSignature, Receipt, FileText } from 'lucide-react';
import './BottomNav.css';

export const BottomNav = () => {
    const navItems = [
        { path: '/app/dashboard', icon: <LayoutDashboard size={24} />, label: 'Inicio' },
        { path: '/app/partes', icon: <ClipboardSignature size={24} />, label: 'Partes' },
        { path: '/app/tickets', icon: <Receipt size={24} />, label: 'Tickets' },
        { path: '/app/facturas', icon: <FileText size={24} />, label: 'Facturas' }
    ];

    return (
        <nav className="bottom-nav">
            <ul>
                {navItems.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="bottom-nav-icon">{item.icon}</span>
                            <span className="bottom-nav-label">{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
