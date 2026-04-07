import React from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import './PoliticaCookies.css';

/**
 * PoliticaCookies.jsx
 * Página de Política de Cookies conforme a:
 *  - LSSI-CE (Ley 34/2002, Art. 22.2)
 *  - RGPD (Reglamento UE 2016/679)
 *  - Guía AEPD sobre el uso de cookies (2023)
 */
export function PoliticaCookies() {
    const { revokeConsent, preferences, consentDate, openModal } = useCookieConsent();

    const formatDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('es-ES', {
            dateStyle: 'long',
            timeStyle: 'short',
        });
    };

    const statusIcon = (active) => (active ? '✅' : '❌');

    return (
        <div className="politica-cookies">
            <div className="politica-cookies__container">

                {/* Cabecera */}
                <header className="politica-cookies__hero">
                    <span className="politica-cookies__hero-icon" aria-hidden="true">🍪</span>
                    <h1 className="politica-cookies__title">Política de Cookies</h1>
                    <p className="politica-cookies__hero-subtitle">
                        Última actualización: <strong>19 de marzo de 2026</strong>
                    </p>
                </header>

                {/* Panel de estado del consentimiento actual */}
                <section className="politica-cookies__consent-panel" aria-label="Tu configuración actual de cookies">
                    <h2 className="politica-cookies__section-title">📋 Tu configuración actual</h2>
                    {consentDate ? (
                        <>
                            <p className="politica-cookies__consent-date">
                                Consentimiento registrado el <strong>{formatDate(consentDate)}</strong>
                            </p>
                            <div className="politica-cookies__prefs-grid">
                                <div className="politica-cookies__pref-item">
                                    <span>{statusIcon(preferences.essential)}</span>
                                    <span>Cookies esenciales</span>
                                </div>
                                <div className="politica-cookies__pref-item">
                                    <span>{statusIcon(preferences.preferences)}</span>
                                    <span>Cookies de preferencias</span>
                                </div>
                                <div className="politica-cookies__pref-item">
                                    <span>{statusIcon(preferences.analytics)}</span>
                                    <span>Cookies analíticas</span>
                                </div>
                                <div className="politica-cookies__pref-item">
                                    <span>{statusIcon(preferences.marketing)}</span>
                                    <span>Cookies de marketing</span>
                                </div>
                            </div>
                            <div className="politica-cookies__consent-actions">
                                <button
                                    id="politica-cookies-manage"
                                    className="politica-btn politica-btn--outline"
                                    onClick={openModal}
                                >
                                    ⚙️ Gestionar preferencias
                                </button>
                                <button
                                    id="politica-cookies-revoke"
                                    className="politica-btn politica-btn--ghost"
                                    onClick={revokeConsent}
                                >
                                    🗑️ Retirar consentimiento
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="politica-cookies__no-consent">
                            <p>Aún no has registrado tus preferencias de cookies.</p>
                            <button
                                id="politica-cookies-configure"
                                className="politica-btn politica-btn--primary"
                                onClick={openModal}
                            >
                                Configurar ahora
                            </button>
                        </div>
                    )}
                </section>

                {/* Contenido legal */}
                <div className="politica-cookies__legal">

                    <section className="politica-cookies__section">
                        <h2 className="politica-cookies__section-title">1. ¿Qué son las cookies?</h2>
                        <p>
                            Las cookies son pequeños archivos de texto que un sitio web almacena en tu
                            navegador cuando lo visitas. Sirven para recordar información sobre tu visita,
                            como tu idioma preferido y otras opciones, y permiten que la web funcione correctamente.
                        </p>
                        <p>
                            Su uso está regulado en España por el <strong>artículo 22.2 de la Ley 34/2002, de Servicios
                                de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)</strong> y por el
                            <strong> Reglamento General de Protección de Datos (RGPD) de la UE 2016/679</strong>.
                            Asimismo, seguimos las directrices de la{' '}
                            <a
                                href="https://www.aepd.es/es/documento/guia-cookies.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="politica-cookies__ext-link"
                            >
                                Guía sobre el uso de cookies de la AEPD (2023)
                            </a>
                            .
                        </p>
                    </section>

                    <section className="politica-cookies__section">
                        <h2 className="politica-cookies__section-title">2. Tipos de cookies que utilizamos</h2>

                        <div className="politica-cookies__cookie-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Categoría</th>
                                        <th>Finalidad</th>
                                        <th>Ejemplos</th>
                                        <th>Duración</th>
                                        <th>Consentimiento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>🔒 Esenciales</strong></td>
                                        <td>Funcionamiento básico, autenticación y seguridad del sitio.</td>
                                        <td>Sesión, CSRF token, idioma</td>
                                        <td>Sesión / 1 año</td>
                                        <td>No requerido (Art. 22.2 LSSI-CE)</td>
                                    </tr>
                                    <tr>
                                        <td><strong>⚙️ Preferencias</strong></td>
                                        <td>Recordar configuraciones personales del usuario (tema, idioma).</td>
                                        <td>Tema visual, idioma</td>
                                        <td>1 año</td>
                                        <td>Requerido</td>
                                    </tr>
                                    <tr>
                                        <td><strong>📊 Analíticas</strong></td>
                                        <td>Medir el uso del sitio para mejorar el servicio (estadísticas).</td>
                                        <td>Google Analytics (_ga, _gid)</td>
                                        <td>Sesión / 2 años</td>
                                        <td>Requerido</td>
                                    </tr>
                                    <tr>
                                        <td><strong>📣 Marketing</strong></td>
                                        <td>Mostrar publicidad personalizada y medir campañas.</td>
                                        <td>Facebook Pixel, Google Ads</td>
                                        <td>Hasta 2 años</td>
                                        <td>Requerido</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="politica-cookies__section">
                        <h2 className="politica-cookies__section-title">3. ¿Cómo gestionamos tu consentimiento?</h2>
                        <p>
                            Al visitar ARVI por primera vez, te mostramos un banner informativo donde puedes:
                        </p>
                        <ul className="politica-cookies__list">
                            <li>✅ <strong>Aceptar todo:</strong> consientes el uso de todas las categorías de cookies.</li>
                            <li>❌ <strong>Rechazar todo:</strong> solo se usarán las cookies estrictamente necesarias.</li>
                            <li>⚙️ <strong>Personalizar:</strong> seleccionas individualmente qué categorías aceptas.</li>
                        </ul>
                        <p>
                            Tu decisión se almacena en tu navegador y tendrá validez durante <strong>12 meses</strong>,
                            tras los cuales se te volverá a solicitar consentimiento. Puedes modificar o retirar
                            tu consentimiento en cualquier momento desde el botón{' '}
                            <strong>&ldquo;🍪 Cookies&rdquo;</strong> de la parte inferior de la pantalla
                            o desde la sección de configuración de esta misma página.
                        </p>
                    </section>

                    <section className="politica-cookies__section">
                        <h2 className="politica-cookies__section-title">4. Cookies de terceros</h2>
                        <p>
                            Algunas funcionalidades pueden ser provistas por terceros que instalan sus propias cookies.
                            ARVI no controla estas cookies y te recomendamos consultar sus políticas de privacidad:
                        </p>
                        <ul className="politica-cookies__list">
                            <li>
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="politica-cookies__ext-link">
                                    Política de privacidad de Google
                                </a>
                            </li>
                            <li>
                                <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="politica-cookies__ext-link">
                                    Política de privacidad de Meta (Facebook)
                                </a>
                            </li>
                        </ul>
                    </section>

                    <section className="politica-cookies__section">
                        <h2 className="politica-cookies__section-title">5. Cómo desactivar cookies desde el navegador</h2>
                        <p>
                            Puedes configurar tu navegador para rechazar o eliminar cookies. Ten en cuenta que
                            desactivar las cookies esenciales puede afectar al funcionamiento del sitio:
                        </p>
                        <ul className="politica-cookies__list">
                            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="politica-cookies__ext-link">Google Chrome</a></li>
                            <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-preferencias-firefox" target="_blank" rel="noopener noreferrer" className="politica-cookies__ext-link">Mozilla Firefox</a></li>
                            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="politica-cookies__ext-link">Apple Safari</a></li>
                            <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="politica-cookies__ext-link">Microsoft Edge</a></li>
                        </ul>
                    </section>

                    <section className="politica-cookies__section">
                        <h2 className="politica-cookies__section-title">6. Responsable del tratamiento</h2>
                        <div className="politica-cookies__contact-card">
                            <p><strong>ARVI</strong></p>
                            <p>Si tienes preguntas sobre nuestra política de cookies o quieres ejercer tus derechos (acceso, rectificación, supresión, portabilidad, oposición), puedes contactarnos a través de:</p>
                            <p>
                                📧 Formulario de contacto:{' '}
                                <Link to="/contacto" className="politica-cookies__ext-link">
                                    arvi.es/contacto
                                </Link>
                            </p>
                            <p>
                                También puedes presentar una reclamación ante la{' '}
                                <a href="https://sedeagpd.gob.es/sede-electronica-web/" target="_blank" rel="noopener noreferrer" className="politica-cookies__ext-link">
                                    Agencia Española de Protección de Datos (AEPD)
                                </a>
                                .
                            </p>
                        </div>
                    </section>

                </div>

                {/* Navegación de vuelta */}
                <div className="politica-cookies__back">
                    <Link to="/" className="politica-btn politica-btn--outline">
                        ← Volver al inicio
                    </Link>
                </div>

            </div>
        </div>
    );
}
