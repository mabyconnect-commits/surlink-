import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  Home,
  Search,
  Calendar,
  User,
  Settings,
  MessageSquare,
  Wallet,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Briefcase,
  DollarSign,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isProvider = user?.role === 'provider';
  const basePath = isProvider ? '/provider' : '';

  const customerNavItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
  ];

  const providerNavItems = [
    { path: '/provider/dashboard', label: 'Dashboard', icon: Home },
    { path: '/provider/bookings', label: 'Jobs', icon: Briefcase },
    { path: '/provider/services', label: 'Services', icon: Settings },
    { path: '/provider/earnings', label: 'Earnings', icon: DollarSign },
    { path: '/provider/messages', label: 'Messages', icon: MessageSquare },
  ];

  const navItems = isProvider ? providerNavItems : customerNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to={isProvider ? '/provider/dashboard' : '/dashboard'} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-[var(--primary)]">Sur</span>
                <span className="text-[var(--surlink-gray)]">link</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-[var(--primary)]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="notification-dot" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-[var(--primary)] text-white text-sm">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown size={16} className="hidden md:block text-[var(--muted-foreground)]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{user?.email}</p>
                    {isProvider && (
                      <span className={`status-badge mt-2 ${user?.kycStatus === 'verified' ? 'verified' : 'pending'}`}>
                        {user?.kycStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`${basePath}/profile`)}>
                    <User size={16} className="mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {isProvider && (
                    <DropdownMenuItem onClick={() => navigate('/provider/kyc')}>
                      <Shield size={16} className="mr-2" />
                      KYC Verification
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate(`${basePath}/referrals`)}>
                    <Users size={16} className="mr-2" />
                    Referrals
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`${basePath}/wallet`)}>
                    <Wallet size={16} className="mr-2" />
                    Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`${basePath}/settings`)}>
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-[var(--destructive)]">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--card)]">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-[var(--primary)]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav md:hidden">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default MainLayout;
