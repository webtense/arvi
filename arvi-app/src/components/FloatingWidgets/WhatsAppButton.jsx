import React from 'react';
import './FloatingWidgets.css';

// ─── Configura tu número de WhatsApp ────────────────────────────────────────
// Formato internacional SIN el "+": país + número
// Ejemplo España: 34 + tu número sin el 0 inicial
const WHATSAPP_NUMBER = '34669475583'; // Jaume Aranda
const WHATSAPP_MESSAGE = '¡Hola! Me gustaría obtener más información sobre vuestros servicios.';
// ─────────────────────────────────────────────────────────────────────────────

const WhatsAppIcon = () => (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.002 3C9.376 3 4 8.373 4 15c0 2.385.68 4.61 1.86 6.504L4 29l7.697-1.842A12.94 12.94 0 0 0 16.002 28C22.627 28 28 22.627 28 16S22.627 3 16.002 3Zm0 2.4c5.856 0 10.6 4.744 10.6 10.6s-4.744 10.6-10.6 10.6c-2.001 0-3.87-.554-5.464-1.519l-.39-.237-4.037.966.986-3.932-.258-.41A10.558 10.558 0 0 1 5.4 16c0-5.856 4.744-10.6 10.6-10.6Zm-3.41 5.57c-.208 0-.546.078-.831.39-.285.312-1.09 1.066-1.09 2.598s1.116 3.015 1.272 3.224c.156.208 2.17 3.484 5.367 4.745 2.665 1.051 3.198.843 3.774.79.576-.052 1.858-.76 2.12-1.494.26-.733.26-1.362.182-1.494-.078-.13-.286-.208-.598-.364-.312-.156-1.858-.917-2.144-1.022-.286-.104-.494-.156-.702.156-.208.312-.806 1.022-.988 1.23-.182.208-.364.234-.676.078-.312-.156-1.318-.486-2.51-1.547-.927-.826-1.553-1.848-1.735-2.16-.182-.312-.02-.481.137-.636.14-.14.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.7-1.69-.962-2.314-.26-.624-.52-.52-.702-.52Z" />
    </svg>
);

export function WhatsAppButton() {
    const encodedMsg = encodeURIComponent(WHATSAPP_MESSAGE);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;

    return (
        <a
            id="whatsapp-float-btn"
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-float-btn"
            aria-label="Contactar por WhatsApp"
        >
            <WhatsAppIcon />
            <span className="wa-float-label">Más información</span>
            <span className="wa-notification-dot" aria-hidden="true" />
        </a>
    );
}
