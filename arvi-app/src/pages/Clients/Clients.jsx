import { useMemo, useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { useClients } from '../../context/ClientsContext';
import api from '../../services/api';
import { emitToast } from '../../utils/toast';

const emptyClient = {
  name: '',
  cif: '',
  email: '',
  phone: '',
  address: '',
};

export const Clients = () => {
  const { clients, loading, addClient, updateClient, deleteClient, searchClients } = useClients();
  const [form, setForm] = useState(emptyClient);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [duplicateReport, setDuplicateReport] = useState(null);
  const [reconcileResult, setReconcileResult] = useState(null);

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [clients]
  );

  const saveClient = async () => {
    if (!form.name.trim()) {
      emitToast({ type: 'error', message: 'El nombre del cliente es obligatorio' });
      return;
    }

    try {
      if (editingId) {
        await updateClient(editingId, form);
        emitToast({ type: 'success', message: 'Cliente actualizado' });
      } else {
        await addClient(form);
        emitToast({ type: 'success', message: 'Cliente creado' });
      }
      setForm(emptyClient);
      setEditingId(null);
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo guardar el cliente' });
    }
  };

  const editClient = (client) => {
    setEditingId(client.id);
    setForm({
      name: client.name || '',
      cif: client.cif || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
    });
  };

  const removeClient = async (id) => {
    try {
      await deleteClient(id);
      emitToast({ type: 'success', message: 'Cliente eliminado' });
      if (selectedClient?.id === id) {
        setSelectedClient(null);
        setLedger(null);
      }
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo eliminar el cliente' });
    }
  };

  const loadLedger = async (client) => {
    try {
      const data = await api.getClientLedger(client.id);
      setSelectedClient(client);
      setLedger(data);
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo cargar el historial del cliente' });
    }
  };

  const importHistory = async () => {
    try {
      const result = await api.importClientsFromFacturas();
      emitToast({
        type: 'success',
        message: `Importacion completada: ${result.importedClients} clientes nuevos de ${result.scannedFiles} archivos`,
      });
      await searchClients(query);
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'Error importando historial de facturas' });
    }
  };

  const runDuplicateAudit = async () => {
    try {
      const report = await api.getClientDuplicateReport();
      setDuplicateReport(report);
      emitToast({ type: 'success', message: `Analisis completado: ${report.duplicateGroups} grupos duplicados` });
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo analizar duplicados' });
    }
  };

  const runReconcile = async () => {
    try {
      const result = await api.reconcileInvoicesByClient();
      setReconcileResult(result);
      emitToast({ type: 'success', message: `Conciliacion completada: ${result.invoicesReconciled} facturas actualizadas` });
      if (selectedClient) await loadLedger(selectedClient);
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo conciliar facturas' });
    }
  };

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h2>Clientes</h2>
          <p className="text-muted">Base maestra de clientes y trazabilidad de facturacion.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={importHistory}>Importar desde carpeta Facturas</Button>
          <Button variant="secondary" onClick={runDuplicateAudit}>Validar duplicados</Button>
          <Button variant="secondary" onClick={runReconcile}>Conciliar facturas</Button>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card title={editingId ? 'Editar cliente' : 'Nuevo cliente'}>
          <div style={{ display: 'grid', gap: 10 }}>
            <input className="form-control" placeholder="Nombre" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <input className="form-control" placeholder="CIF" value={form.cif} onChange={(e) => setForm((p) => ({ ...p, cif: e.target.value }))} />
            <input className="form-control" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <input className="form-control" placeholder="Telefono" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            <input className="form-control" placeholder="Direccion postal" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={saveClient}>{editingId ? 'Actualizar' : 'Crear cliente'}</Button>
              {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setForm(emptyClient); }}>Cancelar</Button>}
            </div>
          </div>
        </Card>

        <Card title="Listado de clientes">
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-control" placeholder="Buscar cliente..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button variant="secondary" onClick={() => searchClients(query)}>Buscar</Button>
            </div>

            <div style={{ maxHeight: 360, overflow: 'auto', display: 'grid', gap: 8 }}>
              {loading && <p className="text-muted">Cargando...</p>}
              {!loading && sortedClients.map((client) => (
                <div key={client.id} className="list-item" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
                  <div>
                    <strong>{client.name}</strong>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{client.cif || 'Sin CIF'} · {client.email || 'Sin email'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => loadLedger(client)}>Historial</Button>
                    <Button variant="secondary" onClick={() => editClient(client)}>Editar</Button>
                    <Button variant="secondary" onClick={() => removeClient(client.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {ledger && (
        <Card title={`Historial financiero - ${selectedClient?.name || ''}`} style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="kpi-card"><small>Total facturado</small><h3>{Number(ledger.totals.totalInvoiced || 0).toFixed(2)} EUR</h3></div>
            <div className="kpi-card"><small>Pendiente cobro</small><h3>{Number(ledger.totals.pendingAmount || 0).toFixed(2)} EUR</h3></div>
            <div className="kpi-card"><small>Facturas</small><h3>{ledger.totals.invoicesCount}</h3></div>
            <div className="kpi-card"><small>Presupuestos</small><h3>{ledger.totals.budgetsCount}</h3></div>
          </div>
        </Card>
      )}

      {(duplicateReport || reconcileResult) && (
        <Card title="Calidad de datos y conciliacion" style={{ marginTop: 16 }}>
          {duplicateReport && (
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Clientes analizados:</strong> {duplicateReport.totalClients}</p>
              <p><strong>Grupos duplicados detectados:</strong> {duplicateReport.duplicateGroups}</p>
              {duplicateReport.duplicates?.slice(0, 10).map((group, index) => (
                <p key={index} className="text-muted" style={{ margin: '0.2rem 0' }}>
                  {group.type.toUpperCase()} · {group.key} · {group.count} clientes
                </p>
              ))}
            </div>
          )}

          {reconcileResult && (
            <div>
              <p><strong>Facturas revisadas:</strong> {reconcileResult.invoicesScanned}</p>
              <p><strong>Facturas conciliadas:</strong> {reconcileResult.invoicesReconciled}</p>
              {reconcileResult.sample?.slice(0, 10).map((row) => (
                <p key={row.invoiceId} className="text-muted" style={{ margin: '0.2rem 0' }}>
                  #{row.invoiceNumber} -&gt; {row.clientName} (ID {row.clientId})
                </p>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
