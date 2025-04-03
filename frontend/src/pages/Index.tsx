// @/pages/Index.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search, Users, CalendarCheck, Clock, MapPin, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/lib/types'; // Assuming Event type is defined here
import { eventService } from '@/services/eventService'; // Import the event service
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';

// --- ADDED: Define a placeholder image URL ---
const PLACEHOLDER_EVENT_IMAGE_URL = "https://via.placeholder.com/400x200.png?text=Event+Image";
// You can replace this with any other placeholder service or a static image URL in your public folder, e.g., "/images/event-placeholder.png"

const Index = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for featured events
  const [error, setError] = useState<string | null>(null); // Error state for featured events

  useEffect(() => {
    // Fetch featured events using the service
    const fetchFeaturedEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const upcomingEvents = await eventService.getApprovedUpcomingEvents();
        const sortedAndFiltered = upcomingEvents
          .filter(event => new Date(event.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setFeaturedEvents(sortedAndFiltered.slice(0, 3));
      } catch (err: any) {
        console.error("Failed to fetch featured events:", err);
        setError(err.message || "Could not load featured events. Please try again later.");
        setFeaturedEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const getDashboardLink = () => {
    if (hasRole('admin')) return '/admin/dashboard';
    if (hasRole('organizer')) return '/organizer/dashboard';
    if (hasRole('student')) return '/student/dashboard';
    return '/events';
  };

  const categoryColors: { [key: string]: string } = {
    'Sports': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    'Cultural': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Workshop': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Seminar': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'Default': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section (remains the same) */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* ... content ... */}
         <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 z-0"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.3] z-0"></div>
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="px-4 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary border-primary/20 animate-subtle-bounce shadow-sm">
                  Event Management Platform
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                  Discover and Manage <span className="gradient-text">Events</span> with Ease
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  {APP_DESCRIPTION}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" asChild className="min-w-[10rem] shadow-pro">
                    <Link to={getDashboardLink()}>
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild className="min-w-[8rem] shadow-pro">
                      <Link to="/register">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="shadow-sm">
                      <Link to="/events">
                        Browse Events
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="lg:block hidden relative">
              <div className="elevated-card p-1 overflow-hidden">
                <div className="relative rounded-xl overflow-hidden shadow-elegant">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                    alt="Event management"
                    className="rounded-xl object-cover w-full h-[500px] transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (remains the same) */}
      <section className="py-16 bg-white dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        {/* ... content ... */}
         <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="elevated-card p-6 text-center">
              <div className="flex flex-col items-center">
                <Calendar className="h-8 w-8 text-primary mb-3" />
                <div className="text-3xl font-bold mb-1">100+</div> {/* Placeholder */}
                <div className="text-sm text-muted-foreground">Events Hosted</div>
              </div>
            </div>
            <div className="elevated-card p-6 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-primary mb-3" />
                <div className="text-3xl font-bold mb-1">5,000+</div> {/* Placeholder */}
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
            <div className="elevated-card p-6 text-center">
              <div className="flex flex-col items-center">
                <Globe className="h-8 w-8 text-primary mb-3" />
                <div className="text-3xl font-bold mb-1">25+</div> {/* Placeholder */}
                <div className="text-sm text-muted-foreground">Locations</div>
              </div>
            </div>
            <div className="elevated-card p-6 text-center">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-8 w-8 text-primary mb-3" />
                <div className="text-3xl font-bold mb-1">98%</div> {/* Placeholder */}
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="section-pro bg-gradient-subtle">
        <div className="container-pro">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="heading-pro mb-2">Upcoming Events</h2>
              <p className="subheading-pro">Discover events you might be interested in</p>
            </div>
            <Button variant="outline" asChild className="shadow-sm">
              <Link to="/events" className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                View All Events
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              Loading upcoming events...
            </div>
          ) : error ? (
            <div className="text-center py-12 elevated-card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-medium">Error loading events</p>
              <p className="text-sm text-red-500 dark:text-red-500 mt-1">{error}</p>
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map(event => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="group"
                >
                  <div className="event-card h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden rounded-t-xl flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                      <img
                        // --- MODIFIED: Use placeholder if eventImage is missing ---
                        src={event.eventImage || PLACEHOLDER_EVENT_IMAGE_URL}
                        alt={event.name || 'Event image'} // Add fallback alt text
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { // Fallback if the provided URL (even the placeholder) fails
                          const target = e.target as HTMLImageElement;
                          target.src = PLACEHOLDER_EVENT_IMAGE_URL; // Set to placeholder on error
                          target.alt = 'Placeholder event image'; // Update alt text
                        }}
                      />
                      <div className="absolute left-4 right-4 bottom-4 z-20">
                        <Badge className={`mb-2 ${categoryColors[event.category] || categoryColors['Default']}`}>
                          {event.category || 'General'} {/* Fallback category */}
                        </Badge>
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{event.name || 'Untitled Event'}</h3> {/* Fallback name */}
                        <div className="flex items-center text-white/80 text-sm">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <p className="line-clamp-1">{event.venue || 'Venue TBD'}</p> {/* Fallback venue */}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <p className="line-clamp-2 text-muted-foreground mb-4 text-sm">
                          {event.description || 'No description available.'} {/* Fallback description */}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-border/50">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1 text-primary/70" />
                          <span>
                            {event.date ? new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Date TBD'} {/* Fallback date */}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mr-1 text-primary/70" />
                          <span>
                            {Array.isArray(event.participants) ? event.participants.length : 0} / {event.maxParticipants ?? 'N/A'} {/* Fallback max participants */}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 elevated-card gradient-subtle">
              <Calendar className="h-16 w-16 mx-auto text-primary/70 mb-4" />
              <h3 className="text-xl font-medium mb-2">No upcoming events found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                There are currently no approved upcoming events scheduled. Check back later or explore all available events.
              </p>
              <Button asChild className="shadow-pro">
                <Link to="/events">Browse All Events</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section (remains the same) */}
      <section className="section-pro bg-white dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        {/* ... content ... */}
         <div className="container-pro">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="heading-pro mb-4">Everything You Need to Manage Events</h2>
            <p className="subheading-pro mx-auto">
              Our platform provides all the tools needed for seamless event management, from creation to participation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="elevated-card p-6 hover-scale">
              <div className="icon-container mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create & Manage Events</h3>
              <p className="text-muted-foreground">
                Easily create and manage events with our intuitive interface. Set dates, venues, and participant limits.
              </p>
            </div>

            <div className="elevated-card p-6 hover-scale">
              <div className="icon-container mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Participant Management</h3>
              <p className="text-muted-foreground">
                Keep track of event participants, manage registrations, and communicate with attendees effortlessly.
              </p>
            </div>

            <div className="elevated-card p-6 hover-scale">
              <div className="icon-container mb-4">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Different roles for administrators, organizers, and students with appropriate permissions and workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (remains the same) */}
      <section className="relative py-24 overflow-hidden">
        {/* ... content ... */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our platform today and start creating or participating in events that match your interests
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="shadow-pro">
                <Link to="/register">Create an Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 shadow-sm" asChild>
                <Link to="/events">Browse Events</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
      </section>
    </div>
  );
};

export default Index;