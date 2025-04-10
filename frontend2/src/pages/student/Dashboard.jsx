// src/pages/student/Dashboard.tsx

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CalendarClock,
  History,
  Search,
  GraduationCap
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
// import { Event, User } from '@/lib/types'; // Import Event and User types
// Note: Enrollment type might not be directly needed here anymore if service returns populated events
import EventList from '@/components/events/EventList';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { enrollmentService } from '@/services/enrollmentService'; // Import enrollment service

// Helper function to safely convert string to Date
const parseDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  // Attempt parsing (handles ISO 8601 format from API)
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const StudentDashboard = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();

  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure user is authenticated and is a student
    requireAuth(() => {
      // Callback after authentication is confirmed
    }, 'student');
  }, [requireAuth]);

  useEffect(() => {
    // Fetch events only if the user object is available and role is confirmed
    if (!user || user.role !== 'student') {
        setIsLoading(false); // Not loading if no user or wrong role
        return;
    }

    const fetchEnrolledEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch enrollments for the current user using the service
        // The service should return enrollments populated with event details
        const userEnrollments = await enrollmentService.getEnrollmentsByUser(user.id);
        // console.log('API Response (User Enrollments):', JSON.stringify(userEnrollments, null, 2)); // Optional: keep for debugging

        // --- MODIFIED SECTION TO MATCH API RESPONSE ---
        const eventsFromEnrollments = userEnrollments
          .map(enrollment => {
            // Check if eventId exists and is an object
            if (!enrollment.eventId || typeof enrollment.eventId !== 'object') {
              console.warn('Skipping enrollment due to missing or invalid eventId:', enrollment);
              return null; // Skip this enrollment
            }

            const apiEvent = enrollment.eventId;
            const apiOrganizer = apiEvent.organizer || {}; // Handle potentially missing organizer

            // Map API fields to your frontend Event type
            return {
              _id: apiEvent._id, // Map _id to id
              title: apiEvent.name, // Map name to title (assuming 'title' in your Event type)
              description: apiEvent.description,
              category: apiEvent.category,
              date: parseDate(apiEvent.date) ?? new Date(0), // Use existing parseDate
              registrationDeadline: parseDate(apiEvent.registrationDeadline) ?? new Date(0),
              venue: apiEvent.venue,
              maxParticipants: apiEvent.maxParticipants,
              status: apiEvent.status,
              createdAt: parseDate(apiEvent.createdAt) ?? new Date(0),
              updatedAt: parseDate(apiEvent.updatedAt) ?? new Date(0),

              // Map organizer fields to your frontend User type
              organizer: {
                id: apiOrganizer._id || 'unknown',
                name: apiOrganizer.fullName || 'Unknown Organizer', // Map fullName to name
                email: apiOrganizer.email || '',
                role: apiOrganizer.role || 'organizer',
                // Add profileImage if it exists in your User type and API response
                // profileImage: apiOrganizer.profileImage || '/placeholder.svg'
              }, // Ensure the object matches the expected structure

              // Map participants (assuming Event type wants string IDs from API)
              // Adjust if your Event type expects User[] objects
              participants: apiEvent.participants || [],

              // Include organizerId if needed by your Event type
              organizerId: apiEvent.organizerId,
            }; // Ensure the object matches the expected Event structure
          })
          .filter((event) => event !== null); // Filter out any skipped enrollments
        // --- END OF MODIFIED SECTION ---


        // Use current date for comparison - Set time to 00:00:00 for day comparison
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Compare based on date only, not time

        // Process events into categories
        const all = eventsFromEnrollments;
        // Ensure date comparison works correctly after parsing
        const upcoming = all.filter(event => event.date && event.date >= now);
        const past = all.filter(event => event.date && event.date < now);

        // console.log('Processed Events:', { all, upcoming, past }); // Optional: verify processed data

        setEnrolledEvents(all);
        setUpcomingEvents(upcoming);
        setPastEvents(past);

      } catch (err) {
        console.error('Error fetching enrolled events:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load your enrolled events. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledEvents();
  }, [user]); // Re-run fetch if user changes

  // Prevent rendering before auth check / redirection
  if (!user || user.role !== 'student') {
    // Show loading state or null while auth check completes
    return isLoading ? <div className="container max-w-7xl py-8 text-center"><div className="loader" /></div> : null;
  }

  // Display error message if fetch failed
  if (error && !isLoading) {
    return (
      <div className="container max-w-7xl py-8 text-center text-red-600">
        <p>Error: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // --- Render Logic ---
  return (
    <div className="container max-w-7xl py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name || 'Student'} {/* Ensure user.name matches mapped field */}
          </p>
        </div>

        <Button
          variant="default"
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
          onClick={() => navigate('/events')}
        >
          <Search className="h-4 w-4" />
          <span>Browse Events</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Enrolled Events Card */}
        <Card className="modern-card shadow-elegant overflow-hidden border-border/40">
          <CardHeader className="pb-2 border-b border-border/30 bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Enrolled Events</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardDescription>
              Events you're participating in
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {isLoading ? (
                <div className="loader-small" />
              ) : (
                <div className="text-4xl font-bold gradient-text">{enrolledEvents.length}</div>
              )}
              <p className="text-sm text-muted-foreground mt-1">Total enrollments</p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Card */}
        <Card className="modern-card shadow-elegant overflow-hidden border-border/40">
          <CardHeader className="pb-2 border-b border-border/30 bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Upcoming Events</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardDescription>
              Events that haven't happened yet
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {isLoading ? (
                 <div className="loader-small" />
              ) : (
                <div className="text-4xl font-bold gradient-text">{upcomingEvents.length}</div>
              )}
              <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Past Events Card */}
        <Card className="modern-card shadow-elegant overflow-hidden border-border/40">
          <CardHeader className="pb-2 border-b border-border/30 bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Past Events</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardDescription>
              Events you've attended
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {isLoading ? (
                 <div className="loader-small" />
              ) : (
                <div className="text-4xl font-bold gradient-text">{pastEvents.length}</div>
              )}
              <p className="text-sm text-muted-foreground mt-1">Completed events</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <div className="bg-card rounded-lg p-1 shadow-sm">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="upcoming" className="flex items-center gap-1 py-3" disabled={isLoading}>
              <Calendar className="h-4 w-4" />
              <span>Upcoming ({isLoading ? '...' : upcomingEvents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-1 py-3" disabled={isLoading}>
              <History className="h-4 w-4" />
              <span>Past Events ({isLoading ? '...' : pastEvents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-1 py-3" disabled={isLoading}>
              <CalendarClock className="h-4 w-4" />
              <span>All ({isLoading ? '...' : enrolledEvents.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <TabsContent value="upcoming" className="space-y-4 animate-fade-in">
          <Card className="modern-card shadow-elegant border-border/40">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Events you're enrolled in that haven't taken place yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loader" /> {/* Make sure .loader CSS exists */}
                </div>
              ) : (
                <EventList
                  events={upcomingEvents}
                  emptyMessage="You're not enrolled in any upcoming events"
                />
              )}
            </CardContent>
            {!isLoading && upcomingEvents.length === 0 && (
              <CardFooter className="bg-muted/20 border-t border-border/30 py-4">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                  onClick={() => navigate('/events')}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Browse Events
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4 animate-fade-in">
          <Card className="modern-card shadow-elegant border-border/40">
            <CardHeader>
              <CardTitle>Past Events</CardTitle>
              <CardDescription>
                Events you've participated in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loader" />
                </div>
              ) : (
                <EventList
                  events={pastEvents}
                  emptyMessage="You haven't participated in any events yet"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4 animate-fade-in">
          <Card className="modern-card shadow-elegant border-border/40">
            <CardHeader>
              <CardTitle>All Enrolled Events</CardTitle>
              <CardDescription>
                Complete list of all events you're enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loader" />
                </div>
              ) : (
                <EventList
                  events={enrolledEvents}
                  emptyMessage="You haven't enrolled in any events yet"
                />
              )}
            </CardContent>
            {!isLoading && enrolledEvents.length === 0 && (
              <CardFooter className="bg-muted/20 border-t border-border/30 py-4">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                  onClick={() => navigate('/events')}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Browse Events
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;