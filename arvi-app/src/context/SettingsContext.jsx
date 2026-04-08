import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from '../i18n/config';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('arviSettings');
        return savedSettings ? JSON.parse(savedSettings) : {
            language: 'ca',
            displacementPrice: 20,
            tech1Rate: 45,
            assistantRate: 30,
            activeServices: {
                preventive: true,
                assets: true,
                tickets: true,
                parts: true
            }
        };
    });

    useEffect(() => {
        if (settings.language) {
            i18n.changeLanguage(settings.language);
        }
    }, [settings.language]);

    useEffect(() => {
        localStorage.setItem('arviSettings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const toggleService = (serviceKey) => {
        setSettings(prev => ({
            ...prev,
            activeServices: {
                ...prev.activeServices,
                [serviceKey]: !prev.activeServices[serviceKey]
            }
        }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, toggleService }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
