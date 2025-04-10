import React from 'react';
import { CalendarClock, Clock, MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import EventInfoItem from './EventInfoItem';
import { Separator } from '@/components/ui/separator';


const EventInformation = ({ 
  date, 
  venue, 
  registrationDeadline, 
  participantCount, 
  maxParticipants,
  description
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Event Details</h3>
        <p className="text-muted-foreground whitespace-pre-line">
          {description}
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Event Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <EventInfoItem 
            icon={CalendarClock}
            label="Date"
            value={format(new Date(date), 'EEEE, MMMM do, yyyy')}
          />
          
          <EventInfoItem 
            icon={Clock}
            label="Time"
            value={format(new Date(date), 'h:mm a')}
          />
          
          <EventInfoItem 
            icon={MapPin}
            label="Venue"
            value={venue}
          />
          
          <EventInfoItem 
            icon={Calendar}
            label="Registration Deadline"
            value={`${format(new Date(registrationDeadline), 'MMMM do, yyyy')} at ${format(new Date(registrationDeadline), 'h:mm a')}`}
          />
          
          <EventInfoItem 
            icon={Users}
            label="Participation"
            value={`${participantCount} / ${maxParticipants} participants`}
          />
        </div>
      </div>
    </div>
  );
};

export default EventInformation;