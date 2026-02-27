import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Plus, Trash2, Calendar, Users as UsersIcon, LayoutDashboard, BarChart3, ClipboardCheck, Check, X, ShieldCheck, ShieldOff } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { refresh: refreshNotifications } = useNotifications();
    const { clubs, events, users, joinRequests, loading, createClub, deleteClub, createEvent, deleteEvent, fetchMembersForClub, addMember, removeMember, setMemberRole, approveRequest, rejectRequest, refresh } = useData();
    const [activeTab, setActiveTab] = useState<'stats' | 'clubs' | 'events' | 'members' | 'requests'>('stats');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [clubMembers, setClubMembers] = useState<any[]>([]);
    const [selectedClubId, setSelectedClubId] = useState<string>('');

    // Stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [memberCountPerClub, setMemberCountPerClub] = useState<any[]>([]);

    // Club Form
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');

    // Event Form
    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventClubId, setEventClubId] = useState('');

    // Member Form
    const [memberUserId, setMemberUserId] = useState('');

    // Compute stats when clubs change
    useEffect(() => {
        const computeStats = async () => {
            const stats = [];
            for (const c of clubs) {
                const members = await fetchMembersForClub(c.id);
                stats.push({ name: c.name, count: members.length });
            }
            setMemberCountPerClub(stats);
        };
        if (clubs.length > 0) computeStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clubs]);

    useEffect(() => {
        if (selectedClubId) {
            fetchMembersForClub(selectedClubId).then(setClubMembers);
        } else {
            setClubMembers([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClubId]);

    // --- Club Handlers ---
    const handleCreateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClub({
                name, category, description,
                image: image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop',
            });
            alert('Клуб успешно создан!');
            setName(''); setCategory(''); setDescription(''); setImage('');
        } catch (error: unknown) {
            alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
        }
    };

    const handleDeleteClub = async (id: string) => {
        if (!window.confirm('Удалить этот клуб?')) return;
        try { await deleteClub(id); } catch (e: unknown) { alert('Ошибка: ' + (e instanceof Error ? e.message : '')); }
    };

    // --- Event Handlers ---
    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventClubId) { alert('Выберите клуб'); return; }
        try {
            await createEvent({ club_id: eventClubId, title: eventTitle, date: eventDate, time: eventTime, location: eventLocation, description: eventDescription });
            alert('Мероприятие объявлено!');
            setEventTitle(''); setEventDate(''); setEventTime(''); setEventLocation(''); setEventDescription(''); setEventClubId('');
            refreshNotifications();
        } catch (error: unknown) {
            alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm('Удалить мероприятие?')) return;
        try { await deleteEvent(id); } catch (e: unknown) { alert('Ошибка: ' + (e instanceof Error ? e.message : '')); }
    };

    // --- Member Handlers ---
    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClubId || !memberUserId) return;
        try {
            await addMember(selectedClubId, memberUserId);
            alert('Участник добавлен!');
            setMemberUserId('');
            const m = await fetchMembersForClub(selectedClubId);
            setClubMembers(m);
        } catch (error: unknown) {
            alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
        }
    };

    const handleRemoveMember = async (clubId: string, userId: string) => {
        if (!window.confirm('Исключить участника?')) return;
        try {
            await removeMember(clubId, userId);
            const m = await fetchMembersForClub(selectedClubId);
            setClubMembers(m);
        } catch (e: unknown) { alert('Ошибка: ' + (e instanceof Error ? e.message : '')); }
    };

    const handleToggleRole = async (clubId: string, userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        try {
            await setMemberRole(clubId, userId, newRole);
            const m = await fetchMembersForClub(selectedClubId);
            setClubMembers(m);
            alert(newRole === 'admin' ? 'Назначен админом клуба!' : 'Права админа клуба сняты.');
        } catch (e: unknown) { alert('Ошибка: ' + (e instanceof Error ? e.message : '')); }
    };

    // --- Join Request Handlers ---
    const handleApproveRequest = async (reqId: string, clubId: string, userId: string) => {
        try { await approveRequest(reqId, clubId, userId); alert('Заявка одобрена!'); refreshNotifications(); refresh(); }
        catch (e: unknown) { alert('Ошибка: ' + (e instanceof Error ? e.message : '')); }
    };

    const handleRejectRequest = async (reqId: string) => {
        try { await rejectRequest(reqId); alert('Заявка отклонена.'); refreshNotifications(); refresh(); }
        catch (e: unknown) { alert('Ошибка: ' + (e instanceof Error ? e.message : '')); }
    };

    if (profile?.role !== 'admin') {
        return (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                <h2>Доступ запрещен</h2><p>Эта страница доступна только администраторам.</p>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontFamily: 'inherit' };
    const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' };
    const maxMembers = Math.max(...memberCountPerClub.map(c => c.count), 1);

    return (
        <div className="admin-dashboard animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* TAB BAR */}
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('stats')}>
                    <BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> Статистика
                </button>
                <button className={`btn ${activeTab === 'clubs' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('clubs')}>
                    <LayoutDashboard size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> Клубы
                </button>
                <button className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('events')}>
                    <Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> Мероприятия
                </button>
                <button className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('members')}>
                    <UsersIcon size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> Участники
                </button>
                <button className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('requests')} style={{ position: 'relative' }}>
                    <ClipboardCheck size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> Заявки
                    {joinRequests.length > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', minWidth: '20px', height: '20px', borderRadius: '50%', background: 'var(--danger, #ef4444)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{joinRequests.length}</span>}
                </button>
            </div>

            {loading && <p>Загрузка данных...</p>}

            {/* STATS */}
            {!loading && activeTab === 'stats' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Всего клубов</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{clubs.length}</div>
                        </div>
                        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center', animationDelay: '0.1s' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Мероприятия</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{events.length}</div>
                        </div>
                        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center', animationDelay: '0.2s' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Пользователи</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success, #22c55e)' }}>{users.length}</div>
                        </div>
                        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center', animationDelay: '0.3s' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Заявки (ожид.)</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning, #f59e0b)' }}>{joinRequests.length}</div>
                        </div>
                    </div>
                    <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Участники по клубам</h2>
                        {memberCountPerClub.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Нет данных.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {memberCountPerClub.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '140px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                        <div style={{ flex: 1, height: '28px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${(item.count / maxMembers) * 100}%`, background: 'var(--accent-gradient)', borderRadius: 'var(--radius-sm)', transition: 'width 0.6s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', minWidth: item.count > 0 ? '32px' : '0' }}>{item.count > 0 && item.count}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* CLUBS */}
            {!loading && activeTab === 'clubs' && (
                <>
                    <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={24} className="text-accent" /> Создать Новый Клуб</h2>
                        <form onSubmit={handleCreateClub} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div><label style={labelStyle}>Название</label><input type="text" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="Например: ФК ЧГУ" /></div>
                                <div><label style={labelStyle}>Категория</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} required style={inputStyle}>
                                        <option value="" disabled>Выберите...</option>
                                        <option value="Спорт">Спорт</option><option value="Технологии">Технологии</option>
                                        <option value="Рукоделие и Творчество">Творчество</option><option value="Академические и Социальные">Академические</option>
                                        <option value="Другое">Другое</option>
                                    </select>
                                </div>
                            </div>
                            <div><label style={labelStyle}>URI Фото (необязательно)</label><input type="text" value={image} onChange={e => setImage(e.target.value)} style={inputStyle} placeholder="https://..." /></div>
                            <div><label style={labelStyle}>Описание</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={inputStyle} placeholder="Коротко о клубе..." /></div>
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Создать клуб</button>
                        </form>
                    </div>
                    <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Список Клубов</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead><tr style={{ borderBottom: '1px solid var(--glass-border)' }}><th style={{ padding: '10px' }}>Название</th><th style={{ padding: '10px' }}>Категория</th><th style={{ padding: '10px' }}>Действия</th></tr></thead>
                            <tbody>
                                {clubs.length === 0 ? <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Клубов нет</td></tr> :
                                    clubs.map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '10px' }}>{c.name}</td>
                                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{c.category}</td>
                                            <td style={{ padding: '10px' }}><button className="icon-btn glass-panel" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteClub(c.id)} title="Удалить"><Trash2 size={18} /></button></td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* EVENTS */}
            {!loading && activeTab === 'events' && (
                <>
                    <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={24} className="text-accent" /> Объявить Мероприятие</h2>
                        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div><label style={labelStyle}>Название</label><input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required style={inputStyle} placeholder="Осеннее Дерби" /></div>
                                <div><label style={labelStyle}>Организатор</label>
                                    <select value={eventClubId} onChange={e => setEventClubId(e.target.value)} required style={inputStyle}>
                                        <option value="" disabled>Клуб...</option>
                                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div><label style={labelStyle}>Дата</label><input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required style={inputStyle} /></div>
                                <div><label style={labelStyle}>Время</label><input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} required style={inputStyle} /></div>
                            </div>
                            <div><label style={labelStyle}>Место</label><input type="text" value={eventLocation} onChange={e => setEventLocation(e.target.value)} required style={inputStyle} placeholder="Стадион..." /></div>
                            <div><label style={labelStyle}>Описание</label><textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)} rows={3} style={inputStyle} placeholder="Детали..." /></div>
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Объявить</button>
                        </form>
                    </div>
                    <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Список Мероприятий</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead><tr style={{ borderBottom: '1px solid var(--glass-border)' }}><th style={{ padding: '10px' }}>Дата</th><th style={{ padding: '10px' }}>Название</th><th style={{ padding: '10px' }}>Клуб</th><th style={{ padding: '10px' }}>Действия</th></tr></thead>
                            <tbody>
                                {events.length === 0 ? <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Нет мероприятий</td></tr> :
                                    events.map(e => (
                                        <tr key={e.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{new Date(e.date).toLocaleDateString('ru-RU')} {e.time}</td>
                                            <td style={{ padding: '10px' }}>{e.title}</td>
                                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{e.clubs?.name}</td>
                                            <td style={{ padding: '10px' }}><button className="icon-btn glass-panel" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteEvent(e.id)} title="Удалить"><Trash2 size={18} /></button></td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* MEMBERS */}
            {!loading && activeTab === 'members' && (
                <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Управление Участниками</h2>
                    <div style={{ marginBottom: '1.5rem' }}><label style={labelStyle}>Выберите клуб:</label>
                        <select value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)} style={{ ...inputStyle, maxWidth: '400px' }}>
                            <option value="" disabled>-- Клуб --</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    {selectedClubId && (
                        <>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Добавить участника</h3>
                                <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}><label style={labelStyle}>Пользователь</label>
                                        <select value={memberUserId} onChange={e => setMemberUserId(e.target.value)} required style={inputStyle}>
                                            <option value="" disabled>-- Пользователь --</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.role})</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Добавить</button>
                                </form>
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Состав клуба</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead><tr style={{ borderBottom: '1px solid var(--glass-border)' }}><th style={{ padding: '10px' }}>Имя</th><th style={{ padding: '10px' }}>Email</th><th style={{ padding: '10px' }}>Роль</th><th style={{ padding: '10px' }}>Действия</th></tr></thead>
                                <tbody>
                                    {clubMembers.length === 0 ? <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Нет участников</td></tr> :
                                        clubMembers.map(m => (
                                            <tr key={m.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '10px' }}>{m.profiles?.full_name || 'Без имени'}</td>
                                                <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{m.profiles?.email}</td>
                                                <td style={{ padding: '10px' }}>
                                                    {m.role === 'admin' ? (
                                                        <span style={{ fontSize: '0.75rem', background: 'var(--accent-primary)', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>Админ клуба</span>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Участник</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px', display: 'flex', gap: '0.5rem' }}>
                                                    <button className="icon-btn glass-panel" style={{ color: m.role === 'admin' ? 'var(--warning)' : 'var(--accent-primary)' }} onClick={() => handleToggleRole(m.club_id, m.user_id, m.role)} title={m.role === 'admin' ? 'Снять админа' : 'Назначить админом'}>
                                                        {m.role === 'admin' ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}
                                                    </button>
                                                    <button className="icon-btn glass-panel" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveMember(m.club_id, m.user_id)} title="Исключить"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* REQUESTS */}
            {!loading && activeTab === 'requests' && (
                <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Заявки на Вступление</h2>
                    {joinRequests.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Нет ожидающих заявок 🎉</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead><tr style={{ borderBottom: '1px solid var(--glass-border)' }}><th style={{ padding: '10px' }}>Студент</th><th style={{ padding: '10px' }}>Email</th><th style={{ padding: '10px' }}>Клуб</th><th style={{ padding: '10px' }}>Дата</th><th style={{ padding: '10px' }}>Действия</th></tr></thead>
                            <tbody>
                                {joinRequests.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '10px' }}>{r.profiles?.full_name || 'Без имени'}</td>
                                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{r.profiles?.email}</td>
                                        <td style={{ padding: '10px' }}>{r.clubs?.name}</td>
                                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleDateString('ru-RU')}</td>
                                        <td style={{ padding: '10px', display: 'flex', gap: '0.5rem' }}>
                                            <button className="icon-btn glass-panel" style={{ color: 'var(--success, #22c55e)' }} onClick={() => handleApproveRequest(r.id, r.club_id, r.user_id)} title="Одобрить"><Check size={18} /></button>
                                            <button className="icon-btn glass-panel" style={{ color: 'var(--danger)' }} onClick={() => handleRejectRequest(r.id)} title="Отклонить"><X size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
