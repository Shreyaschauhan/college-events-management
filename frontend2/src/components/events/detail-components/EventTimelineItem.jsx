import React from 'react';


const EventTimelineItem = ({ icon: Icon, title, date }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
    </div>
  );
};

export default EventTimelineItem;