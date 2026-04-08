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

            const [invoicesData, budgetsData, partsData] = await Promise.all([
                api.getInvoices(),
                api.getBudgets(),
                api.getParts()
            ]);

            setInvoices(invoicesData || []);
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

    const getNextInvoiceNumber = (isDefinitive) => {
        const year = new Date().getFullYear();
        const definitiveCount = invoices.filter(inv => inv.type === 'definitive').length;
        if (isDefinitive) {
            return `${year}/${(definitiveCount + 1).toString().padStart(3, '0')}`;
        }
        const draftCount = invoices.filter(inv => inv.type === 'draft').length;
        return `DRAFT-${year}-${(draftCount + 1).toString().padStart(3, '0')}`;
    };

    const convertToInvoice = async (source, sourceType) => {
        const newInvoice = {
            invoiceNumber: getNextInvoiceNumber(false),
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
            setInvoices(prev => [{ ...newInvoice, id: Date.now().toString() }, ...prev]);
            emitToast({ type: 'info', message: 'Factura guardada en local. Pendiente de sincronizar.' });
            return newInvoice;
        }
    };

    const finalizeInvoice = async (invoiceId) => {
        const prevInvoice = invoices.filter(inv => inv.type === 'definitive').slice(-1)[0];
        const prevHash = prevInvoice ? prevInvoice.hash : '00000000000000000000000000000000';
        
        const newHash = btoa(invoiceId + prevHash).slice(0, 32);
        
        const updatedInvoice = {
            invoiceNumber: getNextInvoiceNumber(true),
            status: 'finalized',
            type: 'definitive',
            hash: newHash,
            prevHash: prevHash,
            finalDate: new Date().toISOString().split('T')[0]
        };

        try {
            await api.finalizeInvoice(invoiceId);
            setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, ...updatedInvoice } : inv));
            emitToast({ type: 'success', message: 'Factura finalizada correctamente.' });
        } catch (error) {
            setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, ...updatedInvoice } : inv));
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
            date: new Date().toISOString().split('T')[0]
        };
        try {
            const created = await api.createInvoice(invoiceData);
            setInvoices(prev => [created, ...prev]);
            emitToast({ type: 'success', message: 'Factura en borrador creada correctamente.' });
        } catch (error) {
            setInvoices(prev => [{ ...invoiceData, id: Date.now().toString() }, ...prev]);
            emitToast({ type: 'info', message: 'Factura guardada en local. Pendiente de sincronizar.' });
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
            getNextInvoiceNumber
        }}>
            {children}
        </AccountingContext.Provider>
    );
};
