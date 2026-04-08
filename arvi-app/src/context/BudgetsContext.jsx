/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { emitToast } from '../utils/toast';

export const BudgetsContext = createContext();

export const useBudgets = () => {
    const context = useContext(BudgetsContext);
    if (!context) {
        throw new Error('useBudgets must be used within a BudgetsProvider');
    }
    return context;
};

export const BudgetsProvider = ({ children }) => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFromAPI = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('arvi_token');
            if (!token) {
                setLoading(false);
                return;
            }

            const budgetsData = await api.getBudgets();
            setBudgets(budgetsData || []);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            const saved = localStorage.getItem('arvi_budgets');
            if (saved) {
                setBudgets(JSON.parse(saved));
                emitToast({ type: 'info', message: 'Presupuestos cargados en local. Pendiente de sincronizar.' });
            } else {
                emitToast({ type: 'error', message: 'No se pudieron cargar los presupuestos.' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFromAPI();
    }, []);

    useEffect(() => {
        localStorage.setItem('arvi_budgets', JSON.stringify(budgets));
    }, [budgets]);

    const addBudget = async (newBudget) => {
        const budgetData = {
            ...newBudget,
            date: new Date().toISOString().split('T')[0],
            status: 'draft'
        };
        try {
            const created = await api.createBudget(budgetData);
            setBudgets(prev => [created, ...prev]);
            emitToast({ type: 'success', message: 'Presupuesto creado correctamente.' });
        } catch (error) {
            setBudgets(prev => [{ ...budgetData, id: Date.now().toString() }, ...prev]);
            emitToast({ type: 'info', message: 'Presupuesto guardado en local. Pendiente de sincronizar.' });
        }
    };

    const updateBudget = async (id, data) => {
        try {
            await api.updateBudget(id, data);
            setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
            emitToast({ type: 'success', message: 'Presupuesto actualizado.' });
        } catch (error) {
            setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
            emitToast({ type: 'info', message: 'Cambios guardados en local. Pendiente de sincronizar.' });
        }
    };

    const deleteBudget = async (id) => {
        try {
            await api.deleteBudget(id);
            setBudgets(prev => prev.filter(b => b.id !== id));
            emitToast({ type: 'success', message: 'Presupuesto eliminado.' });
        } catch (error) {
            setBudgets(prev => prev.filter(b => b.id !== id));
            emitToast({ type: 'info', message: 'Presupuesto eliminado en local. Pendiente de sincronizar.' });
        }
    };

    const sendBudget = async (id) => {
        try {
            const updated = await api.sendBudget(id);
            setBudgets(prev => prev.map(b => b.id === id ? updated : b));
            emitToast({ type: 'success', message: 'Presupuesto enviado.' });
        } catch (error) {
            setBudgets(prev => prev.map(b => b.id === id ? { ...b, status: 'sent' } : b));
            emitToast({ type: 'info', message: 'Estado actualizado en local. Pendiente de sincronizar.' });
        }
    };

    const acceptBudget = async (id) => {
        try {
            const updated = await api.acceptBudget(id);
            setBudgets(prev => prev.map(b => b.id === id ? updated : b));
            emitToast({ type: 'success', message: 'Presupuesto aceptado.' });
        } catch (error) {
            setBudgets(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' } : b));
            emitToast({ type: 'info', message: 'Estado actualizado en local. Pendiente de sincronizar.' });
        }
    };

    return (
        <BudgetsContext.Provider value={{ budgets, loading, addBudget, updateBudget, deleteBudget, sendBudget, acceptBudget }}>
            {children}
        </BudgetsContext.Provider>
    );
};
