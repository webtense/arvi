import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardSignature, Receipt, FileText, Settings as LucideSettings, CalendarClock, Box, Calculator, Users, FolderOpen, UserCircle, BookOpen } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import './Sidebar.css';

export const Sidebar = () => {
    const { settings } = useSettings();
    const { activeServices } = settings;

    const navItems = [
        { path: '/app/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', enabled: true },
        { path: '/app/partes', icon: <ClipboardSignature size={20} />, label: 'Partes & Proformas', enabled: activeServices.parts },
        { path: '/app/preventivo', icon: <CalendarClock size={20} />, label: 'Preventivo', enabled: activeServices.preventive },
        { path: '/app/activos', icon: <Box size={20} />, label: 'Activos', enabled: activeServices.assets },
        { path: '/app/tickets', icon: <Receipt size={20} />, label: 'Tickets (OCR)', enabled: activeServices.tickets },
        { path: '/app/facturas', icon: <FileText size={20} />, label: 'Facturas', enabled: true },
        { path: '/app/presupuestos', icon: <Calculator size={20} />, label: 'Presupuestos', enabled: true },
        { path: '/app/subcontratas', icon: <Users size={20} />, label: 'Subcontratas', enabled: true },
        { path: '/app/clientes', icon: <Users size={20} />, label: 'Clientes', enabled: true },
        { path: '/app/documentos', icon: <FolderOpen size={20} />, label: 'Documentos', enabled: true },
        { path: '/app/usuarios', icon: <Users size={20} />, label: 'Usuarios', enabled: true },
        { path: '/app/blog', icon: <BookOpen size={20} />, label: 'Gestión de Blog', enabled: true },
    ].filter(item => item.enabled);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo-container">
                    <div className="logo-bracket-top"></div>
                    <h1 className="sidebar-logo">ARVI</h1>
                    <div className="logo-bracket-bottom"></div>
                    <p className="sidebar-subtitle">Manteniments Integrals, S.L.</p>
                </div>
            </div>

            <nav className="sidebar-nav" style={{ overflowY: 'auto', paddingBottom: '20px' }}>
                <ul>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <a href="/portal-cliente" target="_blank" rel="noreferrer" className="nav-item portal-link" style={{ color: '#38b2ac', marginBottom: '10px' }}>
                    <span className="nav-icon"><UserCircle size={20} /></span>
                    <span className="nav-label">Portal Cliente</span>
                </a>
                <NavLink to="/app/settings" className="nav-item">
                    <span className="nav-icon"><LucideSettings size={20} /></span>
                    <span className="nav-label">Configuración</span>
                </NavLink>
                <NavLink to="/" className="nav-item">
                    <span className="nav-icon"><UserCircle size={20} /></span>
                    <span className="nav-label">Cerrar App</span>
                </NavLink>
            </div>
        </aside>
    );
};
