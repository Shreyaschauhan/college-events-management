// src/pages/EventDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Event, User } from '@/lib/types';
import EventDetails from '@/components/events/EventDetails';
import EnrollmentForm from '@/components/events/EnrollmentForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { eventService } from '@/services/eventService';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<'enroll' | 'approve' | 'reject' | null>(null);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);

  const fetchEventData = useCallback(async () => {
    if (!id) {
      console.error('Event ID parameter is missing');
      navigate('/events');
      return;
    }

    setIsLoading(true);
    setEvent(null);
    setIsEnrolled(false);

    try {
      const fetchedEvent = await eventService.getEventById(id);

      if (fetchedEvent) {
        // Ensure dates are Date objects
        fetchedEvent.date = new Date(fetchedEvent.date);
        fetchedEvent.registrationDeadline = new Date(fetchedEvent.registrationDeadline);
        fetchedEvent.createdAt = new Date(fetchedEvent.createdAt);
        fetchedEvent.updatedAt = new Date(fetchedEvent.updatedAt);

        setEvent(fetchedEvent);

        // Check enrollment status using user id against participants array of strings
        if (user && user.id && fetchedEvent.participants?.includes(user.id)) {
          setIsEnrolled(true);
        } else {
          setIsEnrolled(false);
        }
      } else {
        toast.error('Event data not found.');
        navigate('/events');
      }
    } catch (error: any) {
      console.error('Error fetching event:', error);
      if (error?.status === 404 || error?.message?.includes('not found')) {
        toast.error('Event not found.');
      } else {
        toast.error(error?.message || 'Failed to load event details');
      }
      navigate('/events');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleEnroll = () => {
    if (!event) return;
    if (!user) {
      toast.info('Please log in to enroll.');
      return;
    }
    if (event.status !== 'approved') {
      toast.warning('Enrollment is not available for this event status.');
      return;
    }
    if (new Date() > new Date(event.registrationDeadline)) {
      toast.warning('The registration deadline has passed.');
      return;
    }
    if (event.participants && event.participants.length >= event.maxParticipants) {
      toast.warning('This event has reached its maximum participant limit.');
      return;
    }

    setEnrollmentDialogOpen(true);
  };

  const handleEnrollmentSubmit = async (formData: any) => {
    if (!user || !user.id || !event || !event._id) return;

    setLoadingAction('enroll');

    try {
      await eventService.enrollUserToEvent(event._id, { userId: user.id });

      setIsEnrolled(true);
      setEnrollmentDialogOpen(false);
      toast.success('Successfully enrolled in the event!');
      console.log('Enrollment form data (not sent to basic enroll endpoint):', formData);

      await fetchEventData();
    } catch (error: any) {
      console.error('Error enrolling in event:', error);
      if (error?.message?.includes('already enrolled')) {
        toast.warning('You are already enrolled in this event.');
        setIsEnrolled(true);
        setEnrollmentDialogOpen(false);
      } else if (error?.message?.includes('capacity')) {
        toast.error('Event is full. Failed to enroll.');
      } else {
        toast.error(error?.message || 'Failed to enroll. Please try again.');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateEventStatus = async (status: 'approved' | 'rejected') => {
    if (!event || !event._id) return;

    const action = status === 'approved' ? 'approve' : 'reject';
    setLoadingAction(action);

    try {
      const updatedEventData = { status: status };
      const updatedEvent = await eventService.updateEvent(event._id, updatedEventData);

      // Ensure dates are Date objects after update
      updatedEvent.date = new Date(updatedEvent.date);
      updatedEvent.registrationDeadline = new Date(updatedEvent.registrationDeadline);
      updatedEvent.createdAt = new Date(updatedEvent.createdAt);
      updatedEvent.updatedAt = new Date(updatedEvent.updatedAt);

      setEvent(updatedEvent);
      toast.success(`Event ${status} successfully`);
    } catch (error: any) {
      console.error(`Error ${action}ing event:`, error);
      toast.error(error?.message || `Failed to ${action} the event. Please try again.`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApproveEvent = () => handleUpdateEventStatus('approved');
  const handleRejectEvent = () => handleUpdateEventStatus('rejected');

  if (isLoading && !event) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The requested event could not be loaded or does not exist.
          </p>
          <Button className="mt-6" onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <EventDetails
        event={event}
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
        onApprove={handleApproveEvent}
        onReject={handleRejectEvent}
        isLoading={loadingAction !== null}
        loadingAction={loadingAction}
        canApproveReject={hasRole('admin')}
        canEnroll={
          user &&
          !isEnrolled &&
          event.status === 'approved' &&
          new Date() <= new Date(event.registrationDeadline) &&
          (!event.participants || event.participants.length < event.maxParticipants)
        }
      />

      <Dialog open={enrollmentDialogOpen} onOpenChange={setEnrollmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enroll in: {event.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <EnrollmentForm
              user={user}
              onSubmit={handleEnrollmentSubmit}
              isLoading={loadingAction === 'enroll'}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;