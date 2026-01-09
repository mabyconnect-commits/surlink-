import React, { useState } from 'react';
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

function Bookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isProvider = user?.role === 'provider';

  // Mock bookings data
  const bookings = [
    {
      id: '1',
      service: 'Pipe Installation',
      category: 'plumbing',
      description: 'Install new water pipes in the bathroom',
      provider: { id: 'p1', name: 'Chinedu Okafor', avatar: null, rating: 4.9, phone: '+234 800 000 0001' },
      customer: { id: 'c1', name: 'Grace Adeyemi', avatar: null, phone: '+234 800 000 0002' },
      status: 'in_progress',
      date: new Date().toISOString(),
      scheduledTime: '10:00 AM - 12:00 PM',
      location: '15 Admiralty Way, Lekki Phase 1, Lagos',
      amount: 25000,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: '2',
      service: 'Drain Unblocking',
      category: 'plumbing',
      description: 'Kitchen sink is blocked and needs clearing',
      provider: { id: 'p2', name: 'Mike Adebayo', avatar: null, rating: 4.8, phone: '+234 800 000 0003' },
      customer: { id: 'c2', name: 'Samuel Nnamdi', avatar: null, phone: '+234 800 000 0004' },
      status: 'pending',
      date: new Date(Date.now() + 86400000).toISOString(),
      scheduledTime: '2:00 PM - 4:00 PM',
      location: '28 Ozumba Mbadiwe Ave, Victoria Island, Lagos',
      amount: 15000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      service: 'AC Servicing',
      category: 'ac_repair',
      description: 'Annual maintenance for 3 split units',
      provider: { id: 'p3', name: 'David Eze', avatar: null, rating: 4.7, phone: '+234 800 000 0005' },
      customer: { id: 'c3', name: 'Amaka Obi', avatar: null, phone: '+234 800 000 0006' },
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      scheduledTime: '9:00 AM - 1:00 PM',
      location: '5 Allen Avenue, Ikeja, Lagos',
      amount: 45000,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      rating: 5,
      review: 'Excellent service! Very professional and thorough.',
    },
    {
      id: '4',
      service: 'Home Cleaning',
      category: 'cleaning',
      description: 'Deep cleaning for 3 bedroom apartment',
      provider: { id: 'p4', name: 'Fatima Ibrahim', avatar: null, rating: 4.9, phone: '+234 800 000 0007' },
      customer: { id: 'c4', name: 'Tunde Bakare', avatar: null, phone: '+234 800 000 0008' },
      status: 'cancelled',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      scheduledTime: '8:00 AM - 12:00 PM',
      location: '10 Bourdillon Road, Ikoyi, Lagos',
      amount: 20000,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      cancelledAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      cancelReason: 'Customer requested cancellation due to travel plans',
    },
  ];

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
    setIsCancelling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Booking cancelled successfully');
      setShowCancelDialog(false);
      setSelectedBooking(null);
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

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
                                <Button size="sm" className="ml-auto">
                                  Accept Job
                                </Button>
                              )}
                              {isProvider && booking.status === 'in_progress' && (
                                <Button size="sm" className="ml-auto">
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
