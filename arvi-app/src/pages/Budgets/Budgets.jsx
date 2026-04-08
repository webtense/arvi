import React, { useMemo, useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Send, CheckCircle2, FileText, MessageCircle, Mail } from 'lucide-react';
import { useBudgets } from '../../context/BudgetsContext';
import { useAccounting } from '../../context/AccountingContext';

const defaultItem = { description: '', quantity: 1, unitPrice: 0, tax: 21, category: 'general' };

export const Budgets = () => {
    const { budgets, addBudget, updateBudget, sendBudget, acceptBudget } = useBudgets();
    const { convertToInvoice } = useAccounting();
    const [client, setClient] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ ...defaultItem }]);

    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0);
        const taxTotal = items.reduce((sum, item) => {
            const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
            return sum + base * ((Number(item.tax) || 0) / 100);
        }, 0);
        return { subtotal, taxTotal, total: subtotal + taxTotal };
    }, [items]);

    const resetForm = () => {
        setClient('');
        setClientEmail('');
        setClientPhone('');
        setNotes('');
        setItems([{ ...defaultItem }]);
    };

    const saveBudget = async () => {
        if (!client.trim()) return;
        const payload = {
            client,
            clientEmail,
            clientPhone,
            notes,
            items: items.map((it) => ({
                ...it,
                quantity: Number(it.quantity) || 0,
                unitPrice: Number(it.unitPrice) || 0,
                tax: Number(it.tax) || 0,
                total: (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)
            })),
            subtotal: totals.subtotal,
            taxTotal: totals.taxTotal,
            total: totals.total,
            status: 'draft'
        };
        await addBudget(payload);
        resetForm();
    };

    const shareByEmail = (budget) => {
        const subject = encodeURIComponent(`Presupuesto ${budget.budgetNumber || budget.id}`);
        const body = encodeURIComponent(`Hola, adjuntamos el presupuesto para ${budget.client}. Total: ${Number(budget.total || 0).toFixed(2)} EUR.`);
        window.open(`mailto:${budget.clientEmail || ''}?subject=${subject}&body=${body}`);
    };

    const shareByWhatsApp = (budget) => {
        const text = encodeURIComponent(`Presupuesto ${budget.budgetNumber || budget.id} para ${budget.client}. Total ${Number(budget.total || 0).toFixed(2)} EUR.`);
        window.open(`https://wa.me/${(budget.clientPhone || '').replace(/\D/g, '')}?text=${text}`, '_blank');
    };

    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h2>Presupuestos</h2>
                    <p className="text-muted">Creación rápida para móvil, envío y conversión a factura.</p>
                </div>
            </header>

            <Card title="Nuevo Presupuesto (rápido)">
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <input className="form-control" placeholder="Cliente" value={client} onChange={(e) => setClient(e.target.value)} />
                    <input className="form-control" placeholder="Email cliente" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                    <input className="form-control" placeholder="Teléfono (WhatsApp)" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                </div>

                <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
                            <input className="form-control" placeholder="Descripción" value={item.description} onChange={(e) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))} />
                            <input className="form-control" type="number" placeholder="Cant." value={item.quantity} onChange={(e) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it))} />
                            <input className="form-control" type="number" placeholder="Precio" value={item.unitPrice} onChange={(e) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, unitPrice: e.target.value } : it))} />
                            <input className="form-control" type="number" placeholder="IVA %" value={item.tax} onChange={(e) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, tax: e.target.value } : it))} />
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Button variant="secondary" onClick={() => setItems(prev => [...prev, { ...defaultItem }])}>Añadir línea</Button>
                        <Button variant="primary" onClick={saveBudget}><FileText size={16} /> Guardar borrador</Button>
                    </div>
                    <textarea className="form-control" rows="2" placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    <strong>Total: {totals.total.toFixed(2)} EUR</strong>
                </div>
            </Card>

            <Card title="Presupuestos creados" style={{ marginTop: '16px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '8px 0' }}>Numero</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map((b) => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 0' }}>{b.budgetNumber || `B-${b.id}`}</td>
                                    <td>{b.client}</td>
                                    <td>{Number(b.total || 0).toFixed(2)} EUR</td>
                                    <td>{b.status}</td>
                                    <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                                        <Button variant="secondary" onClick={() => updateBudget(b.id, { status: 'draft' })}>Editar</Button>
                                        <Button variant="secondary" onClick={() => sendBudget(b.id)}><Send size={14} /> Enviar</Button>
                                        <Button variant="secondary" onClick={() => acceptBudget(b.id)}><CheckCircle2 size={14} /> Aceptar</Button>
                                        <Button variant="secondary" onClick={() => updateBudget(b.id, { status: 'proforma' })}>Pasar a proforma</Button>
                                        <Button variant="secondary" onClick={() => convertToInvoice(b, 'budget')}>Pasar a factura</Button>
                                        <Button variant="secondary" onClick={() => shareByEmail(b)}><Mail size={14} /></Button>
                                        <Button variant="secondary" onClick={() => shareByWhatsApp(b)}><MessageCircle size={14} /></Button>
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
