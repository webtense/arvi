import React from 'react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Settings, Shield, UserX, UserCheck } from 'lucide-react';

export const Users = () => {
    // Dummy Data for User Management
    const usersList = [
        { id: 1, name: 'Administrador Principal', email: 'admin@arvimanteniment.com', role: 'Super Admin', status: 'active', lastLogin: '2026-03-19 09:30' },
        { id: 2, name: 'Técnico Sabadell', email: 'tecnico1@arvimanteniment.com', role: 'Operario', status: 'active', lastLogin: '2026-03-19 12:15' },
        { id: 3, name: 'Presidente Cervantes', email: 'presidente.cervantes@gmail.com', role: 'Cliente', status: 'active', lastLogin: '2026-03-18 20:00' },
        { id: 4, name: 'Gestor Reformas', email: 'reformas@arvimanteniment.com', role: 'Operario', status: 'inactive', lastLogin: '2026-03-10 16:45' }
    ];

    return (
        <div className="users-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', margin: 0 }}>Gestión de Usuarios</h2>
                <Button className="primary">+ Nuevo Usuario</Button>
            </div>

            <Card style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Nombre</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Email</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Rol</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Estado</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Último Acceso</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{user.name}</td>
                                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{user.email}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        backgroundColor: user.role === 'Super Admin' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                                        color: user.role === 'Super Admin' ? 'var(--color-success)' : 'var(--color-info)'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {user.status === 'active'
                                        ? <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-success)' }}><UserCheck size={16} /> Activo</div>
                                        : <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-error)' }}><UserX size={16} /> Inactivo</div>
                                    }
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{user.lastLogin}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--brand-green)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Settings size={18} /> Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
