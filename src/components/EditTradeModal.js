import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeManagementAPI } from '../services/api';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';

function EditTradeModal({ trade, onClose }) {
  const queryClient = useQueryClient();
  const [stopLoss, setStopLoss] = useState(trade.stop_loss);
  const [takeProfit, setTakeProfit] = useState(trade.take_profit);

  const updateSLMutation = useMutation({
    mutationFn: (newSL) => tradeManagementAPI.updateStopLoss(trade.id, newSL),
    onSuccess: () => {
      queryClient.invalidateQueries(['trades']);
      toast.success('Stop Loss updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update SL');
    },
  });

  const updateTPMutation = useMutation({
    mutationFn: (newTP) => tradeManagementAPI.updateTakeProfit(trade.id, newTP),
    onSuccess: () => {
      queryClient.invalidateQueries(['trades']);
      toast.success('Take Profit updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update TP');
    },
  });

  const handleSave = async () => {
    let updated = false;
    
    if (stopLoss !== trade.stop_loss) {
      await updateSLMutation.mutateAsync(parseFloat(stopLoss));
      updated = true;
    }
    if (takeProfit !== trade.take_profit) {
      await updateTPMutation.mutateAsync(parseFloat(takeProfit));
      updated = true;
    }
    
    if (updated) {
      // Force refresh trades
      await queryClient.invalidateQueries(['trades']);
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      onClose();
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="stat-card max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider">Edit Trade</h2>
            <p className="text-sm text-muted-foreground mt-1">{trade.symbol} - {trade.side}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-3 bg-secondary rounded-sm">
            <div className="text-xs text-muted-foreground uppercase mb-1">Entry Price</div>
            <div className="mono font-bold text-lg">{formatPrice(trade.entry_price)}</div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Stop Loss
            </label>
            <input
              type="number"
              step="0.01"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-input border border-border rounded-sm px-4 py-3 mono text-lg focus:outline-none focus:border-loss focus:ring-1 focus:ring-loss"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current: {formatPrice(trade.stop_loss)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Take Profit
            </label>
            <input
              type="number"
              step="0.01"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-input border border-border rounded-sm px-4 py-3 mono text-lg focus:outline-none focus:border-profit focus:ring-1 focus:ring-profit"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current: {formatPrice(trade.take_profit)}
            </p>
          </div>

          <div className="p-3 bg-secondary rounded-sm border border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Risk:</span>
              <span className="mono font-semibold">
                {formatPrice(Math.abs(trade.entry_price - parseFloat(stopLoss || trade.stop_loss)))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reward:</span>
              <span className="mono font-semibold">
                {formatPrice(Math.abs(parseFloat(takeProfit || trade.take_profit) - trade.entry_price))}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-secondary text-foreground rounded-sm font-bold uppercase tracking-wider text-sm transition-all hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateSLMutation.isLoading || updateTPMutation.isLoading}
            className="flex-1 btn-execute flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {updateSLMutation.isLoading || updateTPMutation.isLoading ? (
              <>
                <div className="loading" />
                SAVING...
              </>
            ) : (
              <>
                <Save size={16} />
                SAVE CHANGES
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTradeModal;
