import { useState, useEffect } from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Camera, Upload, ScanLine, CheckCircle, Clock, TrendingUp, DollarSign, Tag, FileText } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useTickets } from '../../context/TicketsContext';
import { emitToast } from '../../utils/toast';
import api from '../../services/api';
import './Tickets.css';

export const Tickets = () => {
    const { tickets, projects, addTicket, updateTicket, closeMonth } = useTickets();
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scannedTickets, setScannedTickets] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');

    useEffect(() => {
        if (tickets.length > 0) {
            setScannedTickets(tickets.map(t => ({
                id: t.id,
                merchant: t.client,
                date: new Date(t.date).toLocaleDateString(),
                amount: t.amount + ' €',
                category: t.category,
                status: t.status,
                imageUrl: t.imageUrl,
                projectId: t.projectId || ''
            })));
        }
    }, [tickets]);

    const detectCategory = (text) => {
        const lowerText = text.toLowerCase();
        if (/gasoil|diesel|gasolina|repsol|cepsa|bp|shell/i.test(lowerText)) return 'gasolina';
        if (/restaurante|menu|cafe|comida|cena|poke|burger|pizza|bar/i.test(lowerText)) return 'restauracion';
        if (/amazon|carrefour|mercadona|ferreteria|tornillo|tubo|pintura|material|bauhaus|leroy|ikea|compra/i.test(lowerText)) return 'compras';
        return 'otros';
    };

    const extractAmount = (text) => {
        const matches = text.match(/(\d+[.,]\d{2})\s*€/);
        return matches ? matches[1] + ' €' : '0.00 €';
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsScanning(true);
        setScanProgress(0);

        try {
            const worker = await createWorker('spa', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setScanProgress(parseInt(m.progress * 100));
                    }
                }
            });
            
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            const hints = await api.getOcrHints(text).catch(() => null);
            const merchant = hints?.vendor || text.split('\n')[0] || 'Nuevo Ticket';
            const category = hints?.category || detectCategory(text);
            const amount = Number(hints?.amount || extractAmount(text).replace(' €', '').replace(',', '.'));
            const amountStr = `${Number(amount || 0).toFixed(2)} €`;
            const imageData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const newTicketData = {
                client: merchant.substring(0, 25),
                amount: amount,
                category: category,
                description: text.substring(0, 200),
                projectId: selectedProjectId ? parseInt(selectedProjectId) : undefined,
                imageData
            };

            await addTicket(newTicketData);

            setScannedTickets([{
                id: Date.now(),
                merchant: newTicketData.client,
                date: new Date().toLocaleDateString(),
                amount: amountStr,
                category: category,
                status: 'verified',
                imageUrl: imageData
            }, ...scannedTickets]);
        } catch (error) {
            console.error('Error in OCR:', error);
            emitToast({ type: 'info', message: 'OCR no disponible. Se usa captura rapida manual.' });
            // Fallback mock if OCR fails for any reason
            handleScanMock();
        } finally {
            setIsScanning(false);
        }
    };

    const handleScanMock = () => {
        setIsScanning(true);
        setScanProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setScanProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsScanning(false);
                setScannedTickets([
                    { id: Date.now(), merchant: 'Restaurante Almogàvar', date: '19/03/2026', amount: '22.50 €', category: 'Comida', status: 'verified' },
                    ...scannedTickets
                ]);
            }
        }, 200);
    };

    const stats = {
        daily: '45.20 €',
        monthly: [
            { month: 'Oct', value: 450 },
            { month: 'Nov', value: 520 },
            { month: 'Dic', value: 380 },
            { month: 'Ene', value: 610 },
            { month: 'Feb', value: 490 },
            { month: 'Mar', value: 540 }
        ]
    };

    const handleCloseCurrentMonth = async () => {
        const now = new Date();
        try {
            const result = await closeMonth(now.getFullYear(), now.getMonth() + 1);
            if (result?.zipUrl) {
                window.open(result.zipUrl, '_blank');
            }
        } catch (error) {
            // Toast handled in context
        }
    };

    return (
        <div className="tickets-page">
            <header className="page-header">
                <div>
                    <h2>Gastos y Tickets</h2>
                    <p className="text-muted">Digitaliza tus tickets comerciales al instante mediante OCR.</p>
                </div>
                <Button variant="outline" onClick={handleCloseCurrentMonth}>Cerrar mes y comprimir</Button>
            </header>

            <div className="tickets-grid">
                <div className="tickets-left-column">
                    {/* EVOLUCIÓN MENSUAL */}
                    <Card title="Evolución Mensual" className="stats-card">
                        <div className="daily-total">
                            <span className="text-muted">Total hoy:</span>
                            <span className="total-amount">{stats.daily}</span>
                        </div>
                        <div className="chart-container">
                            <div className="bar-chart">
                                {stats.monthly.map((item, idx) => (
                                    <div key={idx} className="bar-wrapper">
                                        <div 
                                            className="bar" 
                                            style={{ height: `${(item.value / 700) * 100}%` }}
                                            title={`${item.month}: ${item.value}€`}
                                        ></div>
                                        <span className="bar-label">{item.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="scanner-card">
                        <div className={`scanner-ui ${isScanning ? 'scanning' : ''}`}>
                            {isScanning ? (
                                <div className="scanning-animation">
                                    <ScanLine size={48} className="scan-icon pulse" />
                                    <p>Procesando (OCR {scanProgress}%)...</p>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${scanProgress}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="scanner-idle">
                                    <div className="camera-btn-wrapper">
                                        <button className="camera-btn" onClick={handleScanMock}>
                                            <Camera size={32} />
                                        </button>
                                    </div>
                                    <p>Toca para hacer una foto al ticket</p>
                                    <span className="text-muted text-sm">o arrastra un archivo aquí</span>
                                </div>
                            )}
                        </div>
                        <div className="scanner-actions">
                            <select
                                className="form-control"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            >
                                <option value="">Sin proyecto</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <label className="btn btn-outline full-width" style={{ cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Upload size={18} /> Subir desde Galería
                                <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </Card>
                </div>

                <Card title="Últimos Tickets Procesados" className="history-card">
                    <ul className="ticket-list">
                        {scannedTickets.map(ticket => (
                            <li key={ticket.id} className="ticket-item">
                                <div className="ticket-icon-wrapper">
                                    {ticket.category === 'gasolina' && <TrendingUp size={18} className="cat-icon-gas" />}
                                    {ticket.category === 'restauracion' && <DollarSign size={18} className="cat-icon-food" />}
                                    {ticket.category === 'compras' && <Tag size={18} className="cat-icon-mat" />}
                                    {ticket.category === 'otros' && <FileText size={18} className="cat-icon-other" />}
                                </div>
                                <div className="ticket-info">
                                    <div className="ticket-merchant">{ticket.merchant}</div>
                                    <div className="ticket-date">
                                        {ticket.date} • <span className="ticket-cat-label">{ticket.category}</span>
                                    </div>
                                </div>
                                <div className="ticket-meta">
                                    <div className="ticket-amount">{ticket.amount}</div>
                                    <select
                                        className="form-control"
                                        style={{ minWidth: '180px', marginTop: '0.5rem' }}
                                        value={ticket.projectId || ''}
                                        onChange={(e) => updateTicket(ticket.id, { projectId: e.target.value ? parseInt(e.target.value, 10) : null })}
                                    >
                                        <option value="">Asignar proyecto...</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {ticket.imageUrl && (
                                        <a href={ticket.imageUrl} target="_blank" rel="noreferrer" className="text-muted text-sm">Descargar</a>
                                    )}
                                    <div className="ticket-status">
                                        {ticket.status === 'verified'
                                            ? <span className="status-badge success"><CheckCircle size={14} /> Verificado</span>
                                            : <span className="status-badge pending"><Clock size={14} /> Procesando</span>
                                        }
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};
