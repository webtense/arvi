import React, { useState } from 'react';
import { Camera, Send, Clock, CheckCircle } from 'lucide-react';
import './ClientPortal.css';

export const ClientPortal = () => {
    const [tickets] = useState([
        { id: 'TKT-001', title: 'Ascensor bloqueado Planta 2', status: 'pending', date: 'Hoy' },
        { id: 'TKT-002', title: 'Humedad en el portal', status: 'resolved', date: '12/03/2026' }
    ]);

    return (
        <div className="client-portal">
            <header className="portal-header">
                <h1>Portal del Vecino</h1>
                <p>Comunidad Almogàvar 42</p>
            </header>

            <section className="portal-main">
                <div className="report-card">
                    <h3>Reportar Nueva Incidencia</h3>
                    <form className="report-form" onSubmit={e => e.preventDefault()}>
                        <div className="form-group">
                            <label>¿Qué ocurre?</label>
                            <textarea placeholder="Describe el problema en la comunidad..." rows="3"></textarea>
                        </div>
                        <div className="form-group photo-upload">
                            <button className="photo-btn" type="button">
                                <Camera size={24} />
                                <span>Añadir Foto</span>
                            </button>
                        </div>
                        <button className="submit-btn" type="button">
                            <Send size={18} /> Enviar Incidencia
                        </button>
                    </form>
                </div>

                <div className="history-section">
                    <h3>Mis Incidencias</h3>
                    <ul className="incidences-list">
                        {tickets.map(t => (
                            <li key={t.id} className="incidence-item">
                                <div className="inc-info">
                                    <h4>{t.title}</h4>
                                    <span className="inc-date">{t.date}</span>
                                </div>
                                <div className={`inc-status ${t.status}`}>
                                    {t.status === 'resolved' ? <><CheckCircle size={16} /> Resuelto</> : <><Clock size={16} /> Pendiente</>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
};
