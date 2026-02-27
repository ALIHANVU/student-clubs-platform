import React, { useEffect, useState } from 'react';
import './Home.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useData } from '../contexts/DataContext';
import { supabase } from '../lib/supabase';

const isMockMode = () => !!localStorage.getItem('mock_auth_user');

const Home: React.FC = () => {
    const { profile } = useAuth();
    const { unreadCount } = useNotifications();
    const { events } = useData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [userClubs, setUserClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Upcoming events (next 3 by date)
    const now = new Date().toISOString().split('T')[0];
    const upcomingEvents = events
        .filter(e => e.date >= now)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!profile?.id) { setLoading(false); return; }

            if (isMockMode()) {
                // In demo mode, get clubs from localStorage memberships
                const membersRaw = localStorage.getItem('mock_members');
                const clubsRaw = localStorage.getItem('mock_clubs');
                const members = membersRaw ? JSON.parse(membersRaw) : [];
                const allClubs = clubsRaw ? JSON.parse(clubsRaw) : [];
                const myClubIds = members.filter((m: { user_id: string }) => m.user_id === profile.id).map((m: { club_id: string }) => m.club_id);
                setUserClubs(allClubs.filter((c: { id: string }) => myClubIds.includes(c.id)));
            } else {
                // Real Supabase mode
                const { data } = await supabase
                    .from('club_members')
                    .select('clubs(*)')
                    .eq('user_id', profile.id);
                if (data) {
                    const clubs = data.map(item => item.clubs).filter(Boolean);
                    setUserClubs(clubs);
                }
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, [profile]);

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <h1>Главная Панель</h1>
                <p className="text-secondary">Добро пожаловать в центр студенческой жизни Чеченского Государственного Университета!</p>
            </header>

            <div className="dashboard-grid">
                <div className="glass-card stat-section animate-delay-1">
                    <h3>Мои Клубы</h3>
                    <div className="stat-value">{userClubs.length}</div>
                </div>

                <div className="glass-card stat-section animate-delay-2">
                    <h3>Ближайшие Ивенты</h3>
                    <div className="stat-value text-accent">{upcomingEvents.length}</div>
                </div>

                <div className="glass-card stat-section animate-delay-3">
                    <h3>Уведомления</h3>
                    <div className="stat-value text-success">{unreadCount}</div>
                </div>
            </div>

            <div className="dashboard-content">
                <section className="dashboard-main glass-panel animate-delay-2" style={{ padding: '2rem' }}>
                    <div className="section-header">
                        <h2 className="section-title">В которых я состою</h2>
                        <NavLink to="/clubs" className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>Все Клубы</NavLink>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? <p style={{ color: 'var(--text-secondary)' }}>Загрузка...</p> :
                            userClubs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Вы еще не состоите ни в одном клубе.</p> :
                                userClubs.map((club: { id: string; name: string; category: string }) => (
                                    <div key={club.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{club.name}</h4>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{club.category}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                                            Участник
                                        </div>
                                    </div>
                                ))}
                    </div>
                </section>

                <section className="dashboard-sidebar glass-panel animate-delay-3" style={{ padding: '2rem' }}>
                    <div className="section-header">
                        <h2 className="section-title">Следующее Событие</h2>
                    </div>

                    {upcomingEvents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--accent-gradient)', borderRadius: 'var(--radius-md)', color: 'white', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500 }}>{new Date(upcomingEvents[0].date).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' })} в {upcomingEvents[0].time}</div>
                                <h3 style={{ fontSize: '1.2rem', lineHeight: 1.3 }}>{upcomingEvents[0].title}</h3>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{upcomingEvents[0].clubs?.name}</div>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Пока нет ближайших событий.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;
