import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import {
    Wrench, ShieldCheck, Hammer, ArrowLeft,
    ChefHat, Bath, Store, Palette, Sofa,
    Building2, TreePine, Wine, Sun, Layers, LayoutPanelLeft
} from 'lucide-react';
import { SeoHead } from '../../components/SEO/SeoHead';
import './ServicesDetail.css';

const IconMap = {
    'integral': <Building2 size={48} color="var(--brand-green)" />,
    'integral-reformas': <Wrench size={48} color="var(--brand-green)" />,
    'integral-pisos': <Wrench size={48} color="var(--brand-green)" />,
    'integral-casas': <Wrench size={48} color="var(--brand-green)" />,
    'integral-aticos': <Wrench size={48} color="var(--brand-green)" />,
    'cocina': <ChefHat size={48} color="var(--brand-green)" />,
    'bano': <Bath size={48} color="var(--brand-green)" />,
    'locales': <Store size={48} color="var(--brand-green)" />,
    'interiorismo': <Sofa size={48} color="var(--brand-green)" />,
    'decoracion': <Palette size={48} color="var(--brand-green)" />,
    'mantenimiento-edificios': <Building2 size={48} color="var(--brand-green)" />,
    'aprovechamiento-balcones': <TreePine size={48} color="var(--brand-green)" />,
    'bodegas-domesticas': <Wine size={48} color="var(--brand-green)" />,
    'columnas-luz-natural': <Sun size={48} color="var(--brand-green)" />,
    'remontas': <Layers size={48} color="var(--brand-green)" />,
    'mobiliario-medida': <LayoutPanelLeft size={48} color="var(--brand-green)" />,
    'comunidades': <ShieldCheck size={48} color="var(--brand-green)" />,
    'reformas': <Hammer size={48} color="var(--brand-green)" />
};

export const ServicesDetail = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const servicesData = t('services.data', { returnObjects: true }) || {};
    const data = servicesData[serviceId];

    if (!data) {
        return (
            <div className="service-detail-page">
                <SeoHead
                    title="Servei no trobat | ARVI"
                    description="La pagina de servei solicitada no existeix."
                    path={`/servicios/${serviceId}`}
                    robots="noindex,follow"
                />
                <section className="full-section">
                    <div className="section-inner" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(157, 206, 21, 0.1)', borderRadius: '20px', marginBottom: '1.5rem' }}>
                            <Wrench size={48} color="var(--brand-green)" />
                        </div>
                        <h1 className="section-title">{t('services.detail.notFound.title')}</h1>
                        <p className="section-subtitle">{t('services.detail.notFound.desc')}</p>
                        <Button className="primary" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
                            {t('services.detail.back')}
                        </Button>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <section className="full-section">
            <SeoHead
                title={`${data.title} a Catalunya | ARVI`}
                description={data.description}
                path={`/servicios/${serviceId}`}
            />
            <div className="section-inner">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(157, 206, 21, 0.1)', borderRadius: '20px', marginBottom: '1.5rem' }}>
                        {IconMap[serviceId] || <Wrench size={48} color="var(--brand-green)" />}
                    </div>
                    <h1 className="section-title">{data.title}</h1>
                    <p className="section-subtitle">{data.description}</p>
                </div>

                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Card style={{ padding: '3.5rem', boxShadow: 'var(--shadow-dropdown)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <ShieldCheck color="var(--brand-green)" size={24} />
                            <span style={{ color: 'var(--brand-green)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                {data.badge || t('services.detail.premiumBadge')}
                            </span>
                        </div>

                        {data.features && data.features.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                                {data.features.map((feature, idx) => (
                                    <div key={idx} style={{
                                        padding: '1.25rem',
                                        borderRadius: '12px',
                                        background: 'var(--bg-dark)',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        gap: '12px',
                                        lineHeight: '1.5'
                                    }}>
                                        <span style={{ color: 'var(--brand-green)', fontWeight: 'bold' }}>✓</span>
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('services.detail.advice')}</p>
                            <Button className="primary" onClick={() => navigate('/contacto')} style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
                                {t('services.detail.requestBudget')}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
};
