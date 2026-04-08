import { useState, useEffect } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { FileText, Printer, ChevronLeft, CheckCircle, AlertTriangle, Download, Upload, Plus, Save, Trash2, X, Search, User, Pencil } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { useClients } from '../../context/ClientsContext';
import { QRCodeSVG } from 'qrcode.react';
import { emitToast } from '../../utils/toast';
import './Invoices.css';

const UNIT_OPTIONS = [
    { value: 'ud', label: 'Ud' },
    { value: 'h', label: 'Horas' },
    { value: 'kg', label: 'Kg' },
    { value: 'm', label: 'm' },
    { value: 'm2', label: 'm²' },
    { value: 'm3', label: 'm³' },
    { value: 'l', label: 'Litros' },
];

const TAX_OPTIONS = [
    { value: 21, label: '21% (General)' },
    { value: 10, label: '10% (Reducido)' },
    { value: 4, label: '4% (Superreducido)' },
    { value: 0, label: '0% (Exento)' },
];

export const Invoices = () => {
    const { invoices, finalizeInvoice, importInvoices, addInvoice, getNextInvoiceNumber } = useAccounting();
    const { clients, loading: clientsLoading, searchClients } = useClients();
    
    const [viewMode, setViewMode] = useState('list');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [clientSearch, setClientSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);

    const emptyLine = () => ({
        id: Date.now() + Math.random(),
        description: '',
        quantity: 1,
        unit: 'ud',
        unitPrice: 0,
        tax: 21,
        total: 0
    });

    const [newInvoice, setNewInvoice] = useState({
        clientName: '',
        clientCif: '',
        clientAddress: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        description: '',
        items: [emptyLine()],
        notes: '',
        paymentMethod: 'transfer'
    });

    useEffect(() => {
        if (clientSearch.length >= 2) {
            searchClients(clientSearch);
            setShowClientDropdown(true);
        }
    }, [clientSearch]);

    const calculateTotals = (items) => {
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const taxTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.tax / 100), 0);
        return { subtotal, taxTotal, total: subtotal + taxTotal };
    };

    const updateLine = (index, field, value) => {
        const newItems = [...newInvoice.items];
        newItems[index][field] = value;
        
        if (field === 'unitPrice' || field === 'quantity' || field === 'tax') {
            newItems[index].total = newItems[index].unitPrice * newItems[index].quantity * (1 + newItems[index].tax / 100);
        }
        
        setNewInvoice({ ...newInvoice, items: newItems });
    };

    const addLine = () => {
        setNewInvoice({
            ...newInvoice,
            items: [...newInvoice.items, emptyLine()]
        });
    };

    const removeLine = (index) => {
        if (newInvoice.items.length > 1) {
            const newItems = newInvoice.items.filter((_, i) => i !== index);
            setNewInvoice({ ...newInvoice, items: newItems });
        }
    };

    const selectClient = (client) => {
        setNewInvoice({
            ...newInvoice,
            clientName: client.name,
            clientCif: client.cif || '',
            clientAddress: client.address || ''
        });
        setClientSearch(client.name);
        setShowClientDropdown(false);
    };

    const handleCreateInvoice = () => {
        if (!newInvoice.clientName) {
            emitToast({ type: 'error', message: 'Selecciona un cliente' });
            return;
        }

        const hasValidItems = newInvoice.items.some(item => item.description && item.unitPrice > 0);
        if (!hasValidItems) {
            emitToast({ type: 'error', message: 'Añade al menos una línea con descripción y precio' });
            return;
        }

        const { subtotal, taxTotal, total } = calculateTotals(newInvoice.items);

        const invoice = {
            id: Date.now().toString(),
            invoiceNumber: getNextInvoiceNumber(false),
            date: newInvoice.date,
            dueDate: newInvoice.dueDate || null,
            clientName: newInvoice.clientName,
            clientCif: newInvoice.clientCif,
            clientAddress: newInvoice.clientAddress,
            description: newInvoice.description,
            items: newInvoice.items.map(item => ({
                ...item,
                total: item.unitPrice * item.quantity * (1 + item.tax / 100)
            })),
            subtotal,
            taxRate: 21,
            taxTotal,
            total,
            status: 'draft',
            type: 'draft',
            notes: newInvoice.notes,
            paymentMethod: newInvoice.paymentMethod
        };

        addInvoice(invoice);
        emitToast({ type: 'success', message: 'Factura creada correctamente' });
        
        setShowNewInvoiceModal(false);
        setNewInvoice({
            clientName: '',
            clientCif: '',
            clientAddress: '',
            date: new Date().toISOString().split('T')[0],
            dueDate: '',
            description: '',
            items: [emptyLine()],
            notes: '',
            paymentMethod: 'transfer'
        });
        setClientSearch('');
    };

    const handlePreview = (invoice) => {
        setSelectedInvoice(invoice);
        setViewMode('preview');
    };

    const handleFinalize = () => {
        finalizeInvoice(selectedInvoice.id);
        setShowConfirmModal(false);
        emitToast({ type: 'success', message: 'Factura finalizada y registrada' });
        setViewMode('list');
    };

    const filteredInvoices = invoices.filter(inv => {
        if (filter === 'all') return true;
        if (filter === 'draft') return inv.status === 'draft' || inv.type === 'draft';
        return inv.status === 'finalized' || inv.type === 'definitive';
    });

    const renderInvoicePreview = (inv) => {
        if (!inv) return null;
        const verifactuUrl = `https://www2.agenciatributaria.gob.es/verifactu?id=${inv.invoiceNumber}&hash=${inv.hash || ''}`;

        return (
            <div className="invoice-container" style={{ backgroundColor: '#fff', padding: '40px', color: '#000', borderRadius: '8px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative' }}>
                {inv.type === 'draft' && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '5rem', opacity: 0.1, fontWeight: 900, pointerEvents: 'none', border: '10px solid #000', padding: '20px', textTransform: 'uppercase' }}>
                        BORRADOR
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                    <div style={{ width: '150px' }}>
                        <div style={{ border: '4px solid #9DCE15', borderBottom: 'none', height: '6px', width: '100%', marginBottom: '2px' }}></div>
                        <h1 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-2px', fontWeight: 900, lineHeight: 0.8 }}>ARVI</h1>
                        <div style={{ border: '4px solid #000', borderTop: 'none', height: '6px', width: '100%', marginTop: '2px' }}></div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                        <strong>Reparem el passat | Mantenim el present | Instal·lem el futur</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        <strong>ARVI MANTENIMENTS INTEGRALS S.L.</strong><br />
                        C/ Sentmenat, 5<br />
                        Sabadell BCN 08203
                    </div>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.4', textAlign: 'right' }}>
                        {inv.clientName}<br />
                        {inv.clientCif && <>{inv.clientCif}<br /></>}
                        {inv.clientAddress}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 'bold' }}>
                            {inv.type === 'draft' ? 'FACTURA ESBORRANY' : 'FACTURA'}
                        </h2>
                        <p style={{ margin: '5px 0' }}>Número: <strong>{inv.invoiceNumber}</strong></p>
                        <p style={{ margin: '5px 0' }}>Data: <strong>{inv.finalDate || inv.date}</strong></p>
                    </div>
                    {(inv.status === 'finalized' || inv.type === 'definitive') && (
                        <div style={{ textAlign: 'right' }}>
                            <QRCodeSVG value={verifactuUrl} size={80} />
                            <p style={{ fontSize: '0.6rem', margin: '5px 0 0 0' }}>VERI*FACTU</p>
                        </div>
                    )}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '10px 0' }}>Descripció</th>
                            <th style={{ textAlign: 'center', padding: '10px 0' }}>Quantitat</th>
                            <th style={{ textAlign: 'right', padding: '10px 0' }}>Preu un.</th>
                            <th style={{ textAlign: 'right', padding: '10px 0' }}>IVA</th>
                            <th style={{ textAlign: 'right', padding: '10px 0' }}>Preu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inv.items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px 0' }}>{item.description}</td>
                                <td style={{ textAlign: 'center', padding: '15px 0' }}>{item.quantity} {item.unit}</td>
                                <td style={{ textAlign: 'right', padding: '15px 0' }}>{item.unitPrice.toFixed(2)} €</td>
                                <td style={{ textAlign: 'right', padding: '15px 0' }}>{item.tax}%</td>
                                <td style={{ textAlign: 'right', padding: '15px 0' }}>{(item.unitPrice * item.quantity * (1 + item.tax/100)).toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <table style={{ width: '250px', fontSize: '0.9rem' }}>
                        <tbody>
                            <tr><td style={{ padding: '5px 0' }}>Subtotal</td><td style={{ textAlign: 'right', padding: '5px 0' }}>{inv.subtotal.toFixed(2)} €</td></tr>
                            <tr><td style={{ padding: '5px 0', borderBottom: '1px solid #000' }}>IVA</td><td style={{ textAlign: 'right', padding: '5px 0', borderBottom: '1px solid #000' }}>{inv.taxTotal.toFixed(2)} €</td></tr>
                            <tr><td style={{ padding: '10px 0', fontSize: '1.1rem' }}><strong>Total</strong></td><td style={{ textAlign: 'right', padding: '10px 0', fontSize: '1.1rem' }}><strong>{inv.total.toFixed(2)} €</strong></td></tr>
                        </tbody>
                    </table>
                </div>

                {inv.notes && (
                    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <strong>Notas:</strong> {inv.notes}
                    </div>
                )}

                <div style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '10px', textAlign: 'center', fontSize: '0.85rem' }}>
                    Telèfon: +34 669 47 55 83 • Correu: vendes@arvimanteniment.com
                </div>
            </div>
        );
    };

    if (viewMode === 'preview') {
        return (
            <div style={{ padding: '1rem' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <ChevronLeft size={16} /> Volver
                    </Button>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(selectedInvoice.status === 'draft' || selectedInvoice.type === 'draft') && (
                            <Button variant="primary" onClick={() => setShowConfirmModal(true)}>
                                <CheckCircle size={16} /> Finalizar
                            </Button>
                        )}
                        <Button variant="secondary">
                            <Printer size={16} /> PDF
                        </Button>
                    </div>
                </div>
                {renderInvoicePreview(selectedInvoice)}

                {showConfirmModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <Card style={{ maxWidth: '500px', width: '100%', padding: '1.5rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <AlertTriangle size={48} style={{ color: '#f39c12', marginBottom: '1rem' }} />
                                <h3>Confirmar Factura Definitiva</h3>
                                <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
                                    Una vez finalizada, la factura no podrá ser editada según normativa de Hacienda.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
                                    <Button variant="primary" onClick={handleFinalize}>SÍ, FINALIZAR</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    const totals = calculateTotals(newInvoice.items);

    return (
        <div className="invoices-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>Sistema de Facturación</h2>
                    <p className="text-muted">Crea y gestiona facturas con cliente y líneas detalladas</p>
                </div>
                <Button variant="primary" onClick={() => setShowNewInvoiceModal(true)}>
                    <Plus size={16} /> Nueva Factura
                </Button>
            </header>

            {showNewInvoiceModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '1rem' }}>
                    <Card style={{ maxWidth: '800px', width: '100%', margin: '1rem 0', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Nueva Factura</h3>
                            <button onClick={() => setShowNewInvoiceModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>Cliente *</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={clientSearch} 
                                        onChange={(e) => { setClientSearch(e.target.value); setNewInvoice({ ...newInvoice, client: e.target.value }); }}
                                        placeholder="Buscar cliente..."
                                    />
                                    <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                </div>
                                {showClientDropdown && clients.length > 0 && (
                                    <div style={{ position: 'absolute', zIndex: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', maxHeight: '200px', overflow: 'auto', width: '100%', marginTop: '4px', boxShadow: 'var(--shadow-dropdown)' }}>
                                        {clients.map(client => (
                                            <div key={client.id} onClick={() => selectClient(client)} style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <User size={16} />
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{client.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.cif}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>CIF/NIF</label>
                                <input type="text" className="form-control" value={newInvoice.clientCif} onChange={(e) => setNewInvoice({ ...newInvoice, clientCif: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Fecha</label>
                                <input type="date" className="form-control" value={newInvoice.date} onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Fecha Vencimiento</label>
                                <input type="date" className="form-control" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Descripción del trabajo</label>
                            <input type="text" className="form-control" value={newInvoice.description} onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })} placeholder="Ej: Mantenimiento mensual de comunitaria" />
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4>Líneas de Factura</h4>
                                <Button variant="secondary" size="small" onClick={addLine}>
                                    <Plus size={14} /> Añadir Línea
                                </Button>
                            </div>
                            
                            <div className="table-wrapper" style={{ margin: 0, padding: 0 }}>
                                <table style={{ minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descripción</th>
                                            <th style={{ padding: '0.5rem', width: '80px' }}>Cant.</th>
                                            <th style={{ padding: '0.5rem', width: '80px' }}>Ud.</th>
                                            <th style={{ padding: '0.5rem', width: '100px' }}>Precio</th>
                                            <th style={{ padding: '0.5rem', width: '80px' }}>IVA</th>
                                            <th style={{ padding: '0.5rem', width: '100px', textAlign: 'right' }}>Total</th>
                                            <th style={{ padding: '0.5rem', width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newInvoice.items.map((item, index) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input type="text" className="form-control" style={{ minHeight: '40px' }} value={item.description} onChange={(e) => updateLine(index, 'description', e.target.value)} placeholder="Descripción del trabajo" />
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input type="number" className="form-control" style={{ minHeight: '40px', textAlign: 'center' }} value={item.quantity} onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)} />
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <select className="form-control" style={{ minHeight: '40px', padding: '0.25rem' }} value={item.unit} onChange={(e) => updateLine(index, 'unit', e.target.value)}>
                                                        {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input type="number" className="form-control" style={{ minHeight: '40px', textAlign: 'right' }} value={item.unitPrice} onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <select className="form-control" style={{ minHeight: '40px', padding: '0.25rem' }} value={item.tax} onChange={(e) => updateLine(index, 'tax', parseFloat(e.target.value))}>
                                                        {TAX_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>
                                                    {item.total.toFixed(2)} €
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <button onClick={() => removeLine(index)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '0.25rem' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', minWidth: '200px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Subtotal:</span>
                                        <span>{totals.subtotal.toFixed(2)} €</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>IVA:</span>
                                        <span>{totals.taxTotal.toFixed(2)} €</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                                        <span>Total:</span>
                                        <span style={{ color: 'var(--brand-green)' }}>{totals.total.toFixed(2)} €</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label>Notas</label>
                            <textarea className="form-control" rows={2} value={newInvoice.notes} onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })} placeholder="Observaciones adicionales..." />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <Button variant="secondary" onClick={() => setShowNewInvoiceModal(false)}>Cancelar</Button>
                            <Button variant="primary" onClick={handleCreateInvoice}>
                                <Save size={16} /> Guardar Factura
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todas</button>
                <button className={`filter-btn ${filter === 'draft' ? 'active' : ''}`} onClick={() => setFilter('draft')}>Borradores</button>
                <button className={`filter-btn ${filter === 'definitive' ? 'active' : ''}`} onClick={() => setFilter('definitive')}>Finalizadas</button>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>Nº</th>
                            <th style={{ padding: '0.75rem' }}>Cliente</th>
                            <th style={{ padding: '0.75rem' }}>Fecha</th>
                            <th style={{ padding: '0.75rem' }}>Total</th>
                            <th style={{ padding: '0.75rem' }}>Estado</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No hay facturas
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map(inv => (
                                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem' }}><strong>{inv.invoiceNumber}</strong></td>
                                    <td style={{ padding: '0.75rem' }}>{inv.clientName || inv.client}</td>
                                    <td style={{ padding: '0.75rem' }}>{inv.finalDate || inv.date}</td>
                                    <td style={{ padding: '0.75rem' }}>{inv.total.toFixed(2)} €</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span className={`status-badge ${inv.status === 'finalized' ? 'definitive' : 'draft'}`}>
                                            {inv.status === 'finalized' || inv.type === 'definitive' ? 'Finalizada' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        <Button variant="secondary" size="small" onClick={() => handlePreview(inv)}>
                                            <FileText size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};