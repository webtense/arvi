import React from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Wrench, CalendarPlus } from 'lucide-react';

export const Preventive = () => {
    const tasks = [
        { id: 1, name: 'Revisión Ascensor 1', target: 'CM Almogàvar', freq: 'Mensual', next: '25/03/2026' },
        { id: 2, name: 'Limpieza Grupo de Presión', target: 'Garaje Central', freq: 'Trimestral', next: '02/04/2026' },
        { id: 3, name: 'Mantenimiento Caldera', target: 'Edificio Sur', freq: 'Anual', next: '15/10/2026' }
    ];

    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h2>Mantenimiento Preventivo</h2>
                    <p className="text-muted">Gestión de revisiones y tareas periódicas.</p>
                </div>
                <Button><CalendarPlus size={18} /> Nueva Tarea</Button>
            </header>
            <div className="dashboard-grid">
                <Card title="Próximas Revisiones" className="projects-card">
                    <ul className="project-list">
                        {tasks.map(task => (
                            <li key={task.id} className="project-item">
                                <div className="project-info">
                                    <h4>{task.name} <span style={{ fontSize: '0.8rem', color: '#888' }}>({task.freq})</span></h4>
                                    <span className="project-status">{task.target}</span>
                                </div>
                                <div className="project-meta">
                                    <span className="project-expected">Próxima: {task.next}</span>
                                    <Button variant="outline" size="sm"><Wrench size={14} /> Ejecutar Parte</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};
