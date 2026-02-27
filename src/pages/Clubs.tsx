import React, { useState } from 'react';
import { CATEGORIES } from '../data/mockData';
import { Search } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Clubs: React.FC = () => {
    const { profile } = useAuth();
    const { clubs, loading, getUserJoinedClubs, getUserPendingRequests, submitJoinRequest, cancelJoinRequest, removeMember } = useData();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const joinedClubs = getUserJoinedClubs();
    const pendingRequests = getUserPendingRequests();

    const handleJoinRequest = async (clubId: string) => {
        if (!profile) { alert('Войдите в систему.'); return; }
        try {
            await submitJoinRequest(clubId);
            alert('Заявка отправлена! Ожидайте одобрения администратора.');
        } catch (error: unknown) {
            alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
        }
    };

    const handleCancelRequest = async (clubId: string) => {
        try { await cancelJoinRequest(clubId); }
        catch (error: unknown) { alert('Ошибка: ' + (error instanceof Error ? error.message : '')); }
    };

    const handleLeaveClub = async (clubId: string) => {
        if (!profile) return;
        if (!window.confirm('Вы уверены, что хотите покинуть клуб?')) return;
        try { await removeMember(clubId, profile.id); }
        catch (error: unknown) { alert('Ошибка: ' + (error instanceof Error ? error.message : '')); }
    };

    const filteredClubs = clubs.filter(club => {
        const matchesCategory = activeCategory === 'All' || club.category === activeCategory;
        const matchesSearch = club.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            club.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Каталог Клубов</h1>
                    <p className="text-secondary">Найдите свою нишу в стенах Чеченского Государственного Университета.</p>
                </div>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Поиск клубов..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }} />
                </div>
            </header>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {CATEGORIES.map(cat => (
                    <button key={cat} className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)} style={{ padding: '6px 16px', fontSize: '0.9rem' }}>{cat}</button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {loading ? <p style={{ color: 'var(--text-secondary)' }}>Загрузка клубов...</p> :
                    filteredClubs.map((club, i) => {
                        const isMember = joinedClubs[club.id];
                        const isPending = pendingRequests[club.id];
                        return (
                            <div key={club.id} className="glass-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)', fontWeight: 600 }}>{club.category}</span>
                                        <h3 style={{ fontSize: '1.3rem', marginTop: '0.2rem' }}>{club.name}</h3>
                                    </div>
                                    {isMember && <span style={{ fontSize: '0.7rem', background: 'var(--success)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>УЧАСТНИК</span>}
                                    {isPending && !isMember && <span style={{ fontSize: '0.7rem', background: 'var(--warning, #f59e0b)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>ЗАЯВКА</span>}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                                    {club.description && club.description.length > 120 ? `${club.description.substring(0, 120)}...` : club.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Осн. {club.established || 'Неизвестно'}</div>
                                    {isMember ? (
                                        <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => handleLeaveClub(club.id)}>Покинуть</button>
                                    ) : isPending ? (
                                        <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem', opacity: 0.8 }} onClick={() => handleCancelRequest(club.id)}>Отменить заявку</button>
                                    ) : (
                                        <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => handleJoinRequest(club.id)}>Подать заявку</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>

            {!loading && filteredClubs.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3>Клубы по вашему запросу не найдены.</h3>
                </div>
            )}
        </div>
    );
};

export default Clubs;
