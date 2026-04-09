import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Wrench, ShieldCheck, Hammer, Building2, Store, Award, BookOpen, Mail, LogIn, UserCircle, ChevronDown, HelpCircle } from 'lucide-react';
import { SeoHead } from '../../components/SEO/SeoHead';
import './Landing.css';

// Scroll suave a sección interna
const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const Landing = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const localBusinessJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'ARVI Manteniments Integrals',
        url: 'https://arvimanteniment.com/',
        telephone: '+34 669 47 55 83',
        email: 'info@arvimanteniment.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'C/ Sentmenat, 5',
            addressLocality: 'Sabadell',
            postalCode: '08203',
            addressRegion: 'Barcelona',
            addressCountry: 'ES'
        },
        areaServed: [
            'Catalunya',
            'Barcelona',
            'Girona',
            'Lleida',
            'Tarragona'
        ],
        sameAs: ['https://arvimanteniment.com/']
    };

    return (
        <div className="landing-page-content">
            <SeoHead
                title="Manteniment integral i reformes a Catalunya | ARVI"
                description="Serveis professionals de manteniment integral, reformes i incidencies per comunitats i pimes a tota Catalunya. Atencio rapida i pressupost sense compromís."
                path="/"
                jsonLd={localBusinessJsonLd}
            />
            <main className="landing-main">

                {/* ======= HERO ======= */}
                <section className="hero">
                    <div className="hero-content">
                        <h1 className="hero-title">{t('landing.title')}</h1>
                        <p className="hero-subtitle">{t('landing.subtitle')}</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                            <button className="nav-btn primary hero-btn" onClick={() => scrollToSection('soluciones')}>
                                {t('landing.hero.discover')}
                            </button>
                            <button className="nav-btn secondary hero-btn" onClick={() => navigate('/contacto')}>
                                {t('landing.hero.requestBudget')}
                            </button>
                        </div>
                    </div>
                </section>

                <section className="full-section coverage-section">
                    <div className="section-inner">
                        <h2 className="section-title">Cobertura a tota Catalunya</h2>
                        <p className="section-subtitle">Treballam a Barcelona, Girona, Lleida i Tarragona amb equips propis i resposta rapida.</p>
                        <div className="coverage-grid">
                            <button className="coverage-card" onClick={() => navigate('/cobertura-catalunya')}>Barcelona i area metropolitana</button>
                            <button className="coverage-card" onClick={() => navigate('/cobertura-catalunya')}>Girona i Costa Brava</button>
                            <button className="coverage-card" onClick={() => navigate('/cobertura-catalunya')}>Lleida i Ponent</button>
                            <button className="coverage-card" onClick={() => navigate('/cobertura-catalunya')}>Tarragona i Camp de Tarragona</button>
                        </div>
                    </div>
                </section>

                {/* ======= QUIÉNES SOMOS ======= */}
                <section id="quienes-somos" className="full-section alt-bg">
                    <div className="section-inner">
                        <Building2 size={48} className="section-icon" />
                        <h3 className="section-title">{t('landing.about.title')}</h3>
                        <p className="section-body">
                            {t('landing.about.history')}
                        </p>
                        <p className="section-body">
                            <em style={{ color: 'var(--brand-green)', fontStyle: 'normal', fontWeight: 'bold' }}> {t('landing.about.motto')}</em>
                        </p>
                        <div className="stats-row">
                            <div className="stat-box"><span className="stat-number">+200</span><span className="stat-label">{t('landing.stats.communities')}</span></div>
                            <div className="stat-box"><span className="stat-number">24h</span><span className="stat-label">{t('landing.stats.emergency')}</span></div>
                            <div className="stat-box"><span className="stat-number">100%</span><span className="stat-label">{t('landing.stats.transparency')}</span></div>
                        </div>
                    </div>
                </section>

                {/* ======= SOLUCIONES ======= */}
                <section id="soluciones" className="full-section">
                    <div className="section-inner">
                        <h3 className="section-title">{t('landing.services.title')}</h3>
                        <p className="section-subtitle">{t('landing.services.subtitle')}</p>
                        <div className="services-grid">
                            <div className="service-card" onClick={() => navigate('/servicios/integral')} style={{ cursor: 'pointer' }}>
                                <Wrench size={40} className="service-icon" />
                                <h4>{t('landing.services.integral')}</h4>
                                <p>{t('landing.services.integralDesc')}</p>
                                <span className="card-link">{t('landing.services.viewMore')}</span>
                            </div>
                            <div className="service-card" onClick={() => navigate('/servicios/comunidades')} style={{ cursor: 'pointer' }}>
                                <ShieldCheck size={40} className="service-icon" />
                                <h4>{t('landing.services.communities')}</h4>
                                <p>{t('landing.services.communitiesDesc')}</p>
                                <span className="card-link">{t('landing.services.viewMore')}</span>
                            </div>
                            <div className="service-card" onClick={() => navigate('/servicios/reformas')} style={{ cursor: 'pointer' }}>
                                <Hammer size={40} className="service-icon" />
                                <h4>{t('landing.services.reforms')}</h4>
                                <p>{t('landing.services.reformsDesc')}</p>
                                <span className="card-link">{t('landing.services.viewMore')}</span>
                            </div>
                            <div className="service-card" onClick={() => navigate('/servicios/proyectos-personalizados')} style={{ cursor: 'pointer' }}>
                                <Store size={40} className="service-icon" />
                                <h4>{t('landing.services.customProjects')}</h4>
                                <p>{t('landing.services.customProjectsDesc')}</p>
                                <span className="card-link">{t('landing.services.viewMore')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ======= CASOS DE ÉXITO ======= */}
                <section id="casos-exito" className="full-section alt-bg">
                    <div className="section-inner">
                        <Award size={48} className="section-icon" />
                        <h3 className="section-title">{t('landing.successCases.title')}</h3>
                        <div className="testimonials-grid">
                            <div className="testimonial-card">
                                <p className="test-text">{t('landing.testimonials.t1')}</p>
                                <span className="test-author">{t('landing.testimonials.a1')}</span>
                            </div>
                            <div className="testimonial-card">
                                <p className="test-text">{t('landing.testimonials.t2')}</p>
                                <span className="test-author">{t('landing.testimonials.a2')}</span>
                            </div>
                            <div className="testimonial-card">
                                <p className="test-text">{t('landing.testimonials.t3')}</p>
                                <span className="test-author">{t('landing.testimonials.a3')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ======= BLOG ======= */}
                <section id="blog" className="full-section">
                    <div className="section-inner">
                        <BookOpen size={48} className="section-icon" />
                        <h3 className="section-title">{t('landing.blog.title')}</h3>
                        <p className="section-subtitle">{t('landing.blog.subtitle')}</p>
                        <div className="blog-grid">
                            <div className="blog-card" onClick={() => navigate('/blog/normativa-accessibilitat-2026')}>
                                <span className="blog-tag">Normativa</span>
                                <h4>Nova normativa d'accessibilitat en comunitats 2026</h4>
                                <p>Tots els edificis construïts abans del 2010 hauran d'adaptar els accessos comuns antes del 2026...</p>
                                <span className="card-link">{t('landing.blog.readArticle')}</span>
                            </div>
                            <div className="blog-card" onClick={() => navigate('/blog/reduir-consum-energetic-comunitat')}>
                                <span className="blog-tag">Consell</span>
                                <h4>Com reduir el consum energètic de la teva comunitat</h4>
                                <p>Una revisió periòdica de les instal·laciones pot suposar un estalvi de fins al 30% en la factura...</p>
                                <span className="card-link">{t('landing.blog.readArticle')}</span>
                            </div>
                            <div className="blog-card" onClick={() => navigate('/blog/per-que-digitalitzar-gestio-finca')}>
                                <span className="blog-tag">Tech</span>
                                <h4>Per què digitalitzar la gestió de la teva finca</h4>
                                <p>El Portal del Veí d'ARVI permet als residents reportar incidències en temps real i veure el seguiment...</p>
                                <span className="card-link">{t('landing.blog.readArticle')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ======= CTA FINAL ======= */}
                <section className="cta-section">
                    <h3>{t('landing.cta.title')}</h3>
                    <p>{t('landing.cta.subtitle')}</p>
                    <button className="nav-btn primary hero-btn" onClick={() => navigate('/contacto')}>
                        {t('landing.cta.button')}
                    </button>
                </section>

            </main>
        </div>
    );
};
