import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const TicketsContext = createContext();

export const useTickets = () => {
    const context = useContext(TicketsContext);
    if (!context) {
        throw new Error('useTickets must be used within a TicketsProvider');
    }
    return context;
};

export const TicketsProvider = ({ children }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);

    const fetchFromAPI = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('arvi_token');
            if (!token) {
                setLoading(false);
                return;
            }

            const [ticketsData, projectsData] = await Promise.all([
                api.getTickets(),
                api.getProjects().catch(() => [])
            ]);
            setTickets(ticketsData || []);
            setProjects(projectsData || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            const saved = localStorage.getItem('arvi_tickets');
            if (saved) setTickets(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFromAPI();
    }, []);

    useEffect(() => {
        localStorage.setItem('arvi_tickets', JSON.stringify(tickets));
    }, [tickets]);

    const addTicket = async (newTicket) => {
        const ticketData = {
            ...newTicket,
            date: new Date().toISOString().split('T')[0],
            status: 'verified'
        };
        try {
            const created = await api.createTicket(ticketData);
            setTickets(prev => [created, ...prev]);
        } catch (error) {
            setTickets(prev => [{ ...ticketData, id: Date.now().toString() }, ...prev]);
        }
    };

    const updateTicket = async (id, data) => {
        try {
            await api.updateTicket(id, data);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        } catch (error) {
            setTickets(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        }
    };

    const deleteTicket = async (id) => {
        try {
            await api.deleteTicket(id);
            setTickets(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            setTickets(prev => prev.filter(t => t.id !== id));
        }
    };

    const closeMonth = async (year, month) => {
        return api.closeTicketMonth(year, month);
    };

    return (
        <TicketsContext.Provider value={{ tickets, projects, loading, addTicket, updateTicket, deleteTicket, closeMonth }}>
            {children}
        </TicketsContext.Provider>
    );
};
