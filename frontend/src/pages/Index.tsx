import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search, Users, CalendarCheck, Clock, MapPin, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/lib/types';
import { MOCK_EVENTS } from '@/lib/mock-data';

const Index = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Get a few upcoming events to display
    const upcomingEvents = MOCK_EVENTS
      .filter(event => 
        new Date(event.date) > new Date() && 
        event.status === 'approved'
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
    
    setFeaturedEvents(upcomingEvents);
  }, []);

  const getDashboardLink = () => {
    if (hasRole('admin')) return '/admin/dashboard';
    if (hasRole('organizer')) return '/organizer/dashboard';
    if (hasRole('student')) return '/student/dashboard';
    return '/events';
  };

  const categoryColors = {
    'Sports': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    'Cultural': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-pro">
        <div className="hero-pattern"></div>
        <div className="hero-content">
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
                  A comprehensive platform for creating, organizing, and participating in events seamlessly
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
              <div className="relative rounded-2xl overflow-hidden shadow-pro-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Event management" 
                  className="rounded-2xl object-cover w-full h-[500px] transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex flex-col items-center text-center">
                <Calendar className="h-8 w-8 text-primary mb-3" />
                <div className="stat-value">100+</div>
                <div className="stat-label">Events Hosted</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-primary mb-3" />
                <div className="stat-value">5,000+</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex flex-col items-center text-center">
                <Globe className="h-8 w-8 text-primary mb-3" />
                <div className="stat-value">25+</div>
                <div className="stat-label">Locations</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-8 w-8 text-primary mb-3" />
                <div className="stat-value">98%</div>
                <div className="stat-label">Satisfaction</div>
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

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map(event => (
                <Link 
                  key={event.id} 
                  to={`/events/${event.id}`} 
                  className="group"
                >
                  <div className="event-card-pro h-full">
                    <div className="event-image-container">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                      <img 
                        src={event.eventImage || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"}
                        alt={event.name}
                        className="event-image"
                      />
                      <div className="absolute left-4 right-4 bottom-4 z-20">
                        <Badge className={`mb-2 ${categoryColors[event.category]}`}>
                          {event.category}
                        </Badge>
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{event.name}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          <p className="line-clamp-1">{event.venue}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="line-clamp-2 text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      <div className="flex justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1 text-primary/70" />
                          <span>
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1 text-primary/70" />
                          <span>
                            {event.participants?.length || 0}/{event.maxParticipants}
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
              <h3 className="text-xl font-medium mb-2">No upcoming events</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                There are no upcoming events at the moment. Check back later or browse all events.
              </p>
              <Button asChild className="shadow-pro">
                <Link to="/events">Browse All Events</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="section-pro bg-white dark:bg-gray-900">
        <div className="container-pro">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="heading-pro mb-4">Everything You Need to Manage Events</h2>
            <p className="subheading-pro mx-auto">
              Our platform provides all the tools needed for seamless event management, from creation to participation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card group">
              <div className="feature-icon group-hover:bg-primary/20 transition-colors duration-300">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create & Manage Events</h3>
              <p className="text-muted-foreground">
                Easily create and manage events with our intuitive interface. Set dates, venues, and participant limits.
              </p>
            </div>
            
            <div className="feature-card group">
              <div className="feature-icon group-hover:bg-primary/20 transition-colors duration-300">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Participant Management</h3>
              <p className="text-muted-foreground">
                Keep track of event participants, manage registrations, and communicate with attendees effortlessly.
              </p>
            </div>
            
            <div className="feature-card group">
              <div className="feature-icon group-hover:bg-primary/20 transition-colors duration-300">
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
      
      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-50"></div>
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
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 shadow-sm" asChild>
                <Link to="/events">Browse Events</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
};

export default Index;
