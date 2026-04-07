import { Wallet, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { Card } from '../../components/Card/Card';
import './Dashboard.css';

export const Dashboard = () => {
    const { invoices, budgets } = useAccounting();
    
    // Calculate real KPIs
    const totalInvoiced = invoices
        .filter(inv => inv.type === 'definitive')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const pendingDrafts = invoices
        .filter(inv => inv.type === 'draft')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const pendingBudgets = budgets
        .filter(b => b.status === 'pending')
        .reduce((sum, b) => sum + b.total, 0);

    const kpis = [
        { title: 'Facturado Total', value: `${totalInvoiced.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, icon: <Wallet size={24} />, trend: '+12%', positive: true },
        { title: 'Borradores Pendientes', value: `${pendingDrafts.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, icon: <Clock size={24} />, trend: 'Revisar', positive: false },
        { title: 'Presupuestos Activos', value: `${pendingBudgets.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, icon: <TrendingUp size={24} />, trend: '+5%', positive: true },
        { title: 'Alertas Verifactu', value: '0', icon: <AlertTriangle size={24} />, trend: 'Sistema OK', positive: true, highlight: false }
    ];

    const projects = [
        { id: 1, name: 'Comunidad Almogàvar', status: 'En curso', progress: 75, expected: '12.000 €' },
        { id: 2, name: 'Oficinas La Vanguardia', status: 'Pendiente', progress: 10, expected: '8.500 €' },
        { id: 3, name: 'Local Comercial', status: 'Terminado', progress: 100, expected: '4.100 €' }
    ];

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h2>Visión General</h2>
                    <p className="text-muted">Resumen financiero y estado de proyectos activos.</p>
                </div>
                <div className="header-actions">
                    {/* Aquí iría un selector de fechas */}
                </div>
            </header>

            <section className="kpi-grid">
                {kpis.map((kpi, index) => (
                    <Card key={index} className={`kpi-card ${kpi.highlight ? 'highlight' : ''}`}>
                        <div className="kpi-content">
                            <div className="kpi-icon">{kpi.icon}</div>
                            <div className="kpi-info">
                                <p className="kpi-title">{kpi.title}</p>
                                <h3 className="kpi-value">{kpi.value}</h3>
                            </div>
                        </div>
                        <div className={`kpi-trend ${kpi.positive ? 'positive' : 'neutral'}`}>
                            {kpi.trend}
                        </div>
                    </Card>
                ))}
            </section>

            <div className="dashboard-grid">
                <Card title="Proyectos Activos" className="projects-card">
                    <ul className="project-list">
                        {projects.map(project => (
                            <li key={project.id} className="project-item">
                                <div className="project-info">
                                    <h4>{project.name}</h4>
                                    <span className="project-status">{project.status}</span>
                                </div>
                                <div className="project-meta">
                                    <span className="project-expected">{project.expected}</span>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card title="Gastos Recientes (Tickets)" className="expenses-card">
                    <div className="mock-chart">
                        <div className="bar-container">
                            <div className="bar" style={{ height: '60%' }}><span>Lun</span></div>
                            <div className="bar" style={{ height: '30%' }}><span>Mar</span></div>
                            <div className="bar highlight-bar" style={{ height: '85%' }}><span>Mié</span></div>
                            <div className="bar" style={{ height: '45%' }}><span>Jue</span></div>
                            <div className="bar" style={{ height: '20%' }}><span>Vie</span></div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
