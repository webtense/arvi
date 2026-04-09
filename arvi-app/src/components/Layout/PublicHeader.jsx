import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Building2, Award, BookOpen, Mail, LogIn, HelpCircle, Phone } from 'lucide-react';

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
    window.dispatchEvent(new Event('storage'));
  };

  const handleNavClick = (sectionId, path = '/') => {
    if (location.pathname !== '/') {
      navigate(`${path}#${sectionId}`);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    navigate(`${path}#${sectionId}`);
  };

  return (
    <header>
      <div className="landing-top-strip">
        <button className="top-strip-link" onClick={() => window.open('tel:+34669475583', '_self')}>
          <Phone size={14} /> +34 669 47 55 83
        </button>
        <button className="top-strip-link" onClick={() => navigate('/contacto')}>
          <Mail size={14} /> info@arvimanteniment.com
        </button>
      </div>

      <div className="landing-header">
        <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="landing-logo-group">
            <div className="logo-bracket-l-top"></div>
            <h1 className="logo-text">ARVI</h1>
            <div className="logo-bracket-l-bottom"></div>
          </div>
        </div>

        <nav className="landing-main-nav">
          <button className="main-nav-link" onClick={() => navigate('/')}>Inici</button>
          <button className="main-nav-link" onClick={() => handleNavClick('soluciones')}>
            <Building2 size={16} /> Serveis
          </button>
          <button className="main-nav-link" onClick={() => navigate('/faqs')}>
            <HelpCircle size={16} /> {t('landing.nav.faq')}
          </button>
          <button className="main-nav-link" onClick={() => handleNavClick('casos-exito')}>
            <Award size={16} /> {t('landing.nav.successCases')}
          </button>
          <button className="main-nav-link" onClick={() => navigate('/blog')}>
            <BookOpen size={16} /> {t('landing.nav.blog')}
          </button>
          <button className="main-nav-link" onClick={() => navigate('/cobertura-catalunya')}>
            Catalunya
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
          <button className="nav-btn contact" onClick={() => navigate('/contacto')}>
            Contacta'ns
          </button>
          <button className="nav-btn secondary" onClick={() => navigate('/login')}>
            <LogIn size={16} /> Acces
          </button>
        </div>
      </div>
    </header>
  );
};
