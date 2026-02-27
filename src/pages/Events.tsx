import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Calendar, MapPin, Users } from 'lucide-react';

const Events: React.FC = () => {
    const { user } = useAuth();
    const { events, loading, getUserRegisteredEvents, registerForEvent, unregisterFromEvent } = useData();
    const registeredEvents = getUserRegisteredEvents();

    const toggleRegistration = async (eventId: string, isRegistered: boolean) => {
        if (!user) {
            alert('Сначала войдите в систему, чтобы регистрироваться на мероприятия.');
            return;
        }

        try {
            if (isRegistered) {
                await unregisterFromEvent(eventId);
            } else {
                await registerForEvent(eventId);
            }
        } catch (error: unknown) {
            alert('Ошибка: ' + (error instanceof Error ? error.message : ''));
        }
    };

    if (loading) {
        return (
            <div className="page-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <p>Загрузка мероприятий...</p>
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <h1>Ближайшие Мероприятия</h1>
                <p className="text-secondary">Специальные события, организованные клубами ЧГУ.</p>
            </header>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {events.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>Пока нет запланированных мероприятий. Загляните позже!</p>
                    </div>
                ) : events.map((event, i) => {
                    const isRegistered = !!registeredEvents[event.id];

                    return (
                        <div key={event.id} className="glass-panel animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>

                            <div style={{ minWidth: '100px', textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 600 }}>
                                    {new Date(event.date).toLocaleDateString('ru-RU', { month: 'short' })}
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                                    {new Date(event.date).getDate()}
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{event.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', maxWidth: '800px' }}>{event.description}</p>

                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {event.time}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {event.location}</span>
                                    {event.clubs?.name && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> {event.clubs.name}</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    className={isRegistered ? 'btn btn-secondary' : 'btn btn-primary'}
                                    onClick={() => toggleRegistration(event.id, isRegistered)}
                                >
                                    {isRegistered ? 'Зарегистрирован ✓' : 'Зарегистрироваться'}
                                </button>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Events;
