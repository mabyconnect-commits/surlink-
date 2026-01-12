import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { bookingsAPI, reviewsAPI } from '../services/apiClient';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { formatCurrency, formatDate, formatTime, formatDateTime } from '../lib/constants';

function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const isProvider = user?.role === 'provider';

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsFetching(true);
        const response = await bookingsAPI.getById(bookingId);
        if (response.success) {
          setBooking(response.data);
        } else {
          toast.error('Failed to load booking details');
          navigate('/bookings');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error(error.response?.data?.message || 'Failed to load booking details');
        navigate('/bookings');
      } finally {
        setIsFetching(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, navigate]);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await bookingsAPI.cancel(bookingId, 'User requested cancellation');
      if (response.success) {
        toast.success('Booking cancelled successfully');
        setShowCancelDialog(false);
        // Refresh booking data
        const updatedBooking = await bookingsAPI.getById(bookingId);
        if (updatedBooking.success) {
          setBooking(updatedBooking.data);
        }
      } else {
        toast.error(response.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await bookingsAPI.complete(bookingId);
      if (response.success) {
        toast.success('Job marked as complete!');
        setShowCompleteDialog(false);
        // Refresh booking data
        const updatedBooking = await bookingsAPI.getById(bookingId);
        if (updatedBooking.success) {
          setBooking(updatedBooking.data);
        }
      } else {
        toast.error(response.message || 'Failed to complete job');
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error(error.response?.data?.message || 'Failed to complete job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setIsLoading(true);
    try {
      const response = await reviewsAPI.create({
        bookingId: bookingId,
        providerId: booking.provider.id,
        rating: rating,
        comment: review,
      });
      if (response.success) {
        toast.success('Review submitted successfully!');
        setShowReviewDialog(false);
        setRating(0);
        setReview('');
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-[var(--success)]" size={20} />;
      case 'cancelled': return <XCircle className="text-[var(--destructive)]" size={20} />;
      case 'in_progress': return <Clock className="text-[var(--primary)]" size={20} />;
      default: return <AlertCircle className="text-[var(--warning)]" size={20} />;
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Booking not found</h2>
        <Button onClick={() => navigate('/bookings')}>Go to Bookings</Button>
      </div>
    );
  }

  const otherParty = isProvider ? booking.customer : booking.provider;
  const timeline = [
    { status: 'created', label: 'Booking Created', date: booking.createdAt },
    ...(booking.acceptedAt ? [{ status: 'accepted', label: 'Provider Accepted', date: booking.acceptedAt }] : []),
    ...(booking.startedAt ? [{ status: 'in_progress', label: 'Job Started', date: booking.startedAt }] : []),
    ...(booking.completedAt ? [{ status: 'completed', label: 'Job Completed', date: booking.completedAt }] : []),
    ...(booking.cancelledAt ? [{ status: 'cancelled', label: 'Booking Cancelled', date: booking.cancelledAt }] : []),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{booking.service}</h1>
          <p className="text-[var(--muted-foreground)]">Booking #{booking.id}</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(booking.status)}
              <div>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status.replace('_', ' ')}
                </span>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {booking.status === 'in_progress' && 'Job is currently in progress'}
                  {booking.status === 'pending' && 'Waiting for provider confirmation'}
                  {booking.status === 'completed' && 'Job has been completed'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(booking.amount)}</div>
              {isProvider && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  You earn: {formatCurrency(booking.netAmount)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider/Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isProvider ? 'Customer' : 'Service Provider'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={otherParty.avatar} />
              <AvatarFallback className="bg-[var(--primary)] text-white text-lg">
                {getInitials(otherParty.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{otherParty.name}</h3>
                {!isProvider && booking.provider.verified && (
                  <CheckCircle className="text-[var(--primary)]" size={16} />
                )}
              </div>
              {!isProvider && (
                <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                  <Star className="text-yellow-400 fill-yellow-400" size={14} />
                  {booking.provider.rating} rating
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.href = `tel:${otherParty.phone}`}
              >
                <Phone size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/messages')}
              >
                <MessageSquare size={18} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="text-[var(--muted-foreground)] mt-0.5" size={18} />
            <div>
              <p className="font-medium">{formatDate(booking.date)}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{booking.scheduledTime}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="text-[var(--muted-foreground)] mt-0.5" size={18} />
            <div>
              <p className="font-medium">{booking.location}</p>
              <Button variant="link" className="h-auto p-0 text-[var(--primary)]">
                Open in Maps
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <p className="text-sm font-medium mb-2">Job Description</p>
            <p className="text-sm text-[var(--muted-foreground)]">{booking.description}</p>
          </div>

          {booking.notes && (
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-sm font-medium mb-2">Additional Notes</p>
              <p className="text-sm text-[var(--muted-foreground)]">{booking.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign size={18} />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Service Amount</span>
            <span className="font-medium">{formatCurrency(booking.amount)}</span>
          </div>
          {isProvider && (
            <>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Platform Fee (15%)</span>
                <span className="text-[var(--destructive)]">-{formatCurrency(booking.platformFee)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                <span className="font-semibold">Your Earnings</span>
                <span className="font-bold text-[var(--success)]">{formatCurrency(booking.netAmount)}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 pt-3 text-sm text-[var(--muted-foreground)]">
            <Shield size={14} />
            Payment held in escrow until job completion
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={item.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-[var(--border)] my-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {formatDateTime(item.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {booking.status === 'pending' && (
          <Button
            variant="outline"
            className="text-[var(--destructive)]"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel Booking
          </Button>
        )}

        {isProvider && booking.status === 'in_progress' && (
          <Button onClick={() => setShowCompleteDialog(true)}>
            <CheckCircle size={18} className="mr-2" />
            Mark as Complete
          </Button>
        )}

        {!isProvider && booking.status === 'completed' && (
          <Button onClick={() => setShowReviewDialog(true)}>
            <Star size={18} className="mr-2" />
            Leave a Review
          </Button>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Job as Complete</DialogTitle>
            <DialogDescription>
              Confirm that you have completed this job. The customer will be notified and payment will be released.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Not Yet
            </Button>
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Completion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {booking.provider.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review">Your Review</Label>
              <Textarea
                id="review"
                placeholder="Tell others about your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BookingDetails;
