/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { CLUBS, EVENTS } from '../data/mockData';

// ---- Types ----
export type Club = { id: string; name: string; category: string; description: string; established?: number; image?: string; created_by?: string };
export type EventItem = { id: string; club_id: string; title: string; description?: string; date: string; time: string; location?: string; clubs?: { name: string } };
export type Member = { id: string; club_id: string; user_id: string; role: string; profiles?: { full_name?: string; email?: string } };
export type JoinRequest = { id: string; club_id: string; user_id: string; status: string; created_at: string; clubs?: { name: string }; profiles?: { full_name?: string; email?: string } };
export type Profile = { id: string; email: string; full_name: string; role: string };

type DataContextType = {
    clubs: Club[];
    events: EventItem[];
    members: Member[];
    joinRequests: JoinRequest[];
    users: Profile[];
    loading: boolean;
    // Club operations
    createClub: (club: Omit<Club, 'id'>) => Promise<void>;
    deleteClub: (id: string) => Promise<void>;
    // Event operations
    createEvent: (event: Omit<EventItem, 'id' | 'clubs'>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    // Member operations
    fetchMembersForClub: (clubId: string) => Promise<Member[]>;
    addMember: (clubId: string, userId: string) => Promise<void>;
    removeMember: (clubId: string, userId: string) => Promise<void>;
    setMemberRole: (clubId: string, userId: string, role: string) => Promise<void>;
    // Join request operations
    submitJoinRequest: (clubId: string) => Promise<void>;
    cancelJoinRequest: (clubId: string) => Promise<void>;
    approveRequest: (reqId: string, clubId: string, userId: string) => Promise<void>;
    rejectRequest: (reqId: string) => Promise<void>;
    getUserJoinedClubs: () => Record<string, boolean>;
    getUserPendingRequests: () => Record<string, boolean>;
    // Event registration
    registerForEvent: (eventId: string) => Promise<void>;
    unregisterFromEvent: (eventId: string) => Promise<void>;
    getUserRegisteredEvents: () => Record<string, boolean>;
    // Club admin helpers
    getMyManagedClubs: () => Club[];
    // Refresh
    refresh: () => void;
};

const DataContext = createContext<DataContextType>({} as DataContextType);

// ---- Helpers ----
const isMockMode = () => !!localStorage.getItem('mock_auth_user');
const getMockUser = (): Profile | null => {
    const s = localStorage.getItem('mock_auth_user');
    return s ? JSON.parse(s) : null;
};

const LS_CLUBS = 'mock_clubs';
const LS_EVENTS = 'mock_events';
const LS_MEMBERS = 'mock_members';
const LS_REQUESTS = 'mock_join_requests';
const LS_EVENT_REGS = 'mock_event_registrations';

function lsGet<T>(key: string, fallback: T[]): T[] {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
}
function lsSet<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
}
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Seed mock data on first run
function seedMockData() {
    if (!localStorage.getItem(LS_CLUBS)) {
        const clubs: Club[] = CLUBS.map(c => ({
            id: c.id, name: c.name, category: c.category,
            description: c.description, established: c.established, image: c.image,
        }));
        lsSet(LS_CLUBS, clubs);
    }
    if (!localStorage.getItem(LS_EVENTS)) {
        const events: EventItem[] = EVENTS.map(e => ({
            id: e.id, club_id: e.clubId, title: e.title, description: e.description,
            date: e.date, time: e.time, location: e.location,
            clubs: { name: e.clubName },
        }));
        lsSet(LS_EVENTS, events);
    }
    if (!localStorage.getItem(LS_MEMBERS)) lsSet(LS_MEMBERS, []);
    if (!localStorage.getItem(LS_REQUESTS)) lsSet(LS_REQUESTS, []);
    if (!localStorage.getItem(LS_EVENT_REGS)) lsSet(LS_EVENT_REGS, []);
}

