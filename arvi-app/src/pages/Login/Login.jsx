import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button/Button';
import { Lock, User, AlertCircle } from 'lucide-react';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/app/dashboard';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(username, password);

        if (result.success) {
            // Ir a la página solicitada o a la por defecto según el rol
            if (result.role === 'client' && (!from || from.startsWith('/app'))) {
                navigate('/portal-cliente', { replace: true });
            } else if (result.role === 'admin' && (!from || from === '/portal-cliente')) {
                navigate('/app/dashboard', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="logo-bracket-l-top" style={{ border: '4px solid var(--brand-green)', borderBottom: 'none', height: '8px', width: '100%', maxWidth: '180px', margin: '0 auto 2px' }}></div>
                    <h1 style={{ fontSize: '3rem', margin: 0, letterSpacing: '-2px', color: 'var(--text-main)', fontWeight: 900, lineHeight: 0.8 }}>ARVI</h1>
                    <div className="logo-bracket-l-bottom" style={{ border: '4px solid var(--text-main)', borderTop: 'none', height: '8px', width: '100%', maxWidth: '180px', margin: '2px auto 0' }}></div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontWeight: 'bold' }}>Acceso Restringido</p>
                </div>

                <form onSubmit={handleLogin} style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-color)' }}>
                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Usuario</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                            <input
                                type="text"
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '1rem' }}
                                placeholder="Ej: admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                            <input
                                type="password"
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '1rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="primary" style={{ width: '100%' }}>
                        Iniciar Sesión
                    </Button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.85rem' }}>
                    &copy; 2026 ARVI Manteniments Integrals S.L.
                </p>
            </div>
        </div>
    );
};
