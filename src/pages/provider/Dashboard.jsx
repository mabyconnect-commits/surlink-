import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  DollarSign,
  Briefcase,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  MapPin,
  Shield,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { formatCurrency, formatDate, formatTime } from '../../lib/constants';
import { bookingsAPI, walletAPI } from '../../services/apiClient';

function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);
  const [walletData, setWalletData] = useState(null);

  // Check KYC status
  const kycPending = user?.kycStatus !== 'verified' && user?.kyc_status !== 'verified';

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, walletRes] = await Promise.all([
        bookingsAPI.getAll({ limit: 10 }),
        walletAPI.getBalance()
      ]);

      if (bookingsRes.success) {
        setRecentJobs(bookingsRes.data || []);
      }
      if (walletRes.success) {
        setWalletData(walletRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const stats = {
    totalEarnings: walletData?.total_earnings || walletData?.totalEarnings || 0,
    thisMonth: walletData?.this_month || walletData?.thisMonth || 0,
    pendingPayment: walletData?.pending_balance || walletData?.pendingBalance || 0,
    completedJobs: recentJobs.filter(j => j.status === 'completed').length,
    activeJobs: recentJobs.filter(j => j.status === 'in_progress' || j.status === 'pending').length,
    rating: user?.rating || 0,
    reviews: user?.total_reviews || user?.totalReviews || 0,
    profileViews: user?.profile_views || user?.profileViews || 0,
  };

  const upcomingJobs = recentJobs.filter(j => j.status === 'pending' || j.status === 'in_progress');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* KYC Alert */}
      {kycPending && (
        <Card className="border-[var(--warning)] bg-[var(--warning)]/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-[var(--warning)] shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--warning)]">Complete Your Verification</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Complete your KYC verification to start receiving job requests and build trust with customers.
                </p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/provider/kyc')}
                >
                  <Shield size={16} className="mr-2" />
                  Complete Verification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Hello, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/provider/services')}>
            Manage Services
          </Button>
          <Button onClick={() => navigate('/provider/bookings')}>
            View Jobs
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Total Earnings</span>
              <DollarSign className="text-[var(--success)]" size={18} />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <div className="flex items-center gap-1 text-xs text-[var(--success)] mt-1">
              <TrendingUp size={12} />
              <span>+12% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">This Month</span>
              <Calendar className="text-[var(--primary)]" size={18} />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
            <Progress value={65} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Completed Jobs</span>
              <Briefcase className="text-[var(--info)]" size={18} />
            </div>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">
              {stats.activeJobs} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Rating</span>
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
            </div>
            <div className="text-2xl font-bold">{stats.rating}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">
              {stats.reviews} reviews
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Jobs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Jobs</CardTitle>
                <Button variant="link" className="text-[var(--primary)] p-0" onClick={() => navigate('/provider/bookings')}>
                  View All <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingJobs.length > 0 ? (
                <div className="space-y-3">
                  {upcomingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-[var(--secondary)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                      onClick={() => navigate(`/booking/${job.id}`)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={job.customer.avatar} />
                        <AvatarFallback className="bg-[var(--primary)] text-white text-sm">
                          {job.customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{job.service}</h3>
                          <span className={`status-badge ${job.status}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">{job.customer.name}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(job.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[var(--primary)]">{formatCurrency(job.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto mb-3 text-[var(--muted-foreground)]" size={40} />
                  <p className="text-[var(--muted-foreground)]">No upcoming jobs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Profile Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Eye size={16} className="text-[var(--muted-foreground)]" />
                  Profile Views
                </div>
                <span className="font-semibold">{stats.profileViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Star size={16} className="text-yellow-400" />
                  Average Rating
                </div>
                <span className="font-semibold">{stats.rating}/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-[var(--success)]" />
                  Completion Rate
                </div>
                <span className="font-semibold">98%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-[var(--info)]" />
                  Response Time
                </div>
                <span className="font-semibold">&lt; 30 min</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payment */}
          <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--surlink-teal-dark)] text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm opacity-90">Pending Payment</span>
                <DollarSign size={18} />
              </div>
              <div className="text-3xl font-bold mb-3">{formatCurrency(stats.pendingPayment)}</div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => navigate('/provider/wallet')}
              >
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/provider/services')}>
                <Briefcase size={16} className="mr-2" />
                Manage Services
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/provider/profile')}>
                <Eye size={16} className="mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/provider/earnings')}>
                <DollarSign size={16} className="mr-2" />
                View Earnings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Job History</CardTitle>
            <Button variant="link" className="text-[var(--primary)] p-0" onClick={() => navigate('/provider/bookings')}>
              View All <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Service</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--secondary)] cursor-pointer"
                    onClick={() => navigate(`/booking/${job.id}`)}
                  >
                    <td className="p-4 font-medium">{job.service}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs">
                            {job.customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {job.customer.name}
                      </div>
                    </td>
                    <td className="p-4 text-[var(--muted-foreground)]">{formatDate(job.date)}</td>
                    <td className="p-4 font-semibold">{formatCurrency(job.amount)}</td>
                    <td className="p-4">
                      <span className={`status-badge ${job.status}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProviderDashboard;
