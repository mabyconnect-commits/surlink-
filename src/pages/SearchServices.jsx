import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  Filter,
  SlidersHorizontal,
  X,
  CheckCircle,
  Clock,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Scissors,
  Car,
  Wind,
  TreeDeciduous,
  Truck,
  Settings,
  Camera,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { SERVICE_CATEGORIES, formatCurrency } from '../lib/constants';

// Icon mapping
const iconMap = {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Car, Wind, TreeDeciduous, Truck, Settings, Camera,
};

// Mock providers data
const mockProviders = [
  {
    id: '1',
    name: 'Chinedu Okafor',
    services: ['plumbing'],
    rating: 4.9,
    reviews: 234,
    jobs: 312,
    distance: 0.8,
    location: 'Lekki, Lagos',
    priceRange: { min: 5000, max: 50000 },
    bio: 'Professional plumber with 10+ years experience. Specializing in pipe installation, repairs, and maintenance.',
    avatar: null,
    verified: true,
    responseTime: '< 30 min',
    availability: 'Available today',
  },
  {
    id: '2',
    name: 'Adaeze Nwankwo',
    services: ['cleaning'],
    rating: 4.8,
    reviews: 156,
    jobs: 189,
    distance: 1.2,
    location: 'Victoria Island, Lagos',
    priceRange: { min: 3000, max: 25000 },
    bio: 'Experienced cleaner providing thorough home and office cleaning services.',
    avatar: null,
    verified: true,
    responseTime: '< 1 hour',
    availability: 'Available today',
  },
  {
    id: '3',
    name: 'Emeka Eze',
    services: ['electrical'],
    rating: 4.7,
    reviews: 89,
    jobs: 124,
    distance: 1.5,
    location: 'Ikeja, Lagos',
    priceRange: { min: 8000, max: 75000 },
    bio: 'Licensed electrician handling all electrical installations and repairs.',
    avatar: null,
    verified: true,
    responseTime: '< 45 min',
    availability: 'Available tomorrow',
  },
  {
    id: '4',
    name: 'Fatima Ibrahim',
    services: ['hairdressing'],
    rating: 4.9,
    reviews: 312,
    jobs: 456,
    distance: 2.0,
    location: 'Surulere, Lagos',
    priceRange: { min: 2000, max: 30000 },
    bio: 'Professional hairstylist specializing in braids, weaves, and natural hair care.',
    avatar: null,
    verified: true,
    responseTime: '< 2 hours',
    availability: 'Available today',
  },
  {
    id: '5',
    name: 'David Okechukwu',
    services: ['carpentry'],
    rating: 4.6,
    reviews: 67,
    jobs: 89,
    distance: 2.5,
    location: 'Yaba, Lagos',
    priceRange: { min: 10000, max: 150000 },
    bio: 'Skilled carpenter creating custom furniture and handling wood repairs.',
    avatar: null,
    verified: false,
    responseTime: '< 1 hour',
    availability: 'Available in 2 days',
  },
  {
    id: '6',
    name: 'Grace Okonkwo',
    services: ['painting'],
    rating: 4.8,
    reviews: 123,
    jobs: 167,
    distance: 3.0,
    location: 'Ikoyi, Lagos',
    priceRange: { min: 15000, max: 200000 },
    bio: 'Expert painter offering interior and exterior painting services.',
    avatar: null,
    verified: true,
    responseTime: '< 30 min',
    availability: 'Available today',
  },
];

