import React, { useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { FileText, Printer, ChevronLeft, CheckCircle, AlertTriangle, Download, Upload, Plus } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { QRCodeSVG } from 'qrcode.react';
import './Invoices.css';

export const Invoices = () => {
    const { invoices, finalizeInvoice, importInvoices, addInvoice, getNextInvoiceNumber } = useAccounting();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'preview'
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
    const [filter, setFilter] = useState('all');

    // Estado para nueva factura manual
    const [newInvClient, setNewInvClient] = useState('');
    const [newInvDesc, setNewInvDesc] = useState('');
    const [newInvAmount, setNewInvAmount] = useState('');

    const handlePreview = (invoice) => {
        setSelectedInvoice(invoice);
        setViewMode('preview');
    };

    const handleFinalize = () => {
        finalizeInvoice(selectedInvoice.id);
        setShowConfirmModal(false);
        // Despues de finalizar, actualizamos el invoice seleccionado para ver los cambios
        const updated = invoices.find(inv => inv.id === selectedInvoice.id);
        // Note: state update in context might not be immediate for this local variable, 
        // but the useEffect in context will trigger a re-render.
        setViewMode('list');
    };

    const handleCreateInvoice = () => {
        if (!newInvClient || !newInvAmount) {
            alert('Por favor, indica el cliente y el importe.');
            return;
        }

        const amount = Number(newInvAmount);
        const newInvoice = {
            id: Date.now().toString(),
            invoiceNumber: getNextInvoiceNumber(false),
            date: new Date().toISOString().split('T')[0],
            client: newInvClient,
            description: newInvDesc || 'Servicios directos',
            items: [
                { id: 1, description: newInvDesc || 'Trabajos realizados', quantity: 1, unitPrice: amount, tax: 21, total: amount }
            ],
            subtotal: amount,
            taxTotal: amount * 0.21,
            total: amount * 1.21,
            status: 'draft',
            type: 'draft'
        };

        addInvoice(newInvoice);
        setShowNewInvoiceModal(false);
        setNewInvClient('');
        setNewInvDesc('');
        setNewInvAmount('');
    };

    const filteredInvoices = invoices.filter(inv => {
        if (filter === 'all') return true;
        if (filter === 'draft') return inv.status === 'draft' || inv.type === 'draft';
        return inv.status === 'finalized' || inv.type === 'definitive';
    });

    const renderInvoicePreview = (inv) => {
        if (!inv) return null;

        // Verifactu URL (Mock)
        const verifactuUrl = `https://www2.agenciatributaria.gob.es/verifactu?id=${inv.invoiceNumber}&hash=${inv.hash || ''}`;

        return (
            <div className="invoice-container" style={{ backgroundColor: '#fff', padding: '40px', color: '#000', borderRadius: '8px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative' }}>
                {inv.type === 'draft' && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '5rem', opacity: 0.1, fontWeight: 900, pointerEvents: 'none', border: '10px solid #000', padding: '20px', textTransform: 'uppercase' }}>
                        BORRADOR
                    </div>
                )}

                {/* Header */}
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

                {/* Addresses */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        <strong>ARVI MANTENIMENTS INTEGRALS S.L.</strong><br />
                        C/ Sentmenat, 5<br />
                        Sabadell BCN 08203
                    </div>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.4', textAlign: 'right' }}>
                        {inv.client}<br />
                        C/ Tres Creus 168 atic<br />
                        08202 Sabadell<br />
                        Espanya<br />
                        TIN: ES34761394E
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

                {/* Main Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '10px 0' }}>Descripció:</th>
                            <th style={{ textAlign: 'center', padding: '10px 0' }}>Quantitat</th>
                            <th style={{ textAlign: 'right', padding: '10px 0' }}>Preu un.</th>
                            <th style={{ textAlign: 'right', padding: '10px 0' }}>Impostos</th>
                            <th style={{ textAlign: 'right', padding: '10px 0' }}>Preu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inv.items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px 0' }}>
                                    {item.id === 1 ? (
                                        <>
                                            <strong>{inv.description}</strong><br /><br />
                                            {inv.sourceId ? `Trabajos detallados según parte ${inv.sourceId}` : 'Servicios de mantenimiento y reparación'}
                                        </>
                                    ) : item.description}
                                </td>
                                <td style={{ textAlign: 'center', padding: '15px 0' }}>{item.quantity.toFixed(3)}</td>
                                <td style={{ textAlign: 'right', padding: '15px 0' }}>{(item.unitPrice ?? item.price ?? 0).toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '15px 0' }}>IVA {item.tax}%</td>
                                <td style={{ textAlign: 'right', padding: '15px 0' }}>{item.total.toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <table style={{ width: '300px', fontSize: '0.9rem' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '5px 0' }}><strong>Subtotal</strong></td>
                                <td style={{ textAlign: 'right', padding: '5px 0' }}>{inv.subtotal.toFixed(2)} €</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '5px 0', borderBottom: '1px solid #000' }}>Impostos</td>
                                <td style={{ textAlign: 'right', padding: '5px 0', borderBottom: '1px solid #000' }}>{inv.taxTotal.toFixed(2)} €</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '10px 0', fontSize: '1.1rem' }}><strong>Total</strong></td>
                                <td style={{ textAlign: 'right', padding: '10px 0', fontSize: '1.1rem' }}><strong>{inv.total.toFixed(2)} €</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Verifactu Signature/Hash Chaining */}
                {(inv.status === 'finalized' || inv.type === 'definitive') && (
                    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.65rem', overflowWrap: 'break-word', fontFamily: 'monospace' }}>
                        <strong>REGISTRO VERI*FACTU:</strong><br />
                        HASH: {inv.hash}<br />
                        T-PREV: {inv.prevHash}
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '10px', textAlign: 'center', fontSize: '0.85rem' }}>
                    Telèfon: +34 669 47 55 83 • Correu electrònic: vendes@arvimanteniment.com • Lloc web: http://arvimanteniment.com/<br />
                    TIN: ESB64773450
                </div>
            </div>
        );
    };

    if (viewMode === 'preview') {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <ChevronLeft size={16} /> Volver al Listado
                    </Button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {(selectedInvoice.status === 'draft' || selectedInvoice.type === 'draft') && (
                            <Button variant="primary" onClick={() => setShowConfirmModal(true)}>
                                <CheckCircle size={16} /> Confirmar Factura Definitiva
                            </Button>
                        )}
                        <Button variant="secondary">
                            <Printer size={16} /> Imprimir / Exportar PDF
                        </Button>
                    </div>
                </div>
                {renderInvoicePreview(selectedInvoice)}

                {showConfirmModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <Card style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <AlertTriangle size={48} style={{ color: '#f39c12', marginBottom: '1rem' }} />
                                <h3>Confirmar Factura Definitiva</h3>
                                <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
                                    Estás a punto de generar la factura definitiva <strong>{selectedInvoice.invoiceNumber.replace('DRAFT-', '')}</strong>. 
                                    Una vez confirmada, no podrá ser editada ni eliminada cumpliendo con la normativa de Hacienda (Verifactu).
                                </p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '2rem' }}>
                                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
                                    <Button variant="primary" onClick={handleFinalize}>SÍ, CONFIRMAR FACTURA</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="invoices-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Sistema de Facturación Verifactu</h2>
                    <p className="text-muted">Control total de facturas, borradores y cumplimiento legal.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="primary" onClick={() => setShowNewInvoiceModal(true)}>
                        <Plus size={16} /> Nueva Factura
                    </Button>
                    <Button variant="secondary" onClick={() => {
                        const mockImport = [
                            { id: 'imp1', invoiceNumber: '2022/990', date: '2022-11-05', client: 'Arvi Manteniments SL', description: 'Mantenimiento preventivo 2022', items: [{ id: 1, description: 'Servicios anuales', quantity: 1, price: 1200, tax: 21, total: 1200 }], subtotal: 1200, taxTotal: 252, total: 1452, hash: 'IMPORT_HASH_X1', prevHash: '0000', finalDate: '2022-11-05' }
                        ];
                        importInvoices(mockImport);
                    }}>
                        <Upload size={16} /> Importar Facturas
                    </Button>
                    <Button variant="secondary">
                        <Download size={16} /> Exportar Selección
                    </Button>
                </div>
            </header>

            {showNewInvoiceModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <Card style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
                        <h3>Crear Nueva Factura</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label>Cliente</label>
                                <input type="text" className="form-control" value={newInvClient} onChange={e => setNewInvClient(e.target.value)} placeholder="Ej: Comunidad de Propietarios..." />
                            </div>
                            <div className="form-group">
                                <label>Descripción de Servicios</label>
                                <textarea className="form-control" rows="3" value={newInvDesc} onChange={e => setNewInvDesc(e.target.value)} placeholder="Ej: Reparación de bajante..."></textarea>
                            </div>
                            <div className="form-group">
                                <label>Base Imponible (€)</label>
                                <input type="number" className="form-control" value={newInvAmount} onChange={e => setNewInvAmount(e.target.value)} placeholder="0.00" />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <Button variant="secondary" onClick={() => setShowNewInvoiceModal(false)}>Cancelar</Button>
                                <Button variant="primary" onClick={handleCreateInvoice}>Guardar Borrador</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todas</button>
                <button className={`filter-btn ${filter === 'draft' ? 'active' : ''}`} onClick={() => setFilter('draft')}>Borradores</button>
                <button className={`filter-btn ${filter === 'definitive' ? 'active' : ''}`} onClick={() => setFilter('definitive')}>Definitivas</button>
            </div>

            <Card title="Listado de Facturas">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '15px 10px' }}>Nº Factura</th>
                            <th style={{ padding: '15px 10px' }}>Cliente</th>
                            <th style={{ padding: '15px 10px' }}>Fecha</th>
                            <th style={{ padding: '15px 10px' }}>Total</th>
                            <th style={{ padding: '15px 10px' }}>Estado</th>
                            <th style={{ padding: '15px 10px', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No se encontraron facturas en esta categoría.
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map(inv => (
                                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '15px 10px' }}><strong>{inv.invoiceNumber}</strong></td>
                                    <td style={{ padding: '15px 10px' }}>{inv.client}</td>
                                    <td style={{ padding: '15px 10px' }}>{inv.finalDate || inv.date}</td>
                                    <td style={{ padding: '15px 10px' }}>{inv.total.toFixed(2)} €</td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <span className={`status-badge ${inv.status === 'finalized' ? 'definitive' : 'draft'}`}>
                                            {inv.status === 'finalized' || inv.type === 'definitive' ? 'Definitiva' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                                        <Button variant="secondary" size="small" onClick={() => handlePreview(inv)}>
                                            <FileText size={14} /> Ver
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
