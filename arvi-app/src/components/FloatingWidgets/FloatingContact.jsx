import React, { useState } from 'react';
import './FloatingWidgets.css';

// Icono de chat
const ChatIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ─── Cambia aquí el email de destino ──────────────────────────────────────────
const CONTACT_EMAIL = 'info@arvimanteniment.com';
// ─────────────────────────────────────────────────────────────────────────────

export function FloatingContact() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error
    const [accepted, setAccepted] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!accepted) return;
        setStatus('sending');

        // Envío vía mailto (sin backend). Para producción usa EmailJS o un backend.
        const subject = encodeURIComponent(`Consulta web de ${formData.name}`);
        const body = encodeURIComponent(
            `Nombre: ${formData.name}\nTeléfono: ${formData.phone}\nEmail: ${formData.email}\n\nMensaje:\n${formData.message}`
        );
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

        setTimeout(() => {
            setStatus('sent');
            setFormData({ name: '', phone: '', email: '', message: '' });
            setAccepted(false);
        }, 500);
    };

    return (
        <>
            {/* Widget Panel */}
            <div className={`fc-panel ${isOpen ? 'fc-panel--open' : ''}`} role="dialog" aria-label="Formulario de contacto" aria-hidden={!isOpen}>
                {/* Header */}
                <div className="fc-header">
                    <div className="fc-header-avatar">
                        <img src="/avatar-jaume.jpg" alt="Jaume Aranda" onError={(e) => { e.target.style.display = 'none'; }} />
                        <div className="fc-header-avatar-fallback">J</div>
                    </div>
                    <div className="fc-header-text">
                        <span className="fc-header-title">¿Tienes alguna consulta?</span>
                    </div>
                    <button className="fc-close-btn" onClick={() => setIsOpen(false)} aria-label="Cerrar">
                        <CloseIcon />
                    </button>
                </div>

                {/* Body */}
                <div className="fc-body">
                    <div className="fc-intro">
                        <div className="fc-intro-avatar">
                            <div className="fc-avatar-circle">J</div>
                            <span className="fc-online-dot" />
                        </div>
                        <p className="fc-intro-text">Escríbenos y nos pondremos en contacto contigo lo antes posible.</p>
                    </div>

                    {status === 'sent' ? (
                        <div className="fc-success">
                            <div className="fc-success-icon">✓</div>
                            <p>¡Mensaje enviado! Nos pondremos en contacto pronto.</p>
                            <button className="fc-btn-reset" onClick={() => setStatus('idle')}>Enviar otro mensaje</button>
                        </div>
                    ) : (
                        <form className="fc-form" onSubmit={handleSubmit} noValidate>
                            <input
                                id="fc-name"
                                className="fc-input"
                                type="text"
                                name="name"
                                placeholder="Nombre"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                            />
                            <input
                                id="fc-phone"
                                className="fc-input"
                                type="tel"
                                name="phone"
                                placeholder="Teléfono"
                                value={formData.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                            />
                            <input
                                id="fc-email"
                                className="fc-input"
                                type="email"
                                name="email"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                            <textarea
                                id="fc-message"
                                className="fc-input fc-textarea"
                                name="message"
                                placeholder="¿En qué podemos ayudarte?"
                                value={formData.message}
                                onChange={handleChange}
                                rows={4}
                                required
                            />

                            <label className="fc-checkbox-label">
                                <input
                                    id="fc-accept"
                                    type="checkbox"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <span>
                                    Al enviar, aceptas nuestra{' '}
                                    <a href="/privacidad" target="_blank" rel="noopener noreferrer">política de privacidad</a>
                                    {' '}y recibir comunicaciones de ARVI.
                                </span>
                            </label>

                            <button
                                id="fc-submit"
                                type="submit"
                                className="fc-submit-btn"
                                disabled={!accepted || status === 'sending'}
                            >
                                {status === 'sending' ? 'Enviando...' : (
                                    <>Enviar <SendIcon /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="fc-footer">
                    Powered by <strong>ARVI</strong>
                </div>
            </div>

            {/* Floating Trigger Button */}
            <button
                id="fc-trigger-btn"
                className={`fc-trigger ${isOpen ? 'fc-trigger--active' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Abrir formulario de contacto"
                aria-expanded={isOpen}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
                {!isOpen && <span className="fc-trigger-pulse" />}
            </button>
        </>
    );
}
