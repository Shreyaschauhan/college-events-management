import React from 'react';
import { CalendarCheck, CircleAlert } from 'lucide-react';


const statusInfo = {
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

/**
 * @typedef {Object} EventStatusBannerProps
 * @property {EventStatus} status - The current status of the event.
 * @property {Record<EventStatus, string>} statusColors - A mapping of event statuses to their corresponding color classes.
 */

/**
 * Component to display a banner indicating the status of an event.
 * @param {EventStatusBannerProps} props - The props for the component.
 */
const EventStatusBanner = ({ status, statusColors }) => {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${statusColors[status]}`}>
      {React.createElement(statusInfo[status].icon, { className: "h-5 w-5" })}
      <p className="text-sm">{statusInfo[status].text}</p>
    </div>
  );
};

export { statusInfo };
export default EventStatusBanner;