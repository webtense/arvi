import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ClientsContext = createContext();

export const useClients = () => {
    const context = useContext(ClientsContext);
    if (!context) {
        throw new Error('useClients must be used within a ClientsProvider');
    }
    return context;
};

export const ClientsProvider = ({ children }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);

    const fetchClients = async (search = '') => {
        try {
            setLoading(true);
            const data = await api.getClients(search);
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            const saved = localStorage.getItem('arvi_clients');
            if (saved) setClients(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        localStorage.setItem('arvi_clients', JSON.stringify(clients));
    }, [clients]);

    const addClient = async (clientData) => {
        try {
            const created = await api.createClient(clientData);
            setClients(prev => [created, ...prev]);
            return created;
        } catch (error) {
            throw error;
        }
    };

    const updateClient = async (id, clientData) => {
        try {
            const updated = await api.updateClient(id, clientData);
            setClients(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (error) {
            throw error;
        }
    };

    const deleteClient = async (id) => {
        try {
            await api.deleteClient(id);
            setClients(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            throw error;
        }
    };

    const searchClients = async (query) => {
        await fetchClients(query);
    };

    return (
        <ClientsContext.Provider value={{
            clients,
            loading,
            selectedClient,
            setSelectedClient,
            fetchClients,
            addClient,
            updateClient,
            deleteClient,
            searchClients
        }}>
            {children}
        </ClientsContext.Provider>
    );
};