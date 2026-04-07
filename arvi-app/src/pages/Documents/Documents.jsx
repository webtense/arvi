import React from 'react';
import { Button } from '../../components/Button/Button';
import { FolderOpen, FileText, UploadCloud, Search, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Documents.css';

export const Documents = () => {
    const { t } = useTranslation();

    const mockDocs = [
        { id: 1, type: 'folder', name: 'Comunidad Almogàvar', meta: `4 ${t('documents.files')}`, color: '#f1c40f' },
        { id: 2, type: 'file', name: 'Seguro_RC_2026.pdf', meta: t('documents.global'), color: '#3498db' },
        { id: 3, type: 'file', name: 'CONTRATO_ASCENSOR.pdf', meta: '2.4 MB', color: '#e74c3c' },
        { id: 4, type: 'folder', name: 'Manuales Caldera', meta: `12 ${t('documents.files')}`, color: '#2ecc71' },
        { id: 5, type: 'file', name: 'REGLAMENTO_INTERNO.pdf', meta: t('documents.global'), color: '#9b59b6' },
    ];

    return (
        <div className="documents-page">
            <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>{t('documents.title')}</h2>
                    <p className="text-muted">{t('documents.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input 
                            type="text" 
                            placeholder={t('landing.nav.solutions')} 
                            className="form-control" 
                            style={{ paddingLeft: '40px', width: '250px', background: 'var(--bg-card)' }} 
                        />
                    </div>
                    <Button variant="primary">
                        <UploadCloud size={18} /> {t('documents.uploadFile')}
                    </Button>
                </div>
            </header>

            <div className="documents-grid">
                {mockDocs.map(doc => (
                    <div key={doc.id} className="doc-card">
                        <div className="doc-icon-container" style={{ backgroundColor: `${doc.color}15`, color: doc.color }}>
                            {doc.type === 'folder' ? <FolderOpen size={32} /> : <FileText size={32} />}
                        </div>
                        <p className="doc-name">{doc.name}</p>
                        <span className="doc-meta">{doc.meta}</span>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <MoreVertical size={16} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

