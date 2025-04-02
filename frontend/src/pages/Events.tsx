// src/pages/Events.tsx

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Event } from '@/lib/types'; // Assuming your Event type definition exists here
import EventList from '@/components/events/EventList';
import { toast } from 'sonner';
import { eventService } from '@/services/eventService'; // <-- 1. Import the service

// Mock data import is no longer needed
// import { MOCK_EVENTS } from '@/lib/mock-data'; // <-- 3. Remove mock data import

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // <-- 2. Call the service function instead of using mock data
        console.log("Fetching approved upcoming events..."); // Optional: for debugging
        const fetchedEvents = await eventService.getApprovedUpcomingEvents();
        console.log("Fetched events:", fetchedEvents); // Optional: for debugging

        // Assuming the fetchedEvents structure matches the Event[] type
        // If your API returns dates as strings, you might need to parse them:
        // const processedEvents = fetchedEvents.map(event => ({
        //   ...event,
        //   date: new Date(event.date),
        //   registrationDeadline: new Date(event.registrationDeadline),
        //   createdAt: new Date(event.createdAt),
        //   updatedAt: new Date(event.updatedAt),
        // }));
        // setEvents(processedEvents);

        // If types match directly:
        setEvents(fetchedEvents as Event[]); // Use type assertion if needed

      } catch (error: any) {
        console.error('Error fetching events:', error);
        // Display a more specific error message if available from the service
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
          {/* Consider adding filter/search UI elements here later */}
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
              {/* You might want a more visually appealing loader/spinner component */}
              <div className="loader" /> {/* Replace with your actual loader */}
              <span className="ml-2 text-muted-foreground">Loading events...</span>
            </div>
          ) : (
            <EventList
              events={events}
              emptyMessage={events.length === 0 && !isLoading ? "No approved upcoming events found." : "Loading..."} // Improved empty message
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Events;