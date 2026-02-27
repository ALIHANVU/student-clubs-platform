import React from 'react';
import { SCHEDULE } from '../data/mockData';
import { Clock } from 'lucide-react';

const Schedule: React.FC = () => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <h1>Мое Расписание</h1>
                <p className="text-secondary">Учебные и клубные встречи ЧГУ на неделю.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {days.map((day, i) => {
                    const dayEvents = SCHEDULE.filter(s => s.day === day);

                    if (dayEvents.length === 0) return null;

                    return (
                        <div key={day} className="glass-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                {day}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {dayEvents.map(event => (
                                    <div key={event.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <h4 style={{ fontSize: '1rem' }}>{event.title}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <Clock size={14} /> {event.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Schedule;
