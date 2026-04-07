import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

/**
 * Definición de las categorías de cookies.
 * 'essential' siempre es readonly=true (obligatoria por ley).
 */
const COOKIE_CATEGORIES = [
    {
        id: 'essential',
        label: 'Cookies esenciales',
        description:
            'Necesarias para el funcionamiento básico del sitio web. Incluyen cookies de sesión, autenticación y seguridad. No se pueden desactivar según la LSSI-CE.',
        examples: 'Sesión de usuario, token de autenticación, preferencias de idioma básicas.',
        readonly: true,
        icon: '🔒',
    },
    {
        id: 'preferences',
        label: 'Cookies de preferencias',
        description:
            'Permiten recordar tus preferencias como el tema visual (claro/oscuro), idioma seleccionado u otras configuraciones personales.',
        examples: 'Tema de color, idioma de la interfaz, preferencias de visualización.',
        readonly: false,
        icon: '⚙️',
    },
    {
        id: 'analytics',
        label: 'Cookies analíticas',
        description:
            'Nos ayudan a entender cómo los usuarios interactúan con la web, qué páginas visitan y durante cuánto tiempo, para mejorar el servicio.',
        examples: 'Google Analytics, estadísticas de visitas, heatmaps.',
        readonly: false,
        icon: '📊',
    },
    {
        id: 'marketing',
        label: 'Cookies de marketing',
        description:
            'Utilizadas para mostrarte publicidad relevante y personalizada según tus intereses. También permiten medir la eficacia de las campañas publicitarias.',
        examples: 'Google Ads, Facebook Pixel, remarketing.',
        readonly: false,
        icon: '📣',
    },
];

/**
 * CookiePreferencesModal
 * Modal de personalización de cookies por categorías.
 *
 * Props:
 *  - visible         : boolean
 *  - initialPrefs    : object  { essential, preferences, analytics, marketing }
 *  - onSave          : (prefs) => void
 *  - onClose         : () => void
 *  - onAcceptAll     : () => void
 *  - onRejectAll     : () => void
 */
export function CookiePreferencesModal({
    visible,
    initialPrefs,
    onSave,
    onClose,
    onAcceptAll,
    onRejectAll,
}) {
    const [localPrefs, setLocalPrefs] = useState(initialPrefs);
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Sincroniza si las preferencias externas cambian
    useEffect(() => {
        setLocalPrefs(initialPrefs);
    }, [initialPrefs]);

    if (!visible) return null;

    const toggle = (id) => {
        if (id === 'essential') return; // No se pueden desactivar
        setLocalPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleExpand = (id) => {
        setExpandedCategory((prev) => (prev === id ? null : id));
    };

    const handleSave = () => {
        onSave(localPrefs);
    };

    return (
        <div
            className="cookie-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Personalizar preferencias de cookies"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="cookie-modal">
                {/* Cabecera */}
                <div className="cookie-modal__header">
                    <div>
                        <h2 className="cookie-modal__title">Preferencias de privacidad</h2>
                        <p className="cookie-modal__subtitle">
                            Selecciona qué tipos de cookies aceptas. Las cookies esenciales siempre están activas.
                        </p>
                    </div>
                    <button
                        className="cookie-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar modal de cookies"
                    >
                        ✕
                    </button>
                </div>

                {/* Lista de categorías */}
                <div className="cookie-modal__categories">
                    {COOKIE_CATEGORIES.map((cat) => (
                        <div key={cat.id} className="cookie-category">
                            <div className="cookie-category__header">
                                <button
                                    className="cookie-category__expand"
                                    onClick={() => toggleExpand(cat.id)}
                                    aria-expanded={expandedCategory === cat.id}
                                    aria-controls={`cookie-cat-${cat.id}`}
                                >
                                    <span className="cookie-category__icon">{cat.icon}</span>
                                    <span className="cookie-category__label">{cat.label}</span>
                                    <span
                                        className={`cookie-category__arrow ${expandedCategory === cat.id ? 'cookie-category__arrow--open' : ''
                                            }`}
                                        aria-hidden="true"
                                    >
                                        ›
                                    </span>
                                </button>

                                <label
                                    className={`cookie-toggle ${cat.readonly ? 'cookie-toggle--disabled' : ''}`}
                                    aria-label={`${cat.readonly ? 'Siempre activas' : localPrefs[cat.id] ? 'Desactivar' : 'Activar'}: ${cat.label}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={localPrefs[cat.id] || false}
                                        onChange={() => toggle(cat.id)}
                                        disabled={cat.readonly}
                                        aria-label={cat.label}
                                    />
                                    <span className="cookie-toggle__slider" />
                                    {cat.readonly && (
                                        <span className="cookie-toggle__always-on">Siempre activas</span>
                                    )}
                                </label>
                            </div>

                            {/* Descripción expandible */}
                            <div
                                id={`cookie-cat-${cat.id}`}
                                className={`cookie-category__body ${expandedCategory === cat.id ? 'cookie-category__body--open' : ''
                                    }`}
                            >
                                <p className="cookie-category__desc">{cat.description}</p>
                                <p className="cookie-category__examples">
                                    <strong>Ejemplos:</strong> {cat.examples}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Enlace a política */}
                <p className="cookie-modal__policy-link">
                    Para más información, consulta nuestra{' '}
                    <Link to="/politica-cookies" className="cookie-banner__link" onClick={onClose}>
                        Política de Cookies
                    </Link>
                    .
                </p>

                {/* Pie de acciones */}
                <div className="cookie-modal__footer">
                    <button
                        id="cookie-modal-reject"
                        className="cookie-btn cookie-btn--ghost"
                        onClick={onRejectAll}
                    >
                        Rechazar todo
                    </button>
                    <button
                        id="cookie-modal-save"
                        className="cookie-btn cookie-btn--outline"
                        onClick={handleSave}
                    >
                        Guardar preferencias
                    </button>
                    <button
                        id="cookie-modal-accept"
                        className="cookie-btn cookie-btn--primary"
                        onClick={onAcceptAll}
                    >
                        Aceptar todo
                    </button>
                </div>
            </div>
        </div>
    );
}
