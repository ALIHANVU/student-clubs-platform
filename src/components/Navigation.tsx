import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Trophy, LogOut, ShieldAlert, Bell, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useData } from '../contexts/DataContext';
import './Navigation.css';

const Navigation: React.FC = () => {
    const { profile, signOut } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
    const { getMyManagedClubs } = useData();
    const managedClubs = getMyManagedClubs();
    const [showNotifs, setShowNotifs] = useState(false);
    const panelRef = useRef<HTMLLIElement>(null);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon"></div>
                    <h2 style={{ fontSize: '1.2rem' }}>СтудКлубы ЧГУ</h2>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <LayoutDashboard size={20} />
                            <span>Главная</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/clubs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Users size={20} />
                            <span>Все Клубы</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Calendar size={20} />
                            <span>Расписание</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Trophy size={20} />
                            <span>Мероприятия</span>
                        </NavLink>
                    </li>

                    {/* Мой Клуб — for club admins */}
                    {managedClubs.length > 0 && (
                        <li>
                            <NavLink to="/manage-club" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <Settings size={20} />
                                <span>Мой Клуб</span>
                            </NavLink>
                        </li>
                    )}

                    {/* Notification Bell */}
                    <li style={{ position: 'relative' }} ref={panelRef}>
                        <button
                            className="nav-item notif-bell-btn"
                            onClick={() => setShowNotifs(prev => !prev)}
                            style={{ cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left' }}
                        >
                            <Bell size={20} />
                            <span>Уведомления</span>
                            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                        </button>

                        {showNotifs && (
                            <div className="notif-dropdown glass-card">
                                <div className="notif-dropdown-header">
                                    <strong>Уведомления</strong>
                                    {unreadCount > 0 && (
                                        <button className="notif-mark-all" onClick={markAllRead}>Прочитать все</button>
                                    )}
                                </div>
                                <div className="notif-dropdown-list">
                                    {notifications.length === 0 ? (
                                        <div className="notif-empty">Нет уведомлений</div>
                                    ) : notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`notif-item ${!n.read ? 'notif-unread' : ''}`}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <div className="notif-item-title">{n.title}</div>
                                            <div className="notif-item-msg">{n.message}</div>
                                            <div className="notif-item-date">{new Date(n.date).toLocaleDateString('ru-RU')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                {profile?.role === 'admin' && (
                    <NavLink to="/admin" className="nav-item" style={({ isActive }) => ({ marginBottom: '0.5rem', color: isActive ? 'var(--bg-primary)' : 'var(--accent-primary)', backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent' })}>
                        <ShieldAlert size={20} />
                        <span>Админ Панель</span>
                    </NavLink>
                )}
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {profile?.full_name || 'Студент ЧГУ'}
                </div>
                <button className="nav-item" onClick={signOut}>
                    <LogOut size={20} />
                    <span>Выйти</span>
                </button>
            </div>
        </aside>
    );
};

export default Navigation;
