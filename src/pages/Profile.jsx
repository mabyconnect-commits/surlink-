import React, { useState } from 'react';
import { useAuth } from '../App';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Edit2,
  Star,
  CheckCircle,
  Calendar,
  Briefcase,
  Shield,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { NIGERIAN_STATES, SERVICE_CATEGORIES, formatDate } from '../lib/constants';

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const isProvider = user?.role === 'provider';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+234 800 000 0000',
    bio: 'Professional service provider with years of experience. Committed to delivering quality work.',
    address: '15 Admiralty Way, Lekki Phase 1',
    state: 'Lagos',
    services: ['plumbing', 'ac_repair'],
    experience: '5-10',
    availability: 'weekdays',
  });

  // Mock provider stats
  const providerStats = {
    rating: 4.8,
    totalReviews: 156,
    completedJobs: 234,
    responseRate: 98,
    memberSince: new Date(Date.now() - 86400000 * 365).toISOString(),
  };

  // Mock reviews
  const reviews = [
    {
      id: '1',
      customer: { name: 'Grace Adeyemi', avatar: null },
      rating: 5,
      comment: 'Excellent service! Very professional and completed the work on time.',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      service: 'Pipe Installation',
    },
    {
      id: '2',
      customer: { name: 'Samuel Nnamdi', avatar: null },
      rating: 5,
      comment: 'Great work, very knowledgeable and efficient.',
      date: new Date(Date.now() - 86400000 * 12).toISOString(),
      service: 'Drain Unblocking',
    },
    {
      id: '3',
      customer: { name: 'Amaka Obi', avatar: null },
      rating: 4,
      comment: 'Good service overall. Would recommend.',
      date: new Date(Date.now() - 86400000 * 20).toISOString(),
      service: 'AC Servicing',
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateUser({ name: formData.name });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-[var(--primary)] text-white text-2xl md:text-3xl">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white hover:bg-[var(--surlink-teal-dark)] transition-colors">
                <Camera size={16} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    {user?.kycStatus === 'verified' && (
                      <CheckCircle className="text-[var(--primary)]" size={20} />
                    )}
                  </div>
                  <p className="text-[var(--muted-foreground)]">{user?.email}</p>

                  {isProvider && (
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={18} />
                        <span className="font-semibold">{providerStats.rating}</span>
                        <span className="text-[var(--muted-foreground)]">({providerStats.totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                        <Briefcase size={16} />
                        <span>{providerStats.completedJobs} jobs</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-sm text-[var(--muted-foreground)]">
                    <Calendar size={14} />
                    <span>Member since {formatDate(providerStats.memberSince)}</span>
                  </div>
                </div>

                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} className="mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              {/* KYC Status */}
              {isProvider && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  user?.kycStatus === 'verified'
                    ? 'bg-[var(--success)]/10 text-[var(--success)]'
                    : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                }`}>
                  <Shield size={18} />
                  <span className="text-sm font-medium">
                    {user?.kycStatus === 'verified'
                      ? 'Verified Provider'
                      : 'Verification Pending'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          {isProvider && <TabsTrigger value="services">Services</TabsTrigger>}
          {isProvider && <TabsTrigger value="reviews">Reviews</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditing ? 'Update your personal details' : 'Your personal details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 text-[var(--foreground)]">
                      <User size={18} className="text-[var(--muted-foreground)]" />
                      {formData.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2 p-2 text-[var(--foreground)]">
                    <Mail size={18} className="text-[var(--muted-foreground)]" />
                    {formData.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 text-[var(--foreground)]">
                      <Phone size={18} className="text-[var(--muted-foreground)]" />
                      {formData.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  {isEditing ? (
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NIGERIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-2 text-[var(--foreground)]">
                      <MapPin size={18} className="text-[var(--muted-foreground)]" />
                      {formData.state}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                  />
                ) : (
                  <div className="flex items-start gap-2 p-2 text-[var(--foreground)]">
                    <MapPin size={18} className="text-[var(--muted-foreground)] mt-0.5" />
                    {formData.address}
                  </div>
                )}
              </div>

              {isProvider && (
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <p className="p-2 text-[var(--foreground)]">{formData.bio}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isProvider && (
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Services you provide to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((serviceId) => {
                    const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
                    return (
                      <div
                        key={serviceId}
                        className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--primary)] font-medium"
                      >
                        {service?.name || serviceId}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <div className="p-3 rounded-lg bg-[var(--secondary)]">
                      {formData.experience === '5-10' ? '5-10 years' : formData.experience}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <div className="p-3 rounded-lg bg-[var(--secondary)]">
                      {formData.availability === 'weekdays' ? 'Weekdays' : formData.availability}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isProvider && (
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      {providerStats.totalReviews} reviews from customers
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    <span className="text-2xl font-bold">{providerStats.rating}</span>
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
        )}
      </Tabs>
    </div>
  );
}

export default Profile;
