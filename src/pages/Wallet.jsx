import React, { useState } from 'react';
import { useAuth } from '../App';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building,
  Plus,
  History,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { formatCurrency, formatDate, formatDateTime, MIN_WITHDRAWAL } from '../lib/constants';

function Wallet() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showFundDialog, setShowFundDialog] = useState(false);

  const isProvider = user?.role === 'provider';

  // Mock wallet data
  const walletData = {
    balance: 185000,
    pendingBalance: 35000,
    totalEarnings: 485000,
    totalSpent: 150000,
    escrowBalance: 25000,
  };

  const transactions = [
    {
      id: '1',
      type: 'credit',
      category: 'payment',
      description: 'Payment for Plumbing Service',
      amount: 25000,
      status: 'completed',
      date: new Date(Date.now() - 86400000).toISOString(),
      reference: 'TXN001234',
    },
    {
      id: '2',
      type: 'debit',
      category: 'withdrawal',
      description: 'Withdrawal to GTBank - ****4521',
      amount: 50000,
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      reference: 'WTH001235',
    },
    {
      id: '3',
      type: 'credit',
      category: 'referral',
      description: 'Referral commission - Level 1',
      amount: 2500,
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      reference: 'REF001236',
    },
    {
      id: '4',
      type: 'credit',
      category: 'payment',
      description: 'Payment for Electrical Service',
      amount: 35000,
      status: 'pending',
      date: new Date(Date.now() - 86400000 * 7).toISOString(),
      reference: 'TXN001237',
    },
    {
      id: '5',
      type: 'debit',
      category: 'service',
      description: 'AC Repair Service',
      amount: 15000,
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 10).toISOString(),
      reference: 'SVC001238',
    },
  ];

  const bankAccounts = [
    { id: '1', bankName: 'GTBank', accountNumber: '****4521', accountName: 'John Doe', isDefault: true },
    { id: '2', bankName: 'First Bank', accountNumber: '****7890', accountName: 'John Doe', isDefault: false },
  ];

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is ${formatCurrency(MIN_WITHDRAWAL)}`);
      return;
    }
    if (amount > walletData.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Withdrawal request submitted successfully!');
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
    } catch (error) {
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleFundWallet = async () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount < 1000) {
      toast.error('Minimum funding is NGN 1,000');
      return;
    }

    setIsFunding(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Redirecting to payment gateway...');
      setShowFundDialog(false);
      setFundAmount('');
    } catch (error) {
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsFunding(false);
    }
  };

  const getTransactionIcon = (type, category) => {
    if (type === 'credit') {
      return <ArrowDownLeft className="text-[var(--success)]" size={18} />;
    }
    return <ArrowUpRight className="text-[var(--destructive)]" size={18} />;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your earnings, withdrawals, and transactions
          </p>
        </div>
        <div className="flex gap-3">
          {!isProvider && (
            <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus size={18} className="mr-2" />
                  Fund Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fund Your Wallet</DialogTitle>
                  <DialogDescription>
                    Add money to your wallet to pay for services
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Amount (NGN)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 5000, 10000, 20000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setFundAmount(amount.toString())}
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowFundDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleFundWallet} disabled={isFunding}>
                    {isFunding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Continue to Payment'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <DialogTrigger asChild>
              <Button>
                <ArrowUpRight size={18} className="mr-2" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Withdraw your earnings to your bank account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-[var(--secondary)]">
                  <p className="text-sm text-[var(--muted-foreground)]">Available Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(walletData.balance)}</p>
                </div>

                <div className="space-y-2">
                  <Label>Amount (NGN)</Label>
                  <Input
                    type="number"
                    placeholder={`Min: ${formatCurrency(MIN_WITHDRAWAL)}`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Withdraw to</Label>
                  <Select defaultValue={bankAccounts[0].id}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName} - {account.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-[var(--muted-foreground)]">
                  <AlertCircle className="inline mr-1" size={12} />
                  Withdrawals are processed within 24 hours
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleWithdraw} disabled={isWithdrawing}>
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Withdraw'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--surlink-teal-dark)] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90">Available Balance</span>
              <WalletIcon size={24} />
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(walletData.balance)}</div>
            <p className="text-sm opacity-80">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--muted-foreground)]">
                {isProvider ? 'Pending Earnings' : 'In Escrow'}
              </span>
              <Clock className="text-[var(--warning)]" size={24} />
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(isProvider ? walletData.pendingBalance : walletData.escrowBalance)}
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {isProvider ? 'Awaiting job completion' : 'Held for active bookings'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--muted-foreground)]">
                {isProvider ? 'Total Earnings' : 'Total Spent'}
              </span>
              <TrendingUp className="text-[var(--success)]" size={24} />
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(isProvider ? walletData.totalEarnings : walletData.totalSpent)}
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Transactions</TabsTrigger>
          <TabsTrigger value="bank-accounts">Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-4 hover:bg-[var(--secondary)] transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-[var(--success)]/10' : 'bg-[var(--destructive)]/10'
                    }`}>
                      {getTransactionIcon(tx.type, tx.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{tx.description}</p>
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <span>{formatDateTime(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.reference}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'credit' ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`status-badge ${tx.status}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-[var(--border)]">
                <Button variant="link">View All Transactions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank-accounts" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Bank Accounts</CardTitle>
                <CardDescription>Manage your withdrawal accounts</CardDescription>
              </div>
              <Button size="sm">
                <Plus size={16} className="mr-2" />
                Add Account
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      account.isDefault ? 'border-[var(--primary)] bg-[var(--accent)]' : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-[var(--secondary)] flex items-center justify-center">
                      <Building size={24} className="text-[var(--muted-foreground)]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{account.bankName}</p>
                        {account.isDefault && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {account.accountNumber} • {account.accountName}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <Card className="mt-4 border-[var(--info)]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="text-[var(--info)] shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-[var(--info)]">Secure Transactions</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    All your financial data is encrypted and secure. We never store your full bank details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Wallet;
