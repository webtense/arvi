import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Wrench, ShieldCheck, Hammer, Building2, Store, Award, BookOpen, Mail, LogIn, UserCircle, ChevronDown, HelpCircle } from 'lucide-react';

export const PublicHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('arvi-theme', newTheme);
        window.dispatchEvent(new Event('storage')); // Trigger update if other components listen
    };

    const handleNavClick = (sectionId, path = '/') => {
        if (location.pathname !== '/') {
            navigate(path + '#' + sectionId);
        } else {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                navigate(path + '#' + sectionId);
            }
        }
    };

    return (
        <header className="landing-header">
            <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <div className="landing-logo-group">
                    <div className="logo-bracket-l-top"></div>
                    <h1 className="logo-text">ARVI</h1>
                    <div className="logo-bracket-l-bottom"></div>
                </div>
            </div>

            <nav className="landing-main-nav">
                <button className="main-nav-link" onClick={() => handleNavClick('quienes-somos')}>
                    <Building2 size={16} /> {t('landing.about.title')}
                </button>
                
                <div className="nav-dropdown">
                    <button className="main-nav-link dropdown-toggle" onClick={() => handleNavClick('soluciones')}>
                        <Wrench size={16} /> {t('landing.nav.solutions')} <ChevronDown size={14} />
                    </button>
                    <div className="dropdown-menu">
                        <div className="dropdown-submenu">
                            <span className="submenu-title" onClick={() => navigate('/servicios/integral-reformas')}>{t('landing.services.reforms')}</span>
                            <div className="submenu-items">
                                <button onClick={() => navigate('/servicios/integral-pisos')}>{t('services.data.integral-pisos.title')}</button>
                                <button onClick={() => navigate('/servicios/integral-casas')}>{t('services.data.integral-casas.title')}</button>
                                <button onClick={() => navigate('/servicios/integral-aticos')}>{t('services.data.integral-aticos.title')}</button>
                            </div>
                        </div>
                        <button className="dropdown-item" onClick={() => navigate('/servicios/cocina')}>{t('services.data.cocina.title')}</button>
                        <button className="dropdown-item" onClick={() => navigate('/servicios/bano')}>{t('services.data.bano.title')}</button>
                        <button className="dropdown-item" onClick={() => navigate('/servicios/locales')}>{t('services.data.locales.title')}</button>
                        <button className="dropdown-item" onClick={() => navigate('/servicios/interiorismo')}>{t('services.data.interiorismo.title')}</button>
                        <button className="dropdown-item" onClick={() => navigate('/servicios/decoracion')}>{t('services.data.decoracion.title')}</button>
                        <div className="dropdown-submenu">
                            <span className="submenu-title">Otros trabajos</span>
                            <div className="submenu-items">
                                <button onClick={() => navigate('/servicios/mantenimiento-edificios')}>{t('services.data.mantenimiento-edificios.title')}</button>
                                <button onClick={() => navigate('/servicios/aprovechamiento-balcones')}>{t('services.data.aprovechamiento-balcones.title')}</button>
                                <button onClick={() => navigate('/servicios/bodegas-domesticas')}>{t('services.data.bodegas-domesticas.title')}</button>
                                <button onClick={() => navigate('/servicios/columnas-luz-natural')}>{t('services.data.columnas-luz-natural.title')}</button>
                                <button onClick={() => navigate('/servicios/remontas')}>{t('services.data.remontas.title')}</button>
                                <button onClick={() => navigate('/servicios/mobiliario-medida')}>{t('services.data.mobiliario-medida.title')}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <button className="main-nav-link" onClick={() => navigate('/faqs')}>
                    <HelpCircle size={16} /> {t('landing.nav.faq')}
                </button>

                <button className="main-nav-link" onClick={() => handleNavClick('casos-exito')}>
                    <Award size={16} /> {t('landing.nav.successCases')}
                </button>
                <button className="main-nav-link" onClick={() => navigate('/blog')}>
                    <BookOpen size={16} /> {t('landing.nav.blog')}
                </button>
                <button className="main-nav-link" onClick={() => navigate('/contacto')}>
                    <Mail size={16} /> {t('landing.nav.contact')}
                </button>
            </nav>

            <div className="nav-controls-right">
                <div className="nav-controls">
                    <select
                        className="lang-select"
                        onChange={(e) => changeLanguage(e.target.value)}
                        value={i18n.language}
                    >
                        <option value="ca">CAT</option>
                        <option value="es">ESP</option>
                    </select>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        <Sun size={18} className="sun-icon" />
                        <Moon size={18} className="moon-icon" />
                    </button>
                </div>
                <button className="nav-btn primary" onClick={() => navigate('/login')}>
                    <LogIn size={16} /> {t('landing.nav.adminAccess')}
                </button>
                <button className="nav-btn secondary" onClick={() => navigate('/login')}>
                    <UserCircle size={16} /> {t('landing.nav.portalVei')}
                </button>
            </div>
        </header>
    );
};
