import React from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

/**
 * CookieBanner
 * Banner de consentimiento de cookies conforme a RGPD / LSSI-CE (España).
 * Se muestra en la primera visita del usuario o cuando se revoca el consentimiento.
 *
 * Props:
 *  - onAcceptAll    : () => void
 *  - onRejectAll    : () => void
 *  - onOpenModal    : () => void
 *  - visible        : boolean
 */
export function CookieBanner({ onAcceptAll, onRejectAll, onOpenModal, visible }) {
    if (!visible) return null;

    return (
        <div className="cookie-banner" role="dialog" aria-modal="true" aria-label="Aviso de cookies">
            <div className="cookie-banner__inner">
                <div className="cookie-banner__content">
                    <div className="cookie-banner__header">
                        <span className="cookie-banner__icon" aria-hidden="true">🍪</span>
                        <h2 className="cookie-banner__title">Tu privacidad importa</h2>
                    </div>

                    <p className="cookie-banner__text">
                        Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el uso
                        del sitio y ofrecerte contenido personalizado. Puedes aceptar todas las cookies,
                        rechazarlas o personalizar tu elección.{' '}
                        <Link to="/politica-cookies" className="cookie-banner__link">
                            Más información
                        </Link>
                    </p>

                    <p className="cookie-banner__legal">
                        Al hacer clic en <strong>&ldquo;Aceptar todo&rdquo;</strong>, consientes el uso de
                        todas las cookies. Puedes retirar tu consentimiento en cualquier momento desde nuestra{' '}
                        <Link to="/politica-cookies" className="cookie-banner__link">
                            Política de Cookies
                        </Link>
                        .
                    </p>
                </div>

                <div className="cookie-banner__actions">
                    <button
                        id="cookie-btn-customize"
                        className="cookie-btn cookie-btn--outline"
                        onClick={onOpenModal}
                        aria-label="Personalizar preferencias de cookies"
                    >
                        Personalizar
                    </button>
                    <button
                        id="cookie-btn-reject"
                        className="cookie-btn cookie-btn--ghost"
                        onClick={onRejectAll}
                        aria-label="Rechazar todas las cookies no esenciales"
                    >
                        Rechazar todo
                    </button>
                    <button
                        id="cookie-btn-accept"
                        className="cookie-btn cookie-btn--primary"
                        onClick={onAcceptAll}
                        aria-label="Aceptar todas las cookies"
                    >
                        Aceptar todo
                    </button>
                </div>
            </div>
        </div>
    );
}
