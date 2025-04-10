import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import EventTimelineItem from './EventTimelineItem';


const EventTimeline = ({ createdAt, registrationDeadline, eventDate }) => {
  return (
    <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
      <h3 className="text-xl font-medium">Event Timeline</h3>
      
      <div className="space-y-4">
        <EventTimelineItem 
          icon={Calendar} 
          title="Registration Opens" 
          date={format(new Date(createdAt), 'MMMM do, yyyy')} 
        />
        
        <EventTimelineItem 
          icon={Calendar} 
          title="Registration Deadline" 
          date={`${format(new Date(registrationDeadline), 'MMMM do, yyyy')} at ${format(new Date(registrationDeadline), 'h:mm a')}`} 
        />
        
        <EventTimelineItem 
          icon={Calendar} 
          title="Event Date" 
          date={`${format(new Date(eventDate), 'MMMM do, yyyy')} at ${format(new Date(eventDate), 'h:mm a')}`} 
        />
      </div>
    </div>
  );
};

export default EventTimeline;