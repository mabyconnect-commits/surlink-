import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signalsAPI, tradesAPI } from '../services/api';
import { TrendingUp, TrendingDown, Target, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function Signals() {
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);

  const { data: signals, isLoading } = useQuery({
    queryKey: ['signals'],
    queryFn: () => signalsAPI.getSignals(50),
    refetchInterval: 30000,
  });

  const executeTradeMutation = useMutation({
    mutationFn: tradesAPI.executeTrade,
    onSuccess: () => {
      queryClient.invalidateQueries(['trades']);
      toast.success('Trade executed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to execute trade');
    },
  });

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await signalsAPI.scanAll();
      toast.success(`Scanned ${result.scanned} symbols, generated ${result.signals_generated} signals`);
      queryClient.invalidateQueries(['signals']);
    } catch (error) {
      toast.error('Failed to scan markets');
    } finally {
      setScanning(false);
    }
  };

  const handleExecute = (signalId) => {
    executeTradeMutation.mutate(signalId);
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
    <div className="p-6" data-testid="signals-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider" data-testid="signals-title">
          <Zap className="inline-block mr-2" size={32} />
          Trading Signals
        </h1>
        <button
          onClick={handleScan}
          disabled={scanning}
          data-testid="scan-button"
          className="btn-execute flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <>
              <div className="loading" />
              SCANNING...
            </>
          ) : (
            <>
              <Target size={16} />
              SCAN ALL MARKETS
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading" />
        </div>
      ) : signals && signals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal) => (
            <div
              key={signal.id}
              data-testid={`signal-card-${signal.id}`}
              className={`signal-card ${signal.side.toLowerCase()}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-xl mono" data-testid={`signal-symbol-${signal.id}`}>{signal.symbol}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(signal.timestamp).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-sm uppercase ${
                    signal.side === 'BUY'
                      ? 'bg-profit/20 text-profit'
                      : 'bg-loss/20 text-loss'
                  }`}
                  data-testid={`signal-side-${signal.id}`}
                >
                  {signal.side === 'BUY' ? (
                    <TrendingUp className="inline-block mr-1" size={12} />
                  ) : (
                    <TrendingDown className="inline-block mr-1" size={12} />
                  )}
                  {signal.side}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Entry Price:</span>
                  <span className="mono font-bold text-lg" data-testid={`signal-entry-${signal.id}`}>
                    {formatPrice(signal.entry_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stop Loss:</span>
                  <span className="mono font-semibold loss" data-testid={`signal-sl-${signal.id}`}>
                    {formatPrice(signal.stop_loss)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Take Profit:</span>
                  <span className="mono font-semibold profit" data-testid={`signal-tp-${signal.id}`}>
                    {formatPrice(signal.take_profit)}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <span className="mono font-bold text-primary" data-testid={`signal-confidence-${signal.id}`}>
                      {signal.confidence}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Risk/Reward:</span>
                    <span className="mono font-bold">1:{signal.rrr}</span>
                  </div>
                </div>
              </div>

              {signal.indicators && signal.indicators.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-2 uppercase">Indicators:</div>
                  <div className="flex flex-wrap gap-1">
                    {signal.indicators.map((indicator, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-secondary rounded-sm mono"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {signal.status === 'ACTIVE' && (
                <button
                  onClick={() => handleExecute(signal.id)}
                  disabled={executeTradeMutation.isLoading}
                  data-testid={`execute-btn-${signal.id}`}
                  className="w-full btn-execute flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Target size={14} />
                  EXECUTE TRADE
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-card text-center py-12">
          <AlertCircle className="mx-auto mb-4 text-muted-foreground" size={48} />
          <p className="text-muted-foreground text-lg mb-4">
            No signals available yet.
          </p>
          <button
            onClick={handleScan}
            className="btn-execute mx-auto"
            data-testid="scan-empty-button"
          >
            <Target className="inline-block mr-2" size={16} />
            SCAN MARKETS NOW
          </button>
        </div>
      )}
    </div>
  );
}

export default Signals;