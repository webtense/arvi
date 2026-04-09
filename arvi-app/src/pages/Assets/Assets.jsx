import { useMemo, useState } from 'react';
import { Card } from '../../components/Card/Card';
import { Box, Trash2, Pencil, PlusCircle } from 'lucide-react';
import { useAssets } from '../../context/AssetsContext';
import { emitToast } from '../../utils/toast';

const emptyAsset = {
  name: '',
  description: '',
  location: '',
  serialNumber: '',
  status: 'active',
  notes: '',
  estimatedCost: 0,
  category: '',
  criticality: 'medium',
};

const parseAssetNotes = (asset) => {
  try {
    const parsed = asset.notes ? JSON.parse(asset.notes) : {};
    return {
      estimatedCost: parsed?.metadata?.estimatedCost || 0,
      category: parsed?.metadata?.category || '',
      criticality: parsed?.metadata?.criticality || 'medium',
    };
  } catch {
    return { estimatedCost: 0, category: '', criticality: 'medium' };
  }
};

export const Assets = () => {
  const { assets, addAsset, updateAsset, deleteAsset } = useAssets();
  const [form, setForm] = useState(emptyAsset);
  const [editingId, setEditingId] = useState(null);

  const normalizedAssets = useMemo(
    () => assets.map((asset) => ({ ...asset, ...parseAssetNotes(asset) })),
    [assets]
  );

  const save = async () => {
    if (!form.name.trim()) {
      emitToast({ type: 'error', message: 'El nombre del activo es obligatorio' });
      return;
    }

    try {
      if (editingId) {
        await updateAsset(editingId, form);
        emitToast({ type: 'success', message: 'Activo actualizado' });
      } else {
        await addAsset(form);
        emitToast({ type: 'success', message: 'Activo creado' });
      }
      setForm(emptyAsset);
      setEditingId(null);
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo guardar el activo' });
    }
  };

  const edit = (asset) => {
    setEditingId(asset.id);
    setForm({
      name: asset.name || '',
      description: asset.description || '',
      location: asset.location || '',
      serialNumber: asset.serialNumber || '',
      status: asset.status || 'active',
      notes: asset.notes || '',
      estimatedCost: asset.estimatedCost || 0,
      category: asset.category || '',
      criticality: asset.criticality || 'medium',
    });
  };

    const remove = async (asset) => {
    const reason = window.prompt(`Motivo de eliminacion para el activo "${asset.name}":`, 'Baja por sustitucion');
    if (!reason) return;

        try {
            await deleteAsset(asset.id, reason);
            emitToast({ type: 'success', message: 'Activo eliminado con motivo registrado' });
        } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudo eliminar el activo' });
    }
  };

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h2>Gestion de Activos</h2>
          <p className="text-muted">Inventario, coste estimado, criticidad y mantenimiento por activo.</p>
        </div>
      </header>

      <Card title={editingId ? 'Editar activo' : 'Nuevo activo'}>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <input className="form-control" placeholder="Nombre" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="form-control" placeholder="Ubicacion" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
          <input className="form-control" placeholder="Numero de serie" value={form.serialNumber} onChange={(e) => setForm((p) => ({ ...p, serialNumber: e.target.value }))} />
          <input className="form-control" type="number" placeholder="Coste estimado" value={form.estimatedCost} onChange={(e) => setForm((p) => ({ ...p, estimatedCost: Number(e.target.value) }))} />
          <input className="form-control" placeholder="Categoria" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
          <select className="form-control" value={form.criticality} onChange={(e) => setForm((p) => ({ ...p, criticality: e.target.value }))}>
            <option value="low">Criticidad baja</option>
            <option value="medium">Criticidad media</option>
            <option value="high">Criticidad alta</option>
          </select>
          <textarea className="form-control" rows="2" placeholder="Descripcion / notas" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ gridColumn: '1 / -1' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="tab-btn active" onClick={save}><PlusCircle size={16} /> {editingId ? 'Guardar cambios' : 'Crear activo'}</button>
            {editingId && <button className="tab-btn" onClick={() => { setEditingId(null); setForm(emptyAsset); }}>Cancelar</button>}
          </div>
        </div>
      </Card>

      <Card title="Activos registrados" style={{ marginTop: 16 }}>
        <ul className="project-list">
          {normalizedAssets.map((asset) => (
            <li key={asset.id} className="project-item">
              <div className="project-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Box size={28} color="#00C853" />
                <div>
                  <h4>{asset.name}</h4>
                  <span className="project-status">{asset.location || 'Sin ubicacion'} · Criticidad {asset.criticality}</span>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>Coste estimado: {Number(asset.estimatedCost || 0).toFixed(2)} EUR · Categoria: {asset.category || '-'}</div>
                </div>
              </div>
              <div className="project-meta" style={{ display: 'flex', gap: 8 }}>
                <button className="tab-btn" onClick={() => edit(asset)}><Pencil size={14} /> Editar</button>
                <button className="tab-btn" onClick={() => remove(asset)}><Trash2 size={14} /> Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
