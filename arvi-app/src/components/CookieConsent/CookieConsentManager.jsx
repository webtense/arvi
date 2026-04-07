/**
 * CookieConsentManager.jsx
 * Componente orquestador — gestiona el banner, el modal y el FAB de cookies.
 * Debe incluirse una sola vez, en App.jsx o en el layout raíz.
 */

import React from 'react';
import { CookieBanner } from './CookieBanner';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import './CookieConsent.css';

export function CookieConsentManager() {
    const {
        consentGiven,
        showBanner,
        showModal,
        preferences,
        acceptAll,
        rejectAll,
        saveCustom,
        openModal,
        closeModal,
    } = useCookieConsent();

    return (
        <>
            {/* Banner principal */}
            <CookieBanner
                visible={showBanner}
                onAcceptAll={acceptAll}
                onRejectAll={rejectAll}
                onOpenModal={openModal}
            />

            {/* Modal de preferencias */}
            <CookiePreferencesModal
                visible={showModal}
                initialPrefs={preferences}
                onSave={saveCustom}
                onClose={closeModal}
                onAcceptAll={acceptAll}
                onRejectAll={rejectAll}
            />

            {/* Botón flotante para reabrir las preferencias (RGPD: el usuario puede cambiar su elección) */}
            {consentGiven && !showBanner && !showModal && (
                <button
                    id="cookie-settings-fab"
                    className="cookie-settings-fab"
                    onClick={openModal}
                    aria-label="Gestionar preferencias de cookies"
                    title="Gestionar cookies"
                >
                    <span className="cookie-settings-fab__icon" aria-hidden="true">🍪</span>
                    <span>Cookies</span>
                </button>
            )}
        </>
    );
}
