import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Filter,
  Search,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { formatCurrency, formatDate, formatTime, formatDateTime } from '../lib/constants';
import { bookingsAPI } from '../services/apiClient';

function Bookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isProvider = user?.role === 'provider';

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getAll();
      if (response.success) {
        setBookings(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (isProvider ? booking.customer.name : booking.provider.name).toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return booking.status === activeTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-[var(--warning)] bg-[var(--warning)]/10';
      case 'accepted': return 'text-[var(--info)] bg-[var(--info)]/10';
      case 'in_progress': return 'text-[var(--primary)] bg-[var(--primary)]/10';
      case 'completed': return 'text-[var(--success)] bg-[var(--success)]/10';
      case 'cancelled': return 'text-[var(--destructive)] bg-[var(--destructive)]/10';
      default: return 'text-[var(--muted-foreground)] bg-[var(--muted)]/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      case 'in_progress': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsCancelling(true);
    try {
      const response = await bookingsAPI.cancel(selectedBooking.id, 'Cancelled by user');
      if (response.success) {
        toast.success('Booking cancelled successfully');
        setShowCancelDialog(false);
        setSelectedBooking(null);
        // Refresh bookings list
        fetchBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      const response = await bookingsAPI.accept(bookingId);
      if (response.success) {
        toast.success('Booking accepted successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error(error.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleStartBooking = async (bookingId) => {
    try {
      const response = await bookingsAPI.start(bookingId);
      if (response.success) {
        toast.success('Booking started successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error starting booking:', error);
      toast.error(error.response?.data?.message || 'Failed to start booking');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      const response = await bookingsAPI.complete(bookingId);
      if (response.success) {
        toast.success('Booking completed successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error(error.response?.data?.message || 'Failed to complete booking');
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {isProvider ? 'My Jobs' : 'My Bookings'}
          </h1>
          <p className="text-[var(--muted-foreground)]">
            {isProvider ? 'Manage your service requests and jobs' : 'Track your service bookings'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center">
              <Calendar className="text-[var(--foreground)]" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
              <Clock className="text-[var(--warning)]" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <AlertCircle className="text-[var(--primary)]" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <div className="text-xs text-[var(--muted-foreground)]">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
              <CheckCircle className="text-[var(--success)]" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const otherParty = isProvider ? booking.customer : booking.provider;
                return (
                  <Card
                    key={booking.id}
                    className="cursor-pointer hover:border-[var(--primary)] transition-colors"
                    onClick={() => navigate(`/booking/${booking.id}`)}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="w-12 h-12 hidden md:flex">
                          <AvatarImage src={otherParty.avatar} />
                          <AvatarFallback className="bg-[var(--primary)] text-white">
                            {otherParty.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{booking.service}</h3>
                                <span className={`status-badge ${booking.status} flex items-center gap-1`}>
                                  {getStatusIcon(booking.status)}
                                  {booking.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-[var(--muted-foreground)]">
                                {isProvider ? 'Customer' : 'Provider'}: {otherParty.name}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-lg">{formatCurrency(booking.amount)}</div>
                              {!isProvider && booking.provider.rating && (
                                <div className="flex items-center gap-1 justify-end text-sm">
                                  <Star className="text-yellow-400 fill-yellow-400" size={14} />
                                  {booking.provider.rating}
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                            {booking.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(booking.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {booking.scheduledTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span className="truncate max-w-[200px]">{booking.location}</span>
                            </span>
                          </div>

                          {/* Actions */}
                          {(booking.status === 'pending' || booking.status === 'in_progress') && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${otherParty.phone}`;
                                }}
                              >
                                <Phone size={14} className="mr-1" />
                                Call
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/messages');
                                }}
                              >
                                <MessageSquare size={14} className="mr-1" />
                                Message
                              </Button>
                              {booking.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[var(--destructive)]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBooking(booking);
                                    setShowCancelDialog(true);
                                  }}
                                >
                                  <XCircle size={14} className="mr-1" />
                                  Cancel
                                </Button>
                              )}
                              {isProvider && booking.status === 'pending' && (
                                <Button
                                  size="sm"
                                  className="ml-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptBooking(booking.id);
                                  }}
                                >
                                  Accept Job
                                </Button>
                              )}
                              {isProvider && booking.status === 'accepted' && (
                                <Button
                                  size="sm"
                                  className="ml-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartBooking(booking.id);
                                  }}
                                >
                                  Start Job
                                </Button>
                              )}
                              {isProvider && booking.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  className="ml-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteBooking(booking.id);
                                  }}
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Review for completed */}
                          {booking.status === 'completed' && booking.review && (
                            <div className="mt-4 pt-4 border-t border-[var(--border)]">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={i < booking.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium">{booking.rating}/5</span>
                              </div>
                              <p className="text-sm text-[var(--muted-foreground)]">"{booking.review}"</p>
                            </div>
                          )}

                          {/* Completed without review */}
                          {booking.status === 'completed' && !booking.review && !isProvider && (
                            <div className="mt-4 pt-4 border-t border-[var(--border)]">
                              <Button size="sm" variant="outline">
                                <Star size={14} className="mr-1" />
                                Leave a Review
                              </Button>
                            </div>
                          )}
                        </div>

                        <ChevronRight className="hidden md:block text-[var(--muted-foreground)]" size={20} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="mx-auto mb-4 text-[var(--muted-foreground)]" size={48} />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                {searchQuery
                  ? 'Try adjusting your search'
                  : isProvider
                    ? "You don't have any jobs yet"
                    : "You haven't made any bookings yet"}
              </p>
              {!isProvider && (
                <Button onClick={() => navigate('/search')}>Find a Service</Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="p-4 rounded-lg bg-[var(--secondary)]">
              <p className="font-medium">{selectedBooking.service}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {formatDate(selectedBooking.date)} • {selectedBooking.scheduledTime}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Bookings;
