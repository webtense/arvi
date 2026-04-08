import { useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Save, Settings as SettingsIcon, Shield, Zap, Calculator, Info } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { emitToast } from '../../utils/toast';
import './Settings.css';

export const Settings = () => {
    const { settings, updateSettings, toggleService } = useSettings();
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleRateChange = (field, value) => {
        updateSettings({ [field]: parseFloat(value) || 0 });
        setHasChanges(true);
    };

    const handleToggle = (service) => {
        toggleService(service);
        setHasChanges(true);
    };

    const handleLanguageChange = (value) => {
        updateSettings({ language: value });
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setSaving(false);
        setHasChanges(false);
        emitToast({ type: 'success', message: 'Configuración guardada correctamente' });
    };

    return (
        <div className="settings-page">
            <header className="page-header">
                <div>
                    <h2>Configuración</h2>
                    <p className="text-muted">Personaliza tarifas, módulos e idioma.</p>
                </div>
            </header>

            <div className="settings-grid">
                <Card title="Tarifas Base" icon={<Calculator size={20} />}>
                    <div className="settings-form">
                        <div className="form-group">
                            <label>Idioma</label>
                            <select
                                className="form-control"
                                value={settings.language || 'ca'}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                            >
                                <option value="ca">Català</option>
                                <option value="es">Español</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Desplazamiento (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.displacementPrice}
                                onChange={(e) => handleRateChange('displacementPrice', e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Hora Técnico 1ª (€/h)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.tech1Rate}
                                onChange={(e) => handleRateChange('tech1Rate', e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Hora Ayudante (€/h)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.assistantRate}
                                onChange={(e) => handleRateChange('assistantRate', e.target.value)}
                                className="form-control"
                            />
                        </div>
                    </div>
                </Card>

                <Card title="Módulos Activos" icon={<Zap size={20} />}>
                    <div className="services-toggle-list">
                        <div className="service-toggle-item">
                            <div className="service-info">
                                <strong>Mantenimiento Preventivo</strong>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.activeServices.preventive}
                                    onChange={() => handleToggle('preventive')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="service-toggle-item">
                            <div className="service-info">
                                <strong>Control de Activos</strong>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.activeServices.assets}
                                    onChange={() => handleToggle('assets')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="service-toggle-item">
                            <div className="service-info">
                                <strong>Partes de Trabajo</strong>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.activeServices.parts}
                                    onChange={() => handleToggle('parts')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="service-toggle-item">
                            <div className="service-info">
                                <strong>Tickets (OCR)</strong>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.activeServices.tickets}
                                    onChange={() => handleToggle('tickets')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </Card>

                <Card title="Acerca de" icon={<Info size={20} />}>
                    <div className="settings-info-box">
                        <p><strong>ARVI Manteniments Integrals</strong></p>
                        <p className="text-muted">Versión 2.0.0</p>
                        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                            Sistema de gestión empresarial para empresas de mantenimiento.
                        </p>
                    </div>
                </Card>
            </div>

            {hasChanges && (
                <div className="settings-actions">
                    <Button 
                        className="primary" 
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            )}
        </div>
    );
};
