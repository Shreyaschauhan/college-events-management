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
  // User as UserIcon // Not explicitly used, can remove if desired
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
// import { Event, User /* Removed Enrollment import as it's not directly used here */ } from '@/lib/types'; 
import EventList from '@/components/events/EventList';
import EventForm from '@/components/events/EventForm';
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
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state in table

// Import services
import { eventService } from '@/services/eventService';

// Helper function to safely convert string to Date
const parseDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const OrganizerDashboard = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();

  // State for events managed by this organizer
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);

  // Loading and submission states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);

  // State for participant dialog
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]); 
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);

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
        const allEvents = await eventService.getAllEvents();

        // Filter and process events
        const organizerEvents = allEvents
          .filter(event => event.organizerId === user.id)
          .map(event => ({
            ...event,
            _id: event._id || event.id, // Ensure _id is available
            id: event.id || event._id,   // Ensure id is available if needed elsewhere
            date: parseDate(event.date) ?? new Date(0),
            registrationDeadline: parseDate(event.registrationDeadline) ?? new Date(0),
            createdAt: parseDate(event.createdAt) ?? new Date(0),
            updatedAt: parseDate(event.updatedAt) ?? new Date(0),
            organizer: event.organizer || { ...user },
            // Participants array might just be IDs initially, count depends on backend
            participants: event.participants || [],
          }));

        const now = new Date();
        const upcoming = organizerEvents.filter(
          event => event.date >= now && event.status === 'approved'
        );
        const past = organizerEvents.filter(event => event.date < now);
        const pending = organizerEvents.filter(event => event.status === 'pending');

        setEvents(organizerEvents);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setPendingEvents(pending);

      } catch (err) {
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
  const handleCreateEvent = async (formData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const eventDataToSend = {
        ...formData,
        organizerId: user.id,
        date: new Date(formData.date).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        maxParticipants: Number(formData.maxParticipants) || 0,
      };

      const newEventResponse = await eventService.createEvent(eventDataToSend);

       const newEvent = {
         ...newEventResponse,
         _id: newEventResponse._id || newEventResponse.id,
         id: newEventResponse.id || newEventResponse._id,
         date: parseDate(newEventResponse.date) ?? new Date(0),
         registrationDeadline: parseDate(newEventResponse.registrationDeadline) ?? new Date(0),
         createdAt: parseDate(newEventResponse.createdAt) ?? new Date(0),
         updatedAt: parseDate(newEventResponse.updatedAt) ?? new Date(0),
         organizer: newEventResponse.organizer || { ...user },
         participants: newEventResponse.participants || [],
       };

      setEvents(prev => [...prev, newEvent]);
      if (newEvent.status === 'pending') {
        setPendingEvents(prev => [...prev, newEvent]);
      } else if (newEvent.status === 'approved' && newEvent.date >= new Date()) {
          setUpcomingEvents(prev => [...prev, newEvent]);
      }

      toast.success(`Event "${newEvent.name}" created successfully! Status: ${newEvent.status}`);
      setCreateDialogOpen(false);

    } catch (err) {
      console.error('Error creating event:', err);
      const errorMessage = err.message || 'Failed to create event. Please check the details and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Viewing Participants ---
  const viewEventParticipants = (event) => {
    // Ensure the event object has _id
    if (!event._id) {
        console.error("Cannot view participants: Event ID is missing.", event);
        toast.error("Cannot view participants for this event (missing ID).");
        return;
    }
    setSelectedEvent(event);
    setParticipants([]);
    setParticipantsError(null);
    setParticipantsDialogOpen(true);
    // Fetch participants when dialog opens (handled by useEffect below)
  };

  // --- Fetch Participants when Dialog Opens ---
  useEffect(() => {
    // Ensure dialog is open, an event is selected, and it has an _id
    if (!participantsDialogOpen || !selectedEvent?._id) {
      return;
    }

    const fetchParticipants = async () => {
      setParticipantsLoading(true);
      setParticipantsError(null);
      try {
        // --- MODIFICATION START ---
        // Call the new eventService function to get participant user details
        const fetchedParticipants = await eventService.getEventParticipants(selectedEvent._id);
        // The response should be an array matching ParticipantDetails type
        setParticipants(fetchedParticipants);
        // --- MODIFICATION END ---

      } catch (err) {
        console.error(`Error fetching participants for event ${selectedEvent._id}:`, err);
        const errorMessage = err.message || 'Failed to load participants.';
        setParticipantsError(errorMessage);
        // Optionally show toast error here too if needed
        // toast.error(errorMessage);
      } finally {
        setParticipantsLoading(false);
      }
    };

    fetchParticipants();
  }, [participantsDialogOpen, selectedEvent]); // Re-run if dialog opens or selected event changes

  // --- Render Logic ---
  if (!user || user.role !== 'organizer') {
    return null;
  }

   if (isLoading && !error) {
       return (
           <div className="container py-8 flex justify-center items-center min-h-[60vh]">
               {/* Simple loader or use a Spinner component */}
               <p>Loading events...</p>
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

  const totalEvents = events.length;
  const approvedEventsCount = events.filter(event => event.status === 'approved').length;
  const pendingEventsCount = pendingEvents.length;

  return (
    <div className="container py-8 animate-fade-in">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold gradient-text">Organizer Dashboard</h1>
             <p className="text-muted-foreground mt-1">Manage your events, {user.name}</p> {/* Use fullName or name */}
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
              <EventForm onSubmit={handleCreateEvent} isLoading={isSubmitting} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Events Card */}
        <Card className="hover:shadow-md transition-shadow border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">Events you have created</p>
          </CardContent>
        </Card>

        {/* Approved Events Card */}
         <Card className="hover:shadow-md transition-shadow border-border/40">
           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
             <CardTitle className="text-sm font-medium">Approved Events</CardTitle>
             <Calendar className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{approvedEventsCount}</div>
             <p className="text-xs text-muted-foreground">Events approved by admin</p>
           </CardContent>
         </Card>

        {/* Pending Events Card */}
        <Card className="hover:shadow-md transition-shadow border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
            <CalendarX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEventsCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
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
                             onClick={() => viewEventParticipants(event)} // This triggers the fetch via useEffect
                           >
                             <Users className="h-4 w-4 mr-1" />
                             <span>Participants</span>
                           </Button>
                           <Button
                             size="sm"
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
               <EventList
                 events={pendingEvents}
                 showStatus={true}
                 emptyMessage="You don't have any events pending approval."
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
                             onClick={() => viewEventParticipants(event)} // This triggers the fetch via useEffect
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
               <EventList
                 events={events}
                 showStatus={true}
                 emptyMessage="You haven't created any events yet."
                 // You could potentially pass viewEventParticipants down to EventList -> EventCard if needed
               />
            </CardContent>
             <CardFooter className="border-t border-border/30 pt-4">
                <p className="text-sm text-muted-foreground w-full text-center">
                  Use the Participants button on Upcoming/Past events to view enrollments.
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
          <div className="mt-4 flex-grow overflow-y-auto px-1 py-1"> {/* Added padding for scrollbar */}
            {participantsLoading ? (
              // --- MODIFICATION: Added Skeleton Loader ---
              <div className="space-y-3 mt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-[80%]" />
              </div>
            ) : participantsError ? (
               <div className="text-center py-8 text-red-600">
                 <p>Error: {participantsError}</p>
               </div>
            ) : participants.length > 0 ? (
              // --- MODIFICATION: Updated Table Structure ---
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Name</TableHead> {/* Adjusted width */}
                    <TableHead>Email</TableHead>
                    {/* Removed 'Enrolled On' column */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant._id}> {/* Use _id from backend data */}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3"> {/* Increased gap */}
                          <img
                            src={participant.profileImage || '/placeholder.svg'} // Use placeholder if no image
                            alt={participant.fullName}
                            className="h-9 w-9 rounded-full object-cover border" // Slightly larger image
                          />
                          {/* Use fullName from backend data */}
                          <span>{participant.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{participant.email}</TableCell>
                      {/* Removed enrollment date cell */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No participants have enrolled in this event yet.
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