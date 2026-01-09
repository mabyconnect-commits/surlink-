import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketAPI } from '../services/api';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function TradeChartModal({ trade, onClose }) {
  const { data: chartData } = useQuery({
    queryKey: ['tradeChart', trade.symbol],
    queryFn: () => marketAPI.getMarketData(trade.symbol, '15m', 50),
    refetchInterval: 30000,
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="stat-card max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider">{trade.symbol} Trade Chart</h2>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-muted-foreground">Entry: <span className="mono font-bold text-foreground">{formatPrice(trade.entry_price)}</span></span>
              <span className="text-muted-foreground">Side: <span className={`font-bold ${trade.side === 'BUY' ? 'profit' : 'loss'}`}>{trade.side}</span></span>
              <span className="text-muted-foreground">Status: <span className={`font-bold ${trade.status === 'ACTIVE' ? 'text-primary' : 'text-muted-foreground'}`}>{trade.status}</span></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {chartData?.data ? (
          <div className="chart-container h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.data}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E599" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E599" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fill: '#888888', fontSize: 11 }}
                  stroke="#262626"
                  tickFormatter={(val) => new Date(val).toLocaleTimeString()}
                />
                <YAxis
                  tick={{ fill: '#888888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
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
                  formatter={(value) => [formatPrice(value), 'Price']}
                />
                
                {/* Entry Line */}
                <ReferenceLine
                  y={trade.entry_price}
                  stroke="#00B8D9"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: `Entry: ${formatPrice(trade.entry_price)}`, fill: '#00B8D9', fontSize: 12, position: 'right' }}
                />
                
                {/* Stop Loss Line */}
                <ReferenceLine
                  y={trade.stop_loss}
                  stroke="#FF3333"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ value: `SL: ${formatPrice(trade.stop_loss)}`, fill: '#FF3333', fontSize: 12, position: 'right' }}
                />
                
                {/* Take Profit Line */}
                <ReferenceLine
                  y={trade.take_profit}
                  stroke="#00E599"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ value: `TP: ${formatPrice(trade.take_profit)}`, fill: '#00E599', fontSize: 12, position: 'right' }}
                />
                
                {/* Current Price Line (if trade is closed) */}
                {trade.exit_price && (
                  <ReferenceLine
                    y={trade.exit_price}
                    stroke="#FFAB00"
                    strokeWidth={2}
                    label={{ value: `Exit: ${formatPrice(trade.exit_price)}`, fill: '#FFAB00', fontSize: 12, position: 'right' }}
                  />
                )}
                
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#00E599"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-96">
            <div className="loading" />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary rounded-sm">
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Entry Price</div>
            <div className="mono font-bold text-neutral">{formatPrice(trade.entry_price)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Stop Loss</div>
            <div className="mono font-bold loss">{formatPrice(trade.stop_loss)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Take Profit</div>
            <div className="mono font-bold profit">{formatPrice(trade.take_profit)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">P/L</div>
            <div className={`mono font-bold ${(trade.unrealized_pnl || trade.profit_loss || 0) >= 0 ? 'profit' : 'loss'}`}>
              {formatPrice(trade.unrealized_pnl || trade.profit_loss || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradeChartModal;
