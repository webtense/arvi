import React from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Save, Settings as SettingsIcon, Shield, Zap, Calculator } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import './Settings.css';

export const Settings = () => {
    const { settings, updateSettings, toggleService } = useSettings();

    const handleRateChange = (field, value) => {
        updateSettings({ [field]: parseFloat(value) || 0 });
    };

    return (
        <div className="settings-page">
            <header className="page-header">
                <div>
                    <h2>Configuración del Sistema</h2>
                    <p className="text-muted">Gestiona tarifas base y visibilidad de módulos.</p>
                </div>
            </header>

            <div className="settings-grid">
                {/* Tarifas y Precios */}
                <Card title="Tarifas y Precios" icon={<Calculator size={20} />}>
                    <div className="settings-form">
                        <div className="form-group">
                            <label>Idioma por defecto</label>
                            <select
                                className="form-control"
                                value={settings.language || 'ca'}
                                onChange={(e) => updateSettings({ language: e.target.value })}
                            >
                                <option value="ca">Català</option>
                                <option value="es">Español</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Precio Disposición de Servicio (€)</label>
                            <input
                                type="number"
                                value={settings.displacementPrice}
                                onChange={(e) => handleRateChange('displacementPrice', e.target.value)}
                                className="form-control"
                            />
                            <p className="help-text">Precio base por desplazamiento (por defecto en partes).</p>
                        </div>
                        <div className="form-group">
                            <label>Precio Hora Técnico Oficial 1ª (€/h)</label>
                            <input
                                type="number"
                                value={settings.tech1Rate}
                                onChange={(e) => handleRateChange('tech1Rate', e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Precio Hora Ayudante (€/h)</label>
                            <input
                                type="number"
                                value={settings.assistantRate}
                                onChange={(e) => handleRateChange('assistantRate', e.target.value)}
                                className="form-control"
                            />
                        </div>
                    </div>
                </Card>

                {/* Módulos Activos */}
                <Card title="Módulos y Servicios" icon={<Zap size={20} />}>
                    <div className="services-toggle-list">
                        <div className="service-toggle-item">
                            <div className="service-info">
                                <strong>Mantenimiento Preventivo</strong>
                                <p>Gestión de calendarios y revisiones periódicas.</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.activeServices.preventive}
                                    onChange={() => toggleService('preventive')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="service-toggle-item">
                            <div className="service-info">
                                <strong>Control de Activos</strong>
                                <p>Inventario de maquinaria y equipos de clientes.</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.activeServices.assets}
                                    onChange={() => toggleService('assets')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Seguridad y Legal */}
                <Card title="Seguridad y Legal" icon={<Shield size={20} />}>
                    <div className="settings-info-box">
                        <p>Los textos legales de los partes de trabajo se ajustan automáticamente a la normativa de vicios ocultos (LOE/Código Civil) comentada en el plan de implementación.</p>
                        <Button variant="outline" style={{ marginTop: '1rem' }}>Ver Cláusula Estándar</Button>
                    </div>
                </Card>
            </div>

            <div className="settings-actions">
                <Button className="primary">
                    <Save size={18} /> Guardar Cambios
                </Button>
            </div>
        </div>
    );
};
