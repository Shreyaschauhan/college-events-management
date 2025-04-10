import React from 'react';
import { Button } from '@/components/ui/button';

const EventEnrollmentStatus = ({ 
  isPastEvent, 
  isRegistrationOpen, 
  isEnrolled, 
  isFull, 
  isLoading, 
  onEnroll 
}) => {
  return (
    <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
      <h3 className="text-xl font-medium">Enrollment Status</h3>
      
      {isPastEvent ? (
        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm">This event has already taken place.</p>
        </div>
      ) : !isRegistrationOpen ? (
        <div className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-100 p-4 rounded-md">
          <p className="text-sm">Registration for this event has closed.</p>
        </div>
      ) : isEnrolled ? (
        <div className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-100 p-4 rounded-md">
          <p className="text-sm">You are enrolled in this event. We look forward to seeing you there!</p>
        </div>
      ) : isFull ? (
        <div className="bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-100 p-4 rounded-md">
          <p className="text-sm">This event has reached its participant limit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Spots are limited. Enroll now to secure your place!</p>
          <Button 
            onClick={onEnroll}
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loader mr-2" />
                <span>Enrolling...</span>
              </div>
            ) : (
              <span>Enroll Now</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventEnrollmentStatus;