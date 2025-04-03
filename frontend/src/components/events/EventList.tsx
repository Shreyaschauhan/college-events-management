// src/components/events/EventList.tsx

import { useState } from 'react';
import { Event, EventCategory } from '@/lib/types'; // Make sure Event type has 'title'
import EventCard from '@/components/events/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, CalendarPlus, CalendarDays, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type EventListProps = {
  events: Event[];
  showStatus?: boolean;
  emptyMessage?: string;
};

const EventList = ({
  events,
  showStatus = false,
  emptyMessage = "No events found"
}: EventListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'All'>('All');
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(false);
  console.log(events);
  // Filter events based on search term and category
  const filteredEvents = events.filter(event => {
    // --- MODIFIED SECTION START ---
    // Search filter: Use 'title' instead of 'name' and add checks for undefined/null
    const matchesSearch =
      (event.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (event.venue?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
    // --- MODIFIED SECTION END ---

    // Category filter (ensure event.category exists)
    const matchesCategory = categoryFilter === 'All' || (event.category && event.category === categoryFilter);

    // Upcoming events filter (ensure event.date exists)
    const eventDate = event.date ? new Date(event.date) : null;
    const matchesUpcoming = !showOnlyUpcoming || (eventDate && eventDate > new Date());

    return matchesSearch && matchesCategory && matchesUpcoming;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setShowOnlyUpcoming(false);
  };

  const hasActiveFilters = searchTerm || categoryFilter !== 'All' || showOnlyUpcoming;

  const categoryColors = {
    'Sports': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    'Cultural': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'Technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'All': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    // Add default for potentially undefined category
    'default': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  };

  // Helper function to get color, falling back to default
  const getCategoryColor = (category?: EventCategory | 'All') => {
    return categoryColors[category || 'default'] || categoryColors['default'];
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* --- Filter Section --- */}
      <div className="glass rounded-2xl p-6 shadow-magical">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9 py-5 border-border/50 shadow-inner-glow focus:shadow-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Select */}
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as EventCategory | 'All')}
              >
                 <SelectTrigger className={`w-full sm:w-44 border-border/50 shadow-inner-glow focus:shadow-none py-5 transition-all duration-300 ${getCategoryColor(categoryFilter)}`}>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="shadow-pro">
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter Button */}
              <Button
                variant={showOnlyUpcoming ? "default" : "outline"}
                className={`sm:w-auto w-full py-5 ${showOnlyUpcoming ? 'shadow-none' : 'shadow-inner-glow border-border/50'} transition-all duration-300`}
                onClick={() => setShowOnlyUpcoming(!showOnlyUpcoming)}
              >
                {showOnlyUpcoming ? (
                  <CalendarDays className="mr-2 h-4 w-4" />
                ) : (
                  <CalendarPlus className="mr-2 h-4 w-4" />
                )}
                {showOnlyUpcoming ? "Upcoming Only" : "All Dates"}
              </Button>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="sm:w-auto w-full py-5 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Event List or Empty Message --- */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            // Make sure EventCard uses event.title, event.id etc. correctly
            <EventCard
              key={event._id} // Use event.id which was mapped from _id
              event={event}
              showStatus={showStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 glass rounded-2xl">
          <Calendar className="h-16 w-16 mx-auto text-primary/70 mb-4" />
          <h3 className="text-xl font-medium mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No events match your current search criteria. Try adjusting your filters or check back later.
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-2 border-border/50 shadow-inner-glow hover:shadow-none"
            >
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventList;