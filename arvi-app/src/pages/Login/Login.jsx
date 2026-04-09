import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button/Button';
import { Lock, User, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import api from '../../services/api';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
    const [recoveryMessage, setRecoveryMessage] = useState('');
    const [recovering, setRecovering] = useState(false);
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

    const handlePasswordRecovery = async (e) => {
        e.preventDefault();
        setRecoveryMessage('');

        if (!recoveryIdentifier.trim()) {
            setRecoveryMessage('Indica tu usuario o email para recuperar la contrasena.');
            return;
        }

        try {
            setRecovering(true);
            const response = await api.forgotPassword(recoveryIdentifier.trim());
            setRecoveryMessage(response.message || 'Solicitud de recuperacion enviada.');
        } catch (recoveryError) {
            setRecoveryMessage(recoveryError.message || 'No se pudo enviar la solicitud.');
        } finally {
            setRecovering(false);
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
                                type={showPassword ? 'text' : 'password'}
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '1rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                style={{ position: 'absolute', right: '10px', top: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setShowRecovery(prev => !prev);
                                setRecoveryMessage('');
                            }}
                            style={{ marginTop: '0.75rem', border: 'none', background: 'transparent', color: 'var(--brand-green)', cursor: 'pointer', padding: 0, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <KeyRound size={16} /> Olvide mi contrasena
                        </button>
                    </div>

                    <Button type="submit" className="primary" style={{ width: '100%' }}>
                        Iniciar Sesión
                    </Button>

                    {showRecovery && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <form onSubmit={handlePasswordRecovery} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Recuperar contrasena (usuario o email)</label>
                                <input
                                    type="text"
                                    value={recoveryIdentifier}
                                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                                    placeholder="admin o admin@arvi.com"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                                />
                                <Button type="submit" className="secondary" disabled={recovering} style={{ width: '100%' }}>
                                    {recovering ? 'Enviando...' : 'Enviar solicitud'}
                                </Button>
                                {recoveryMessage && (
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{recoveryMessage}</p>
                                )}
                            </form>
                        </div>
                    )}
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.85rem' }}>
                    &copy; 2026 ARVI Manteniments Integrals S.L.
                </p>
            </div>
        </div>
    );
};
