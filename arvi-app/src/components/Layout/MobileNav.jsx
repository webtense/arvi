import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardSignature, Receipt, FileText, Settings as LucideSettings, CalendarClock, Box, Calculator, Users, FolderOpen, UserCircle, BookOpen, X, Menu, LogOut } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import './MobileNav.css';

export const MobileNav = () => {
    const { settings } = useSettings();
    const { activeServices } = settings;
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navItems = [
        { path: '/app/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard', enabled: true },
        { path: '/app/partes', icon: <ClipboardSignature size={22} />, label: 'Partes', enabled: activeServices.parts },
        { path: '/app/preventivo', icon: <CalendarClock size={22} />, label: 'Preventivo', enabled: activeServices.preventive },
        { path: '/app/activos', icon: <Box size={22} />, label: 'Activos', enabled: activeServices.assets },
        { path: '/app/tickets', icon: <Receipt size={22} />, label: 'Tickets', enabled: activeServices.tickets },
        { path: '/app/facturas', icon: <FileText size={22} />, label: 'Facturas', enabled: true },
        { path: '/app/presupuestos', icon: <Calculator size={22} />, label: 'Presupuestos', enabled: true },
        { path: '/app/subcontratas', icon: <Users size={22} />, label: 'Subcontratas', enabled: true },
        { path: '/app/documentos', icon: <FolderOpen size={22} />, label: 'Documentos', enabled: true },
        { path: '/app/usuarios', icon: <Users size={22} />, label: 'Usuarios', enabled: true },
        { path: '/app/blog', icon: <BookOpen size={22} />, label: 'Blog', enabled: true },
    ].filter(item => item.enabled);

    return (
        <>
            <button 
                className="mobile-menu-toggle" 
                onClick={() => setIsOpen(true)}
                aria-label="Abrir menú"
            >
                <Menu size={24} />
            </button>

            <div className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />
            
            <aside className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <div className="mobile-nav-logo">
                        <div className="logo-bracket-top"></div>
                        <h1 className="mobile-logo-text">ARVI</h1>
                        <div className="logo-bracket-bottom"></div>
                    </div>
                    <button 
                        className="mobile-nav-close" 
                        onClick={() => setIsOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="mobile-nav-content">
                    <ul className="mobile-nav-list">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <span className="mobile-nav-icon">{item.icon}</span>
                                    <span className="mobile-nav-label">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="mobile-nav-footer">
                    <a href="/portal-cliente" target="_blank" rel="noreferrer" className="mobile-nav-item portal-link">
                        <span className="mobile-nav-icon"><UserCircle size={22} /></span>
                        <span className="mobile-nav-label">Portal Cliente</span>
                    </a>
                    <NavLink to="/app/settings" className="mobile-nav-item">
                        <span className="mobile-nav-icon"><LucideSettings size={22} /></span>
                        <span className="mobile-nav-label">Configuración</span>
                    </NavLink>
                    <NavLink to="/" className="mobile-nav-item logout">
                        <span className="mobile-nav-icon"><LogOut size={22} /></span>
                        <span className="mobile-nav-label">Cerrar App</span>
                    </NavLink>
                </div>
            </aside>
        </>
    );
};