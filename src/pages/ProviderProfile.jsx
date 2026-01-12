import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, reviewsAPI, bookingsAPI } from '../services/apiClient';
import {
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  MessageSquare,
  Calendar,
  Briefcase,
  Shield,
  ChevronRight,
  Share2,
  Heart,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { SERVICE_CATEGORIES, formatCurrency, formatDate } from '../lib/constants';

function ProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDescription, setBookingDescription] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Fetch provider details
  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setIsLoading(true);
        const [providerResponse, reviewsResponse] = await Promise.all([
          usersAPI.getProviderById(providerId),
          reviewsAPI.getProviderReviews(providerId),
        ]);

        if (providerResponse.success) {
          setProvider(providerResponse.data);
        } else {
          toast.error('Failed to load provider details');
          navigate('/search');
        }

        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching provider:', error);
        toast.error(error.response?.data?.message || 'Failed to load provider details');
        navigate('/search');
      } finally {
        setIsLoading(false);
      }
    };

    if (providerId) {
      fetchProviderData();
    }
  }, [providerId, navigate]);

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingDescription.trim()) {
      toast.error('Please describe your job requirements');
      return;
    }

    setIsBooking(true);
    try {
      const response = await bookingsAPI.create({
        providerId: providerId,
        serviceId: selectedService.id,
        description: bookingDescription,
        amount: selectedService.price,
      });

      if (response.success) {
        toast.success('Booking request sent successfully!');
        setShowBookingDialog(false);
        setBookingDescription('');
        navigate('/bookings');
      } else {
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${provider.name} on Surlink`,
        text: `Check out ${provider.name}'s services on Surlink!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Provider not found</h2>
        <Button onClick={() => navigate('/search')}>Go to Search</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <Avatar className="w-24 h-24 md:w-32 md:h-32 shrink-0">
              <AvatarImage src={provider.avatar} />
              <AvatarFallback className="bg-[var(--primary)] text-white text-2xl md:text-3xl">
                {getInitials(provider.name)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 w-full">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{provider.name}</h1>
                    {provider.verified && (
                      <CheckCircle className="text-[var(--primary)]" size={20} />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {provider.location} • {provider.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {provider.responseTime}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart
                      size={18}
                      className={isFavorite ? 'fill-red-500 text-red-500' : ''}
                    />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400 fill-yellow-400" size={18} />
                  <span className="font-bold">{provider.rating}</span>
                  <span className="text-[var(--muted-foreground)]">({provider.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                  <Briefcase size={16} />
                  <span>{provider.completedJobs} jobs completed</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                  <Calendar size={16} />
                  <span>Member since {formatDate(provider.memberSince)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Button onClick={() => handleBookService(provider.services[0])}>
                  Book Now
                </Button>
                <Button variant="outline">
                  <Phone size={16} className="mr-2" />
                  Call
                </Button>
                <Button variant="outline" onClick={() => navigate('/messages')}>
                  <MessageSquare size={16} className="mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({provider.reviews})</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--muted-foreground)]">{provider.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] mb-2">Working Days</p>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <span
                        key={day}
                        className={`px-3 py-1 rounded-full text-sm ${
                          provider.availability.includes(day)
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Working Hours</p>
                  <p className="font-medium">{provider.workingHours}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {provider.services.map((service) => (
              <Card key={service.id} className="hover:border-[var(--primary)] transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{service.name}</h3>
                    <div className="text-right">
                      <div className="font-bold text-[var(--primary)]">{formatCurrency(service.price)}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{service.duration}</div>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleBookService(service)}
                  >
                    Book This Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Customer Reviews</CardTitle>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400 fill-yellow-400" size={24} />
                  <span className="text-2xl font-bold">{provider.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-lg bg-[var(--secondary)]">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.customer.avatar} />
                          <AvatarFallback className="bg-[var(--primary)]/10 text-[var(--primary)] text-sm">
                            {review.customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.customer.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{review.service}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {formatDate(review.date)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {portfolio.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-xl bg-[var(--secondary)] flex items-center justify-center"
              >
                <div className="text-center">
                  <Briefcase className="mx-auto mb-2 text-[var(--muted-foreground)]" size={32} />
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
            <DialogDescription>
              Request a booking with {provider.name}
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-[var(--secondary)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{selectedService.name}</h3>
                  <span className="font-bold text-[var(--primary)]">
                    {formatCurrency(selectedService.price)}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Estimated duration: {selectedService.duration}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Describe your job</Label>
                <Textarea
                  placeholder="Tell us more about what you need done..."
                  rows={4}
                  value={bookingDescription}
                  onChange={(e) => setBookingDescription(e.target.value)}
                />
              </div>

              <div className="p-4 rounded-lg bg-[var(--accent)]">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-[var(--primary)]" size={18} />
                  <span className="font-semibold text-[var(--primary)]">Secure Payment</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Payment will be held in escrow until the job is completed to your satisfaction.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)} disabled={isBooking}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} disabled={isBooking}>
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Booking Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProviderProfile;
