import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardSignature, Receipt, FileText, Calculator, Box } from 'lucide-react';
import './BottomNav.css';

export const BottomNav = () => {
    const navItems = [
        { path: '/app/dashboard', icon: <LayoutDashboard size={22} />, label: 'Inicio' },
        { path: '/app/partes', icon: <ClipboardSignature size={22} />, label: 'Partes' },
        { path: '/app/tickets', icon: <Receipt size={22} />, label: 'Tickets' },
        { path: '/app/facturas', icon: <FileText size={22} />, label: 'Facturas' },
        { path: '/app/presupuestos', icon: <Calculator size={22} />, label: 'Presup.' },
        { path: '/app/activos', icon: <Box size={22} />, label: 'Activos' }
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
