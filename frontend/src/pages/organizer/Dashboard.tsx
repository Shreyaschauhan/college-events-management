// src/pages/organizer/Dashboard.tsx

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarPlus, 
  Calendar, 
  CalendarClock, 
  CalendarX,
  Users,
  History,
  User as UserIcon
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event, User, Enrollment } from '@/lib/types';
import EventList from '@/components/events/EventList';
import EventForm from '@/components/events/EventForm'; // Assume this component exists and works
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import services
import { eventService } from '@/services/eventService';
import { enrollmentService } from '@/services/enrollmentService';

// Remove mock data imports
// import { MOCK_EVENTS, MOCK_ENROLLMENTS } from '@/lib/mock-data';

// Define a type for participant data shown in the dialog
type ParticipantDetails = User & { enrollmentDate?: Date };

// Helper function to safely convert string to Date
const parseDate = (dateString: string | Date | undefined): Date | null => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const OrganizerDashboard = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  // State for events managed by this organizer
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  
  // Loading and submission states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  
  // State for participant dialog
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<ParticipantDetails[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);

  useEffect(() => {
    requireAuth(() => {
      // Proceed only if authenticated as organizer
    }, 'organizer');
  }, [requireAuth]);

  // --- Fetch Organizer's Events ---
  useEffect(() => {
    if (!user || user.role !== 'organizer') {
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch ALL events (adjust if backend provides a filtered endpoint)
        const allEvents = await eventService.getAllEvents();
        
        // Filter events created by the current organizer
        const organizerEvents = allEvents
          .filter(event => event.organizerId === user.id)
          .map(event => ({ // Process dates and ensure structure
            ...event,
            date: parseDate(event.date) ?? new Date(0),
            registrationDeadline: parseDate(event.registrationDeadline) ?? new Date(0),
            createdAt: parseDate(event.createdAt) ?? new Date(0),
            updatedAt: parseDate(event.updatedAt) ?? new Date(0),
            // Assume backend might send organizer object or just ID
            organizer: event.organizer || { ...user }, // Default to current user if missing
             // We will fetch participants on demand, so initialize as empty or use count if backend provides it
            participants: event.participants || [], 
            // participantsCount: event.participantsCount || 0 // If backend provides count
          }));
          
        const now = new Date();
        
        // Categorize events
        const upcoming = organizerEvents.filter(
          event => event.date >= now && event.status === 'approved'
        );
        const past = organizerEvents.filter(event => event.date < now);
        const pending = organizerEvents.filter(event => event.status === 'pending');
        
        setEvents(organizerEvents);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setPendingEvents(pending);

      } catch (err: any) {
        console.error('Error fetching organizer events:', err);
        const errorMessage = err.message || 'Failed to load your events. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]); // Re-fetch if user changes

  // --- Handle Event Creation ---
  const handleCreateEvent = async (formData: Omit<Event, 'id' | 'organizerId' | 'organizer' | 'status' | 'participants' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null); // Clear previous form errors

    try {
      // Prepare data for the API - backend should ideally set organizerId from token
      const eventDataToSend = {
        ...formData,
        organizerId: user.id, // Send organizerId explicitly if backend requires it
        // Convert dates back to ISO strings if necessary for backend
        date: new Date(formData.date).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        // Ensure maxParticipants is a number
        maxParticipants: Number(formData.maxParticipants) || 0, 
      };

      // Call the service to create the event
      const newEventResponse = await eventService.createEvent(eventDataToSend);

      // Process the returned event
       const newEvent: Event = {
         ...newEventResponse,
         date: parseDate(newEventResponse.date) ?? new Date(0),
         registrationDeadline: parseDate(newEventResponse.registrationDeadline) ?? new Date(0),
         createdAt: parseDate(newEventResponse.createdAt) ?? new Date(0),
         updatedAt: parseDate(newEventResponse.updatedAt) ?? new Date(0),
         organizer: newEventResponse.organizer || { ...user },
         participants: newEventResponse.participants || [],
       };
      
      // Update local state optimistically or based on response
      setEvents(prev => [...prev, newEvent]);
      // Add to pending list as new events usually start as pending
      if (newEvent.status === 'pending') {
        setPendingEvents(prev => [...prev, newEvent]);
      } else if (newEvent.status === 'approved' && newEvent.date >= new Date()) {
          setUpcomingEvents(prev => [...prev, newEvent]);
      }
      
      toast.success(`Event "${newEvent.name}" created successfully! Status: ${newEvent.status}`);
      setCreateDialogOpen(false); // Close the dialog

    } catch (err: any) {
      console.error('Error creating event:', err);
      const errorMessage = err.message || 'Failed to create event. Please check the details and try again.';
      setError(errorMessage); // You might want a specific error state for the form
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Viewing Participants ---
  const viewEventParticipants = (event: Event) => {
    setSelectedEvent(event);
    setParticipants([]); // Clear previous participants
    setParticipantsError(null); // Clear previous errors
    setParticipantsDialogOpen(true);
    // Fetch participants when dialog opens (handled by useEffect below)
  };

  // --- Fetch Participants when Dialog Opens ---
  useEffect(() => {
    if (!participantsDialogOpen || !selectedEvent) {
      return; // Only fetch if dialog is open and an event is selected
    }

    const fetchParticipants = async () => {
      setParticipantsLoading(true);
      setParticipantsError(null);
      try {
        const enrollments = await enrollmentService.getEnrollmentsByEvent(selectedEvent._id);
        
        // Extract user details and enrollment date from each enrollment
        const participantDetails = enrollments
          .map(enrollment => {
            if (!enrollment.user) return null; // Skip if user data is missing
            return {
              ...enrollment.user, // Spread user details (id, name, email, role, profileImage)
              enrollmentDate: parseDate(enrollment.enrollmentDate) // Add enrollment date
            };
          })
          .filter((p): p is ParticipantDetails => p !== null); // Type guard

        setParticipants(participantDetails);

      } catch (err: any) {
        console.error(`Error fetching participants for event ${selectedEvent._id}:`, err);
        const errorMessage = err.message || 'Failed to load participants.';
        setParticipantsError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setParticipantsLoading(false);
      }
    };

    fetchParticipants();
  }, [participantsDialogOpen, selectedEvent]); // Re-run if dialog opens or selected event changes

  // --- Render Logic ---
  if (!user || user.role !== 'organizer') {
    return null; // requireAuth handles redirection
  }

  // Display global loading indicator or error
   if (isLoading && !error) {
       return (
           <div className="container py-8 flex justify-center items-center min-h-[60vh]">
               <div className="loader" />
           </div>
       );
   }
   
   if (error && !isLoading) {
     return (
       <div className="container py-8 text-center text-red-600">
         <p>Error: {error}</p>
         <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
           Retry Loading Events
         </Button>
       </div>
     );
   }

  // Recalculate counts based on fetched state
  const totalEvents = events.length;
  const approvedEventsCount = events.filter(event => event.status === 'approved').length;
  const pendingEventsCount = pendingEvents.length;
  // Note: Total enrollments card removed as it requires extra calls or backend support

  return (
    <div className="container py-8 animate-fade-in">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold gradient-text">Organizer Dashboard</h1>
             <p className="text-muted-foreground mt-1">Manage your events, {user.name}</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white">
              <CalendarPlus className="h-4 w-4" />
              <span>Create Event</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {/* Pass the API handler function */}
              <EventForm onSubmit={handleCreateEvent} isLoading={isSubmitting} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8"> {/* Adjusted grid */}
        <Card className="hover:shadow-md transition-shadow border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events you have created
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approved Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedEventsCount}</div>
            <p className="text-xs text-muted-foreground">
              Events approved by admin
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
            <CalendarX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEventsCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        {/* Removed Total Enrollments card */}
      </div>
      
      {/* Tabs */}
       <Tabs defaultValue="upcoming" className="space-y-4">
         <div className="bg-card rounded-lg p-1 shadow-sm">
           <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="upcoming" className="flex items-center gap-1 py-2">
                <Calendar className="h-4 w-4" /> 
                <span>Upcoming ({upcomingEvents.length})</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-1 py-2">
                <CalendarX className="h-4 w-4" /> 
                <span>Pending ({pendingEvents.length})</span>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-1 py-2">
                <History className="h-4 w-4" /> 
                <span>Past ({pastEvents.length})</span>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-1 py-2">
                <CalendarClock className="h-4 w-4" /> 
                <span>All ({events.length})</span>
              </TabsTrigger>
           </TabsList>
         </div>
        
        {/* Tab Content - Upcoming */}
        <TabsContent value="upcoming" className="space-y-4 animate-fade-in">
          <Card className="modern-card shadow-elegant border-border/40">
            <CardHeader>
              <CardTitle>Upcoming Approved Events</CardTitle>
              <CardDescription>
                Your approved events that haven't taken place yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">You don't have any upcoming approved events.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Card key={event._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.date.toLocaleDateString()} • {event.venue}
                          </p>
                           <p className="text-sm text-muted-foreground mt-1">
                             Category: {event.category} • Max Participants: {event.maxParticipants}
                           </p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2 flex-wrap">
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => viewEventParticipants(event)} // Triggers fetch
                           >
                             <Users className="h-4 w-4 mr-1" />
                             {/* Count is fetched on demand, so just show the action */}
                             <span>Participants</span> 
                           </Button>
                           {/* Add Edit/Delete buttons later if needed */}
                           <Button 
                             size="sm"
                             onClick={() => navigate(`/events/${event._id}`)} // Navigate to detail page
                           >
                             View Details
                           </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content - Pending */}
         <TabsContent value="pending" className="space-y-4 animate-fade-in">
           <Card className="modern-card shadow-elegant border-border/40">
             <CardHeader>
               <CardTitle>Pending Events</CardTitle>
               <CardDescription>
                 Events waiting for administrator approval.
               </CardDescription>
             </CardHeader>
             <CardContent>
               {/* Use EventList component, ensure it can handle missing counts */}
               <EventList 
                 events={pendingEvents} 
                 showStatus={true} 
                 emptyMessage="You don't have any events pending approval."
                 // Pass action handlers if EventList supports them (e.g., onViewDetails)
                 // onViewDetails={(id) => navigate(`/events/${id}`)} 
               />
             </CardContent>
           </Card>
         </TabsContent>
        
         {/* Tab Content - Past */}
         <TabsContent value="past" className="space-y-4 animate-fade-in">
           <Card className="modern-card shadow-elegant border-border/40">
             <CardHeader>
               <CardTitle>Past Events</CardTitle>
               <CardDescription>
                 Events that have already taken place.
               </CardDescription>
             </CardHeader>
             <CardContent>
               {pastEvents.length === 0 ? (
                 <p className="text-center py-6 text-muted-foreground">You don't have any past events.</p>
               ) : (
                 <div className="space-y-4">
                   {pastEvents.map((event) => (
                     <Card key={event._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-grow">
                            <h3 className="font-medium text-base text-muted-foreground line-through">{event.name}</h3>
                             <p className="text-sm text-muted-foreground">
                               {event.date.toLocaleDateString()} • {event.venue}
                             </p>
                          </div>
                         <div className="flex flex-shrink-0 gap-2 flex-wrap">
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => viewEventParticipants(event)}
                           >
                             <Users className="h-4 w-4 mr-1" />
                             <span>Participants</span>
                           </Button>
                           <Button 
                             size="sm"
                             variant="secondary"
                             onClick={() => navigate(`/events/${event._id}`)}
                           >
                             View Details
                           </Button>
                         </div>
                       </div>
                     </Card>
                   ))}
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>
        
         {/* Tab Content - All */}
        <TabsContent value="all" className="space-y-4 animate-fade-in">
          <Card className="modern-card shadow-elegant border-border/40">
            <CardHeader>
              <CardTitle>All Your Events</CardTitle>
              <CardDescription>
                Complete list of all events you have created.
              </CardDescription>
            </CardHeader>
            <CardContent>
               {/* Use EventList component */}
               <EventList 
                 events={events} 
                 showStatus={true} 
                 emptyMessage="You haven't created any events yet."
                 // Add actions if needed
                 // onViewDetails={(id) => navigate(`/events/${id}`)}
                 // onManageParticipants={(event) => viewEventParticipants(event)}
               />
            </CardContent>
            <CardFooter className="border-t border-border/30 pt-4">
               {/* Dialog Trigger moved to header, keep footer clean or add summary */}
                <p className="text-sm text-muted-foreground w-full text-center">
                  Create new events using the button in the header.
                </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* --- Participants Dialog --- */}
      <Dialog open={participantsDialogOpen} onOpenChange={setParticipantsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Event Participants</DialogTitle>
            <DialogDescription>
              Showing participants for: <strong>{selectedEvent?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex-grow overflow-y-auto">
            {participantsLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="loader" /> 
              </div>
            ) : participantsError ? (
               <div className="text-center py-8 text-red-600">
                 <p>Error: {participantsError}</p>
               </div>
            ) : participants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrolled On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <img 
                            src={participant.profileImage || '/placeholder.svg'} // Use placeholder if no image
                            alt={participant.name}
                            className="h-8 w-8 rounded-full object-cover border" 
                          />
                          <span>{participant.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>
                        {participant.enrollmentDate 
                          ? participant.enrollmentDate.toLocaleDateString() 
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No participants have enrolled for this event yet.
              </div>
            )}
          </div>
           <div className="mt-4 pt-4 border-t border-border/30 flex justify-end">
               <Button variant="outline" onClick={() => setParticipantsDialogOpen(false)}>
                   Close
               </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerDashboard;