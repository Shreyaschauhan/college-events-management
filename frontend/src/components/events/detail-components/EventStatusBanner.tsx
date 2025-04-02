
import React from 'react';
import { CalendarCheck, CircleAlert } from 'lucide-react';
import { EventStatus } from '@/lib/types';

type StatusInfo = Record<EventStatus, { icon: React.ElementType, text: string }>;

const statusInfo: StatusInfo = {
  'pending': {
    icon: CircleAlert,
    text: 'This event is pending approval by an administrator',
  },
  'approved': {
    icon: CalendarCheck,
    text: 'This event has been approved and is open for registration',
  },
  'rejected': {
    icon: CircleAlert,
    text: 'This event has been rejected by an administrator',
  },
};

type EventStatusBannerProps = {
  status: EventStatus;
  statusColors: Record<EventStatus, string>;
};

const EventStatusBanner = ({ status, statusColors }: EventStatusBannerProps) => {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${statusColors[status]}`}>
      {React.createElement(statusInfo[status].icon, { className: "h-5 w-5" })}
      <p className="text-sm">{statusInfo[status].text}</p>
    </div>
  );
};

export { statusInfo };
export default EventStatusBanner;
