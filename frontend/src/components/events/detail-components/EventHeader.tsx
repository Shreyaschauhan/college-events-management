
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventCategory, EventStatus } from '@/lib/types';

type EventHeaderProps = {
  name: string;
  category: EventCategory;
  organizerName?: string;
  status: EventStatus;
  isPastEvent: boolean;
  isRegistrationOpen: boolean;
  hasAdminRights: boolean;
  hasOrganizerRights: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading: boolean;
  loadingAction: 'approve' | 'reject' | null;
};

const EventHeader = ({ 
  name, 
  category, 
  organizerName, 
  status, 
  isPastEvent, 
  isRegistrationOpen,
  hasAdminRights,
  hasOrganizerRights,
  onApprove,
  onReject,
  isLoading,
  loadingAction
}: EventHeaderProps) => {
  const categoryColors = {
    'Sports': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'Cultural': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'Technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    'approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  return (
    <div className="flex justify-between items-start flex-wrap gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={categoryColors[category] || ""}>
            {category}
          </Badge>
          
          {isPastEvent && (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
              Past Event
            </Badge>
          )}
          
          {(hasAdminRights || hasOrganizerRights) && (
            <Badge className={statusColors[status] || ""} variant="outline">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )}

          {!isRegistrationOpen && !isPastEvent && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
              Registration Closed
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl font-bold">{name}</h1>
        
        {organizerName && (
          <p className="text-muted-foreground">
            Organized by <span className="font-medium text-foreground">{organizerName}</span>
          </p>
        )}
      </div>
      
      <div className="flex gap-2">
        {hasAdminRights && status === 'pending' && (
          <>
            <Button 
              variant="outline" 
              onClick={onReject} 
              disabled={isLoading}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              {isLoading && loadingAction === 'reject' ? (
                <div className="flex items-center">
                  <div className="loader mr-2" />
                  <span>Rejecting...</span>
                </div>
              ) : (
                <span>Reject Event</span>
              )}
            </Button>
            <Button 
              onClick={onApprove} 
              disabled={isLoading}
            >
              {isLoading && loadingAction === 'approve' ? (
                <div className="flex items-center">
                  <div className="loader mr-2" />
                  <span>Approving...</span>
                </div>
              ) : (
                <span>Approve Event</span>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EventHeader;
