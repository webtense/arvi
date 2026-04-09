import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, HelpCircle, Hammer, Palette, Wrench, FileText, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card/Card';
import { SeoHead } from '../../components/SEO/SeoHead';
import './FAQs.css';

export const FAQs = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [activeCategory, setActiveCategory] = useState('reforms');
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = t('faqs.data', { returnObjects: true }) || [];
    const categories = [
        { id: 'reforms', label: t('faqs.categories.reforms'), icon: <Hammer size={20} /> },
        { id: 'interiorism', label: t('faqs.categories.interiorism'), icon: <Palette size={20} /> },
        { id: 'maintenance', label: t('faqs.categories.maintenance'), icon: <Wrench size={20} /> },
        { id: 'process', label: t('faqs.categories.process'), icon: <FileText size={20} /> },
    ];

    const currentCategoryLabel = categories.find(c => c.id === activeCategory)?.label;
    const currentFaqs = faqs.find(f => f.category === currentCategoryLabel)?.items || [];

    return (
        <div className="faqs-page">
            <SeoHead
                title="Preguntes frequents de manteniment i reformes | ARVI"
                description="Resol dubtes sobre manteniment integral, reformes, processos i pressupostos per comunitats i empreses a Catalunya."
                path="/faqs"
            />
            <section className="full-section">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <HelpCircle size={48} className="section-icon" />
                    <h1 className="section-title">{t('faqs.title')}</h1>
                    <p className="section-subtitle">{t('faqs.subtitle')}</p>
                </div>

                <div className="faqs-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Categorías */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setOpenIndex(null);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.5rem', borderRadius: '100px', border: '1px solid var(--border-color)', background: activeCategory === cat.id ? 'var(--brand-green)' : 'var(--bg-card)', color: activeCategory === cat.id ? 'white' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.3s', fontWeight: '600' }}
                            >
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Lista de FAQs */}
                    <div className="faqs-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '400px' }}>
                        {currentFaqs.map((faq, index) => (
                            <Card key={index} style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    style={{ width: '100%', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-main)' }}
                                >
                                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{faq.q}</span>
                                    {openIndex === index ? <ChevronUp size={20} color="var(--brand-green)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                                </button>
                                {openIndex === index && (
                                    <div style={{ padding: '0 2rem 2rem 2rem', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="cta-section">
                <div className="section-inner" style={{ textAlign: 'center' }}>
                    <h3>{t('faqs.cta.title')}</h3>
                    <p>{t('faqs.cta.subtitle')}</p>
                    <button className="nav-btn primary hero-btn" onClick={() => navigate('/contacto')} style={{ marginTop: '2rem' }}>
                        {t('faqs.cta.button')}
                    </button>
                </div>
            </section>
        </div>
    );
};
