import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Calendar,
  Clock,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Scissors,
  Car,
  Wind,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { SERVICE_CATEGORIES, formatCurrency, formatDate } from '../../lib/constants';

// Icon mapping
const iconMap = {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Car, Wind,
};

function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data for recent bookings
  const recentBookings = [
    {
      id: '1',
      service: 'Plumbing',
      provider: { name: 'John Okoro', avatar: null, rating: 4.8 },
      status: 'completed',
      date: new Date().toISOString(),
      amount: 15000,
    },
    {
      id: '2',
      service: 'Electrical',
      provider: { name: 'Ada Nweke', avatar: null, rating: 4.9 },
      status: 'in_progress',
      date: new Date().toISOString(),
      amount: 25000,
    },
  ];

  // Mock nearby providers
  const nearbyProviders = [
    {
      id: '1',
      name: 'Mike Adebayo',
      service: 'Electrician',
      rating: 4.9,
      jobs: 234,
      distance: '0.8 km',
      price: 'From NGN 5,000',
      avatar: null,
      verified: true,
    },
    {
      id: '2',
      name: 'Sarah Okonkwo',
      service: 'Cleaner',
      rating: 4.8,
      jobs: 156,
      distance: '1.2 km',
      price: 'From NGN 3,000',
      avatar: null,
      verified: true,
    },
    {
      id: '3',
      name: 'David Eze',
      service: 'Plumber',
      rating: 4.7,
      jobs: 89,
      distance: '1.5 km',
      price: 'From NGN 4,500',
      avatar: null,
      verified: true,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-[var(--success)] bg-[var(--success)]/10';
      case 'in_progress': return 'text-[var(--primary)] bg-[var(--primary)]/10';
      case 'pending': return 'text-[var(--warning)] bg-[var(--warning)]/10';
      default: return 'text-[var(--muted-foreground)] bg-[var(--muted)]/10';
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-[var(--muted-foreground)]">
            What service do you need today?
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <MapPin size={16} />
          <span>Lagos, Nigeria</span>
          <Button variant="link" size="sm" className="text-[var(--primary)] p-0">
            Change
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={20} />
              <Input
                type="text"
                placeholder="Search for a service..."
                className="pl-12 h-12"
              />
            </div>
            <Button size="lg" className="h-12 px-8" onClick={() => navigate('/search')}>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <Calendar className="text-[var(--primary)]" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-[var(--muted-foreground)]">Total Bookings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
              <CheckCircle className="text-[var(--success)]" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">10</div>
              <div className="text-xs text-[var(--muted-foreground)]">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
              <Clock className="text-[var(--warning)]" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-xs text-[var(--muted-foreground)]">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--info)]/10 flex items-center justify-center">
              <TrendingUp className="text-[var(--info)]" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(150000)}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Total Spent</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Browse Services</h2>
          <Button variant="link" className="text-[var(--primary)]" onClick={() => navigate('/search')}>
            View All <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {SERVICE_CATEGORIES.slice(0, 8).map((category) => {
            const Icon = iconMap[category.icon] || Wrench;
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/search?category=${category.id}`)}
                className="flex flex-col items-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all hover:shadow-md"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-center line-clamp-1">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nearby Providers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Top Rated Near You</h2>
          <Button variant="link" className="text-[var(--primary)]" onClick={() => navigate('/search')}>
            See More <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {nearbyProviders.map((provider) => (
            <Card key={provider.id} className="provider-card cursor-pointer" onClick={() => navigate(`/provider/${provider.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={provider.avatar} />
                    <AvatarFallback className="bg-[var(--primary)] text-white">
                      {provider.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{provider.name}</h3>
                      {provider.verified && (
                        <CheckCircle className="text-[var(--primary)] shrink-0" size={14} />
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">{provider.service}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={12} />
                        {provider.rating}
                      </span>
                      <span className="text-[var(--muted-foreground)]">{provider.jobs} jobs</span>
                      <span className="text-[var(--muted-foreground)]">{provider.distance}</span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--primary)] mt-2">{provider.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Button variant="link" className="text-[var(--primary)]" onClick={() => navigate('/bookings')}>
            View All <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            {recentBookings.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/booking/${booking.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-[var(--secondary)] transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={booking.provider.avatar} />
                      <AvatarFallback className="bg-[var(--primary)]/10 text-[var(--primary)]">
                        {booking.provider.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{booking.service}</span>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {booking.provider.name} • {formatDate(booking.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(booking.amount)}</div>
                      <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <Star className="text-yellow-400 fill-yellow-400" size={10} />
                        {booking.provider.rating}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Calendar className="mx-auto mb-3 text-[var(--muted-foreground)]" size={40} />
                <p className="text-[var(--muted-foreground)]">No bookings yet</p>
                <Button className="mt-4" onClick={() => navigate('/search')}>
                  Find a Service
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CustomerDashboard;
