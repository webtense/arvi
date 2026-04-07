import React from 'react';
import { Card } from '../../components/Card/Card';
import { HardHat } from 'lucide-react';

export const Subcontractors = () => {
    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h2>Subcontratas Externas</h2>
                    <p className="text-muted">Gestiona el trabajo delegado a otros profesionales.</p>
                </div>
            </header>
            <Card title="Directorio de Profesionales">
                <ul className="project-list">
                    <li className="project-item">
                        <div className="project-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <HardHat size={32} color="#f39c12" />
                            <div>
                                <h4>Instalaciones Eléctricas Ruiz</h4>
                                <span className="project-status">Electricista - 3 Tickets asignados</span>
                            </div>
                        </div>
                        <div className="project-meta">
                            <span className="project-expected" style={{ color: 'red' }}>Saldo Deudor: 340 €</span>
                        </div>
                    </li>
                </ul>
            </Card>
        </div>
    );
};
