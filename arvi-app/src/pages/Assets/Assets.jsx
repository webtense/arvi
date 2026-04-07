import React from 'react';
import { Card } from '../../components/Card/Card';
import { Box, QrCode, Hammer } from 'lucide-react';

export const Assets = () => {
    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h2>Gestión de Activos</h2>
                    <p className="text-muted">Control de maquinarias, ascensores y equipos de clientes.</p>
                </div>
            </header>
            <div className="dashboard-grid">
                <Card title="Inventario de Activos">
                    <ul className="project-list">
                        <li className="project-item">
                            <div className="project-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Box size={32} color="#00C853" />
                                <div>
                                    <h4>Ascensor OTIS Modelo XT-200</h4>
                                    <span className="project-status">Comunidad Almogàvar 42</span>
                                </div>
                            </div>
                            <div className="project-meta" style={{ display: 'flex', gap: '10px' }}>
                                <button className="tab-btn active"><QrCode size={16} /> Ver QR</button>
                                <button className="tab-btn"><Hammer size={16} /> Historial (12)</button>
                            </div>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};
