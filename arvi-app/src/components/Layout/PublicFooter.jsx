import React from 'react';
import { useTranslation } from 'react-i18next';

export const PublicFooter = () => {
    const { t } = useTranslation();
    return (
        <footer className="landing-footer">
            <p>{t('landing.footer')}</p>
        </footer>
    );
};
