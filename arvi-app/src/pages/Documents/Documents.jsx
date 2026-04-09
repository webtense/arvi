import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button/Button';
import { FolderOpen, FileText, UploadCloud, Search, Download, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { emitToast } from '../../utils/toast';
import './Documents.css';

export const Documents = () => {
  const { t } = useTranslation();
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');

  const loadDocs = async (query = '') => {
    try {
      const result = await api.getDocuments({ search: query });
      setDocs(result || []);
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'No se pudieron cargar los documentos' });
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('category', category);
      await api.uploadDocument(formData);
      emitToast({ type: 'success', message: 'Documento subido correctamente' });
      setTitle('');
      await loadDocs(search);
    } catch (error) {
      emitToast({ type: 'error', message: error.message || 'Error al subir documento' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return docs;
    const q = search.toLowerCase();
    return docs.filter((doc) => [doc.title, doc.fileName, doc.category].join(' ').toLowerCase().includes(q));
  }, [docs, search]);

  return (
    <div className="documents-page">
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2>{t('documents.title')}</h2>
          <p className="text-muted">Gestor documental funcional por proyecto y cliente.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              type="text"
              placeholder="Buscar documento"
              className="form-control"
              style={{ paddingLeft: '40px', width: '250px', background: 'var(--bg-card)' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input className="form-control" style={{ width: 220 }} placeholder="Titulo (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="form-control" style={{ width: 160 }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="general">General</option>
            <option value="proyecto">Proyecto</option>
            <option value="legal">Legal</option>
            <option value="factura">Factura</option>
          </select>
          <label className="btn btn-primary" style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
            <UploadCloud size={18} /> {uploading ? 'Subiendo...' : t('documents.uploadFile')}
            <input type="file" hidden onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </header>

      <div className="documents-grid">
        {filtered.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-icon-container" style={{ backgroundColor: 'rgba(56, 161, 105, 0.15)', color: '#38a169' }}>
              {doc.category === 'proyecto' ? <FolderOpen size={32} /> : <FileText size={32} />}
            </div>
            <p className="doc-name">{doc.title || doc.fileName}</p>
            <span className="doc-meta">{doc.category} · {(Number(doc.size || 0) / 1024).toFixed(1)} KB</span>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <Button size="small" variant="secondary" onClick={() => window.open(api.getDocumentDownloadUrl(doc.id), '_blank')}>
                <Download size={14} /> Descargar
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={async () => {
                  await api.deleteDocument(doc.id);
                  setDocs((prev) => prev.filter((d) => d.id !== doc.id));
                  emitToast({ type: 'success', message: 'Documento eliminado' });
                }}
              >
                <Trash2 size={14} /> Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
