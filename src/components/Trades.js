import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradesAPI, tradeManagementAPI } from '../services/api';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, X, Edit, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import TradeChartModal from './TradeChartModal';
import EditTradeModal from './EditTradeModal';
import api from '../services/api';

function Trades() {
  const queryClient = useQueryClient();
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
  
  const { data: trades, isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => tradesAPI.getTrades(100),
    refetchInterval: 5000, // Refresh every 5 seconds for live P/L
  });

  // Auto-update all trades every 10 seconds
  useEffect(() => {
    const updateInterval = setInterval(async () => {
      try {
        await api.post('/trades/update-all');
        // Quietly refresh trades
        queryClient.invalidateQueries(['trades']);
        queryClient.invalidateQueries(['wallet']);
      } catch (error) {
        console.error('Failed to update trades:', error);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(updateInterval);
  }, [queryClient]);

  const closeTradeMutation = useMutation({
    mutationFn: tradeManagementAPI.closeTrade,
    onSuccess: () => {
      queryClient.invalidateQueries(['trades']);
      queryClient.invalidateQueries(['wallet']);
      toast.success('Trade closed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to close trade');
    },
  });

  const handleCloseTrade = (tradeId) => {
    if (window.confirm('Are you sure you want to close this trade?')) {
      closeTradeMutation.mutate(tradeId);
    }
  };

  const getPnLTrend = (trade) => {
    if (trade.status !== 'ACTIVE') return null;
    
    const pnl = trade.unrealized_pnl || 0;
    const entryPrice = trade.entry_price;
    const currentPrice = trade.current_price || entryPrice;
    
    if (trade.side === 'BUY') {
      return currentPrice > entryPrice ? 'up' : 'down';
    } else {
      return currentPrice < entryPrice ? 'up' : 'down';
    }
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
    <div className="p-6" data-testid="trades-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider" data-testid="trades-title">
          <TrendingUp className="inline-block mr-2" size={32} />
          Trade History
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading" />
        </div>
      ) : trades && trades.length > 0 ? (
        <div className="stat-card overflow-x-auto">
          <table className="data-table" data-testid="trades-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Entry</th>
                <th>Current</th>
                <th>SL</th>
                <th>TP</th>
                <th>Quantity</th>
                <th>P/L</th>
                <th>Trend</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => {
                const isActive = trade.status === 'ACTIVE';
                const pnl = isActive ? (trade.unrealized_pnl || 0) : (trade.profit_loss || 0);
                const trend = getPnLTrend(trade);
                
                return (
                  <tr key={trade.id} data-testid={`trade-row-${trade.id}`}>
                    <td className="font-bold mono">{trade.symbol}</td>
                    <td>
                      <span
                        className={`flex items-center gap-1 ${
                          trade.side === 'BUY' ? 'profit' : 'loss'
                        }`}
                      >
                        {trade.side === 'BUY' ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {trade.side}
                      </span>
                    </td>
                    <td className="mono">{formatPrice(trade.entry_price)}</td>
                    <td className="mono">
                      {isActive && trade.current_price 
                        ? formatPrice(trade.current_price)
                        : trade.exit_price 
                        ? formatPrice(trade.exit_price)
                        : '-'}
                    </td>
                    <td className="mono loss">{formatPrice(trade.stop_loss)}</td>
                    <td className="mono profit">{formatPrice(trade.take_profit)}</td>
                    <td className="mono">{trade.quantity}</td>
                    <td className={`mono font-bold ${pnl >= 0 ? 'profit' : 'loss'}`}>
                      {formatPrice(pnl)}
                    </td>
                    <td>
                      {trend === 'up' && (
                        <div className="flex items-center gap-1 profit">
                          <ArrowUp size={16} />
                          <span className="text-xs font-bold">UP</span>
                        </div>
                      )}
                      {trend === 'down' && (
                        <div className="flex items-center gap-1 loss">
                          <ArrowDown size={16} />
                          <span className="text-xs font-bold">DOWN</span>
                        </div>
                      )}
                      {!trend && <span className="text-xs text-muted-foreground">-</span>}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          trade.status === 'ACTIVE' ? 'active' : 'closed'
                        }`}
                      >
                        {trade.status === 'ACTIVE' ? (
                          <CheckCircle className="inline-block mr-1" size={12} />
                        ) : (
                          <XCircle className="inline-block mr-1" size={12} />
                        )}
                        {trade.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedTrade(trade)}
                          data-testid={`chart-btn-${trade.id}`}
                          className="p-2 bg-secondary hover:bg-muted rounded-sm transition-colors"
                          title="View Chart"
                        >
                          <BarChart3 size={14} className="text-primary" />
                        </button>
                        {trade.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => setEditingTrade(trade)}
                              data-testid={`edit-btn-${trade.id}`}
                              className="p-2 bg-secondary hover:bg-muted rounded-sm transition-colors"
                              title="Edit SL/TP"
                            >
                              <Edit size={14} className="text-warning" />
                            </button>
                            <button
                              onClick={() => handleCloseTrade(trade.id)}
                              disabled={closeTradeMutation.isLoading}
                              data-testid={`close-trade-${trade.id}`}
                              className="p-2 bg-loss/20 hover:bg-loss/30 rounded-sm transition-colors disabled:opacity-50"
                              title="Close Trade"
                            >
                              <X size={14} className="text-loss" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="stat-card text-center py-12">
          <p className="text-muted-foreground text-lg">
            No trades yet. Execute signals to start trading.
          </p>
        </div>
      )}

      {/* Trade Chart Modal */}
      {selectedTrade && (
        <TradeChartModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
      )}

      {/* Edit Trade Modal */}
      {editingTrade && (
        <EditTradeModal trade={editingTrade} onClose={() => setEditingTrade(null)} />
      )}
    </div>
  );
}

export default Trades;