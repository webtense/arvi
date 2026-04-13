import { useMemo, useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Send, CheckCircle2, FileText, Mail, Search } from 'lucide-react';
import { useBudgets } from '../../context/BudgetsContext';
import { useClients } from '../../context/ClientsContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';
import { emitToast } from '../../utils/toast';
import './Budgets.css';

const makeLine = (description = '', quantity = 1, unitPrice = 0, category = 'general') => ({
  description,
  quantity,
  unitPrice,
  tax: 21,
  category,
});

export const Budgets = () => {
  const { budgets, addBudget, updateBudget, sendBudget, acceptBudget } = useBudgets();
  const { clients, searchClients, addClient } = useClients();
  const { settings } = useSettings();

  const [clientQuery, setClientQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [createClientInline, setCreateClientInline] = useState(false);
  const [inlineClient, setInlineClient] = useState({ name: '', cif: '', email: '', phone: '', address: '' });
  const [notes, setNotes] = useState('');
  const [techHours, setTechHours] = useState(1);
  const [workDescription, setWorkDescription] = useState('');
  const [extraLines, setExtraLines] = useState([]);

  const displacement = Number(settings.displacementPrice || 0);
  const hourRate = Number(settings.tech1Rate || 45);

  const items = useMemo(() => {
    return [
      makeLine('Desplazamiento de servicio', 1, displacement, 'service'),
      makeLine('Horas tecnico', Number(techHours) || 0, hourRate, 'labor'),
      ...(workDescription.trim()
        ? [makeLine(`Trabajo realizado: ${workDescription.trim()}`, 1, 0, 'work-description')]
        : []),
      ...extraLines,
    ];
  }, [displacement, hourRate, techHours, workDescription, extraLines]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
    const taxTotal = items.reduce((sum, item) => {
      const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      return sum + (base * (Number(item.tax) || 0)) / 100;
    }, 0);
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  }, [items]);

  const resetForm = () => {
    setClientQuery('');
    setSelectedClient(null);
    setCreateClientInline(false);
    setInlineClient({ name: '', cif: '', email: '', phone: '', address: '' });
    setNotes('');
    setTechHours(1);
    setWorkDescription('');
    setExtraLines([]);
  };

  const saveBudget = async () => {
    const client = selectedClient || (createClientInline ? inlineClient : null);
    if (!client?.name?.trim()) {
      emitToast({ type: 'error', message: 'Selecciona o crea un cliente antes de guardar' });
      return;
    }

    let clientData = selectedClient;
    if (!selectedClient && createClientInline) {
      try {
        clientData = await addClient(inlineClient);
      } catch (error) {
        emitToast({ type: 'error', message: error.message || 'No se pudo crear el cliente' });
        return;
      }
    }

    const payload = {
      clientId: clientData?.id,
      client: clientData?.name || inlineClient.name,
      clientCif: clientData?.cif || inlineClient.cif,
      clientEmail: clientData?.email || inlineClient.email,
      clientPhone: clientData?.phone || inlineClient.phone,
      clientAddress: clientData?.address || inlineClient.address,
      notes,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      items,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
    };

    await addBudget(payload);
    emitToast({ type: 'success', message: 'Presupuesto guardado en borrador' });
    resetForm();
  };

  const convertToInvoice = async (budget) => {
    try {
      await api.budgetToInvoice(budget.id);
      emitToast({ type: 'success', message: 'Presupuesto convertido a factura' });
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo convertir a factura' });
    }
  };

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h2>Presupuestos / Proformas</h2>
          <p className="text-muted">Flujo: cliente -&gt; servicio + horas tecnico -&gt; total automatico -&gt; borrador / envio / factura.</p>
        </div>
      </header>

      <Card title="Nuevo presupuesto">
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input className="form-control" placeholder="Buscar cliente" value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} style={{ minWidth: 220 }} />
            <Button variant="secondary" onClick={() => searchClients(clientQuery)}><Search size={14} /> Buscar</Button>
            <Button variant="secondary" onClick={() => setCreateClientInline((prev) => !prev)}>{createClientInline ? 'Cancelar alta cliente' : 'Cliente no existe: crear'}</Button>
          </div>

          {!createClientInline && clients.length > 0 && (
            <div style={{ display: 'grid', gap: 8, maxHeight: 120, overflow: 'auto' }}>
              {clients.slice(0, 6).map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className="list-item"
                  style={{ textAlign: 'left', border: selectedClient?.id === client.id ? '1px solid var(--brand-green)' : '1px solid var(--border-color)' }}
                  onClick={() => setSelectedClient(client)}
                >
                  <strong>{client.name}</strong> · {client.cif || 'Sin CIF'} · {client.email || 'Sin email'}
                </button>
              ))}
            </div>
          )}

          {createClientInline && (
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <input className="form-control" placeholder="Nombre" value={inlineClient.name} onChange={(e) => setInlineClient((p) => ({ ...p, name: e.target.value }))} />
              <input className="form-control" placeholder="CIF" value={inlineClient.cif} onChange={(e) => setInlineClient((p) => ({ ...p, cif: e.target.value }))} />
              <input className="form-control" placeholder="Email" value={inlineClient.email} onChange={(e) => setInlineClient((p) => ({ ...p, email: e.target.value }))} />
              <input className="form-control" placeholder="Telefono" value={inlineClient.phone} onChange={(e) => setInlineClient((p) => ({ ...p, phone: e.target.value }))} />
              <input className="form-control" placeholder="Direccion" value={inlineClient.address} onChange={(e) => setInlineClient((p) => ({ ...p, address: e.target.value }))} />
            </div>
          )}

          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label>Desplazamiento ({displacement.toFixed(2)} EUR)</label>
              <input className="form-control" value={displacement} disabled />
            </div>
            <div>
              <label>Horas tecnico ({hourRate.toFixed(2)} EUR/h)</label>
              <input className="form-control" type="number" min="0" step="0.5" value={techHours} onChange={(e) => setTechHours(e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Descripcion de trabajo realizado</label>
              <textarea className="form-control" rows="2" value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <strong>Lineas adicionales</strong>
            {extraLines.map((line, idx) => (
              <div key={idx} className="budget-extra-line-grid">
                <input className="form-control" placeholder="Descripcion" value={line.description} onChange={(e) => setExtraLines((prev) => prev.map((l, i) => (i === idx ? { ...l, description: e.target.value } : l)))} />
                <input className="form-control" type="number" value={line.quantity} onChange={(e) => setExtraLines((prev) => prev.map((l, i) => (i === idx ? { ...l, quantity: Number(e.target.value) } : l)))} />
                <input className="form-control" type="number" value={line.unitPrice} onChange={(e) => setExtraLines((prev) => prev.map((l, i) => (i === idx ? { ...l, unitPrice: Number(e.target.value) } : l)))} />
                <input className="form-control" type="number" value={line.tax} onChange={(e) => setExtraLines((prev) => prev.map((l, i) => (i === idx ? { ...l, tax: Number(e.target.value) } : l)))} />
                <Button variant="secondary" onClick={() => setExtraLines((prev) => prev.filter((_, i) => i !== idx))}>X</Button>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setExtraLines((prev) => [...prev, makeLine('', 1, 0, 'extra')])}>Añadir linea</Button>
          </div>

          <textarea className="form-control" rows="2" placeholder="Notas internas" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div style={{ display: 'grid', gap: 6 }}>
            <div>Subtotal: <strong>{totals.subtotal.toFixed(2)} EUR</strong></div>
            <div>IVA: <strong>{totals.taxTotal.toFixed(2)} EUR</strong></div>
            <div>Total: <strong>{totals.total.toFixed(2)} EUR</strong></div>
          </div>

          <Button variant="primary" onClick={saveBudget}><FileText size={16} /> Guardar borrador</Button>
        </div>
      </Card>

      <Card title="Listado de presupuestos" style={{ marginTop: 16 }}>
        <div className="budget-cards-list">
          {budgets.map((budget) => (
            <Card key={budget.id} className="budget-mobile-card">
              <div className="budget-mobile-head">
                <div>
                  <p className="budget-number">{budget.budgetNumber || `B-${budget.id}`}</p>
                  <h3>{budget.client}</h3>
                </div>
                <span className="budget-status-chip">{budget.status}</span>
              </div>
              <div className="budget-mobile-meta">
                <span><strong>Total</strong>{Number(budget.total || 0).toFixed(2)} EUR</span>
                <span><strong>Email</strong>{budget.clientEmail || '-'}</span>
              </div>
              <div className="budget-actions-wrap">
                <Button variant="secondary" onClick={() => sendBudget(budget.id)}><Send size={14} /> Enviar</Button>
                <Button variant="secondary" onClick={() => acceptBudget(budget.id)}><CheckCircle2 size={14} /> Aceptar</Button>
                <Button variant="secondary" onClick={() => convertToInvoice(budget)}>Pasar a factura</Button>
                <Button variant="secondary" onClick={() => window.open(api.getBudgetPdfUrl(budget.id), '_blank', 'noopener,noreferrer')}><FileText size={14} /> PDF</Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="budget-table-desktop" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>Numero</th>
                <th style={{ textAlign: 'left' }}>Cliente</th>
                <th style={{ textAlign: 'left' }}>Total</th>
                <th style={{ textAlign: 'left' }}>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 0' }}>{budget.budgetNumber || `B-${budget.id}`}</td>
                  <td>{budget.client}</td>
                  <td>{Number(budget.total || 0).toFixed(2)} EUR</td>
                  <td>{budget.status}</td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => updateBudget(budget.id, { status: 'draft' })}>Editar</Button>
                    <Button variant="secondary" onClick={() => sendBudget(budget.id)}><Send size={14} /> Enviar</Button>
                    <Button variant="secondary" onClick={() => acceptBudget(budget.id)}><CheckCircle2 size={14} /> Aceptar</Button>
                    <Button variant="secondary" onClick={() => convertToInvoice(budget)}>Pasar a factura</Button>
                    <Button variant="secondary" onClick={() => window.open(api.getBudgetPdfUrl(budget.id), '_blank', 'noopener,noreferrer')}><FileText size={14} /> PDF</Button>
                    <Button variant="secondary" onClick={() => window.open(`mailto:${budget.clientEmail || ''}`)}><Mail size={14} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
