import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, LogOut, ShieldAlert, Bell, Settings, Calendar, MoreHorizontal, X } from 'lucide-react';
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
    const [showMore, setShowMore] = useState(false);
    const panelRef = useRef<HTMLLIElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close panels on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close menus when navigating
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setShowMore(false); setShowNotifs(false); }, [location.pathname]);

    const moreIsActive = ['/schedule', '/manage-club', '/admin'].includes(location.pathname);

    return (
        <aside className="sidebar glass-panel">
            {/* ========== DESKTOP SIDEBAR ========== */}
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon"></div>
                    <h2 style={{ fontSize: '1.2rem' }}>СтудКлубы ЧГУ</h2>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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
                    <li className="desktop-only">
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

                    {/* Desktop: Мой Клуб */}
                    {managedClubs.length > 0 && (
                        <li className="desktop-only">
                            <NavLink to="/manage-club" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <Settings size={20} />
                                <span>Мой Клуб</span>
                            </NavLink>
                        </li>
                    )}

                    {/* Desktop: Notification Bell */}
                    <li style={{ position: 'relative' }} ref={panelRef} className="desktop-only">
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

                    {/* ========== MOBILE: "Ещё" tab ========== */}
                    <li className="mobile-only mobile-more-tab">
                        <button
                            className={`nav-item ${moreIsActive || showMore ? 'active' : ''}`}
                            onClick={() => { setShowMore(prev => !prev); setShowNotifs(false); }}
                        >
                            {unreadCount > 0 && <span className="more-notif-dot"></span>}
                            <MoreHorizontal size={20} />
                            <span>Ещё</span>
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Desktop footer */}
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

            {/* ========== MOBILE: "Ещё" Bottom Sheet ========== */}
            {showMore && (
                <>
                    <div className="mobile-overlay" onClick={() => setShowMore(false)}></div>
                    <div className="mobile-more-sheet">
                        <div className="more-sheet-handle"></div>
                        <div className="more-sheet-header">
                            <span className="more-sheet-title">Меню</span>
                            <button className="more-sheet-close" onClick={() => setShowMore(false)}><X size={20} /></button>
                        </div>

                        {/* User card */}
                        <div className="more-sheet-user">
                            <div className="more-user-avatar">{(profile?.full_name || 'С')[0]}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{profile?.full_name || 'Студент ЧГУ'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{profile?.email}</div>
                            </div>
                        </div>

                        <div className="more-sheet-items">
                            <button className="more-sheet-item" onClick={() => navigate('/schedule')}>
                                <Calendar size={20} /> <span>Расписание</span>
                            </button>

                            {/* Notifications */}
                            <button className="more-sheet-item" onClick={() => { setShowMore(false); setShowNotifs(true); }}>
                                <Bell size={20} />
                                <span>Уведомления</span>
                                {unreadCount > 0 && <span className="more-sheet-badge">{unreadCount}</span>}
                            </button>

                            {managedClubs.length > 0 && (
                                <button className="more-sheet-item" onClick={() => navigate('/manage-club')}>
                                    <Settings size={20} /> <span>Мой Клуб</span>
                                </button>
                            )}

                            {profile?.role === 'admin' && (
                                <button className="more-sheet-item" onClick={() => navigate('/admin')}>
                                    <ShieldAlert size={20} /> <span>Админ Панель</span>
                                </button>
                            )}

                            <div className="more-sheet-divider"></div>

                            <button className="more-sheet-item more-sheet-logout" onClick={signOut}>
                                <LogOut size={20} /> <span>Выйти</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ========== MOBILE: Notif panel (triggered from "Ещё") ========== */}
            {showNotifs && (
                <div className="mobile-only">
                    <div className="mobile-overlay" onClick={() => setShowNotifs(false)}></div>
                    <div className="mobile-notif-sheet">
                        <div className="more-sheet-handle"></div>
                        <div className="more-sheet-header">
                            <strong>Уведомления</strong>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {unreadCount > 0 && <button className="notif-mark-all" onClick={markAllRead}>Прочитать все</button>}
                                <button className="more-sheet-close" onClick={() => setShowNotifs(false)}><X size={20} /></button>
                            </div>
                        </div>
                        <div className="notif-dropdown-list" style={{ maxHeight: '60vh' }}>
                            {notifications.length === 0 ? (
                                <div className="notif-empty">Нет уведомлений 🎉</div>
                            ) : notifications.map(n => (
                                <div key={n.id} className={`notif-item ${!n.read ? 'notif-unread' : ''}`} onClick={() => markAsRead(n.id)}>
                                    <div className="notif-item-title">{n.title}</div>
                                    <div className="notif-item-msg">{n.message}</div>
                                    <div className="notif-item-date">{new Date(n.date).toLocaleDateString('ru-RU')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Navigation;
