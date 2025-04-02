
import React from 'react';
import { Event, EventStatus, User } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

// Import smaller components
import EventHeader from './detail-components/EventHeader';
import EventStatusBanner, { statusInfo } from './detail-components/EventStatusBanner';
import EventInformation from './detail-components/EventInformation';
import ParticipantsList from './detail-components/ParticipantsList';
import EventEnrollmentStatus from './detail-components/EventEnrollmentStatus';
import EventTimeline from './detail-components/EventTimeline';

type EventDetailsProps = {
  event: Event;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
  loadingAction?: 'enroll' | 'approve' | 'reject' | null;
};

const EventDetails = ({ 
  event, 
  isEnrolled = false, 
  onEnroll, 
  onApprove, 
  onReject,
  isLoading = false,
  loadingAction = null,
}: EventDetailsProps) => {
  const { hasRole } = useAuth();
  
  const isPastEvent = new Date(event.date) < new Date();
  const isRegistrationOpen = new Date(event.registrationDeadline) > new Date();
  const isFull = (event.participants?.length || 0) >= event.maxParticipants;
  
  const categoryColors = {
    'Sports': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    'Cultural': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'Technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  };

  const statusColors = {
    'pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    'approved': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    'rejected': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
  };

  const handleEnrollClick = () => {
    if (onEnroll) {
      onEnroll();
    }
  };

  return (
    <div className="space-y-8 animate-expand">
      <div className="relative">
        {/* Event Banner */}
        <div className="rounded-xl h-44 md:h-72 overflow-hidden mb-6 bg-gradient-to-r from-primary/20 to-blue-600/20 shadow-elegant">
          {event.eventImage ? (
            <img 
              src={event.eventImage} 
              alt={event.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="shine w-full h-full" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-6 md:p-8 w-full">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[event.category]}`}>
                  {event.category}
                </span>
                
                {isPastEvent && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    Past Event
                  </span>
                )}
                
                {hasRole(['admin', 'organizer']) && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                )}
              </div>
              
              <h1 className="text-white text-2xl md:text-4xl font-bold shadow-sm">
                {event.name}
              </h1>
              
              {event.organizer?.name && (
                <p className="text-white/80 mt-2">
                  Organized by <span className="font-medium">{event.organizer.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <EventHeader 
        name={event.name}
        category={event.category}
        organizerName={event.organizer?.name}
        status={event.status}
        isPastEvent={isPastEvent}
        isRegistrationOpen={isRegistrationOpen}
        hasAdminRights={hasRole('admin')}
        hasOrganizerRights={hasRole('organizer')}
        onApprove={onApprove}
        onReject={onReject}
        isLoading={!!isLoading}
        loadingAction={loadingAction === 'approve' ? 'approve' : loadingAction === 'reject' ? 'reject' : null}
      />
      
      {/* Status Info Banner */}
      {hasRole(['admin', 'organizer']) && (
        <EventStatusBanner status={event.status} statusColors={statusColors} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="modern-card p-6 shadow-elegant">
            <EventInformation 
              date={event.date} 
              venue={event.venue}
              registrationDeadline={event.registrationDeadline}
              participantCount={event.participants?.length || 0}
              maxParticipants={event.maxParticipants}
              description={event.description}
            />
          </div>
        </div>
        
        <div className="space-y-6 md:col-span-1">
          {hasRole(['admin', 'organizer']) && event.participants && event.participants.length > 0 && (
            <div className="modern-card p-6 shadow-elegant">
              <ParticipantsList 
                participants={event.participants} 
                title="Enrolled Participants" 
              />
            </div>
          )}
          
          {hasRole('student') && event.status === 'approved' && (
            <div className="modern-card p-6 shadow-elegant gradient-border">
              <EventEnrollmentStatus 
                isPastEvent={isPastEvent}
                isRegistrationOpen={isRegistrationOpen}
                isEnrolled={isEnrolled}
                isFull={isFull}
                isLoading={!!isLoading && loadingAction === 'enroll'}
                onEnroll={handleEnrollClick}
              />
            </div>
          )}
          
          <div className="modern-card p-6 shadow-elegant">
            <EventTimeline 
              createdAt={event.createdAt} 
              registrationDeadline={event.registrationDeadline} 
              eventDate={event.date} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
