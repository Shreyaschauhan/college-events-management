
export type UserRole = 'admin' | 'organizer' | 'student' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  rollNumber?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  branch?: string;
}

export type EventCategory = 'Sports' | 'Cultural' | 'Technical';

export type EventStatus = 'pending' | 'approved' | 'rejected';

export interface Event {
  _id: string;
  name: string;
  description: string;
  category: EventCategory;
  date: Date;
  registrationDeadline: Date;
  venue: string;
  maxParticipants: number;
  organizerId: string;
  organizer?: User;
  status: EventStatus;
  participants?: User[];
  createdAt: Date;
  updatedAt: Date;
  eventImage?: string;
}

export interface Enrollment {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  user?: User;
  enrollmentDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  rollNumber?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  branch?: string;
  requirements?: string;
}
