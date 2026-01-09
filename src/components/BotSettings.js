import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../services/api';
import { Settings, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

function BotSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    auto_trading_enabled: false,
    risk_per_trade: 1.0,
    max_concurrent_trades: 3,
    preferred_rrr: 3.0,
    trading_symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT'],
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsAPI.getSettings,
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: settingsAPI.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('Settings saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleToggle = () => {
    setFormData({ ...formData, auto_trading_enabled: !formData.auto_trading_enabled });
  };

  const handleSymbolToggle = (symbol) => {
    const symbols = formData.trading_symbols;
    if (symbols.includes(symbol)) {
      setFormData({
        ...formData,
        trading_symbols: symbols.filter((s) => s !== symbol),
      });
    } else {
      setFormData({
        ...formData,
        trading_symbols: [...symbols, symbol],
      });
    }
  };

  const allSymbols = [
    { name: 'Bitcoin', symbol: 'BTCUSDT', category: 'Crypto' },
    { name: 'Ethereum', symbol: 'ETHUSDT', category: 'Crypto' },
    { name: 'Solana', symbol: 'SOLUSDT', category: 'Crypto' },
    { name: 'Avalanche', symbol: 'AVAXUSDT', category: 'Crypto' },
    { name: 'Gold (XAU/USD)', symbol: 'XAUUSD', category: 'Forex' },
    { name: 'Euro (EUR/USD)', symbol: 'EURUSD', category: 'Forex' },
    { name: 'Japanese Yen (USD/JPY)', symbol: 'USDJPY', category: 'Forex' },
    { name: 'British Pound (GBP/USD)', symbol: 'GBPUSD', category: 'Forex' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="settings-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider" data-testid="settings-title">
          <Settings className="inline-block mr-2" size={32} />
          Bot Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="stat-card mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Trading Configuration</h2>

          {/* Auto Trading Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-sm border border-border">
              <div>
                <div className="font-bold text-lg" data-testid="auto-trading-label">Automated Trading</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {formData.auto_trading_enabled
                    ? 'Bot will automatically execute high-confidence signals'
                    : 'Manual approval required for all trades'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                data-testid="auto-trading-toggle"
                className={`relative inline-flex h-12 w-24 items-center rounded-sm transition-colors ${
                  formData.auto_trading_enabled ? 'bg-profit' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-10 w-10 transform rounded-sm bg-card transition-transform ${
                    formData.auto_trading_enabled ? 'translate-x-12' : 'translate-x-1'
                  }`}
                />
                {formData.auto_trading_enabled ? (
                  <ToggleRight className="absolute right-2 text-primary-foreground" size={20} />
                ) : (
                  <ToggleLeft className="absolute left-2 text-foreground" size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Risk Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" data-testid="risk-label">
                Risk Per Trade (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={formData.risk_per_trade}
                onChange={(e) =>
                  setFormData({ ...formData, risk_per_trade: parseFloat(e.target.value) })
                }
                data-testid="risk-input"
                className="w-full bg-input border border-border rounded-sm px-4 py-3 mono text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Percentage of account to risk per trade
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" data-testid="max-trades-label">
                Max Concurrent Trades
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.max_concurrent_trades}
                onChange={(e) =>
                  setFormData({ ...formData, max_concurrent_trades: parseInt(e.target.value) })
                }
                data-testid="max-trades-input"
                className="w-full bg-input border border-border rounded-sm px-4 py-3 mono text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Maximum number of open trades at once
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold uppercase tracking-wider mb-2" data-testid="rrr-label">
              Preferred Risk/Reward Ratio
            </label>
            <select
              value={formData.preferred_rrr}
              onChange={(e) =>
                setFormData({ ...formData, preferred_rrr: parseFloat(e.target.value) })
              }
              data-testid="rrr-select"
              className="w-full bg-input border border-border rounded-sm px-4 py-3 mono text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="2.0">1:2</option>
              <option value="3.0">1:3</option>
              <option value="4.0">1:4</option>
              <option value="5.0">1:5</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Target profit relative to risk (higher = better but harder to achieve)
            </p>
          </div>
        </div>

          {/* Trading Symbols */}
        <div className="stat-card mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Trading Symbols</h2>
          
          {/* Crypto Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Cryptocurrency</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSymbols.filter(item => item.category === 'Crypto').map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => handleSymbolToggle(item.symbol)}
                  data-testid={`symbol-toggle-${item.symbol}`}
                  className={`p-4 border-2 rounded-sm cursor-pointer transition-all ${
                    formData.trading_symbols.includes(item.symbol)
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">{item.name}</div>
                      <div className="text-sm text-muted-foreground mono">{item.symbol}</div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center ${
                        formData.trading_symbols.includes(item.symbol)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {formData.trading_symbols.includes(item.symbol) && (
                        <svg
                          className="w-4 h-4 text-primary-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Forex Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-warning mb-3">Forex Markets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSymbols.filter(item => item.category === 'Forex').map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => handleSymbolToggle(item.symbol)}
                  data-testid={`symbol-toggle-${item.symbol}`}
                  className={`p-4 border-2 rounded-sm cursor-pointer transition-all ${
                    formData.trading_symbols.includes(item.symbol)
                      ? 'border-warning bg-warning/10'
                      : 'border-border bg-secondary hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">{item.name}</div>
                      <div className="text-sm text-muted-foreground mono">{item.symbol}</div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center ${
                        formData.trading_symbols.includes(item.symbol)
                          ? 'border-warning bg-warning'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {formData.trading_symbols.includes(item.symbol) && (
                        <svg
                          className="w-4 h-4 text-primary-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Select which cryptocurrency and forex pairs to analyze and trade
          </p>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={updateSettingsMutation.isLoading}
          data-testid="save-settings-btn"
          className="btn-execute flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateSettingsMutation.isLoading ? (
            <>
              <div className="loading" />
              SAVING...
            </>
          ) : (
            <>
              <Save size={16} />
              SAVE SETTINGS
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default BotSettings;