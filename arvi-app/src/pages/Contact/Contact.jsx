import { useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Mail, MapPin, Phone, Briefcase, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { emitToast } from '../../utils/toast';
import { SeoHead } from '../../components/SEO/SeoHead';

export const Contact = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('nombre'),
            email: formData.get('email'),
            phone: formData.get('telefono'),
            subject: formData.get('asunto'),
            message: formData.get('mensaje'),
            service: formData.get('servicio') || 'general'
        };

        try {
            await api.sendContact(data);
            setStatus('sent');
            emitToast({ type: 'success', message: 'Solicitud enviada correctamente' });
        } catch (error) {
            emitToast({ type: 'error', message: 'Error al enviar. Intenta de nuevo.' });
            setStatus('idle');
        }
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
            <SeoHead
                title="Contacte i pressupostos | ARVI Catalunya"
                description="Demana pressupost de manteniment integral, reformes o incidencies a qualsevol punt de Catalunya. Resposta rapida per email o telefon."
                path="/contacto"
            />
            <div className="section-inner">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <Mail size={48} className="section-icon" />
                    <h1 className="section-title">{t('landing.nav.contact')}</h1>
                    <p className="section-subtitle">{t('contact.form.subtitle')}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '4rem', alignItems: 'start' }}>
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
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ARVI Manteniments Integrals S.L.<br />CIF: B64773450</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card style={{ padding: '3rem' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                        {t('contact.form.name')} *
                                    </label>
                                    <input 
                                        name="nombre" 
                                        type="text" 
                                        className="form-control" 
                                        required 
                                        placeholder={t('contact.form.namePlaceholder')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                        {t('contact.form.email')} *
                                    </label>
                                    <input 
                                        name="email" 
                                        type="email" 
                                        className="form-control" 
                                        required 
                                        placeholder="email@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                        {t('contact.form.phone')}
                                    </label>
                                    <input 
                                        name="telefono" 
                                        type="tel" 
                                        className="form-control" 
                                        placeholder="+34 600 000 000"
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                        {t('contact.form.service')}
                                    </label>
                                    <select name="servicio" className="form-control">
                                        <option value="general">{t('contact.services.general')}</option>
                                        <option value="integral">{t('contact.services.integral')}</option>
                                        <option value="preventivo">{t('contact.services.preventivo')}</option>
                                        <option value="reformas">{t('contact.services.reformas')}</option>
                                        <option value="emergencias">{t('contact.services.emergencias')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                    {t('contact.form.subject')}
                                </label>
                                <input 
                                    name="asunto" 
                                    type="text" 
                                    className="form-control" 
                                    placeholder={t('contact.form.subjectPlaceholder')}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                    {t('contact.form.message')} *
                                </label>
                                <textarea 
                                    name="mensaje" 
                                    className="form-control" 
                                    rows="5" 
                                    required
                                    placeholder={t('contact.form.messagePlaceholder')}
                                ></textarea>
                            </div>

                            <Button 
                                type="submit" 
                                className="primary" 
                                disabled={status === 'sending'}
                                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Send size={18} />
                                {status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </section>
    );
};