// ---- Provider ----
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile } = useAuth();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});
    const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
    const [eventRegs, setEventRegs] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    const loadAll = useCallback(async () => {
        setLoading(true);

        if (isMockMode()) {
            seedMockData();
            const user = getMockUser();
            setClubs(lsGet<Club>(LS_CLUBS, []));
            const evts = lsGet<EventItem>(LS_EVENTS, []);
            setEvents(evts);
            setUsers([
                { id: 'admin-001', email: 'admin@chgu.ru', full_name: 'Демо Админ', role: 'admin' },
                { id: 'student-001', email: 'student@chgu.ru', full_name: 'Демо Студент', role: 'student' },
            ]);

            // Members
            const allMembers = lsGet<Member>(LS_MEMBERS, []);
            setMembers(allMembers);
            if (user) {
                const jm: Record<string, boolean> = {};
                allMembers.filter(m => m.user_id === user.id).forEach(m => { jm[m.club_id] = true; });
                setJoinedMap(jm);
            }

            // Join requests
            const allReqs = lsGet<JoinRequest>(LS_REQUESTS, []);
            const pendingReqs = allReqs.filter(r => r.status === 'pending');
            setJoinRequests(pendingReqs);
            if (user) {
                const pm: Record<string, boolean> = {};
                pendingReqs.filter(r => r.user_id === user.id).forEach(r => { pm[r.club_id] = true; });
                setPendingMap(pm);
            }

            // Event registrations
            const regs = lsGet<{ event_id: string; user_id: string }>(LS_EVENT_REGS, []);
            if (user) {
                const er: Record<string, boolean> = {};
                regs.filter(r => r.user_id === user.id).forEach(r => { er[r.event_id] = true; });
                setEventRegs(er);
            }
        } else {
            // ---- SUPABASE MODE ----
            const { data: clubsData } = await supabase.from('clubs').select('*').order('name');
            if (clubsData) setClubs(clubsData);

            const { data: eventsData } = await supabase.from('events').select('*, clubs(name)').order('date');
            if (eventsData) setEvents(eventsData);

            const { data: usersData } = await supabase.from('profiles').select('*').order('full_name');
            if (usersData) setUsers(usersData);

            if (profile?.id) {
                const { data: mData } = await supabase.from('club_members').select('club_id').eq('user_id', profile.id);
                if (mData) {
                    const jm: Record<string, boolean> = {};
                    mData.forEach(m => { jm[m.club_id] = true; });
                    setJoinedMap(jm);
                }
                const { data: rData } = await supabase.from('join_requests').select('club_id').eq('user_id', profile.id).eq('status', 'pending');
                if (rData) {
                    const pm: Record<string, boolean> = {};
                    rData.forEach(r => { pm[r.club_id] = true; });
                    setPendingMap(pm);
                }
                const { data: eData } = await supabase.from('event_attendees').select('event_id').eq('user_id', profile.id);
                if (eData) {
                    const er: Record<string, boolean> = {};
                    eData.forEach(r => { er[r.event_id] = true; });
                    setEventRegs(er);
                }
            }

            const { data: reqData } = await supabase.from('join_requests').select('*, clubs(name), profiles(full_name, email)').eq('status', 'pending').order('created_at', { ascending: false });
            if (reqData) setJoinRequests(reqData);
        }

        setLoading(false);
    }, [profile]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => { await loadAll(); if (cancelled) return; };
        run();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    // ======== CLUB CRUD ========
    const createClub = async (club: Omit<Club, 'id'>) => {
        if (isMockMode()) {
            const list = lsGet<Club>(LS_CLUBS, []);
            list.push({ ...club, id: uuid() });
            lsSet(LS_CLUBS, list);
            loadAll();
        } else {
            const { error } = await supabase.from('clubs').insert([{ ...club, created_by: profile?.id }]);
            if (error) throw error;
            loadAll();
        }
    };

    const deleteClub = async (id: string) => {
        if (isMockMode()) {
            lsSet(LS_CLUBS, lsGet<Club>(LS_CLUBS, []).filter(c => c.id !== id));
            // cascade: remove members, events, requests
            lsSet(LS_MEMBERS, lsGet<Member>(LS_MEMBERS, []).filter(m => m.club_id !== id));
            lsSet(LS_EVENTS, lsGet<EventItem>(LS_EVENTS, []).filter(e => e.club_id !== id));
            lsSet(LS_REQUESTS, lsGet<JoinRequest>(LS_REQUESTS, []).filter(r => r.club_id !== id));
            loadAll();
        } else {
            const { error } = await supabase.from('clubs').delete().eq('id', id);
            if (error) throw error;
            loadAll();
        }
    };

    // ======== EVENT CRUD ========
    const createEvent = async (event: Omit<EventItem, 'id' | 'clubs'>) => {
        if (isMockMode()) {
            const currentClubs = lsGet<Club>(LS_CLUBS, []);
            const club = currentClubs.find(c => c.id === event.club_id);
            const list = lsGet<EventItem>(LS_EVENTS, []);
            list.push({ ...event, id: uuid(), clubs: { name: club?.name || '' } });
            lsSet(LS_EVENTS, list);
            loadAll();
        } else {
            const { error } = await supabase.from('events').insert([event]);
            if (error) throw error;
            loadAll();
        }
    };

    const deleteEvent = async (id: string) => {
        if (isMockMode()) {
            lsSet(LS_EVENTS, lsGet<EventItem>(LS_EVENTS, []).filter(e => e.id !== id));
            loadAll();
        } else {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            loadAll();
        }
    };

    // ======== MEMBER CRUD ========
    const fetchMembersForClub = async (clubId: string): Promise<Member[]> => {
        if (isMockMode()) {
            const all = lsGet<Member>(LS_MEMBERS, []);
            const mockUsers = [
                { id: 'admin-001', full_name: 'Демо Админ', email: 'admin@chgu.ru' },
                { id: 'student-001', full_name: 'Демо Студент', email: 'student@chgu.ru' },
            ];
            return all.filter(m => m.club_id === clubId).map(m => ({
                ...m,
                profiles: mockUsers.find(u => u.id === m.user_id) || { full_name: 'Неизвестный', email: '' },
            }));
        } else {
            const { data } = await supabase.from('club_members').select('*, profiles(full_name, email)').eq('club_id', clubId);
            return data || [];
        }
    };

    const addMember = async (clubId: string, userId: string) => {
        if (isMockMode()) {
            const list = lsGet<Member>(LS_MEMBERS, []);
            if (list.some(m => m.club_id === clubId && m.user_id === userId)) throw new Error('Уже состоит в клубе');
            list.push({ id: uuid(), club_id: clubId, user_id: userId, role: 'member' });
            lsSet(LS_MEMBERS, list);
            loadAll();
        } else {
            const { error } = await supabase.from('club_members').insert([{ club_id: clubId, user_id: userId, role: 'member' }]);
            if (error) throw error;
            loadAll();
        }
    };

    const removeMember = async (clubId: string, userId: string) => {
        if (isMockMode()) {
            lsSet(LS_MEMBERS, lsGet<Member>(LS_MEMBERS, []).filter(m => !(m.club_id === clubId && m.user_id === userId)));
            loadAll();
        } else {
            const { error } = await supabase.from('club_members').delete().match({ club_id: clubId, user_id: userId });
            if (error) throw error;
            loadAll();
        }
    };

    const setMemberRole = async (clubId: string, userId: string, role: string) => {
        if (isMockMode()) {
            const list = lsGet<Member>(LS_MEMBERS, []);
            lsSet(LS_MEMBERS, list.map(m => (m.club_id === clubId && m.user_id === userId) ? { ...m, role } : m));
            loadAll();
        } else {
            const { error } = await supabase.from('club_members').update({ role }).match({ club_id: clubId, user_id: userId });
            if (error) throw error;
            loadAll();
        }
    };

    const getMyManagedClubs = (): Club[] => {
        const user = getMockUser() || profile;
        if (!user) return [];
        // Global admin manages all clubs
        if (user.role === 'admin') return clubs;
        // Club admins manage only their clubs
        const adminMemberships = members.filter(m => m.user_id === user.id && m.role === 'admin');
        return clubs.filter(c => adminMemberships.some(m => m.club_id === c.id));
    };

    // ======== JOIN REQUEST CRUD ========
    const submitJoinRequest = async (clubId: string) => {
        const user = getMockUser() || profile;
        if (!user) return;
        if (isMockMode()) {
            const list = lsGet<JoinRequest>(LS_REQUESTS, []);
            if (list.some(r => r.club_id === clubId && r.user_id === user.id && r.status === 'pending')) throw new Error('Заявка уже отправлена');
            const currentClubs = lsGet<Club>(LS_CLUBS, []);
            const club = currentClubs.find(c => c.id === clubId);
            list.push({ id: uuid(), club_id: clubId, user_id: user.id, status: 'pending', created_at: new Date().toISOString(), clubs: { name: club?.name || '' }, profiles: { full_name: user.full_name, email: user.email } });
            lsSet(LS_REQUESTS, list);
            loadAll();
        } else {
            const { error } = await supabase.from('join_requests').insert([{ club_id: clubId, user_id: user.id }]);
            if (error) throw error;
            loadAll();
        }
    };

    const cancelJoinRequest = async (clubId: string) => {
        const user = getMockUser() || profile;
        if (!user) return;
        if (isMockMode()) {
            lsSet(LS_REQUESTS, lsGet<JoinRequest>(LS_REQUESTS, []).filter(r => !(r.club_id === clubId && r.user_id === user.id)));
            loadAll();
        } else {
            await supabase.from('join_requests').delete().match({ club_id: clubId, user_id: user.id });
            loadAll();
        }
    };

    const approveRequest = async (reqId: string, clubId: string, userId: string) => {
        if (isMockMode()) {
            // Add to members
            const membersList = lsGet<Member>(LS_MEMBERS, []);
            if (!membersList.some(m => m.club_id === clubId && m.user_id === userId)) {
                membersList.push({ id: uuid(), club_id: clubId, user_id: userId, role: 'member' });
                lsSet(LS_MEMBERS, membersList);
            }
            // Update request status
            const reqs = lsGet<JoinRequest>(LS_REQUESTS, []);
            lsSet(LS_REQUESTS, reqs.map(r => r.id === reqId ? { ...r, status: 'approved' } : r));
            loadAll();
        } else {
            await supabase.from('club_members').insert([{ club_id: clubId, user_id: userId, role: 'member' }]);
            await supabase.from('join_requests').update({ status: 'approved' }).eq('id', reqId);
            loadAll();
        }
    };

    const rejectRequest = async (reqId: string) => {
        if (isMockMode()) {
            const reqs = lsGet<JoinRequest>(LS_REQUESTS, []);
            lsSet(LS_REQUESTS, reqs.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
            loadAll();
        } else {
            await supabase.from('join_requests').update({ status: 'rejected' }).eq('id', reqId);
            loadAll();
        }
    };

    // ======== EVENT REGISTRATION ========
    const registerForEvent = async (eventId: string) => {
        const user = getMockUser() || profile;
        if (!user) return;
        if (isMockMode()) {
            const list = lsGet<{ event_id: string; user_id: string }>(LS_EVENT_REGS, []);
            if (!list.some(r => r.event_id === eventId && r.user_id === user.id)) {
                list.push({ event_id: eventId, user_id: user.id });
                lsSet(LS_EVENT_REGS, list);
            }
            setEventRegs(prev => ({ ...prev, [eventId]: true }));
        } else {
            await supabase.from('event_attendees').insert([{ event_id: eventId, user_id: user.id }]);
            setEventRegs(prev => ({ ...prev, [eventId]: true }));
        }
    };

    const unregisterFromEvent = async (eventId: string) => {
        const user = getMockUser() || profile;
        if (!user) return;
        if (isMockMode()) {
            lsSet(LS_EVENT_REGS, lsGet<{ event_id: string; user_id: string }>(LS_EVENT_REGS, []).filter(r => !(r.event_id === eventId && r.user_id === user.id)));
            setEventRegs(prev => { const n = { ...prev }; delete n[eventId]; return n; });
        } else {
            await supabase.from('event_attendees').delete().match({ event_id: eventId, user_id: user.id });
            setEventRegs(prev => { const n = { ...prev }; delete n[eventId]; return n; });
        }
    };

    return (
        <DataContext.Provider value={{
            clubs, events, members, joinRequests, users, loading,
            createClub, deleteClub,
            createEvent, deleteEvent,
            fetchMembersForClub, addMember, removeMember, setMemberRole,
            submitJoinRequest, cancelJoinRequest, approveRequest, rejectRequest,
            getUserJoinedClubs: () => joinedMap,
            getUserPendingRequests: () => pendingMap,
            registerForEvent, unregisterFromEvent,
            getUserRegisteredEvents: () => eventRegs,
            getMyManagedClubs,
            refresh: loadAll,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
