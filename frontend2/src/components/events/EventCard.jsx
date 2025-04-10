import { CalendarClock, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * @typedef {Object} Event
 * @property {string} _id - The unique ID of the event.
 * @property {string} name - The name of the event.
 * @property {string} description - The description of the event.
 * @property {string} category - The category of the event (e.g., Sports, Cultural, Technical).
 * @property {string} status - The status of the event (e.g., pending, approved, rejected).
 * @property {string} venue - The venue of the event.
 * @property {Date} date - The date of the event.
 * @property {Date} registrationDeadline - The registration deadline for the event.
 * @property {string} [eventImage] - The image URL for the event (optional).
 * @property {number} maxParticipants - The maximum number of participants allowed.
 * @property {Array<Object>} [participants] - The list of participants (optional).
 */

/**
 * @typedef {Object} EventCardProps
 * @property {Event} event - The event data to display.
 * @property {boolean} [showStatus] - Whether to show the event status badge.
 */

/**
 * Component to display an event card.
 * @param {EventCardProps} props - The props for the component.
 */
const EventCard = ({ event, showStatus = false }) => {
  const isPastEvent = new Date(event.date) < new Date();
  const isRegistrationOpen = new Date(event.registrationDeadline) > new Date();

  const categoryColors = {
    'Sports': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800',
    'Cultural': 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-100 border-purple-200 dark:border-purple-800',
    'Technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-100 border-blue-200 dark:border-blue-800',
  };

  const statusColors = {
    'pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100 border-amber-200 dark:border-amber-800',
    'approved': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800',
    'rejected': 'bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-100 border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="elegant-card group overflow-hidden">
      {/* Card Image or Gradient Banner */}
      <div className="h-36 bg-gradient-to-r from-primary/20 via-blue-500/10 to-blue-600/20 relative">
        {event.eventImage ? (
          <img 
            src={event.eventImage} 
            alt={event.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-40 bg-diagonal-pattern bg-[length:10px_10px]">
            <div className="shine" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent"></div>
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className={`${categoryColors[event.category] || ""} border shadow-soft`} variant="outline">
            {event.category}
          </Badge>
          
          {showStatus && (
            <Badge className={`${statusColors[event.status] || ""} border shadow-soft`} variant="outline">
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-xl leading-tight group-hover:text-primary transition-colors duration-300">{event.name}</h3>
          
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {isPastEvent && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                Past Event
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <CalendarClock className="h-4 w-4 text-primary" />
            </div>
            <span className="truncate">{format(new Date(event.date), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="truncate">{format(new Date(event.date), 'p')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="truncate">
              {event.participants?.length || 0} / {event.maxParticipants}
            </span>
          </div>
        </div>
      </div>
      
      {!showStatus && (
        <Link 
          to={`/events/${event._id}`}
          className="block p-5 border-t border-border/50 bg-card/80 hover:bg-muted/30 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div>
              {!isPastEvent && isRegistrationOpen ? (
                <>
                  <span className="text-sm font-medium">Registration closes on</span>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.registrationDeadline), 'PPP')}
                  </p>
                </>
              ) : isPastEvent ? (
                <span className="text-sm text-muted-foreground">Event completed</span>
              ) : (
                <span className="text-sm text-muted-foreground">Registration closed</span>
              )}
            </div>
            
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white shrink-0 transition-all duration-300 group-hover:shadow-md"
            >
              <span className="mr-1">View Details</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </Button>
          </div>
        </Link>
      )}
    </div>
  );
};

export default EventCard;