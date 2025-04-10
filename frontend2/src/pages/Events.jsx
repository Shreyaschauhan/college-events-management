import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import EventList from '@/components/events/EventList';
import { toast } from 'sonner';
import { eventService } from '@/services/eventService';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching approved upcoming events...');
        const fetchedEvents = await eventService.getApprovedUpcomingEvents();
        console.log('Fetched events:', fetchedEvents);

        // If your API returns dates as strings, you might need to parse them:
        const processedEvents = fetchedEvents.map((event) => ({
          ...event,
          date: new Date(event.date),
          registrationDeadline: new Date(event.registrationDeadline),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
        setEvents(processedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        const errorMessage = error?.message || 'Failed to load events';
        toast.error(errorMessage);
        setEvents([]); // Clear events on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="container py-12 animate-fade-in">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Explore Events</h1>
        <p className="text-muted-foreground">
          Discover and join exciting events across various categories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Events</CardTitle>
          <CardDescription>
            Browse through our collection of upcoming approved events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8 min-h-[200px]">
              <div className="loader" />
              <span className="ml-2 text-muted-foreground">Loading events...</span>
            </div>
          ) : (
            <EventList
              events={events}
              emptyMessage={
                events.length === 0 && !isLoading
                  ? 'No approved upcoming events found.'
                  : 'Loading...'
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Events;