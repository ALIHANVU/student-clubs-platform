import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // Mock Fallback if using placeholder keys
            const isMock = import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' || !import.meta.env.VITE_SUPABASE_URL;

            if (isMock) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Demo logic: login with 'admin' or anything else as student
                const role = email.includes('admin') ? 'admin' : 'student';
                const mockProfile = { id: 'mock-1', email, full_name: fullName || 'Demo Студент', role };

                // Save mock state to local storage
                localStorage.setItem('mock_auth_user', JSON.stringify(mockProfile));

                // Dispatch event to force AuthContext update
                window.dispatchEvent(new Event('mock-auth-changed'));

                if (!isLogin) {
                    alert('Регистрация в Демо-режиме успешна! Сейчас вы войдете.');
                }
                navigate('/');
                return;
            }

            // Real Supabase Auth
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                alert('Регистрация успешна! Теперь вы можете войти.');
                setIsLogin(true);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setErrorMsg(error.message || 'Произошла ошибка при авторизации.');
            } else {
                setErrorMsg('Произошла ошибка при авторизации.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="logo-icon" style={{ margin: '0 auto 1rem auto', width: '48px', height: '48px' }}></div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>СтудКлубы ЧГУ</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {isLogin ? 'С возвращением! Войдите в свой аккаунт.' : 'Присоединяйтесь к студенческой жизни ЧГУ.'}
                    </p>

                    {(!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') && (
                        <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
                            <strong>Включен Временный Демо-Режим</strong><br />
                            Поскольку ключи БД не заданы, вы можете войти с любыми данными. Введите email с текстом "admin", чтобы получить права Администратора.
                        </div>
                    )}
                </div>

                {errorMsg && (
                    <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Имя и Фамилия</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                                    color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit'
                                }}
                                placeholder="Иван Иванов"
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Университетская почта (Email)</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                                color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit'
                            }}
                            placeholder="student@chgu.edu.ru"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Пароль</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                                color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '12px' }} disabled={loading}>
                        {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {isLogin ? 'Еще нет аккаунта? ' : 'Уже есть аккаунт? '}
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, padding: 0 }}
                    >
                        {isLogin ? 'Создать' : 'Войти'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            // Simulate fast login
                            await new Promise(resolve => setTimeout(resolve, 300));
                            const mockProfile = { id: 'mock-1', email: 'student@chgu.edu.ru', full_name: 'Демо Студент', role: 'student' };
                            localStorage.setItem('mock_auth_user', JSON.stringify(mockProfile));
                            window.dispatchEvent(new Event('mock-auth-changed'));
                            window.location.href = '/';
                        }}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.85rem',
                            fontWeight: 500
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    >
                        👨‍🎓 Студент (Демо)
                    </button>
                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            // Simulate fast login
                            await new Promise(resolve => setTimeout(resolve, 300));
                            const mockProfile = { id: 'mock-2', email: 'admin@chgu.edu.ru', full_name: 'Демо Админ', role: 'admin' };
                            localStorage.setItem('mock_auth_user', JSON.stringify(mockProfile));
                            window.dispatchEvent(new Event('mock-auth-changed'));
                            window.location.href = '/';
                        }}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.85rem',
                            fontWeight: 500
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    >
                        👑 Админ (Демо)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
