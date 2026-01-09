import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatCurrency, formatDate } from '../../lib/constants';

function ProviderEarnings() {
  const [period, setPeriod] = useState('this_month');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock earnings data
  const earningsData = {
    totalEarnings: 485000,
    thisMonth: 125000,
    lastMonth: 98000,
    pendingPayment: 35000,
    completedJobs: 89,
    averageJobValue: 15500,
    growth: 27.6,
  };

  const transactions = [
    { id: '1', type: 'credit', description: 'Pipe Installation - Grace Adeyemi', amount: 25000, fee: 3750, net: 21250, status: 'completed', date: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', type: 'credit', description: 'Drain Unblocking - Samuel Nnamdi', amount: 15000, fee: 2250, net: 12750, status: 'pending', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '3', type: 'credit', description: 'AC Servicing - Amaka Obi', amount: 45000, fee: 6750, net: 38250, status: 'completed', date: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '4', type: 'referral', description: 'Referral commission - Level 1', amount: 2500, fee: 0, net: 2500, status: 'completed', date: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: '5', type: 'credit', description: 'Water Heater Repair - Tunde Bakare', amount: 35000, fee: 5250, net: 29750, status: 'completed', date: new Date(Date.now() - 86400000 * 10).toISOString() },
  ];

  const monthlyEarnings = [
    { month: 'Jan', earnings: 85000 },
    { month: 'Feb', earnings: 92000 },
    { month: 'Mar', earnings: 78000 },
    { month: 'Apr', earnings: 105000 },
    { month: 'May', earnings: 98000 },
    { month: 'Jun', earnings: 125000 },
  ];

  const maxEarnings = Math.max(...monthlyEarnings.map(m => m.earnings));

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Earnings</h1>
          <p className="text-[var(--muted-foreground)]">
            Track your income and transaction history
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--surlink-teal-dark)] text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Earnings</span>
              <DollarSign size={20} />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.totalEarnings)}</div>
            <div className="flex items-center gap-1 text-xs mt-2 opacity-90">
              <TrendingUp size={14} />
              <span>All time</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">This Month</span>
              <Calendar className="text-[var(--info)]" size={20} />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.thisMonth)}</div>
            <div className="flex items-center gap-1 text-xs mt-2 text-[var(--success)]">
              <TrendingUp size={14} />
              <span>+{earningsData.growth}% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Pending</span>
              <Clock className="text-[var(--warning)]" size={20} />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.pendingPayment)}</div>
            <div className="text-xs mt-2 text-[var(--muted-foreground)]">
              Awaiting job completion
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted-foreground)]">Avg. Job Value</span>
              <TrendingUp className="text-[var(--success)]" size={20} />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.averageJobValue)}</div>
            <div className="text-xs mt-2 text-[var(--muted-foreground)]">
              From {earningsData.completedJobs} jobs
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Earnings Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyEarnings.map((month) => (
                    <div key={month.month} className="flex items-center gap-4">
                      <span className="w-8 text-sm text-[var(--muted-foreground)]">{month.month}</span>
                      <div className="flex-1 h-8 bg-[var(--secondary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                          style={{ width: `${(month.earnings / maxEarnings) * 100}%` }}
                        />
                      </div>
                      <span className="w-24 text-right text-sm font-medium">
                        {formatCurrency(month.earnings)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--secondary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                        <ArrowDownLeft className="text-[var(--success)]" size={18} />
                      </div>
                      <div>
                        <p className="font-medium">Total Income</p>
                        <p className="text-xs text-[var(--muted-foreground)]">From services</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[var(--success)]">
                      {formatCurrency(earningsData.thisMonth)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--secondary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--destructive)]/10 flex items-center justify-center">
                        <ArrowUpRight className="text-[var(--destructive)]" size={18} />
                      </div>
                      <div>
                        <p className="font-medium">Platform Fees</p>
                        <p className="text-xs text-[var(--muted-foreground)]">15% of earnings</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[var(--destructive)]">
                      -{formatCurrency(earningsData.thisMonth * 0.15)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <CheckCircle className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--primary)]">Net Earnings</p>
                        <p className="text-xs text-[var(--muted-foreground)]">After fees</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[var(--primary)]">
                      {formatCurrency(earningsData.thisMonth * 0.85)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-[var(--accent)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Referral Earnings</span>
                    <span className="font-bold text-[var(--primary)]">{formatCurrency(12500)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Commission from 5 active referrals this month
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Transaction History</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter size={14} className="mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Description</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Date</th>
                      <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Amount</th>
                      <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Fee</th>
                      <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Net</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-[var(--secondary)]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'referral' ? 'bg-[var(--warning)]/10' : 'bg-[var(--success)]/10'
                            }`}>
                              {tx.type === 'referral' ? (
                                <TrendingUp className="text-[var(--warning)]" size={14} />
                              ) : (
                                <ArrowDownLeft className="text-[var(--success)]" size={14} />
                              )}
                            </div>
                            <span className="font-medium">{tx.description}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[var(--muted-foreground)]">{formatDate(tx.date)}</td>
                        <td className="p-4 text-right font-medium">{formatCurrency(tx.amount)}</td>
                        <td className="p-4 text-right text-[var(--destructive)]">
                          {tx.fee > 0 ? `-${formatCurrency(tx.fee)}` : '-'}
                        </td>
                        <td className="p-4 text-right font-bold text-[var(--success)]">
                          {formatCurrency(tx.net)}
                        </td>
                        <td className="p-4">
                          <span className={`status-badge ${tx.status}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProviderEarnings;
