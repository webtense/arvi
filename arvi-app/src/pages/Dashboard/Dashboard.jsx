import { Wallet, TrendingUp, Clock, AlertTriangle, CalendarRange } from 'lucide-react';
import { useMemo } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { Card } from '../../components/Card/Card';
import './Dashboard.css';

const money = (amount) => `${Number(amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} EUR`;

export const Dashboard = () => {
  const { invoices, budgets } = useAccounting();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const metrics = useMemo(() => {
    const finalized = invoices.filter((inv) => inv.status === 'finalized' || inv.type === 'definitive');
    const monthInvoices = finalized.filter((inv) => {
      const d = new Date(inv.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const yearInvoices = finalized.filter((inv) => new Date(inv.date).getFullYear() === currentYear);

    const pendingInvoices = invoices.filter((inv) => inv.paymentStatus !== 'paid' && (inv.status === 'finalized' || inv.type === 'definitive'));
    const acceptedBudgets = budgets.filter((b) => b.status === 'accepted');
    const sentBudgets = budgets.filter((b) => b.status === 'sent');

    const monthTotal = monthInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const yearTotal = yearInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const acceptedAmount = acceptedBudgets.reduce((sum, b) => sum + Number(b.total || 0), 0);
    const sentAmount = sentBudgets.reduce((sum, b) => sum + Number(b.total || 0), 0);

    const forecast30 = acceptedAmount + sentAmount * 0.55;
    const forecast90 = acceptedAmount + sentAmount * 0.8;

    const monthlySeries = Array.from({ length: 12 }, (_, m) => {
      const value = yearInvoices
        .filter((inv) => new Date(inv.date).getMonth() === m)
        .reduce((sum, inv) => sum + Number(inv.total || 0), 0);
      return { month: m, value };
    });

    return {
      monthTotal,
      yearTotal,
      pendingAmount,
      acceptedAmount,
      sentAmount,
      forecast30,
      forecast90,
      monthlySeries,
    };
  }, [invoices, budgets, currentMonth, currentYear]);

  const maxSeries = Math.max(...metrics.monthlySeries.map((s) => s.value), 1);

  const kpis = [
    { title: 'Facturado mes actual', value: money(metrics.monthTotal), icon: <CalendarRange size={22} />, trend: 'Seguimiento mensual', positive: true },
    { title: 'Facturado anio en curso', value: money(metrics.yearTotal), icon: <Wallet size={22} />, trend: 'Acumulado YTD', positive: true },
    { title: 'Pendiente de cobro', value: money(metrics.pendingAmount), icon: <Clock size={22} />, trend: metrics.pendingAmount > 0 ? 'Requiere seguimiento' : 'Todo al dia', positive: metrics.pendingAmount === 0 },
    { title: 'Prevision 30 dias', value: money(metrics.forecast30), icon: <TrendingUp size={22} />, trend: `Prevision 90 dias: ${money(metrics.forecast90)}`, positive: true },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Panel financiero y previsiones</h2>
          <p className="text-muted">Indicadores para mejorar facturacion, conversion y cobro.</p>
        </div>
      </header>

      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="kpi-card">
            <div className="kpi-content">
              <div className="kpi-icon">{kpi.icon}</div>
              <div className="kpi-info">
                <p className="kpi-title">{kpi.title}</p>
                <h3 className="kpi-value">{kpi.value}</h3>
              </div>
            </div>
            <div className={`kpi-trend ${kpi.positive ? 'positive' : 'neutral'}`}>{kpi.trend}</div>
          </Card>
        ))}
      </section>

      <div className="dashboard-grid">
        <Card title="Evolucion mensual (anio actual)" className="expenses-card">
          <div className="mock-chart">
            <div className="bar-container">
              {metrics.monthlySeries.map((item) => (
                <div key={item.month} className="bar" style={{ height: `${Math.max((item.value / maxSeries) * 100, 4)}%` }}>
                  <span>{new Date(currentYear, item.month, 1).toLocaleDateString('es-ES', { month: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Pipeline comercial" className="projects-card">
          <ul className="project-list">
            <li className="project-item">
              <div className="project-info"><h4>Presupuestos aceptados</h4><span className="project-status">Alta conversion</span></div>
              <div className="project-meta"><span className="project-expected">{money(metrics.acceptedAmount)}</span></div>
            </li>
            <li className="project-item">
              <div className="project-info"><h4>Presupuestos enviados</h4><span className="project-status">Pendiente respuesta</span></div>
              <div className="project-meta"><span className="project-expected">{money(metrics.sentAmount)}</span></div>
            </li>
            <li className="project-item">
              <div className="project-info"><h4>Alertas de gestion</h4><span className="project-status">Requiere seguimiento</span></div>
              <div className="project-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={16} /> Cobro pendiente: {money(metrics.pendingAmount)}</div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