function SearchServices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 100000,
    minRating: 0,
    verifiedOnly: false,
    availableToday: false,
    maxDistance: 10,
  });
  const [filteredProviders, setFilteredProviders] = useState(mockProviders);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    let results = mockProviders;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        p => p.name.toLowerCase().includes(query) ||
             p.services.some(s => s.includes(query)) ||
             p.bio.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      results = results.filter(p => p.services.includes(selectedCategory));
    }

    // Apply other filters
    results = results.filter(p => {
      if (filters.verifiedOnly && !p.verified) return false;
      if (filters.availableToday && !p.availability.includes('today')) return false;
      if (p.rating < filters.minRating) return false;
      if (p.distance > filters.maxDistance) return false;
      if (p.priceRange.min < filters.minPrice || p.priceRange.min > filters.maxPrice) return false;
      return true;
    });

    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        results.sort((a, b) => a.distance - b.distance);
        break;
      case 'price-low':
        results.sort((a, b) => a.priceRange.min - b.priceRange.min);
        break;
      case 'price-high':
        results.sort((a, b) => b.priceRange.min - a.priceRange.min);
        break;
      case 'reviews':
        results.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }

    setFilteredProviders(results);
  }, [searchQuery, selectedCategory, filters, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery, category: selectedCategory });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 100000,
      minRating: 0,
      verifiedOnly: false,
      availableToday: false,
      maxDistance: 10,
    });
    setSelectedCategory('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Find Service Providers</h1>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={20} />
            <Input
              type="text"
              placeholder="Search for services or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
            />
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={20} />
            <Input
              type="text"
              placeholder="Location"
              defaultValue="Lagos, Nigeria"
              className="pl-12 h-12"
            />
          </div>
          <Button type="submit" size="lg" className="h-12">
            Search
          </Button>
        </form>
      </div>

      {/* Categories */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--accent)]'
            }`}
          >
            All Services
          </button>
          {SERVICE_CATEGORIES.map((category) => {
            const Icon = iconMap[category.icon] || Wrench;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                <Icon size={16} />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          {filteredProviders.length} providers found
        </p>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm"
          >
            <option value="rating">Highest Rated</option>
            <option value="distance">Nearest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="reviews">Most Reviews</option>
          </select>

          {/* Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal size={16} className="mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Results</SheetTitle>
                <SheetDescription>
                  Narrow down your search to find the perfect provider
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label>Price Range</Label>
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatCurrency(filters.minPrice)}</span>
                    <span>{formatCurrency(filters.maxPrice)}</span>
                  </div>
                  <Slider
                    value={[filters.maxPrice]}
                    onValueChange={([value]) => setFilters(prev => ({ ...prev, maxPrice: value }))}
                    max={100000}
                    step={1000}
                  />
                </div>

                {/* Minimum Rating */}
                <div className="space-y-3">
                  <Label>Minimum Rating</Label>
                  <div className="flex gap-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                          filters.minRating === rating
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--secondary)]'
                        }`}
                      >
                        <Star size={14} className={filters.minRating === rating ? 'fill-white' : 'fill-yellow-400 text-yellow-400'} />
                        {rating === 0 ? 'Any' : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Distance */}
                <div className="space-y-3">
                  <Label>Maximum Distance: {filters.maxDistance} km</Label>
                  <Slider
                    value={[filters.maxDistance]}
                    onValueChange={([value]) => setFilters(prev => ({ ...prev, maxDistance: value }))}
                    max={50}
                    step={1}
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verifiedOnly}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: checked }))}
                    />
                    <Label htmlFor="verified" className="cursor-pointer">Verified providers only</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="available"
                      checked={filters.availableToday}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, availableToday: checked }))}
                    />
                    <Label htmlFor="available" className="cursor-pointer">Available today</Label>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  <X size={16} className="mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Results Grid */}
      {filteredProviders.length > 0 ? (
        <div className="provider-grid">
          {filteredProviders.map((provider) => (
            <Card
              key={provider.id}
              className="provider-card cursor-pointer"
              onClick={() => navigate(`/provider/${provider.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={provider.avatar} />
                    <AvatarFallback className="bg-[var(--primary)] text-white text-lg">
                      {provider.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{provider.name}</h3>
                      {provider.verified && (
                        <CheckCircle className="text-[var(--primary)] shrink-0" size={16} />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.services.map((serviceId) => {
                        const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
                        return (
                          <span
                            key={serviceId}
                            className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--primary)]"
                          >
                            {service?.name || serviceId}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="font-medium">{provider.rating}</span>
                        <span className="text-[var(--muted-foreground)]">({provider.reviews})</span>
                      </span>
                      <span className="text-[var(--muted-foreground)]">{provider.jobs} jobs</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[var(--muted-foreground)] mt-3 line-clamp-2">
                  {provider.bio}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                      <MapPin size={14} />
                      {provider.distance} km away
                    </div>
                    <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                      <Clock size={14} />
                      {provider.responseTime}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[var(--primary)]">
                      From {formatCurrency(provider.priceRange.min)}
                    </div>
                    <div className="text-xs text-[var(--success)]">{provider.availability}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="mx-auto mb-4 text-[var(--muted-foreground)]" size={48} />
          <h3 className="text-lg font-semibold mb-2">No providers found</h3>
          <p className="text-[var(--muted-foreground)] mb-4">
            Try adjusting your search or filters to find more providers
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default SearchServices;
