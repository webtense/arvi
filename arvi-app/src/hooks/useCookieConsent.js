/**
 * useCookieConsent.js
 * Hook para gestionar el consentimiento de cookies conforme a LSSI-CE y RGPD (España/UE)
 * Las cookies técnicas/esenciales siempre están activas y no requieren consentimiento.
 * El resto de categorías requieren consentimiento explícito del usuario.
 */

import { useState, useEffect, useCallback } from 'react';

const CONSENT_KEY = 'arvi_cookie_consent';
const CONSENT_VERSION = '1.0'; // Incrementar si cambia la política de cookies

const DEFAULT_PREFERENCES = {
    essential: true,       // Siempre activas, no se pueden desactivar (LSSI-CE Art. 22.2)
    analytics: false,      // Cookies de análisis / estadísticas
    marketing: false,      // Cookies de publicidad y marketing
    preferences: false,    // Cookies de personalización (tema, idioma, etc.)
};

/**
 * Lee el consentimiento guardado en localStorage.
 * Devuelve null si no existe o si la versión ha cambiado.
 */
function readStoredConsent() {
    try {
        const raw = localStorage.getItem(CONSENT_KEY);
        if (!raw) return null;
        const stored = JSON.parse(raw);
        if (stored.version !== CONSENT_VERSION) return null;
        return stored;
    } catch {
        return null;
    }
}

export function useCookieConsent() {
    const [consentGiven, setConsentGiven] = useState(false); // ¿Ya se tomó una decisión?
    const [showBanner, setShowBanner] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [consentDate, setConsentDate] = useState(null);

    // Al montar, leer consentimiento previo
    useEffect(() => {
        const stored = readStoredConsent();
        if (stored) {
            setConsentGiven(true);
            setPreferences(stored.preferences);
            setConsentDate(stored.date);
            setShowBanner(false);
        } else {
            // No hay consentimiento → mostrar banner con pequeño delay para mejor UX
            const timer = setTimeout(() => setShowBanner(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    /** Guarda el consentimiento en localStorage con metadatos */
    const saveConsent = useCallback((prefs) => {
        const payload = {
            version: CONSENT_VERSION,
            date: new Date().toISOString(),
            preferences: { ...prefs, essential: true }, // Esenciales siempre true
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
        setPreferences(payload.preferences);
        setConsentDate(payload.date);
        setConsentGiven(true);
        setShowBanner(false);
        setShowModal(false);
    }, []);

    /** Acepta todas las categorías */
    const acceptAll = useCallback(() => {
        saveConsent({
            essential: true,
            analytics: true,
            marketing: true,
            preferences: true,
        });
    }, [saveConsent]);

    /** Rechaza todas excepto las esenciales */
    const rejectAll = useCallback(() => {
        saveConsent({
            essential: true,
            analytics: false,
            marketing: false,
            preferences: false,
        });
    }, [saveConsent]);

    /** Guarda las preferencias personalizadas del modal */
    const saveCustom = useCallback((customPrefs) => {
        saveConsent({ ...customPrefs, essential: true });
    }, [saveConsent]);

    /** Abre el modal de personalización */
    const openModal = useCallback(() => setShowModal(true), []);
    const closeModal = useCallback(() => setShowModal(false), []);

    /** Permite reabrir el banner (desde "Política de Cookies") */
    const revokeConsent = useCallback(() => {
        localStorage.removeItem(CONSENT_KEY);
        setConsentGiven(false);
        setConsentDate(null);
        setPreferences(DEFAULT_PREFERENCES);
        setShowBanner(true);
    }, []);

    /** Comprueba si una categoría concreta tiene consentimiento */
    const hasConsent = useCallback(
        (category) => preferences[category] === true,
        [preferences]
    );

    return {
        consentGiven,
        showBanner,
        showModal,
        preferences,
        consentDate,
        acceptAll,
        rejectAll,
        saveCustom,
        openModal,
        closeModal,
        revokeConsent,
        hasConsent,
    };
}
