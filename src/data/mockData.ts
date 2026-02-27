export interface Club {
    id: string;
    name: string;
    category: string;
    description: string;
    memberCount: number;
    established: number;
    image: string;
    isMember: boolean;
    upcomingMeetings: number;
}

export interface Event {
    id: string;
    clubId: string;
    clubName: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    attendees: number;
    isRegistered: boolean;
}

export const CATEGORIES = ['Все', 'Спорт', 'Технологии', 'Рукоделие и Творчество', 'Академические и Социальные'];

export const CLUBS: Club[] = [
    {
        id: 'c1',
        name: 'ФК ЧГУ',
        category: 'Спорт',
        description: 'Официальный футбольный клуб Чеченского государственного университета. Мы тренируемся еженедельно, участвуем в региональных лигах и приветствуем игроков любого уровня, которые разделяют нашу страсть к красивой игре.',
        memberCount: 85,
        established: 2010,
        image: 'soccer',
        isMember: true,
        upcomingMeetings: 2
    },
    {
        id: 'c2',
        name: 'CodeCrafters',
        category: 'Технологии',
        description: 'Сообщество увлеченных программистов, разработчиков и хакеров ЧГУ. Мы проводим еженедельные хакатоны, изучаем алгоритмы и вместе создаем open-source проекты.',
        memberCount: 142,
        established: 2015,
        image: 'code',
        isMember: true,
        upcomingMeetings: 3
    },
    {
        id: 'c3',
        name: 'Уголок Рукоделия',
        category: 'Рукоделие и Творчество',
        description: 'Клуб посвящен рукоделию, шитью, вязанию и креативным DIY-проектам. Присоединяйтесь к нам, чтобы расслабиться, создать красивые вещи своими руками и обменяться опытом в уютной атмосфере.',
        memberCount: 45,
        established: 2018,
        image: 'scissors',
        isMember: false,
        upcomingMeetings: 1
    },
    {
        id: 'c4',
        name: 'Общество Истории и Археологии',
        category: 'Академические и Социальные',
        description: 'Погружение в глубины истории человечества и археологические открытия на базе ЧГУ. Организуем походы в музеи, исторические дебаты и лекции от известных историков.',
        memberCount: 68,
        established: 2012,
        image: 'landmark',
        isMember: false,
        upcomingMeetings: 1
    }
];

export const EVENTS: Event[] = [
    {
        id: 'e1',
        clubId: 'c1',
        clubName: 'ФК ЧГУ',
        title: 'Межуниверситетское Осеннее Дерби',
        date: '2026-03-15',
        time: '14:00',
        location: 'Главный стадион ЧГУ',
        description: 'Самый важный матч семестра. Приходите поддержать нашу команду в игре против главных соперников!',
        attendees: 300,
        isRegistered: true
    },
    {
        id: 'e2',
        clubId: 'c2',
        clubName: 'CodeCrafters',
        title: 'IT & Web3 Хакатон 2026',
        date: '2026-03-20',
        time: '09:00',
        location: 'Технопарк ЧГУ, Ауд. 404',
        description: '48-часовой марафон программирования, посвященный созданию умных dApps. Еда и напитки предоставляются!',
        attendees: 120,
        isRegistered: true
    },
    {
        id: 'e3',
        clubId: 'c3',
        clubName: 'Уголок Рукоделия',
        title: 'Благотворительный Мастер-класс по Вязанию',
        date: '2026-03-10',
        time: '18:00',
        location: 'Студенческий совет, Комната 2Б',
        description: 'Научитесь вязать, создавая теплые вещи для местных приютов. Новички категорически приветствуются!',
        attendees: 25,
        isRegistered: false
    },
    {
        id: 'e4',
        clubId: 'c4',
        clubName: 'Общество Истории и Археологии',
        title: 'Выставка: Затерянные Города Шелкового Пути',
        date: '2026-03-25',
        time: '16:30',
        location: 'Национальный музей ЧР',
        description: 'Экскурсия по новой захватывающей выставке, демонстрирующей недавние археологические находки из Центральной Азии.',
        attendees: 40,
        isRegistered: false
    },
    {
        id: 'e5',
        clubId: 'c2',
        clubName: 'CodeCrafters',
        title: 'Еженедельный Забег по Алгоритмам и Пицца',
        date: '2026-03-05',
        time: '19:00',
        location: 'Библиотека ЧГУ, Групповая Комната Б',
        description: 'Вместе решаем сложные задачи на Leetcode с бесплатной пиццей. Не забудьте свой ноутбук!',
        attendees: 45,
        isRegistered: true
    }
];

export const SCHEDULE = [
    { id: 's1', eventId: 'e5', day: 'Понедельник', time: '19:00 - 21:00', title: 'CodeCrafters: Алгоритмы' },
    { id: 's2', eventId: 'e3', day: 'Вторник', time: '18:00 - 20:00', title: 'Уголок Рукоделия: Благотворительное вязание' },
    { id: 's3', clubId: 'c1', day: 'Среда', time: '16:00 - 18:00', title: 'ФК ЧГУ: Тренировка на поле' },
    { id: 's4', eventId: 'e4', day: 'Четверг', time: '16:30 - 19:30', title: 'Историческое общество: Экскурсия на выставку' },
    { id: 'm1', club_id: '1', user_id: 'u1', role: 'member', joined_at: '2023-09-01T10:00:00Z', status: 'Скоро' },
    { id: 'm2', club_id: '3', user_id: 'u1', role: 'admin', joined_at: '2023-10-15T14:30:00Z', status: 'Скоро' },
    { id: 's5', clubId: 'c1', day: 'Пятница', time: '15:00 - 17:00', title: 'ФК ЧГУ: Тактическое занятие' },
    { id: 's6', eventId: 'e2', day: 'Суббота', time: '09:00 - 23:59', title: 'CodeCrafters: Хакатон День 1' },
];
