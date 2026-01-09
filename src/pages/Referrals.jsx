import React, { useState } from 'react';
import { useAuth } from '../App';
import {
  Users,
  Copy,
  Share2,
  Gift,
  TrendingUp,
  CheckCircle,
  Link as LinkIcon,
  DollarSign,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { REFERRAL_RATES, formatCurrency, formatDate } from '../lib/constants';

function Referrals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const referralLink = `https://surlink.com/register?ref=${user?.referralCode}`;

  // Mock referral data
  const referralStats = {
    totalReferrals: 24,
    activeReferrals: 18,
    totalEarnings: 125000,
    pendingEarnings: 15000,
    level1Count: 12,
    level2Count: 8,
    level3Count: 4,
  };

  const referralHistory = [
    {
      id: '1',
      name: 'John Okoro',
      level: 1,
      joinedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: 'active',
      earnings: 5000,
      avatar: null,
    },
    {
      id: '2',
      name: 'Ada Nweke',
      level: 1,
      joinedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      status: 'active',
      earnings: 7500,
      avatar: null,
    },
    {
      id: '3',
      name: 'Mike Eze',
      level: 2,
      joinedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      status: 'active',
      earnings: 3000,
      avatar: null,
    },
    {
      id: '4',
      name: 'Sarah Ibrahim',
      level: 2,
      joinedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      status: 'pending',
      earnings: 0,
      avatar: null,
    },
    {
      id: '5',
      name: 'David Okonkwo',
      level: 3,
      joinedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
      status: 'active',
      earnings: 1500,
      avatar: null,
    },
  ];

  const earningsHistory = [
    { id: '1', type: 'referral', description: 'Level 1 commission from John Okoro', amount: 2500, date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '2', type: 'referral', description: 'Level 1 commission from Ada Nweke', amount: 3750, date: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '3', type: 'referral', description: 'Level 2 commission from Mike Eze', amount: 1500, date: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: '4', type: 'bonus', description: 'Monthly referral bonus', amount: 5000, date: new Date(Date.now() - 86400000 * 30).toISOString() },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Surlink',
          text: 'Join Surlink and find trusted service providers near you! Use my referral code to get started.',
          url: referralLink,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return 'bg-[var(--primary)]';
      case 2: return 'bg-[var(--info)]';
      case 3: return 'bg-[var(--warning)]';
      default: return 'bg-[var(--muted)]';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-[var(--muted-foreground)]">
          Earn up to 5% commission on every transaction from your referrals
        </p>
      </div>

      {/* Referral Link Card */}
      <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--surlink-teal-dark)] text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold mb-1">Your Referral Code</h3>
              <p className="text-3xl font-bold">{user?.referralCode}</p>
            </div>
            <Gift size={40} className="opacity-50" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="flex-1 relative">
              <Input
                value={referralLink}
                readOnly
                className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                onClick={() => copyToClipboard(referralLink)}
              >
                <Copy size={18} />
              </Button>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-[var(--primary)] hover:bg-white/90"
              onClick={shareReferral}
            >
              <Share2 size={18} className="mr-2" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commission Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info size={18} />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <div className="text-3xl font-bold text-[var(--primary)] mb-1">{REFERRAL_RATES.LEVEL_1}%</div>
              <div className="text-sm font-medium">Level 1 (Direct)</div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Earn on every transaction from people you refer directly
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--info)]/10 border border-[var(--info)]/20">
              <div className="text-3xl font-bold text-[var(--info)] mb-1">{REFERRAL_RATES.LEVEL_2}%</div>
              <div className="text-sm font-medium">Level 2</div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Earn on transactions from people your referrals invite
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20">
              <div className="text-3xl font-bold text-[var(--warning)] mb-1">{REFERRAL_RATES.LEVEL_3}%</div>
              <div className="text-sm font-medium">Level 3</div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Earn on transactions from the third level of referrals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Total Earnings</span>
              <DollarSign className="text-[var(--success)]" size={18} />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(referralStats.totalEarnings)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Pending</span>
              <TrendingUp className="text-[var(--warning)]" size={18} />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(referralStats.pendingEarnings)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Total Referrals</span>
              <Users className="text-[var(--primary)]" size={18} />
            </div>
            <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Active</span>
              <CheckCircle className="text-[var(--success)]" size={18} />
            </div>
            <div className="text-2xl font-bold">{referralStats.activeReferrals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Referral Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Referral Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level 1</span>
                    <span className="font-medium">{referralStats.level1Count} referrals</span>
                  </div>
                  <Progress value={(referralStats.level1Count / referralStats.totalReferrals) * 100} className="h-2 bg-[var(--primary)]/20" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level 2</span>
                    <span className="font-medium">{referralStats.level2Count} referrals</span>
                  </div>
                  <Progress value={(referralStats.level2Count / referralStats.totalReferrals) * 100} className="h-2 bg-[var(--info)]/20" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level 3</span>
                    <span className="font-medium">{referralStats.level3Count} referrals</span>
                  </div>
                  <Progress value={(referralStats.level3Count / referralStats.totalReferrals) * 100} className="h-2 bg-[var(--warning)]/20" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralHistory.slice(0, 4).map((referral) => (
                    <div key={referral.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={referral.avatar} />
                        <AvatarFallback className="text-xs bg-[var(--primary)]/10 text-[var(--primary)]">
                          {referral.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{referral.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Level {referral.level} • {formatDate(referral.joinedAt)}
                        </p>
                      </div>
                      {referral.earnings > 0 && (
                        <span className="text-sm font-medium text-[var(--success)]">
                          +{formatCurrency(referral.earnings)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">User</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Level</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Joined</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralHistory.map((referral) => (
                      <tr key={referral.id} className="border-b border-[var(--border)] hover:bg-[var(--secondary)]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-[var(--primary)]/10 text-[var(--primary)]">
                                {referral.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{referral.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${getLevelColor(referral.level)}`}>
                            {referral.level}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--muted-foreground)]">{formatDate(referral.joinedAt)}</td>
                        <td className="p-4">
                          <span className={`status-badge ${referral.status}`}>
                            {referral.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {referral.earnings > 0 ? formatCurrency(referral.earnings) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {earningsHistory.map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-4 hover:bg-[var(--secondary)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        earning.type === 'bonus' ? 'bg-[var(--warning)]/10' : 'bg-[var(--success)]/10'
                      }`}>
                        {earning.type === 'bonus' ? (
                          <Gift className="text-[var(--warning)]" size={18} />
                        ) : (
                          <Users className="text-[var(--success)]" size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{earning.description}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">{formatDate(earning.date)}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[var(--success)]">
                      +{formatCurrency(earning.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Referrals;
