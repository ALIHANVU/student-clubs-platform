/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type Notification = {
    id: string;
    type: 'event' | 'join_request' | 'request_approved' | 'request_rejected';
    title: string;
    message: string;
    date: string;
    read: boolean;
};

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllRead: () => void;
    refresh: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: () => { },
    markAllRead: () => { },
    refresh: () => { },
});

const isMockMode = () => !!localStorage.getItem('mock_auth_user');

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const readIdsRef = useRef<Set<string>>(new Set());

    const fetchNotifications = async () => {
        if (!profile) return;
        const notifs: Notification[] = [];
        const readIds = readIdsRef.current;

        if (isMockMode()) {
            // ---- DEMO MODE: read from localStorage ----
            const eventsRaw = localStorage.getItem('mock_events');
            const events = eventsRaw ? JSON.parse(eventsRaw) : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            events.forEach((e: any) => {
                notifs.push({
                    id: `event-${e.id}`,
                    type: 'event',
                    title: 'Новое мероприятие',
                    message: `${e.title} — ${e.clubs?.name || ''}`,
                    date: e.date || new Date().toISOString(),
                    read: readIds.has(`event-${e.id}`),
                });
            });

            // Admin: pending requests
            if (profile.role === 'admin') {
                const reqsRaw = localStorage.getItem('mock_join_requests');
                const reqs = reqsRaw ? JSON.parse(reqsRaw) : [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                reqs.filter((r: any) => r.status === 'pending').forEach((r: any) => {
                    notifs.push({
                        id: `req-${r.id}`,
                        type: 'join_request',
                        title: 'Заявка на вступление',
                        message: `${r.profiles?.full_name || 'Студент'} → ${r.clubs?.name || 'клуб'}`,
                        date: r.created_at || new Date().toISOString(),
                        read: readIds.has(`req-${r.id}`),
                    });
                });
            }

            // Student: request statuses
            if (profile.role === 'student') {
                const reqsRaw = localStorage.getItem('mock_join_requests');
                const reqs = reqsRaw ? JSON.parse(reqsRaw) : [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                reqs.filter((r: any) => r.user_id === profile.id && (r.status === 'approved' || r.status === 'rejected')).forEach((r: any) => {
                    const isApproved = r.status === 'approved';
                    notifs.push({
                        id: `mystatus-${r.id}`,
                        type: isApproved ? 'request_approved' : 'request_rejected',
                        title: isApproved ? 'Заявка одобрена ✅' : 'Заявка отклонена ❌',
                        message: r.clubs?.name || 'клуб',
                        date: r.created_at || new Date().toISOString(),
                        read: readIds.has(`mystatus-${r.id}`),
                    });
                });
            }

        } else {
            // ---- SUPABASE MODE ----
            // 1. Recent events (last 14 days)
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const { data: events } = await supabase
                .from('events')
                .select('id, title, date, clubs(name)')
                .gte('date', twoWeeksAgo.toISOString().split('T')[0])
                .order('date', { ascending: false })
                .limit(10);

            if (events) {
                events.forEach(e => {
                    notifs.push({
                        id: `event-${e.id}`,
                        type: 'event',
                        title: 'Новое мероприятие',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        message: `${e.title} — ${(e as any).clubs?.name || ''}`,
                        date: e.date,
                        read: readIds.has(`event-${e.id}`),
                    });
                });
            }

            // 2. Admin: pending join requests
            if (profile.role === 'admin') {
                const { data: requests } = await supabase
                    .from('join_requests')
                    .select('id, created_at, status, clubs(name), profiles(full_name)')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (requests) {
                    requests.forEach(r => {
                        notifs.push({
                            id: `req-${r.id}`,
                            type: 'join_request',
                            title: 'Заявка на вступление',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            message: `${(r as any).profiles?.full_name || 'Студент'} → ${(r as any).clubs?.name || 'клуб'}`,
                            date: r.created_at,
                            read: readIds.has(`req-${r.id}`),
                        });
                    });
                }
            }

            // 3. Student: request statuses
            if (profile.role === 'student') {
                const { data: myRequests } = await supabase
                    .from('join_requests')
                    .select('id, status, created_at, clubs(name)')
                    .eq('user_id', profile.id)
                    .in('status', ['approved', 'rejected'])
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (myRequests) {
                    myRequests.forEach(r => {
                        const isApproved = r.status === 'approved';
                        notifs.push({
                            id: `mystatus-${r.id}`,
                            type: isApproved ? 'request_approved' : 'request_rejected',
                            title: isApproved ? 'Заявка одобрена ✅' : 'Заявка отклонена ❌',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            message: (r as any).clubs?.name || 'клуб',
                            date: r.created_at,
                            read: readIds.has(`mystatus-${r.id}`),
                        });
                    });
                }
            }
        }

        setNotifications(notifs);
    };

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!profile) return;
            await fetchNotifications();
            if (cancelled) return;
        };
        run();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    const markAsRead = (id: string) => {
        readIdsRef.current.add(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        notifications.forEach(n => readIdsRef.current.add(n.id));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, refresh: fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
