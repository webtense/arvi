/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { emitToast } from '../utils/toast';

const AccountingContext = createContext();

export const useAccounting = () => {
    const context = useContext(AccountingContext);
    if (!context) {
        throw new Error('useAccounting must be used within an AccountingProvider');
    }
    return context;
};

export const AccountingProvider = ({ children }) => {
    const [invoices, setInvoices] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFromAPI = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('arvi_token');
            if (!token) {
                setLoading(false);
                return;
            }

            const [invoicesResponse, budgetsData, partsData] = await Promise.all([
                api.getInvoices(),
                api.getBudgets(),
                api.getParts()
            ]);

            setInvoices(invoicesResponse?.data || []);
            setBudgets(budgetsData || []);
            setParts(partsData || []);
        } catch (error) {
            console.error('Error fetching from API:', error);
            // Fallback to localStorage
            const savedInvoices = localStorage.getItem('arvi_invoices');
            const savedBudgets = localStorage.getItem('arvi_budgets');
            const savedParts = localStorage.getItem('arvi_parts');
            
            if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
            if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
            if (savedParts) setParts(JSON.parse(savedParts));

            if (savedInvoices || savedBudgets || savedParts) {
                emitToast({ type: 'info', message: 'Datos contables cargados en local. Pendiente de sincronizar.' });
            } else {
                emitToast({ type: 'error', message: 'No se pudieron cargar los datos contables.' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFromAPI();
    }, []);

    useEffect(() => {
        localStorage.setItem('arvi_invoices', JSON.stringify(invoices));
        localStorage.setItem('arvi_budgets', JSON.stringify(budgets));
        localStorage.setItem('arvi_parts', JSON.stringify(parts));
    }, [invoices, budgets, parts]);

    const getNextLocalInvoiceNumber = (referenceDate = new Date(), source = invoices) => {
        const date = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
        const year = Number.isNaN(date.getFullYear()) ? new Date().getFullYear() : date.getFullYear();
        const prefix = `${year}/`;
        const maxSequential = source.reduce((max, invoice) => {
            if (!invoice.invoiceNumber || !invoice.invoiceNumber.startsWith(prefix)) return max;
            const match = invoice.invoiceNumber.match(/\/(\d+)/);
            if (!match) return max;
            const number = parseInt(match[1], 10);
            if (!Number.isFinite(number)) return max;
            return number > max ? number : max;
        }, 0);
        const next = maxSequential + 1;
        return `${year}/${next.toString().padStart(3, '0')}`;
    };

    const ensureLocalInvoiceNumber = (invoice, source = invoices) => {
        const valid = /^\d{4}\/\d{3,}$/.test(invoice.invoiceNumber || '');
        if (valid) return invoice.invoiceNumber;
        return getNextLocalInvoiceNumber(invoice.date ? new Date(invoice.date) : new Date(), source);
    };

    const convertToInvoice = async (source, sourceType) => {
        const newInvoice = {
            date: new Date().toISOString().split('T')[0],
            client: source.client,
            description: source.work || source.description || 'Facturación de servicios',
            items: source.items || [
                { id: 1, description: source.work || 'Trabajos realizados', quantity: 1, unitPrice: source.total || 0, tax: 21, total: source.total || 0 }
            ],
            subtotal: source.total || 0,
            taxTotal: (source.total || 0) * 0.21,
            total: (source.total || 0) * 1.21,
            status: 'draft',
            type: 'draft',
            sourceId: source.id,
            sourceType: sourceType
        };

        try {
            const created = await api.createInvoice(newInvoice);
            setInvoices(prev => [created, ...prev]);
            
            if (sourceType === 'budget') {
                await api.updateBudget(source.id, { status: 'invoiced' });
                setBudgets(prev => prev.map(b => b.id === source.id ? { ...b, status: 'invoiced' } : b));
            } else if (sourceType === 'part') {
                await api.updatePart(source.id, { status: 'invoiced' });
                setParts(prev => prev.map(p => p.id === source.id ? { ...p, status: 'invoiced' } : p));
            }

            emitToast({ type: 'success', message: 'Factura creada correctamente.' });
            
            return created;
        } catch (error) {
            const fallback = { ...newInvoice, id: Date.now().toString(), invoiceNumber: ensureLocalInvoiceNumber(newInvoice) };
            setInvoices(prev => [fallback, ...prev]);
            emitToast({ type: 'info', message: 'Factura guardada en local. Pendiente de sincronizar.' });
            return fallback;
        }
    };

    const finalizeInvoice = async (invoiceId) => {
        try {
            const updated = await api.finalizeInvoice(invoiceId);
            setInvoices(prev => prev.map(inv => inv.id === invoiceId ? updated : inv));
            emitToast({ type: 'success', message: 'Factura finalizada correctamente.' });
        } catch (error) {
            const today = new Date().toISOString().split('T')[0];
            setInvoices(prev => {
                const prevInvoice = prev.filter(inv => inv.type === 'definitive').slice(-1)[0];
                const prevHash = prevInvoice ? prevInvoice.hash : '00000000000000000000000000000000';
                const newHash = btoa(invoiceId + prevHash).slice(0, 32);
                return prev.map(inv => {
                    if (inv.id !== invoiceId) return inv;
                    const invoiceNumber = ensureLocalInvoiceNumber(inv, prev);
                    return {
                        ...inv,
                        invoiceNumber,
                        status: 'finalized',
                        type: 'definitive',
                        hash: newHash,
                        prevHash,
                        finalDate: today
                    };
                });
            });
            emitToast({ type: 'info', message: 'Factura finalizada en local. Pendiente de sincronizar.' });
        }
    };

    const addPart = async (newPart) => {
        const partData = {
            ...newPart,
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        try {
            const created = await api.createPart(partData);
            setParts(prev => [created, ...prev]);
            emitToast({ type: 'success', message: 'Parte guardado correctamente.' });
        } catch (error) {
            setParts(prev => [{ ...partData, id: Date.now().toString() }, ...prev]);
            emitToast({ type: 'info', message: 'Parte guardado en local. Pendiente de sincronizar.' });
        }
    };

    const addInvoice = async (newInvoice) => {
        const invoiceData = {
            ...newInvoice,
            date: newInvoice.date || new Date().toISOString().split('T')[0]
        };
        try {
            const created = await api.createInvoice(invoiceData);
            setInvoices(prev => [created, ...prev]);
            emitToast({ type: 'success', message: 'Factura en borrador creada correctamente.' });
            return created;
        } catch (error) {
            const fallback = { ...invoiceData, id: Date.now().toString(), invoiceNumber: ensureLocalInvoiceNumber(invoiceData) };
            setInvoices(prev => [fallback, ...prev]);
            emitToast({ type: 'info', message: 'Factura guardada en local. Pendiente de sincronizar.' });
            return fallback;
        }
    };

    const updateInvoice = async (id, changes) => {
        try {
            const updated = await api.updateInvoice(id, changes);
            setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
            emitToast({ type: 'success', message: 'Factura actualizada correctamente.' });
            return updated;
        } catch (error) {
            setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...changes } : inv));
            emitToast({ type: 'info', message: 'Cambios guardados en local. Pendiente de sincronizar.' });
            return { id, ...changes };
        }
    };

    const duplicateInvoice = async (id) => {
        try {
            const duplicated = await api.duplicateInvoice(id);
            setInvoices(prev => [duplicated, ...prev]);
            emitToast({ type: 'success', message: 'Factura duplicada.' });
            return duplicated;
        } catch (error) {
            emitToast({ type: 'error', message: error.message || 'No se pudo duplicar la factura.' });
            throw error;
        }
    };

    const deleteInvoice = async (id) => {
        try {
            await api.deleteInvoice(id);
            setInvoices(prev => prev.filter(inv => inv.id !== id));
            emitToast({ type: 'success', message: 'Factura eliminada.' });
        } catch (error) {
            emitToast({ type: 'error', message: error.message || 'No se pudo eliminar la factura.' });
            throw error;
        }
    };

    const importInvoices = (importedData) => {
        setInvoices(prev => {
            const existingNumbers = new Set(prev.map(inv => inv.invoiceNumber));
            const filteredImport = importedData.filter(inv => !existingNumbers.has(inv.invoiceNumber));
            return [...prev, ...filteredImport.map(inv => ({ ...inv, status: 'imported', type: 'definitive' }))];
        });
    };

    return (
        <AccountingContext.Provider value={{
            invoices,
            budgets,
            parts,
            loading,
            convertToInvoice,
            finalizeInvoice,
            importInvoices,
            addPart,
            addInvoice,
            updateInvoice,
            duplicateInvoice,
            deleteInvoice
        }}>
            {children}
        </AccountingContext.Provider>
    );
};
