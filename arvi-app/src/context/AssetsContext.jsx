/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { emitToast } from '../utils/toast';

export const AssetsContext = createContext();

export const useAssets = () => {
    const context = useContext(AssetsContext);
    if (!context) {
        throw new Error('useAssets must be used within an AssetsProvider');
    }
    return context;
};

export const AssetsProvider = ({ children }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFromAPI = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('arvi_token');
            if (!token) {
                setLoading(false);
                return;
            }

            const assetsData = await api.getAssets();
            setAssets(assetsData || []);
        } catch (error) {
            console.error('Error fetching assets:', error);
            const saved = localStorage.getItem('arvi_assets');
            if (saved) {
                setAssets(JSON.parse(saved));
                emitToast({ type: 'info', message: 'Activos cargados en local. Pendiente de sincronizar.' });
            } else {
                emitToast({ type: 'error', message: 'No se pudieron cargar los activos.' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFromAPI();
    }, []);

    useEffect(() => {
        localStorage.setItem('arvi_assets', JSON.stringify(assets));
    }, [assets]);

    const addAsset = async (newAsset) => {
        try {
            const created = await api.createAsset(newAsset);
            setAssets(prev => [created, ...prev]);
            emitToast({ type: 'success', message: 'Activo creado correctamente.' });
        } catch (error) {
            setAssets(prev => [{ ...newAsset, id: Date.now().toString() }, ...prev]);
            emitToast({ type: 'info', message: 'Activo guardado en local. Pendiente de sincronizar.' });
        }
    };

    const updateAsset = async (id, data) => {
        try {
            await api.updateAsset(id, data);
            setAssets(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
            emitToast({ type: 'success', message: 'Activo actualizado.' });
        } catch (error) {
            setAssets(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
            emitToast({ type: 'info', message: 'Cambios guardados en local. Pendiente de sincronizar.' });
        }
    };

    const deleteAsset = async (id) => {
        try {
            await api.deleteAsset(id);
            setAssets(prev => prev.filter(a => a.id !== id));
            emitToast({ type: 'success', message: 'Activo eliminado.' });
        } catch (error) {
            setAssets(prev => prev.filter(a => a.id !== id));
            emitToast({ type: 'info', message: 'Activo eliminado en local. Pendiente de sincronizar.' });
        }
    };

    return (
        <AssetsContext.Provider value={{ assets, loading, addAsset, updateAsset, deleteAsset }}>
            {children}
        </AssetsContext.Provider>
    );
};
