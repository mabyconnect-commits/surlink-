import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { servicesAPI, usersAPI } from '../services/apiClient';
import {
  Star,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Scissors,
  Car,
  Wind,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { SERVICE_CATEGORIES, formatCurrency } from '../lib/constants';

// Icon mapping
const iconMap = {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Car, Wind,
};

function ServiceDetails() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
  const Icon = iconMap[category?.icon] || Wrench;

  // Fetch providers for this category
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const response = await usersAPI.getProviders({ category: categoryId });
        if (response.success) {
          setProviders(response.data || []);
        } else {
          toast.error('Failed to load providers');
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        toast.error(error.response?.data?.message || 'Failed to load providers');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchProviders();
    }
  }, [categoryId]);

  if (!category) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Service not found</h2>
        <Button onClick={() => navigate('/search')}>Browse Services</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${category.color}15`, color: category.color }}
        >
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-[var(--muted-foreground)]">{category.description}</p>
        </div>
      </div>

      {/* Provider Count */}
      <p className="text-sm text-[var(--muted-foreground)]">
        {isLoading ? 'Loading...' : `${providers.length} providers available near you`}
      </p>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : (
        <>
          {/* Providers List */}
          <div className="space-y-4">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className="cursor-pointer hover:border-[var(--primary)] transition-colors"
            onClick={() => navigate(`/provider/${provider.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-[var(--primary)] text-white text-lg">
                    {provider.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{provider.name}</h3>
                    {provider.verified && (
                      <CheckCircle className="text-[var(--primary)]" size={16} />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-2">
                    <span className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={14} />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-[var(--muted-foreground)]">({provider.reviews})</span>
                    </span>
                    <span className="text-[var(--muted-foreground)]">{provider.jobs} jobs</span>
                    <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
                      <MapPin size={14} />
                      {provider.distance} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--primary)] font-bold">
                      From {formatCurrency(provider.priceFrom)}
                    </span>
                    <Button size="sm">View Profile</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
          </div>

          {providers.length === 0 && (
        <div className="text-center py-16">
          <Icon size={48} className="mx-auto mb-4 text-[var(--muted-foreground)]" />
          <h3 className="text-lg font-semibold mb-2">No providers available</h3>
          <p className="text-[var(--muted-foreground)] mb-4">
            There are no {category.name.toLowerCase()} providers in your area yet.
          </p>
          <Button variant="outline" onClick={() => navigate('/search')}>
            Browse Other Services
          </Button>
        </div>
          )}
        </>
      )}
    </div>
  );
}

export default ServiceDetails;
