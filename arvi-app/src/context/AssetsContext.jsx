import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
            if (saved) setAssets(JSON.parse(saved));
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
        } catch (error) {
            setAssets(prev => [{ ...newAsset, id: Date.now().toString() }, ...prev]);
        }
    };

    const updateAsset = async (id, data) => {
        try {
            await api.updateAsset(id, data);
            setAssets(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
        } catch (error) {
            setAssets(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
        }
    };

    const deleteAsset = async (id) => {
        try {
            await api.deleteAsset(id);
            setAssets(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            setAssets(prev => prev.filter(a => a.id !== id));
        }
    };

    return (
        <AssetsContext.Provider value={{ assets, loading, addAsset, updateAsset, deleteAsset }}>
            {children}
        </AssetsContext.Provider>
    );
};
