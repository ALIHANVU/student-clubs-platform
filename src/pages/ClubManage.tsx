import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import type { Member } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, Trash2, ShieldCheck, ShieldOff, Plus, UserPlus } from 'lucide-react';

const ClubManage: React.FC = () => {
    const { profile } = useAuth();
    const {
        clubs, events, members, loading,
        getMyManagedClubs, fetchMembersForClub,
        removeMember, setMemberRole,
        createEvent, deleteEvent,
        approveRequest, rejectRequest,
        joinRequests,
    } = useData();

    const managedClubs = getMyManagedClubs();
    const [selectedClubId, setSelectedClubId] = useState<string>('');
    const [clubMembers, setClubMembers] = useState<Member[]>([]);
    const [activeTab, setActiveTab] = useState<'members' | 'events' | 'requests'>('members');

    // Event form
    const [evTitle, setEvTitle] = useState('');
    const [evDate, setEvDate] = useState('');
    const [evTime, setEvTime] = useState('');
    const [evLocation, setEvLocation] = useState('');
    const [evDesc, setEvDesc] = useState('');

    // Auto-select first club
    useEffect(() => {
        if (managedClubs.length > 0 && !selectedClubId) {
            setSelectedClubId(managedClubs[0].id);
        }
    }, [managedClubs, selectedClubId]);

    // Reload members when club changes
    useEffect(() => {
        if (!selectedClubId) return;
        fetchMembersForClub(selectedClubId).then(setClubMembers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClubId, members]);

    const selectedClub = clubs.find(c => c.id === selectedClubId);
    const clubEvents = events.filter(e => e.club_id === selectedClubId);
    const clubRequests = joinRequests.filter(r => r.club_id === selectedClubId);

    const handleToggleAdmin = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        await setMemberRole(selectedClubId, userId, newRole);
    };

    const handleKick = async (userId: string) => {
        if (!window.confirm('Вы уверены, что хотите исключить участника?')) return;
        await removeMember(selectedClubId, userId);
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!evTitle || !evDate || !evTime) return alert('Заполните название, дату и время.');
        await createEvent({ club_id: selectedClubId, title: evTitle, date: evDate, time: evTime, location: evLocation, description: evDesc });
        setEvTitle(''); setEvDate(''); setEvTime(''); setEvLocation(''); setEvDesc('');
        alert('Мероприятие создано!');
    };

    if (loading) return <div className="page-container animate-fade-in"><p>Загрузка...</p></div>;

    if (managedClubs.length === 0) {
        return (
            <div className="page-container animate-fade-in">
                <header className="page-header">
                    <h1>Управление Клубом</h1>
                    <p className="text-secondary">У вас нет клубов для управления. Администратор должен назначить вас админом клуба.</p>
                </header>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
        color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
        fontSize: '16px',
    };

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Управление Клубом</h1>
                    <p className="text-secondary">Управляйте участниками и мероприятиями вашего клуба.</p>
                </div>

                {managedClubs.length > 1 && (
                    <select
                        value={selectedClubId}
                        onChange={e => setSelectedClubId(e.target.value)}
                        style={{ ...inputStyle, maxWidth: '260px' }}
                    >
                        {managedClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                )}
            </header>

            {/* Club Info */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--accent-gradient)', borderRadius: 'var(--radius-md)', flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.4rem' }}>{selectedClub?.name}</h2>
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{selectedClub?.category} • {selectedClub?.description?.substring(0, 80)}{(selectedClub?.description?.length || 0) > 80 ? '...' : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{clubMembers.length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Участников</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)' }}>{clubEvents.length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ивентов</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                    { key: 'members' as const, label: 'Участники', icon: <Users size={16} /> },
                    { key: 'events' as const, label: 'Мероприятия', icon: <Calendar size={16} /> },
                    { key: 'requests' as const, label: `Заявки (${clubRequests.length})`, icon: <UserPlus size={16} /> },
                ].map(t => (
                    <button
                        key={t.key}
                        className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab(t.key)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            {/* Members Tab */}
            {activeTab === 'members' && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Участники Клуба</h3>
                    {clubMembers.length === 0 ? (
                        <p className="text-secondary">Нет участников.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {clubMembers.map(m => (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: m.role === 'admin' ? 'var(--accent-gradient)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                                            {(m.profiles?.full_name || '?')[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{m.profiles?.full_name || 'Неизвестный'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {m.profiles?.email}
                                                {m.role === 'admin' && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--accent-primary)', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>Админ клуба</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {/* Only global admin or club admin (not themselves) can toggle admin */}
                                        {profile?.role === 'admin' && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleToggleAdmin(m.user_id, m.role)}
                                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                                title={m.role === 'admin' ? 'Снять права админа' : 'Назначить админом'}
                                            >
                                                {m.role === 'admin' ? <><ShieldOff size={14} /> Снять</> : <><ShieldCheck size={14} /> Админ</>}
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleKick(m.user_id)}
                                            style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--danger)' }}
                                        >
                                            <Trash2 size={14} /> Исключить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Create Event Form */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18} /> Создать Мероприятие</h3>
                        <form onSubmit={handleCreateEvent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Название</label>
                                <input style={inputStyle} value={evTitle} onChange={e => setEvTitle(e.target.value)} placeholder="Тренировка / Хакатон" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Дата</label>
                                <input type="date" style={inputStyle} value={evDate} onChange={e => setEvDate(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Время</label>
                                <input type="time" style={inputStyle} value={evTime} onChange={e => setEvTime(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Место</label>
                                <input style={inputStyle} value={evLocation} onChange={e => setEvLocation(e.target.value)} placeholder="Аудитория / Стадион" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Описание</label>
                                <textarea style={{ ...inputStyle, minHeight: '60px' }} value={evDesc} onChange={e => setEvDesc(e.target.value)} placeholder="Подробности..." />
                            </div>
                            <div><button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Создать</button></div>
                        </form>
                    </div>

                    {/* Events List */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Мероприятия ({clubEvents.length})</h3>
                        {clubEvents.length === 0 ? <p className="text-secondary">Нет мероприятий</p> :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {clubEvents.map(ev => (
                                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{ev.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(ev.date).toLocaleDateString('ru-RU')} в {ev.time} • {ev.location}</div>
                                        </div>
                                        <button className="btn btn-secondary" onClick={() => deleteEvent(ev.id)} style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--danger)' }}>
                                            <Trash2 size={14} /> Удалить
                                        </button>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Заявки на вступление</h3>
                    {clubRequests.length === 0 ? <p className="text-secondary">Нет ожидающих заявок</p> :
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {clubRequests.map(req => (
                                <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{req.profiles?.full_name || 'Студент'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.profiles?.email} • {new Date(req.created_at).toLocaleDateString('ru-RU')}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-primary" onClick={() => approveRequest(req.id, req.club_id, req.user_id)} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Принять</button>
                                        <button className="btn btn-secondary" onClick={() => rejectRequest(req.id)} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Отклонить</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            )}

            {/* Info block about user roles */}
            {profile?.role !== 'admin' && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                    ℹ️ Вы можете управлять участниками и мероприятиями клуба. Только глобальный администратор может назначать новых админов клубов.
                </div>
            )}
        </div>
    );
};

export default ClubManage;
