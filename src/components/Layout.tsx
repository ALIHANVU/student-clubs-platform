import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import './Layout.css';

const Layout: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="app-layout">
            <Navigation />

            {/* Global Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '30px',
                    zIndex: 1000,
                    padding: '12px',
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--glass-shadow)',
                    transition: 'all var(--transition-normal)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'var(--glass-bg)';
                }}
            >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
