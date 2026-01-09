import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketAPI, signalsAPI, performanceAPI, walletAPI } from '../services/api';
import { TrendingUp, TrendingDown, Activity, Zap, Target, DollarSign, Wallet } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT'];

  const { data: priceData, refetch: refetchPrice } = useQuery({
    queryKey: ['price', selectedSymbol],
    queryFn: () => marketAPI.getPrice(selectedSymbol),
    refetchInterval: 10000,
  });

  const { data: signals } = useQuery({
    queryKey: ['signals'],
    queryFn: () => signalsAPI.getSignals(10),
    refetchInterval: 30000,
  });

  const { data: performance } = useQuery({
    queryKey: ['performance'],
    queryFn: () => performanceAPI.getMetrics(),
    refetchInterval: 30000,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletAPI.getWallet(),
    refetchInterval: 5000, // Update every 5 seconds
  });

  const { data: chartData } = useQuery({
    queryKey: ['chartData', selectedSymbol],
    queryFn: () => marketAPI.getMarketData(selectedSymbol, '1h', 24),
    refetchInterval: 60000,
  });

  const handleScan = async () => {
    await signalsAPI.scanAll();
    window.location.href = '/signals';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  return (
    <div className="control-room-grid" data-testid="dashboard">
      {/* Market Overview */}
      <div className="col-span-12 md:col-span-8">
        <div className="stat-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold uppercase tracking-wider" data-testid="market-overview-title">Market Overview</h2>
            <div className="flex gap-2">
              {symbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  data-testid={`symbol-${symbol}`}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-sm transition-all ${
                    selectedSymbol === symbol
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {symbol.replace('USDT', '')}
                </button>
              ))}
            </div>
          </div>

          {priceData && (
            <div className="mb-6">
              <div className="flex items-baseline gap-4">
                <span className="price text-4xl" data-testid="current-price">{formatPrice(priceData.price)}</span>
                <span className="text-muted-foreground text-sm mono">{selectedSymbol}</span>
              </div>
            </div>
          )}

          {chartData?.data && (
            <div className="chart-container" data-testid="price-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.data}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E599" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E599" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fill: '#888888', fontSize: 12 }}
                    stroke="#262626"
                    tickFormatter={(val) => new Date(val).toLocaleTimeString()}
                  />
                  <YAxis
                    tick={{ fill: '#888888', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                    stroke="#262626"
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: '1px solid #262626',
                      borderRadius: '2px',
                      fontFamily: 'JetBrains Mono',
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#00E599"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="col-span-12 md:col-span-4 space-y-4">
        {/* Demo Wallet */}
        <div className="stat-card neon-glow-green" data-testid="demo-wallet">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="text-primary" size={20} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Demo Wallet</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-muted-foreground text-xs uppercase mb-1">Balance</div>
              <div className="price text-3xl text-primary" data-testid="wallet-balance">
                {wallet ? formatPrice(wallet.balance) : '$0.00'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-muted-foreground text-xs uppercase mb-1">Equity</div>
                <div className="price text-lg" data-testid="wallet-equity">
                  {wallet ? formatPrice(wallet.equity) : '$0.00'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase mb-1">Unrealized P/L</div>
                <div className={`price text-lg ${wallet?.unrealized_pnl >= 0 ? 'profit' : 'loss'}`} data-testid="unrealized-pnl">
                  {wallet ? formatPrice(wallet.unrealized_pnl || 0) : '$0.00'}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Open Trades:</span>
                <span className="font-bold">{wallet?.open_trades_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card" data-testid="performance-stats">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="text-muted-foreground text-xs uppercase mb-1">Win Rate</div>
              <div className="price text-3xl" data-testid="win-rate">
                {performance?.win_rate || 0}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase mb-1">Total Trades</div>
              <div className="price text-2xl" data-testid="total-trades">
                {performance?.total_trades || 0}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase mb-1">Total Profit</div>
              <div className={`price text-2xl ${(performance?.total_profit || 0) >= 0 ? 'profit' : 'loss'}`} data-testid="total-profit">
                {formatPrice(performance?.total_profit || 0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase mb-1">Win / Loss</div>
              <div className="flex gap-4">
                <div>
                  <span className="profit mono text-lg">{performance?.winning_trades || 0}</span>
                  <span className="text-muted-foreground text-xs ml-1">W</span>
                </div>
                <div>
                  <span className="loss mono text-lg">{performance?.losing_trades || 0}</span>
                  <span className="text-muted-foreground text-xs ml-1">L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <button
            onClick={handleScan}
            data-testid="scan-markets-btn"
            className="w-full btn-execute flex items-center justify-center gap-2"
          >
            <Activity size={16} />
            SCAN ALL MARKETS
          </button>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="col-span-12">
        <div className="stat-card">
          <h3 className="text-xl font-bold uppercase tracking-wider mb-4" data-testid="recent-signals-title">Recent Signals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {signals && signals.length > 0 ? (
              signals.slice(0, 6).map((signal) => (
                <div
                  key={signal.id}
                  data-testid={`signal-${signal.id}`}
                  className={`signal-card ${signal.side.toLowerCase()}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold mono">{signal.symbol}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(signal.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-sm ${
                        signal.side === 'BUY'
                          ? 'bg-profit/20 text-profit'
                          : 'bg-loss/20 text-loss'
                      }`}
                    >
                      {signal.side}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry:</span>
                      <span className="mono font-semibold">{formatPrice(signal.entry_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SL:</span>
                      <span className="mono font-semibold loss">{formatPrice(signal.stop_loss)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TP:</span>
                      <span className="mono font-semibold profit">{formatPrice(signal.take_profit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="mono font-semibold">{signal.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RRR:</span>
                      <span className="mono font-semibold">1:{signal.rrr}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-muted-foreground py-8">
                No signals yet. Click "SCAN ALL MARKETS" to generate signals.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;