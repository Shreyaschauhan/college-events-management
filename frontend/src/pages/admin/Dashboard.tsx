import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CalendarClock,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  UserRound,
  UserCog
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event, User } from '@/lib/types'; // Assuming User type has { id, name, email, role }
import EventList from '@/components/events/EventList';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { adminService } from '@/services/adminService'; // Import the service
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading states

// Define types for the dashboard stats and dialog users
interface DashboardStats {
  totalUsers: number;
  studentCount: number;
  organizerCount: number;
  pendingEventCount: number;
}

const AdminDashboard = () => {
  const { user, requireAuth } = useAuth(); // Assuming useAuth provides user object with role
  const navigate = useNavigate();

  // State for events
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // State for dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // State for Users Dialog
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'all' | 'student' | 'organizer'>('all');
  const [dialogUsers, setDialogUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // State for button loading
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({});
  const [isRejecting, setIsRejecting] = useState<Record<string, boolean>>({});

  // Ensure user is authenticated as admin
  useEffect(() => {
    requireAuth(() => {
      // Callback executed if authentication is successful and role is admin
    }, 'admin');
  }, [requireAuth]);


  // Fetch initial dashboard data (Events and Stats)
  const loadDashboardData = useCallback(async () => {
    setIsLoadingEvents(true);
    setIsLoadingStats(true);
    try {
      // Fetch events and stats in parallel
      const [fetchedEvents, fetchedStats] = await Promise.all([
        adminService.getAllEventsForAdmin(),
        adminService.getDashboardStats(),
      ]);

      // Process events
      setEvents(fetchedEvents);
      setPendingEvents(fetchedEvents.filter(event => event.status === 'pending'));
      setApprovedEvents(fetchedEvents.filter(event => event.status === 'approved'));
      setRejectedEvents(fetchedEvents.filter(event => event.status === 'rejected'));

      // Set stats
      setDashboardStats(fetchedStats);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.message || 'Failed to load dashboard data');
      // Keep previous state or set to empty/null on error? Setting empty/null:
      setEvents([]);
      setPendingEvents([]);
      setApprovedEvents([]);
      setRejectedEvents([]);
      setDashboardStats(null);
    } finally {
      setIsLoadingEvents(false);
      setIsLoadingStats(false);
    }
  }, []); // No dependencies needed if service calls don't depend on changing props/state here

  useEffect(() => {
    if (user?.role === 'admin') { // Only fetch if user is confirmed admin
        loadDashboardData();
    }
  }, [user, loadDashboardData]); // Depend on user and the load function


  const handleApproveEvent = async (eventId: string) => {
    setIsApproving(prev => ({ ...prev, [eventId]: true }));
    try {
      const updatedEvent = await adminService.approveEvent(eventId);
      toast.success(`Event "${updatedEvent.name}" has been approved`);

      // Update local state efficiently
      setEvents(prevEvents => prevEvents.map(e => e.id === eventId ? updatedEvent : e));
      setPendingEvents(prevPending => prevPending.filter(e => e.id !== eventId));
      // Add to approved, ensuring no duplicates if somehow already there
      setApprovedEvents(prevApproved => [updatedEvent, ...prevApproved.filter(e => e.id !== eventId)]);

      // Update stats count locally for immediate feedback (optional but nice)
      setDashboardStats(prev => prev ? ({...prev, pendingEventCount: Math.max(0, prev.pendingEventCount - 1)}) : null);

    } catch (error: any) {
      console.error('Error approving event:', error);
      toast.error(error.message || 'Failed to approve event');
    } finally {
      setIsApproving(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleRejectEvent = async (eventId: string) => {
     setIsRejecting(prev => ({ ...prev, [eventId]: true }));
    try {
      const updatedEvent = await adminService.rejectEvent(eventId);
      toast.success(`Event "${updatedEvent.name}" has been rejected`);

      // Update local state efficiently
      setEvents(prevEvents => prevEvents.map(e => e.id === eventId ? updatedEvent : e));
      setPendingEvents(prevPending => prevPending.filter(e => e.id !== eventId));
       // Add to rejected, ensuring no duplicates
      setRejectedEvents(prevRejected => [updatedEvent, ...prevRejected.filter(e => e.id !== eventId)]);

       // Update stats count locally
      setDashboardStats(prev => prev ? ({...prev, pendingEventCount: Math.max(0, prev.pendingEventCount - 1)}) : null);

    } catch (error: any) {
      console.error('Error rejecting event:', error);
      toast.error(error.message || 'Failed to reject event');
    } finally {
       setIsRejecting(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const openUsersDialog = async (type: 'all' | 'student' | 'organizer') => {
    setSelectedUserType(type);
    setShowUsersDialog(true);
    setIsLoadingUsers(true); // Start loading users for the dialog
    setDialogUsers([]); // Clear previous users
    try {
      // Fetch users based on the selected type ('all' maps to undefined/null for the service)
      const roleToFetch = type === 'all' ? undefined : type;
      const fetchedUsers = await adminService.getUsers(roleToFetch);
      setDialogUsers(fetchedUsers);
    } catch (error: any) {
      console.error(`Error fetching ${type} users:`, error);
      toast.error(error.message || `Failed to load ${type} users`);
      setDialogUsers([]); // Set to empty on error
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Render guard: Wait for authentication check and user role confirmation
  if (!user || user.role !== 'admin') {
     // You might want a dedicated loading spinner here while useAuth is resolving
     // Or rely on requireAuth to handle redirection if not logged in/admin
    return null;
  }

  // Calculate total events count *after* events are loaded
  const totalEventsCount = events.length;
  // Use fetched stats for pending count display in the card/tab
  const totalPendingEventsCount = dashboardStats?.pendingEventCount ?? pendingEvents.length; // Fallback if stats not loaded yet

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Users Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openUsersDialog('all')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats?.totalUsers ?? 'N/A'}</div>
            )}
            <p className="text-xs text-muted-foreground">Across all roles</p>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openUsersDialog('student')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats?.studentCount ?? 'N/A'}</div>
            )}
            <p className="text-xs text-muted-foreground">Student users</p>
          </CardContent>
        </Card>

        {/* Organizers Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openUsersDialog('organizer')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Organizers</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats?.organizerCount ?? 'N/A'}</div>
            )}
            <p className="text-xs text-muted-foreground">Event organizers</p>
          </CardContent>
        </Card>

        {/* Pending Events Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingStats ? ( // Can use either stats or event loading state
              <Skeleton className="h-8 w-1/2" />
            ) : (
               // Use stats count primarily, fallback to filtered list length
              <div className="text-2xl font-bold">{totalPendingEventsCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Pending ({isLoadingEvents ? '...' : totalPendingEventsCount})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>Approved ({isLoadingEvents ? '...' : approvedEvents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>Rejected ({isLoadingEvents ? '...' : rejectedEvents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            <span>All Events ({isLoadingEvents ? '...' : totalEventsCount})</span>
          </TabsTrigger>
        </TabsList>

        {/* Pending Events Tab Content */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Events</CardTitle>
              <CardDescription>These events are awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : pendingEvents.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">No pending events to review</p>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            By {event.organizer?.name ?? 'Unknown Organizer'} • {format(new Date(event.date), 'PPP')} {/* Use PPP for locale-aware date */}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm" // Make buttons smaller
                            className="border-destructive text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                            onClick={() => handleRejectEvent(event.id)}
                            disabled={isRejecting[event.id] || isApproving[event.id]} // Disable if rejecting or approving
                          >
                            {isRejecting[event.id] ? 'Rejecting...' : 'Reject'}
                          </Button>
                          <Button
                            size="sm" // Make buttons smaller
                            className="flex-1 sm:flex-none"
                            onClick={() => handleApproveEvent(event.id)}
                            disabled={isApproving[event.id] || isRejecting[event.id]} // Disable if approving or rejecting
                          >
                             {isApproving[event.id] ? 'Approving...' : 'Approve'}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2">{event.description}</p>
                      <div className="flex gap-2 text-sm">
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate(`/events/${event.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Events Tab Content */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Events</CardTitle>
              <CardDescription>Events that have been approved by administrators</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                 <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ) : (
                <EventList
                  events={approvedEvents}
                  showStatus={false} // Status is implied by the tab
                  emptyMessage="No approved events"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Events Tab Content */}
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Events</CardTitle>
              <CardDescription>Events that were not approved</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                 <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ) : (
                <EventList
                  events={rejectedEvents}
                  showStatus={false} // Status is implied
                  emptyMessage="No rejected events"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Events Tab Content */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <CardDescription>Complete list of all events in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                 <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ) : (
                <EventList
                  events={events}
                  showStatus={true} // Show status here as it's mixed
                  emptyMessage="No events found"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Users Dialog */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col"> {/* Make dialog content flex column */}
          <DialogHeader>
            <DialogTitle>
              {selectedUserType === 'all'
                ? 'All Users'
                : selectedUserType === 'student'
                  ? 'Students'
                  : 'Organizers'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex-grow overflow-y-auto"> {/* Make table container grow and scroll */}
            {isLoadingUsers ? (
                <div className="space-y-2 p-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : dialogUsers.length === 0 ? (
                 <p className="text-center py-6 text-muted-foreground">No users found for this role.</p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dialogUsers.map((u) => ( // Use fetched dialogUsers state
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;