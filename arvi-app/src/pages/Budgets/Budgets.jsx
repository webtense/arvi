import React from 'react';
import { Card } from '../../components/Card/Card';
import { TrendingUp } from 'lucide-react';

export const Budgets = () => {
    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h2>Presupuestos y Rentabilidad</h2>
                    <p className="text-muted">Control de costes en pequeñas obras y reformas.</p>
                </div>
            </header>
            <div className="kpi-grid">
                <Card className="kpi-card highlight">
                    <div className="kpi-content">
                        <div className="kpi-icon"><TrendingUp size={24} /></div>
                        <div className="kpi-info">
                            <p className="kpi-title">Margen Promedio</p>
                            <h3 className="kpi-value">34.2%</h3>
                        </div>
                    </div>
                </Card>
            </div>
            <Card title="Obras en Curso" style={{ marginTop: '20px' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '10px 0' }}>Proyecto</th>
                            <th>Coste Previsto</th>
                            <th>Coste Real (Material+Horas)</th>
                            <th>Rentabilidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '10px 0' }}>Reforma Patios LM</td>
                            <td>4,500 €</td>
                            <td>2,800 €</td>
                            <td style={{ color: 'green' }}><strong>+37.7%</strong></td>
                        </tr>
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
