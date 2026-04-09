import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { HardHat, Pencil, Trash2, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import { emitToast } from '../../utils/toast';

const emptyForm = {
    name: '',
    cif: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    paymentMethod: '',
    accountNumber: '',
    notes: '',
    status: 'active'
};

export const Subcontractors = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [query, setQuery] = useState('');
    const [projects, setProjects] = useState([]);
    const [assignment, setAssignment] = useState({ subcontractorId: '', projectId: '', cost: '', invoiceAmount: '', notes: '' });

    const load = async () => {
        try {
            setLoading(true);
            const data = await api.getSubcontractors();
            setItems(data || []);
        } catch (error) {
            const local = localStorage.getItem('arvi_subcontractors');
            if (local) {
                setItems(JSON.parse(local));
                emitToast({ type: 'info', message: 'Subcontratas cargadas en local. Pendiente de sincronizar.' });
            } else {
                emitToast({ type: 'error', message: 'No se pudieron cargar las subcontratas.' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        api.getProjects().then(setProjects).catch(() => setProjects([]));
    }, []);

    useEffect(() => {
        localStorage.setItem('arvi_subcontractors', JSON.stringify(items));
    }, [items]);

    const filtered = useMemo(() => {
        if (!query) return items;
        const q = query.toLowerCase();
        return items.filter((s) =>
            [s.name, s.cif, s.contactPerson, s.contactPhone].some((field) =>
                (field || '').toLowerCase().includes(q)
            )
        );
    }, [items, query]);

    const onChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.cif) {
            emitToast({ type: 'error', message: 'Nombre y CIF son obligatorios.' });
            return;
        }

        try {
            if (editingId) {
                const updated = await api.updateSubcontractor(editingId, form);
                setItems((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
                emitToast({ type: 'success', message: 'Subcontrata actualizada.' });
            } else {
                const created = await api.createSubcontractor(form);
                setItems((prev) => [created, ...prev]);
                emitToast({ type: 'success', message: 'Subcontrata creada correctamente.' });
            }
        } catch (error) {
            if (editingId) {
                setItems((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
            } else {
                setItems((prev) => [{ id: Date.now(), ...form }, ...prev]);
            }
            emitToast({ type: 'info', message: 'Cambios guardados en local. Pendiente de sincronizar.' });
        }

        setForm(emptyForm);
        setEditingId(null);
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name || '',
            cif: item.cif || '',
            contactPerson: item.contactPerson || '',
            contactPhone: item.contactPhone || '',
            contactEmail: item.contactEmail || '',
            paymentMethod: item.paymentMethod || '',
            accountNumber: item.accountNumber || '',
            notes: item.notes || '',
            status: item.status || 'active'
        });
    };

    const remove = async (id) => {
        try {
            await api.deleteSubcontractor(id);
            emitToast({ type: 'success', message: 'Subcontrata eliminada.' });
        } catch (error) {
            emitToast({ type: 'info', message: 'Subcontrata eliminada en local. Pendiente de sincronizar.' });
        }
        setItems((prev) => prev.filter((s) => s.id !== id));
    };

    const assignToProject = async () => {
        if (!assignment.subcontractorId || !assignment.projectId) {
            emitToast({ type: 'error', message: 'Selecciona subcontrata y proyecto' });
            return;
        }

        try {
            await api.addSubcontractorAssignment(assignment.subcontractorId, {
                projectId: assignment.projectId,
                cost: Number(assignment.cost || 0),
                invoiceAmount: Number(assignment.invoiceAmount || 0),
                notes: assignment.notes,
            });
            emitToast({ type: 'success', message: 'Subcontrata asignada al proyecto' });
            setAssignment({ subcontractorId: '', projectId: '', cost: '', invoiceAmount: '', notes: '' });
            await load();
        } catch (error) {
            emitToast({ type: 'error', message: error.message || 'No se pudo asignar la subcontrata' });
        }
    };

    return (
        <div className="dashboard">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                    <h2>Subcontratas Externas</h2>
                    <p className="text-muted">Crea, edita y gestiona los datos fiscales, contacto y pago.</p>
                </div>
                <input
                    className="form-control"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nombre, CIF o contacto"
                    style={{ maxWidth: '320px' }}
                />
            </header>

            <Card title={editingId ? 'Editar subcontrata' : 'Nueva subcontrata'}>
                <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <input className="form-control" placeholder="Nombre" value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
                    <input className="form-control" placeholder="CIF" value={form.cif} onChange={(e) => onChange('cif', e.target.value.toUpperCase())} required />
                    <input className="form-control" placeholder="Persona de contacto" value={form.contactPerson} onChange={(e) => onChange('contactPerson', e.target.value)} />
                    <input className="form-control" placeholder="Teléfono contacto" value={form.contactPhone} onChange={(e) => onChange('contactPhone', e.target.value)} />
                    <input className="form-control" placeholder="Email contacto" value={form.contactEmail} onChange={(e) => onChange('contactEmail', e.target.value)} />
                    <input className="form-control" placeholder="Forma de pago" value={form.paymentMethod} onChange={(e) => onChange('paymentMethod', e.target.value)} />
                    <input className="form-control" placeholder="Número de cuenta (IBAN)" value={form.accountNumber} onChange={(e) => onChange('accountNumber', e.target.value)} />
                    <select className="form-control" value={form.status} onChange={(e) => onChange('status', e.target.value)}>
                        <option value="active">Activa</option>
                        <option value="inactive">Inactiva</option>
                    </select>
                    <textarea className="form-control" rows="2" placeholder="Notas" value={form.notes} onChange={(e) => onChange('notes', e.target.value)} style={{ gridColumn: '1 / -1' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button type="submit" variant="primary"><PlusCircle size={16} /> {editingId ? 'Guardar cambios' : 'Crear subcontrata'}</Button>
                        {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</Button>}
                    </div>
                </form>
            </Card>

            <Card title="Directorio de Subcontratas" style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '1rem', display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    <select className="form-control" value={assignment.subcontractorId} onChange={(e) => setAssignment((p) => ({ ...p, subcontractorId: e.target.value }))}>
                        <option value="">Asignar subcontrata...</option>
                        {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
                    </select>
                    <select className="form-control" value={assignment.projectId} onChange={(e) => setAssignment((p) => ({ ...p, projectId: e.target.value }))}>
                        <option value="">Proyecto...</option>
                        {projects.map((prj) => <option key={prj.id} value={prj.id}>{prj.name}</option>)}
                    </select>
                    <input className="form-control" type="number" placeholder="Coste" value={assignment.cost} onChange={(e) => setAssignment((p) => ({ ...p, cost: e.target.value }))} />
                    <input className="form-control" type="number" placeholder="Facturado" value={assignment.invoiceAmount} onChange={(e) => setAssignment((p) => ({ ...p, invoiceAmount: e.target.value }))} />
                    <input className="form-control" placeholder="Notas" value={assignment.notes} onChange={(e) => setAssignment((p) => ({ ...p, notes: e.target.value }))} />
                    <Button variant="secondary" onClick={assignToProject}>Asignar</Button>
                </div>

                {loading ? (
                    <p className="text-muted">Cargando...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-muted">No hay subcontratas registradas.</p>
                ) : (
                    <ul className="project-list">
                        {filtered.map((item) => (
                            <li className="project-item" key={item.id}>
                                <div className="project-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <HardHat size={28} color="#f39c12" />
                                    <div>
                                        <h4>{item.name}</h4>
                                        <span className="project-status">{item.cif} · {item.contactPerson || 'Sin contacto'} · {item.contactPhone || '-'}</span>
                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{item.paymentMethod || 'Forma de pago no definida'} · {item.accountNumber || 'Cuenta no definida'}</div>
                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>Proyectos: {item.projectCount || 0} · Facturado: {Number(item.totalInvoiced || 0).toFixed(2)} EUR</div>
                                    </div>
                                </div>
                                <div className="project-meta" style={{ display: 'flex', gap: '8px' }}>
                                    <Button variant="secondary" size="small" onClick={() => startEdit(item)}><Pencil size={14} /> Editar</Button>
                                    <Button variant="secondary" size="small" onClick={() => remove(item.id)}><Trash2 size={14} /> Eliminar</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
};
