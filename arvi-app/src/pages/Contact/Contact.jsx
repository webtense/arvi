import React, { useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Mail, MapPin, Phone, Briefcase, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Contact = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [status, setStatus] = useState('idle'); // idle | sending | sent

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        
        setTimeout(() => {
            setStatus('sent');
            const formData = new FormData(e.currentTarget);
            const subject = encodeURIComponent(`Solicitud de Presupuesto: ${formData.get('asunto') || 'General'}`);
            const body = encodeURIComponent(
                `Nombre: ${formData.get('nombre')}\n` +
                `Email: ${formData.get('email')}\n` +
                `Teléfono: ${formData.get('telefono')}\n\n` +
                `Mensaje:\n${formData.get('mensaje')}`
            );
            window.location.href = `mailto:info@arvimanteniment.com?subject=${subject}&body=${body}`;
        }, 1000);
    };

    if (status === 'sent') {
        return (
            <section className="full-section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
                <div className="section-inner" style={{ maxWidth: '600px' }}>
                    <Card style={{ padding: '4rem', textAlign: 'center' }}>
                        <CheckCircle size={80} color="var(--brand-green)" style={{ marginBottom: '2rem' }} />
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{t('contact.sent.title')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            {t('contact.sent.message')}
                        </p>
                        <Button className="primary" onClick={() => navigate('/')} style={{ padding: '1rem 3rem' }}>{t('contact.sent.back')}</Button>
                    </Card>
                </div>
            </section>
        );
    }

    return (
        <section className="full-section">
            <div className="section-inner">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <Mail size={48} className="section-icon" />
                    <h2 className="section-title">{t('landing.nav.contact')}</h2>
                    <p className="section-subtitle">{t('contact.form.subtitle')}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '4rem', alignItems: 'start' }}>
                    {/* Información de Contacto */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Card style={{ padding: '2.5rem' }}>
                            <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '2px solid var(--brand-green)', paddingBottom: '0.4rem', display: 'inline-block', fontSize: '1.25rem' }}>
                                {t('contact.form.contactInfoTitle')}
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1.25rem' }}>
                                    <div style={{ background: 'rgba(157, 206, 21, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin color="var(--brand-green)" size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem' }}>{t('contact.form.headquarters')}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>C/ Sentmenat, 5, Sabadell<br />08203 Barcelona</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.25rem' }}>
                                    <div style={{ background: 'rgba(157, 206, 21, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone color="var(--brand-green)" size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem' }}>{t('landing.contact.phoneLabel')}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>+34 669 47 55 83</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.25rem' }}>
                                    <div style={{ background: 'rgba(157, 206, 21, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail color="var(--brand-green)" size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem' }}>{t('landing.contact.emailLabel')}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>info@arvimanteniment.com</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card style={{ padding: '2rem', background: 'rgba(157, 206, 21, 0.05)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Briefcase color="var(--brand-green)" size={20} />
                                <div>
                                    <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.1rem' }}>{t('contact.form.fiscalData')}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ARVI MANTENIMENTS INTEGRALS S.L.<br />TIN: {t('landing.contact.tin')}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Formulario de Presupuesto */}
                    <Card style={{ padding: '3.5rem', boxShadow: 'var(--shadow-dropdown)' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>{t('contact.form.title')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>{t('contact.form.subtitle')}</p>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label htmlFor="nombre" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('contact.form.labels.name')}</label>
                                    <input required type="text" id="nombre" name="nombre" placeholder={t('contact.form.placeholders.name')} style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', transition: 'border-color 0.2s', outline: 'none' }} />
                                </div>
                                <div>
                                    <label htmlFor="telefono" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('contact.form.labels.phone')}</label>
                                    <input required type="tel" id="telefono" name="telefono" placeholder={t('contact.form.placeholders.phone')} style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', outline: 'none' }} />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="email" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('contact.form.labels.email')}</label>
                                <input required type="email" id="email" name="email" placeholder={t('contact.form.placeholders.email')} style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', outline: 'none' }} />
                            </div>

                            <div>
                                <label htmlFor="asunto" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('contact.form.labels.service')}</label>
                                <select id="asunto" name="asunto" style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}>
                                    <option value="reformas">{t('contact.form.services.reforms')}</option>
                                    <option value="comunidades">{t('contact.form.services.communities')}</option>
                                    <option value="mantenimiento">{t('contact.form.services.maintenance')}</option>
                                    <option value="otros">{t('contact.form.services.others')}</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="mensaje" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('contact.form.labels.message')}</label>
                                <textarea required id="mensaje" name="mensaje" rows="5" placeholder={t('contact.form.placeholders.message')} style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', resize: 'none', lineHeight: '1.5', outline: 'none' }}></textarea>
                            </div>

                            <Button type="submit" className="primary" disabled={status === 'sending'} style={{ height: '4rem', fontSize: '1.1rem', marginTop: '1rem', borderRadius: '12px' }}>
                                {status === 'sending' ? t('contact.form.sending') : <><Send size={22} style={{ marginRight: '0.75rem' }} /> {t('contact.form.submit')}</>}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </section>
    );
};
