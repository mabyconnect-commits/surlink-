import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Scissors,
  Car,
  Wind,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { SERVICE_CATEGORIES } from '../lib/constants';

// Icon mapping
const iconMap = {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Car, Wind,
};

function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const stats = [
    { number: '10,000+', label: 'Service Providers' },
    { number: '50,000+', label: 'Happy Customers' },
    { number: '100,000+', label: 'Jobs Completed' },
    { number: '4.8/5', label: 'Average Rating' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All service providers go through strict KYC verification and background checks.',
    },
    {
      icon: MapPin,
      title: 'Location-Based Matching',
      description: 'Find skilled professionals near you for quick and convenient service.',
    },
    {
      icon: Clock,
      title: 'Fast Response Time',
      description: 'Get connected with available service providers within minutes.',
    },
    {
      icon: Star,
      title: 'Rated & Reviewed',
      description: 'Choose from professionals with genuine reviews from real customers.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Search for a Service',
      description: 'Enter the service you need and your location to find available professionals.',
    },
    {
      step: 2,
      title: 'Choose a Professional',
      description: 'Compare profiles, ratings, and prices to select the best match for your needs.',
    },
    {
      step: 3,
      title: 'Book & Pay Securely',
      description: 'Schedule your service and pay securely through the Surlink platform.',
    },
    {
      step: 4,
      title: 'Get the Job Done',
      description: 'The professional arrives, completes the job, and you confirm completion.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-[var(--primary)]">Sur</span>
                <span className="text-[var(--surlink-gray)]">link</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Services
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                How It Works
              </a>
              <a href="#become-provider" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Become a Provider
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--card)]">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              <a href="#services" className="block py-2 text-sm font-medium text-[var(--muted-foreground)]">
                Services
              </a>
              <a href="#how-it-works" className="block py-2 text-sm font-medium text-[var(--muted-foreground)]">
                How It Works
              </a>
              <a href="#become-provider" className="block py-2 text-sm font-medium text-[var(--muted-foreground)]">
                Become a Provider
              </a>
              <div className="flex gap-3 pt-3 border-t border-[var(--border)]">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button className="flex-1" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Trusted <span className="text-[var(--primary)]">Service Professionals</span> Near You
            </h1>
            <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-8">
              Connect with verified plumbers, electricians, carpenters, and more. Get your jobs done by skilled professionals in your area.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)]">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={20} />
                  <Input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-0 bg-transparent text-base"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={20} />
                  <Input
                    type="text"
                    placeholder="Your location"
                    className="pl-12 h-12 border-0 bg-transparent text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8">
                  Search
                </Button>
              </div>
            </form>

            {/* Popular Services */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-[var(--muted-foreground)]">Popular:</span>
              {['Plumber', 'Electrician', 'Cleaner', 'Driver'].map((service) => (
                <button
                  key={service}
                  onClick={() => navigate(`/search?q=${service}`)}
                  className="text-sm px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-[var(--border)] bg-[var(--card)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Services</h2>
            <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Find the right professional for any job, from home repairs to personal services.
            </p>
          </div>

          <div className="service-grid">
            {SERVICE_CATEGORIES.slice(0, 8).map((category) => {
              const Icon = iconMap[category.icon] || Wrench;
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/search?category=${category.id}`)}
                  className="category-card group"
                >
                  <div
                    className="icon"
                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] text-center line-clamp-2">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => navigate('/search')}>
              View All Services
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-[var(--secondary)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Surlink?</h2>
            <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
              We make it easy to find and hire trusted professionals for all your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                  <div className="w-12 h-12 rounded-lg bg-[var(--accent)] flex items-center justify-center mb-4">
                    <Icon size={24} className="text-[var(--primary)]" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Get your job done in 4 simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Provider CTA */}
      <section id="become-provider" className="py-16 md:py-24 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Become a Service Provider</h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of skilled professionals earning on Surlink. Set your own rates, work flexible hours, and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              {[
                'Free to join',
                'Set your own prices',
                'Get paid securely',
                'Earn referral bonuses',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-white" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-[var(--primary)] hover:bg-gray-100"
              onClick={() => navigate('/register?role=provider')}
            >
              Start Earning Today
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="py-16 md:py-24 bg-[var(--secondary)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[var(--card)] rounded-2xl p-8 md:p-12 border border-[var(--border)]">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-[var(--primary)]" size={24} />
                    <span className="text-sm font-semibold text-[var(--primary)]">REFERRAL PROGRAM</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Earn Up to 5% on Every Referral
                  </h2>
                  <p className="text-[var(--muted-foreground)] mb-6">
                    Share Surlink with friends and earn commissions on their transactions. Our 3-level referral system rewards you for growing our community.
                  </p>
                  <div className="referral-stats mb-6">
                    <div className="referral-level">
                      <div className="percentage">2.5%</div>
                      <div className="label">Level 1</div>
                    </div>
                    <div className="referral-level">
                      <div className="percentage">1.5%</div>
                      <div className="label">Level 2</div>
                    </div>
                    <div className="referral-level">
                      <div className="percentage">1.0%</div>
                      <div className="label">Level 3</div>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/register')}>
                    Join & Start Earning
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--foreground)] text-[var(--background)]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold text-white">Surlink</span>
              </div>
              <p className="text-sm opacity-70">
                Connecting skilled professionals with customers who need their services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="#" className="hover:opacity-100">Find Services</a></li>
                <li><a href="#" className="hover:opacity-100">How It Works</a></li>
                <li><a href="#" className="hover:opacity-100">Pricing</a></li>
                <li><a href="#" className="hover:opacity-100">Safety</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Providers</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="#" className="hover:opacity-100">Become a Provider</a></li>
                <li><a href="#" className="hover:opacity-100">Provider Resources</a></li>
                <li><a href="#" className="hover:opacity-100">Success Stories</a></li>
                <li><a href="#" className="hover:opacity-100">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="#" className="hover:opacity-100">About Us</a></li>
                <li><a href="#" className="hover:opacity-100">Blog</a></li>
                <li><a href="#" className="hover:opacity-100">Careers</a></li>
                <li><a href="#" className="hover:opacity-100">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-70">
              &copy; {new Date().getFullYear()} Surlink. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm opacity-70">
              <a href="#" className="hover:opacity-100">Terms of Service</a>
              <a href="#" className="hover:opacity-100">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
