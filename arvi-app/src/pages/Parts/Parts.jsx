import { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/Button/Button';
import { Plus, Send, Trash2, FileText, CheckCircle, ClipboardList, FileCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAccounting } from '../../context/AccountingContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { emitToast } from '../../utils/toast';
import './Parts.css';

export const Parts = () => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const { parts, budgets, convertToInvoice, addPart } = useAccounting();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('partes');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Estados del formulario
    const [customer, setCustomer] = useState('');
    const [description, setDescription] = useState('');
    const [materials, setMaterials] = useState([{ id: Date.now(), name: '', qty: '' }]);
    const [displacement, setDisplacement] = useState(settings.displacementPrice);
    const [tech1Hours, setTech1Hours] = useState('');
    const [assistantHours, setAssistantHours] = useState('');
    const [isOk, setIsOk] = useState(false);

    // Configurar Canvas para dibujo
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Ajustar el tamaño real del canvas
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = 180;
        }
    }, [activeTab]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        ctx.beginPath();
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        setIsDrawing(true);
        if (e.type === 'touchstart') e.preventDefault();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        if (e.type === 'touchmove') e.preventDefault();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.getContext('2d').closePath();
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const resetForm = () => {
        setCustomer('');
        setDescription('');
        setMaterials([{ id: Date.now(), name: '', qty: '' }]);
        setDisplacement(settings.displacementPrice);
        setTech1Hours('');
        setAssistantHours('');
        setIsOk(false);
        clearSignature();
    };

    const handleSave = () => {
        if (!customer) {
            emitToast({ type: 'error', message: 'Por favor, indica el cliente.' });
            return;
        }

        const laborTotal = (Number(tech1Hours) * settings.tech1Rate) + 
                          (Number(assistantHours) * settings.assistantRate) + 
                          Number(displacement);

        const newPart = {
            id: `PAR-${Date.now()}`,
            client: customer,
            work: description,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            items: materials.map(m => ({
                id: m.id,
                description: m.name,
                quantity: Number(m.qty) || 1,
                price: 0, // In work reports, materials might not have prices yet
                tax: 21,
                total: 0
            })),
            total: laborTotal // Initial total based on labor
        };

        addPart(newPart);
        resetForm();
    };

    return (
        <div className="parts-page">
            <header className="page-header" id="top">
                <div>
                    <h2>{t('parts.title')}</h2>
                    <p className="text-muted">{t('parts.subtitle')}</p>
                </div>
                <Button variant="primary" onClick={resetForm}>
                    <Plus size={18} /> {t('parts.newDocument')}
                </Button>
            </header>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'partes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('partes')}
                >
                    <ClipboardList size={18} /> {t('parts.tabWorkReports')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'proformas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('proformas')}
                >
                    <FileCheck size={18} /> {t('parts.tabProformas')}
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'partes' ? (
                    <div className="parts-grid">
                        <div className="form-card">
                            <h3>{t('parts.newQuickReport')}</h3>
                            <form className="quick-form" onSubmit={(e) => e.preventDefault()}>
                                <div className="form-group">
                                    <label>{t('parts.clientProject')}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('parts.clientPlaceholder')} 
                                        className="form-control"
                                        value={customer}
                                        onChange={(e) => setCustomer(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('parts.jobDescription')}</label>
                                    <textarea 
                                        placeholder={t('parts.descriptionPlaceholder')} 
                                        className="form-control" 
                                        rows="3"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label>{t('parts.materialsUsed')}</label>
                                        <button 
                                            type="button" 
                                            className="btn-add-line"
                                            onClick={() => setMaterials([...materials, { id: Date.now(), name: '', qty: '' }])}
                                        >
                                            <Plus size={16} /> {t('parts.addLine')}
                                        </button>
                                    </div>
                                    {materials.map((mat, index) => (
                                        <div key={mat.id} className="material-line">
                                            <input 
                                                type="text" 
                                                placeholder={t('parts.material')} 
                                                className="form-control"
                                                style={{ flex: 3 }}
                                                value={mat.name}
                                                onChange={(e) => {
                                                    const newMats = [...materials];
                                                    newMats[index].name = e.target.value;
                                                    setMaterials(newMats);
                                                }}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder={t('parts.qty')} 
                                                className="form-control"
                                                style={{ flex: 1 }}
                                                value={mat.qty}
                                                onChange={(e) => {
                                                    const newMats = [...materials];
                                                    newMats[index].qty = e.target.value;
                                                    setMaterials(newMats);
                                                }}
                                            />
                                            {materials.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    className="btn-remove-line"
                                                    onClick={() => setMaterials(materials.filter(m => m.id !== mat.id))}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="labor-grid">
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>{t('parts.serviceFee')}</label>
                                        <input 
                                            type="number" 
                                            className="form-control"
                                            value={displacement}
                                            onChange={(e) => setDisplacement(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>{t('parts.tech1Hours')} ({settings.tech1Rate}€/h)</label>
                                        <input 
                                            type="number" 
                                            placeholder={t('parts.hoursPlaceholder')} 
                                            className="form-control"
                                            value={tech1Hours}
                                            onChange={(e) => setTech1Hours(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>{t('parts.assistantHours')} ({settings.assistantRate}€/h)</label>
                                        <input 
                                            type="number" 
                                            placeholder={t('parts.hoursPlaceholder')} 
                                            className="form-control"
                                            value={assistantHours}
                                            onChange={(e) => setAssistantHours(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="signature-section">
                                    <label className="checkbox-label" style={{ fontWeight: '600', color: 'var(--brand-green)', marginBottom: '1rem' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={isOk}
                                            style={{ accentColor: 'var(--brand-green)', width: '1.2rem', height: '1.2rem' }}
                                            onChange={(e) => setIsOk(e.target.checked)}
                                        />
                                        {t('parts.workFinished')}
                                    </label>

                                    <div className="legal-disclaimer">
                                        {t('parts.legalDisclaimer')}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 0.5rem' }}>
                                        <label style={{ fontWeight: '500' }}>{t('parts.customerSignature')}</label>
                                        <button type="button" onClick={clearSignature} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                            <Trash2 size={16} /> {t('parts.clear')}
                                        </button>
                                    </div>
                                    <div className="signature-canvas-container">
                                        <canvas
                                            ref={canvasRef}
                                            onMouseDown={startDrawing}
                                            onMouseUp={stopDrawing}
                                            onMouseOut={stopDrawing}
                                            onMouseMove={draw}
                                            onTouchStart={startDrawing}
                                            onTouchEnd={stopDrawing}
                                            onTouchMove={draw}
                                        />
                                    </div>
                                </div>

                                <div className="form-actions" style={{ marginTop: '2.5rem' }}>
                                    <Button type="button" variant="primary" style={{ width: '100%', height: '3.5rem', fontSize: '1.1rem' }} onClick={handleSave}>
                                        <Send size={20} /> {t('parts.generatePdf')}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="list-card">
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>{t('parts.recentReports')}</h3>
                            <div className="reports-list">
                                {parts.map(part => (
                                    <div key={part.id} className="list-item">
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--brand-green-glow)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-green)' }}>
                                                <FileText size={22} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{part.client}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{part.date} • {part.work}</div>
                                            </div>
                                        </div>
                                        <div>
                                            {part.status === 'invoiced' ? (
                                                <span className="status-badge definitive">{t('parts.invoiced')}</span>
                                            ) : (
                                                <Button size="small" variant="secondary" onClick={() => {
                                                    convertToInvoice(part, 'part');
                                                    navigate('/app/facturas');
                                                }}>
                                                    {t('parts.invoice')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="list-card" style={{ maxWidth: '800px' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>{t('parts.activeProformas')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {budgets.map(budget => (
                                <div key={budget.id} className="list-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)' }}>
                                            <FileCheck size={22} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{budget.client}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{budget.date} • {t('parts.total')}: <span style={{ color: 'var(--brand-green)', fontWeight: '700' }}>{budget.total} €</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        {budget.status === 'invoiced' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: '600' }}>
                                                <CheckCircle size={18} /> {t('parts.invoiced')}
                                            </div>
                                        ) : (
                                            <Button variant="primary" size="small" onClick={() => {
                                                convertToInvoice(budget, 'budget');
                                                navigate('/app/facturas');
                                            }}>
                                                {t('parts.convertToInvoice')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
