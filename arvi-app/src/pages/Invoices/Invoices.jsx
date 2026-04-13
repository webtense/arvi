import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { CheckCircle, ChevronLeft, CreditCard, Download, Eye, FileText, Filter, Pencil, Plus, Save, Search, Trash2, User, X, Copy } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { useClients } from '../../context/ClientsContext';
import { emitToast } from '../../utils/toast';
import { formatDate, getTodayISO, parseDateInput } from '../../utils/dates';
import api from '../../services/api';
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
  { value: 21, label: '21%' },
  { value: 10, label: '10%' },
  { value: 4, label: '4%' },
  { value: 0, label: '0%' },
];

const emptyLine = () => ({
  id: Date.now() + Math.random(),
  description: '',
  quantity: 1,
  unit: 'ud',
  unitPrice: 0,
  tax: 21,
  total: 0,
});

const createInvoiceState = () => ({
  id: null,
  clientId: null,
  clientName: '',
  clientCif: '',
  clientAddress: '',
  date: getTodayISO(),
  dueDate: '',
  description: '',
  items: [emptyLine()],
  notes: '',
  paymentMethod: 'transfer',
  paymentStatus: 'pending',
});

const FILTER_PRESETS = [
  { key: 'all', label: 'Todas' },
  { key: 'draft', label: 'Borradores' },
  { key: 'finalized', label: 'Finalizadas' },
  { key: 'paid', label: 'Pagadas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'historical', label: 'Histórico' },
];

export const Invoices = () => {
  const { addInvoice, updateInvoice, finalizeInvoice, duplicateInvoice, deleteInvoice } = useAccounting();
  const { addClient } = useClients();

  const clientDropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    preset: 'all',
    search: '',
    sort: 'date_desc',
  });
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState('create');
  const [saving, setSaving] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState(() => createInvoiceState());
  const [dateDisplay, setDateDisplay] = useState(() => formatDate(getTodayISO()));
  const [dueDateDisplay, setDueDateDisplay] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const listQuery = useMemo(() => {
    const query = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      sort: filters.sort,
    };

    if (filters.preset === 'draft') query.status = 'draft';
    if (filters.preset === 'finalized') query.status = 'finalized';
    if (filters.preset === 'paid') query.paymentStatus = 'paid';
    if (filters.preset === 'pending') query.paymentStatus = 'pending';
    if (filters.preset === 'historical') query.historical = 'true';
    return query;
  }, [filters, pagination.page, pagination.limit]);

  const resetEditor = () => {
    const fresh = createInvoiceState();
    setInvoiceForm(fresh);
    setDateDisplay(formatDate(fresh.date));
    setDueDateDisplay('');
    setClientSearch('');
    setClientResults([]);
    setShowClientDropdown(false);
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.getInvoices(listQuery);
      setInvoiceRows(response.data || []);
      setPagination((prev) => ({
        ...prev,
        page: response.pagination?.page || 1,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      }));
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudieron cargar las facturas' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [listQuery]);

  useEffect(() => {
    if (clientSearch.trim().length < 2) {
      setClientResults([]);
      setShowClientDropdown(false);
      return;
    }

    let active = true;
    setClientSearchLoading(true);
    api.getClients(clientSearch.trim())
      .then((data) => {
        if (!active) return;
        setClientResults(data || []);
        setShowClientDropdown(true);
      })
      .catch(() => {
        if (!active) return;
        setClientResults([]);
      })
      .finally(() => {
        if (active) setClientSearchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [clientSearch]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const totals = useMemo(() => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0);
    const taxTotal = invoiceForm.items.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0) * Number(item.tax || 0)) / 100, 0);
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  }, [invoiceForm.items]);

  const openCreateEditor = () => {
    setEditorMode('create');
    resetEditor();
    setShowEditor(true);
  };

  const openEditEditor = async (invoiceId) => {
    try {
      const invoice = await api.request(`/invoices/${invoiceId}`);
      setEditorMode('edit');
      setInvoiceForm({
        id: invoice.id,
        clientId: invoice.clientId,
        clientName: invoice.clientName || '',
        clientCif: invoice.clientCif || '',
        clientAddress: invoice.clientAddress || '',
        date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : getTodayISO(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        description: invoice.description || '',
        items: (invoice.items || []).map((item) => ({ ...item, id: item.id || Date.now() + Math.random() })),
        notes: invoice.notes || '',
        paymentMethod: invoice.paymentMethod || 'transfer',
        paymentStatus: invoice.paymentStatus || 'pending',
      });
      setDateDisplay(formatDate(invoice.date, formatDate(getTodayISO())));
      setDueDateDisplay(formatDate(invoice.dueDate, ''));
      setClientSearch(invoice.clientName || '');
      setClientResults([]);
      setShowEditor(true);
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo cargar la factura' });
    }
  };

  const closeEditor = () => {
    setShowEditor(false);
    resetEditor();
  };

  const handleDateFieldChange = (field, value) => {
    if (field === 'date') setDateDisplay(value);
    if (field === 'dueDate') setDueDateDisplay(value);
    const iso = parseDateInput(value);
    setInvoiceForm((prev) => ({ ...prev, [field]: iso }));
  };

  const updateLine = (index, field, value) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      items[index].total = Number(items[index].unitPrice || 0) * Number(items[index].quantity || 0) * (1 + Number(items[index].tax || 0) / 100);
      return { ...prev, items };
    });
  };

  const addLine = () => setInvoiceForm((prev) => ({ ...prev, items: [...prev.items, emptyLine()] }));
  const removeLine = (index) => setInvoiceForm((prev) => ({ ...prev, items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items }));

  const selectClient = (client) => {
    setInvoiceForm((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientCif: client.cif || '',
      clientAddress: client.address || '',
    }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const handleSaveInvoice = async () => {
    if (!invoiceForm.clientName.trim()) {
      emitToast({ type: 'error', message: 'Selecciona un cliente' });
      return;
    }
    if (!invoiceForm.date) {
      emitToast({ type: 'error', message: 'Indica una fecha válida' });
      return;
    }
    if (!invoiceForm.items.some((item) => item.description && Number(item.unitPrice) > 0)) {
      emitToast({ type: 'error', message: 'Añade al menos una línea válida' });
      return;
    }

    const payload = {
      clientId: invoiceForm.clientId,
      clientName: invoiceForm.clientName,
      clientCif: invoiceForm.clientCif,
      clientAddress: invoiceForm.clientAddress,
      date: invoiceForm.date,
      dueDate: invoiceForm.dueDate || null,
      description: invoiceForm.description,
      items: invoiceForm.items,
      notes: invoiceForm.notes,
      paymentMethod: invoiceForm.paymentMethod,
      paymentStatus: invoiceForm.paymentStatus,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      status: 'draft',
      type: 'draft',
    };

    try {
      setSaving(true);
      if (editorMode === 'edit' && invoiceForm.id) {
        await updateInvoice(invoiceForm.id, payload);
      } else {
        await addInvoice(payload);
      }
      closeEditor();
      await loadInvoices();
    } finally {
      setSaving(false);
    }
  };

  const loadPreview = async (invoiceId) => {
    try {
      const invoice = await api.request(`/invoices/${invoiceId}`);
      setSelectedInvoice(invoice);
      setViewMode('preview');
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo abrir la factura' });
    }
  };

  const handleFinalizeInvoice = async (invoiceId) => {
    await finalizeInvoice(invoiceId);
    await loadInvoices();
    if (selectedInvoice?.id === invoiceId) {
      await loadPreview(invoiceId);
    }
  };

  const handleTogglePaid = async (invoice) => {
    const nextStatus = invoice.paymentStatus === 'paid' ? 'pending' : 'paid';
    await updateInvoice(invoice.id, { paymentStatus: nextStatus });
    await loadInvoices();
    if (selectedInvoice?.id === invoice.id) {
      setSelectedInvoice((prev) => ({ ...prev, paymentStatus: nextStatus }));
    }
  };

  const handleDuplicateInvoice = async (invoiceId) => {
    await duplicateInvoice(invoiceId);
    await loadInvoices();
  };

  const handleDeleteDraft = async (invoiceId) => {
    if (!window.confirm('¿Eliminar este borrador?')) return;
    await deleteInvoice(invoiceId);
    await loadInvoices();
  };

  const renderActions = (invoice) => (
    <div className="invoice-actions-group">
      <Button variant="secondary" onClick={() => loadPreview(invoice.id)}><Eye size={14} /> Ver</Button>
      {invoice.status === 'draft' && <Button variant="secondary" onClick={() => openEditEditor(invoice.id)}><Pencil size={14} /> Editar</Button>}
      {invoice.status === 'draft' && <Button variant="primary" onClick={() => handleFinalizeInvoice(invoice.id)}><CheckCircle size={14} /> Finalizar</Button>}
      <Button variant="secondary" onClick={() => handleDuplicateInvoice(invoice.id)}><Copy size={14} /> Duplicar</Button>
      <Button variant="secondary" onClick={() => window.open(api.getInvoicePdfUrl(invoice.id), '_blank', 'noopener,noreferrer')}><Download size={14} /> PDF</Button>
      <Button variant="secondary" onClick={() => handleTogglePaid(invoice)}><CreditCard size={14} /> {invoice.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente'}</Button>
      {invoice.status === 'draft' && <Button variant="secondary" onClick={() => handleDeleteDraft(invoice.id)}><Trash2 size={14} /> Eliminar</Button>}
    </div>
  );

  if (viewMode === 'preview' && selectedInvoice) {
    return (
      <div className="invoices-page">
        <div className="invoice-preview-toolbar">
          <Button variant="secondary" onClick={() => setViewMode('list')}><ChevronLeft size={16} /> Volver</Button>
          <div className="invoice-preview-actions">
            {selectedInvoice.status === 'draft' && <Button variant="primary" onClick={() => handleFinalizeInvoice(selectedInvoice.id)}><CheckCircle size={16} /> Finalizar</Button>}
            <Button variant="secondary" onClick={() => window.open(api.getInvoicePdfUrl(selectedInvoice.id), '_blank', 'noopener,noreferrer')}><Download size={16} /> PDF</Button>
            <Button variant="secondary" onClick={() => handleTogglePaid(selectedInvoice)}><CreditCard size={16} /> {selectedInvoice.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente'}</Button>
          </div>
        </div>

        <Card className="invoice-preview-card">
          <div className="invoice-preview-header">
            <div>
              <p className="invoice-preview-eyebrow">Factura</p>
              <h2>{selectedInvoice.invoiceNumber}</h2>
              <p className="text-muted">{selectedInvoice.clientName}</p>
            </div>
            <div className="invoice-preview-meta">
              <span className={`status-badge ${selectedInvoice.status === 'finalized' ? 'definitive' : 'draft'}`}>{selectedInvoice.status === 'draft' ? 'Borrador' : 'Finalizada'}</span>
              <span className={`payment-chip ${selectedInvoice.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>{selectedInvoice.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente'}</span>
            </div>
          </div>

          <div className="invoice-preview-grid">
            <div><strong>Fecha</strong><span>{formatDate(selectedInvoice.finalDate || selectedInvoice.date, '-')}</span></div>
            <div><strong>Vencimiento</strong><span>{formatDate(selectedInvoice.dueDate, '-')}</span></div>
            <div><strong>CIF</strong><span>{selectedInvoice.clientCif || '-'}</span></div>
            <div><strong>Metodo</strong><span>{selectedInvoice.paymentMethod || '-'}</span></div>
          </div>

          {selectedInvoice.description && <p className="invoice-preview-description">{selectedInvoice.description}</p>}

          <div className="invoice-lines-mobile">
            {selectedInvoice.items.map((item) => (
              <div key={item.id} className="invoice-line-card">
                <div className="invoice-line-card-head">
                  <strong>{item.description}</strong>
                  <span>{Number(item.total).toFixed(2)} €</span>
                </div>
                <div className="invoice-line-card-grid">
                  <span>Cant.: {item.quantity}</span>
                  <span>Ud.: {item.unit}</span>
                  <span>Precio: {Number(item.unitPrice).toFixed(2)} €</span>
                  <span>IVA: {item.tax}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="invoice-totals-box">
            <div><span>Subtotal</span><strong>{Number(selectedInvoice.subtotal || 0).toFixed(2)} €</strong></div>
            <div><span>IVA</span><strong>{Number(selectedInvoice.taxTotal || 0).toFixed(2)} €</strong></div>
            <div className="grand-total"><span>Total</span><strong>{Number(selectedInvoice.total || 0).toFixed(2)} €</strong></div>
          </div>

          {selectedInvoice.notes && <div className="invoice-notes-box"><strong>Notas</strong><p>{selectedInvoice.notes}</p></div>}
        </Card>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <header className="page-header invoices-header">
        <div>
          <h2>Facturación y proformas</h2>
          <p className="text-muted">Borradores tipo Odoo, histórico unificado y gestión rápida desde móvil.</p>
        </div>
        <Button variant="primary" onClick={openCreateEditor}><Plus size={16} /> Nueva factura</Button>
      </header>

      <Card className="invoice-toolbar-card">
        <div className="invoice-toolbar-row">
          <div className="invoice-search-box">
            <Search size={18} />
            <input
              className="form-control invoice-search-input"
              placeholder="Buscar por cliente, CIF, número o concepto"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <Button variant="secondary" className="filters-mobile-toggle" onClick={() => setShowMobileFilters((prev) => !prev)}><Filter size={16} /> Filtros</Button>
          <select className="form-control invoice-sort-select" value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}>
            <option value="date_desc">Mas recientes</option>
            <option value="date_asc">Mas antiguas</option>
            <option value="number_desc">Numero desc</option>
            <option value="number_asc">Numero asc</option>
            <option value="total_desc">Importe mayor</option>
            <option value="total_asc">Importe menor</option>
            <option value="client_asc">Cliente A-Z</option>
          </select>
        </div>

        <div className={`invoice-filter-chips ${showMobileFilters ? 'open' : ''}`}>
          {FILTER_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={`filter-chip ${filters.preset === preset.key ? 'active' : ''}`}
              onClick={() => {
                setFilters((prev) => ({ ...prev, preset: preset.key }));
                setPagination((prev) => ({ ...prev, page: 1 }));
                setShowMobileFilters(false);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="invoice-stats-inline">
        <span>{pagination.total} resultados</span>
        <span>{filters.preset === 'historical' ? 'Histórico unificado' : 'Facturas activas'}</span>
      </div>

      {loading ? (
        <Card><p className="text-muted">Cargando facturas...</p></Card>
      ) : invoiceRows.length === 0 ? (
        <Card><p className="text-muted">No hay facturas para estos filtros.</p></Card>
      ) : (
        <>
          <div className="invoice-cards-list">
            {invoiceRows.map((invoice) => (
              <Card key={invoice.id} className="invoice-mobile-card">
                <div className="invoice-mobile-card-head">
                  <div>
                    <p className="invoice-card-number">{invoice.invoiceNumber}</p>
                    <h3>{invoice.clientName || 'Cliente sin nombre'}</h3>
                  </div>
                  <div className="invoice-mobile-card-badges">
                    <span className={`status-badge ${invoice.status === 'finalized' ? 'definitive' : 'draft'}`}>{invoice.status === 'draft' ? 'Borrador' : 'Finalizada'}</span>
                    <span className={`payment-chip ${invoice.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>{invoice.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente'}</span>
                  </div>
                </div>
                <div className="invoice-mobile-card-grid">
                  <span><strong>Fecha</strong>{formatDate(invoice.finalDate || invoice.date, '-')}</span>
                  <span><strong>Total</strong>{Number(invoice.total || 0).toFixed(2)} €</span>
                  <span><strong>CIF</strong>{invoice.clientCif || '-'}</span>
                  <span><strong>Concepto</strong>{invoice.description || '-'}</span>
                </div>
                {renderActions(invoice)}
              </Card>
            ))}
          </div>

          <div className="table-wrapper invoice-table-desktop">
            <table>
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Cobro</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoiceRows.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><strong>{invoice.invoiceNumber}</strong></td>
                    <td>{invoice.clientName}</td>
                    <td>{formatDate(invoice.finalDate || invoice.date, '-')}</td>
                    <td>{Number(invoice.total || 0).toFixed(2)} €</td>
                    <td><span className={`status-badge ${invoice.status === 'finalized' ? 'definitive' : 'draft'}`}>{invoice.status === 'draft' ? 'Borrador' : 'Finalizada'}</span></td>
                    <td><span className={`payment-chip ${invoice.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>{invoice.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente'}</span></td>
                    <td style={{ textAlign: 'right' }}>{renderActions(invoice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-pagination">
            <Button variant="secondary" disabled={pagination.page <= 1} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}>Anterior</Button>
            <span>Pagina {pagination.page} de {pagination.totalPages || 1}</span>
            <Button variant="secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}>Siguiente</Button>
          </div>
        </>
      )}

      {showEditor && (
        <div className="modal-overlay invoice-editor-overlay">
          <div className="invoice-editor-panel">
            <div className="invoice-editor-header">
              <div>
                <p className="invoice-preview-eyebrow">{editorMode === 'edit' ? 'Editar borrador' : 'Nueva factura'}</p>
                <h3>{editorMode === 'edit' ? 'Actualizar factura' : 'Crear borrador'}</h3>
              </div>
              <div className="invoice-editor-header-actions">
                <Button variant="secondary" onClick={closeEditor}>Cerrar</Button>
                <Button variant="primary" onClick={handleSaveInvoice} disabled={saving}><Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}</Button>
              </div>
            </div>

            <div className="invoice-editor-body">
              <div className="invoice-editor-grid">
                <div className="form-group invoice-client-group" ref={clientDropdownRef}>
                  <label>Cliente *</label>
                  <div className="invoice-client-search">
                    <input
                      type="text"
                      className="form-control"
                      value={clientSearch}
                      onFocus={() => clientResults.length > 0 && setShowClientDropdown(true)}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setInvoiceForm((prev) => ({ ...prev, clientName: e.target.value, clientId: null }));
                      }}
                      placeholder="Buscar cliente..."
                    />
                    <Search size={18} />
                  </div>
                  {showClientDropdown && (
                    <div className="invoice-client-dropdown">
                      {clientSearchLoading && <div className="invoice-client-status">Buscando clientes...</div>}
                      {!clientSearchLoading && clientResults.length === 0 && clientSearch.length >= 2 && (
                        <div className="invoice-client-empty">
                          <span>Cliente no encontrado.</span>
                          <Button
                            variant="secondary"
                            onClick={async () => {
                              try {
                                const created = await addClient({ name: clientSearch, cif: invoiceForm.clientCif, address: invoiceForm.clientAddress });
                                selectClient(created);
                                emitToast({ type: 'success', message: 'Cliente creado y seleccionado' });
                              } catch (error) {
                                emitToast({ type: 'error', message: error.message || 'No se pudo crear cliente' });
                              }
                            }}
                          >Crear cliente rapido</Button>
                        </div>
                      )}
                      {!clientSearchLoading && clientResults.map((client) => (
                        <button key={client.id} type="button" className="invoice-client-option" onClick={() => selectClient(client)}>
                          <User size={16} />
                          <div>
                            <strong>{client.name}</strong>
                            <span>{client.cif || 'Sin CIF'}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>CIF/NIF</label>
                  <input className="form-control" value={invoiceForm.clientCif} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, clientCif: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input className="form-control" placeholder="DD/MM/AAAA" inputMode="numeric" value={dateDisplay} onChange={(e) => handleDateFieldChange('date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Vencimiento</label>
                  <input className="form-control" placeholder="DD/MM/AAAA" inputMode="numeric" value={dueDateDisplay} onChange={(e) => handleDateFieldChange('dueDate', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción del trabajo</label>
                <input className="form-control" value={invoiceForm.description} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Ej: Mantenimiento mensual" />
              </div>

              <div className="invoice-lines-header">
                <h4>Líneas de factura</h4>
                <Button variant="secondary" onClick={addLine}><Plus size={14} /> Añadir línea</Button>
              </div>

              <div className="invoice-line-list">
                {invoiceForm.items.map((item, index) => (
                  <div key={item.id} className="invoice-line-card editor-line-card">
                    <div className="invoice-line-card-head">
                      <strong>Línea {index + 1}</strong>
                      <button type="button" className="invoice-line-delete" onClick={() => removeLine(index)}><Trash2 size={16} /></button>
                    </div>
                    <div className="invoice-line-form-grid">
                      <input className="form-control invoice-line-description" placeholder="Descripción" value={item.description} onChange={(e) => updateLine(index, 'description', e.target.value)} />
                      <input className="form-control" type="number" placeholder="Cant." value={item.quantity} onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)} />
                      <select className="form-control" value={item.unit} onChange={(e) => updateLine(index, 'unit', e.target.value)}>{UNIT_OPTIONS.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</select>
                      <input className="form-control" type="number" placeholder="Precio" value={item.unitPrice} onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
                      <select className="form-control" value={item.tax} onChange={(e) => updateLine(index, 'tax', parseFloat(e.target.value))}>{TAX_OPTIONS.map((tax) => <option key={tax.value} value={tax.value}>{tax.label}</option>)}</select>
                      <div className="invoice-line-total">{Number(item.total || 0).toFixed(2)} €</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Notas</label>
                <textarea className="form-control" rows={3} value={invoiceForm.notes} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, notes: e.target.value }))} />
              </div>

              <div className="invoice-editor-payment-grid">
                <div className="form-group">
                  <label>Metodo de cobro</label>
                  <select className="form-control" value={invoiceForm.paymentMethod} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}>
                    <option value="transfer">Transferencia</option>
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="direct-debit">Domiciliación</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado de cobro</label>
                  <select className="form-control" value={invoiceForm.paymentStatus} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}>
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagada</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="invoice-editor-footer">
              <div>
                <span>Subtotal {totals.subtotal.toFixed(2)} €</span>
                <span>IVA {totals.taxTotal.toFixed(2)} €</span>
              </div>
              <strong>Total {totals.total.toFixed(2)} €</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
