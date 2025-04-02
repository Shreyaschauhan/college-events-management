
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarClock, 
  Users, 
  CheckCircle, 
  Clock,
  AlertCircle,
  UserRound,
  UserCog
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event, User } from '@/lib/types';
import EventList from '@/components/events/EventList';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

// Mock data
import { MOCK_EVENTS, MOCK_ENROLLMENTS, MOCK_USERS } from '@/lib/mock-data';

const AdminDashboard = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'all' | 'student' | 'organizer'>('all');

  useEffect(() => {
    requireAuth(() => {
      // Only proceed if authenticated as admin
    }, 'admin');
  }, [requireAuth]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call to fetch all events
        const allEvents = [...MOCK_EVENTS];
        
        // Process events
        setEvents(allEvents);
        setPendingEvents(allEvents.filter(event => event.status === 'pending'));
        setApprovedEvents(allEvents.filter(event => event.status === 'approved'));
        setRejectedEvents(allEvents.filter(event => event.status === 'rejected'));
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const handleApproveEvent = (eventId: string) => {
    // Find the event in our mock data
    const eventIndex = MOCK_EVENTS.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      // Update the event status
      MOCK_EVENTS[eventIndex] = {
        ...MOCK_EVENTS[eventIndex],
        status: 'approved',
      };
      
      // Update local state
      const updatedEvent = {...MOCK_EVENTS[eventIndex]};
      
      // Update the events in state
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      setApprovedEvents(prev => [...prev, updatedEvent]);
      
      toast.success(`Event "${updatedEvent.name}" has been approved`);
    }
  };

  const handleRejectEvent = (eventId: string) => {
    // Find the event in our mock data
    const eventIndex = MOCK_EVENTS.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      // Update the event status
      MOCK_EVENTS[eventIndex] = {
        ...MOCK_EVENTS[eventIndex],
        status: 'rejected',
      };
      
      // Update local state
      const updatedEvent = {...MOCK_EVENTS[eventIndex]};
      
      // Update the events in state
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      setRejectedEvents(prev => [...prev, updatedEvent]);
      
      toast.success(`Event "${updatedEvent.name}" has been rejected`);
    }
  };

  const openUsersDialog = (type: 'all' | 'student' | 'organizer') => {
    setSelectedUserType(type);
    setShowUsersDialog(true);
  };

  if (!user || user.role !== 'admin') {
    return null; // The requireAuth will handle redirection
  }

  const totalUsers = MOCK_USERS.length;
  const totalEvents = MOCK_EVENTS.length;
  const totalEnrollments = MOCK_ENROLLMENTS.length;
  const totalPendingEvents = pendingEvents.length;
  
  const students = MOCK_USERS.filter(u => u.role === 'student');
  const organizers = MOCK_USERS.filter(u => u.role === 'organizer');
  
  const filteredUsers = selectedUserType === 'all' 
    ? MOCK_USERS 
    : selectedUserType === 'student' 
      ? students 
      : organizers;

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openUsersDialog('all')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across all roles
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openUsersDialog('student')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Student users
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openUsersDialog('organizer')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Organizers</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizers.length}</div>
            <p className="text-xs text-muted-foreground">
              Event organizers
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> 
            <span>Pending ({pendingEvents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> 
            <span>Approved ({approvedEvents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> 
            <span>Rejected ({rejectedEvents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <CalendarClock className="h-4 w-4" /> 
            <span>All Events ({events.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Events</CardTitle>
              <CardDescription>
                These events are awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loader" />
                </div>
              ) : pendingEvents.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">No pending events to review</p>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            By {event.organizer?.name} • {format(new Date(event.date), 'MMMM do, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => handleRejectEvent(event.id)}
                          >
                            Reject
                          </Button>
                          <Button 
                            onClick={() => handleApproveEvent(event.id)}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2">{event.description}</p>
                      <div className="flex gap-2 text-sm">
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate(`/events/${event.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Events</CardTitle>
              <CardDescription>
                Events that have been approved by administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loader" />
                </div>
              ) : (
                <EventList 
                  events={approvedEvents} 
                  showStatus={true}
                  emptyMessage="No approved events"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Events</CardTitle>
              <CardDescription>
                Events that were not approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loader" />
                </div>
              ) : (
                <EventList 
                  events={rejectedEvents} 
                  showStatus={true}
                  emptyMessage="No rejected events"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <CardDescription>
                Complete list of all events in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loader" />
                </div>
              ) : (
                <EventList 
                  events={events} 
                  showStatus={true}
                  emptyMessage="No events found"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Users Dialog */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUserType === 'all' 
                ? 'All Users' 
                : selectedUserType === 'student' 
                  ? 'Students' 
                  : 'Organizers'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
