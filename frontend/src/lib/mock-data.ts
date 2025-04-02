
import { User, Event, Enrollment, EventCategory, EventStatus } from './types';

// Mock Users
export const MOCK_USERS: (User & { password?: string })[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    profileImage: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Event Organizer',
    email: 'organizer@example.com',
    password: 'organizer123',
    role: 'organizer',
    profileImage: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Student User',
    email: 'student@example.com',
    password: 'student123',
    role: 'student',
    profileImage: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'jane123',
    role: 'student',
    profileImage: '/placeholder.svg'
  },
  {
    id: '5',
    name: 'John Smith',
    email: 'john@example.com',
    password: 'john123',
    role: 'student',
    profileImage: '/placeholder.svg'
  },
  {
    id: '6',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    password: 'sarah123',
    role: 'organizer',
    profileImage: '/placeholder.svg'
  }
];

// Function to create a date with a specific offset from now
const createDate = (daysOffset: number, hoursOffset = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(date.getHours() + hoursOffset);
  return date;
};

// Mock Events
export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Annual Tech Conference',
    description: 'Join us for our annual technology conference featuring workshops, keynote speakers, and networking opportunities. Learn about the latest trends in software development, AI, and cloud computing.',
    category: 'Technical' as EventCategory,
    date: createDate(15),
    registrationDeadline: createDate(10),
    venue: 'Main Auditorium',
    maxParticipants: 200,
    organizerId: '2',
    organizer: MOCK_USERS.find(user => user.id === '2') as User,
    status: 'approved' as EventStatus,
    participants: [
      MOCK_USERS.find(user => user.id === '3') as User,
      MOCK_USERS.find(user => user.id === '4') as User,
      MOCK_USERS.find(user => user.id === '5') as User
    ],
    createdAt: createDate(-10),
    updatedAt: createDate(-10)
  },
  {
    id: '2',
    name: 'Basketball Tournament',
    description: 'Participate in our annual basketball tournament. Form teams of 5 players and compete for the championship trophy. All skill levels welcome!',
    category: 'Sports' as EventCategory,
    date: createDate(7),
    registrationDeadline: createDate(3),
    venue: 'Sports Complex',
    maxParticipants: 100,
    organizerId: '2',
    organizer: MOCK_USERS.find(user => user.id === '2') as User,
    status: 'approved' as EventStatus,
    participants: [
      MOCK_USERS.find(user => user.id === '3') as User
    ],
    createdAt: createDate(-15),
    updatedAt: createDate(-15)
  },
  {
    id: '3',
    name: 'Cultural Festival',
    description: 'Celebrate diversity with performances, food, and activities from various cultures. Join us for a day of music, dance, and international cuisine.',
    category: 'Cultural' as EventCategory,
    date: createDate(21),
    registrationDeadline: createDate(14),
    venue: 'Student Center',
    maxParticipants: 300,
    organizerId: '6',
    organizer: MOCK_USERS.find(user => user.id === '6') as User,
    status: 'approved' as EventStatus,
    participants: [],
    createdAt: createDate(-20),
    updatedAt: createDate(-20)
  },
  {
    id: '4',
    name: 'Coding Hackathon',
    description: 'A 24-hour coding challenge where teams compete to build innovative solutions. Prizes for the top projects!',
    category: 'Technical' as EventCategory,
    date: createDate(30),
    registrationDeadline: createDate(25),
    venue: 'Computer Science Building',
    maxParticipants: 150,
    organizerId: '2',
    organizer: MOCK_USERS.find(user => user.id === '2') as User,
    status: 'pending' as EventStatus,
    participants: [],
    createdAt: createDate(-5),
    updatedAt: createDate(-5)
  },
  {
    id: '5',
    name: 'Dance Competition',
    description: 'Showcase your dance skills in various categories including solo, duo, and group performances. All dance styles welcome!',
    category: 'Cultural' as EventCategory,
    date: createDate(45),
    registrationDeadline: createDate(35),
    venue: 'Performing Arts Center',
    maxParticipants: 80,
    organizerId: '6',
    organizer: MOCK_USERS.find(user => user.id === '6') as User,
    status: 'approved' as EventStatus,
    participants: [
      MOCK_USERS.find(user => user.id === '5') as User
    ],
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: '6',
    name: 'Swimming Championship',
    description: 'Annual swimming competition with various categories and age groups. Come and compete with the best swimmers on campus!',
    category: 'Sports' as EventCategory,
    date: createDate(-10), // Past event
    registrationDeadline: createDate(-20),
    venue: 'Aquatic Center',
    maxParticipants: 120,
    organizerId: '2',
    organizer: MOCK_USERS.find(user => user.id === '2') as User,
    status: 'approved' as EventStatus,
    participants: [
      MOCK_USERS.find(user => user.id === '3') as User,
      MOCK_USERS.find(user => user.id === '4') as User
    ],
    createdAt: createDate(-60),
    updatedAt: createDate(-60)
  },
  {
    id: '7',
    name: 'AI Workshop',
    description: 'Learn the basics of artificial intelligence and machine learning. Hands-on session with practical examples.',
    category: 'Technical' as EventCategory,
    date: createDate(12),
    registrationDeadline: createDate(5),
    venue: 'Engineering Building, Room 202',
    maxParticipants: 50,
    organizerId: '6',
    organizer: MOCK_USERS.find(user => user.id === '6') as User,
    status: 'rejected' as EventStatus,
    participants: [],
    createdAt: createDate(-25),
    updatedAt: createDate(-25)
  }
];

// Mock Enrollments
export const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: 'e1',
    eventId: '1',
    userId: '3',
    enrollmentDate: createDate(-8),
    status: 'approved'
  },
  {
    id: 'e2',
    eventId: '1',
    userId: '4',
    enrollmentDate: createDate(-7),
    status: 'approved'
  },
  {
    id: 'e3',
    eventId: '1',
    userId: '5',
    enrollmentDate: createDate(-6),
    status: 'approved'
  },
  {
    id: 'e4',
    eventId: '2',
    userId: '3',
    enrollmentDate: createDate(-12),
    status: 'approved'
  },
  {
    id: 'e5',
    eventId: '5',
    userId: '5',
    enrollmentDate: createDate(-28),
    status: 'approved'
  },
  {
    id: 'e6',
    eventId: '6',
    userId: '3',
    enrollmentDate: createDate(-55),
    status: 'approved'
  },
  {
    id: 'e7',
    eventId: '6',
    userId: '4',
    enrollmentDate: createDate(-50),
    status: 'approved'
  }
];
