const { supabase } = require('../config/supabase');
const crypto = require('crypto');

/**
 * @desc    Get wallet balance
 * @route   GET /api/wallet/balance
 * @access  Private
 */
exports.getBalance = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('wallet_balance, wallet_pending_balance, wallet_escrow_balance, wallet_total_earnings, wallet_total_spent')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Get balance error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch balance',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      data: {
        balance: parseFloat(user.wallet_balance || 0),
        pending: parseFloat(user.wallet_pending_balance || 0),
        escrow: parseFloat(user.wallet_escrow_balance || 0),
        total_earnings: parseFloat(user.wallet_total_earnings || 0),
        total_spent: parseFloat(user.wallet_total_spent || 0)
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching balance',
      error: error.message
    });
  }
};

/**
 * @desc    Get transaction history
 * @route   GET /api/wallet/transactions
 * @access  Private
 */
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Get transactions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Fund wallet (initialize payment)
 * @route   POST /api/wallet/fund
 * @access  Private
 */
exports.fundWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < parseFloat(process.env.MIN_FUNDING_AMOUNT || 1000)) {
      return res.status(400).json({
        success: false,
        message: `Minimum funding amount is ₦${process.env.MIN_FUNDING_AMOUNT || 1000}`
      });
    }

    // Generate reference
    const reference = `FUND-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Get current balance
    const { data: user } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', req.user.id)
      .single();

    const currentBalance = parseFloat(user?.wallet_balance || 0);

    // Create pending transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: req.user.id,
        type: 'credit',
        category: 'funding',
        amount,
        description: `Wallet funding of ₦${amount}`,
        reference,
        status: 'pending',
        balance_before: currentBalance,
        balance_after: currentBalance, // Will update on completion
        payment_gateway_provider: 'paystack'
      }])
      .select()
      .single();

    if (error) {
      console.error('Fund wallet error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate funding',
        error: error.message
      });
    }

    // In production, initialize Paystack payment here
    // For now, return transaction details
    res.status(200).json({
      success: true,
      message: 'Funding initiated. Complete payment to credit wallet.',
      data: {
        transaction_id: transaction.id,
        reference,
        amount,
        // In production, include Paystack payment URL
        payment_url: `https://paystack.com/pay/${reference}`, // Placeholder
        note: 'Paystack integration pending. Transaction created in pending state.'
      }
    });
  } catch (error) {
    console.error('Fund wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error funding wallet',
      error: error.message
    });
  }
};

/**
 * @desc    Request withdrawal
 * @route   POST /api/wallet/withdraw
 * @access  Private
 */
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, bank_account_id } = req.body;

    const minWithdrawal = parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT || 5000);

    if (!amount || !bank_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Amount and bank account are required'
      });
    }

    if (amount < minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ₦${minWithdrawal}`
      });
    }

    // Get user balance
    const { data: user } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', req.user.id)
      .single();

    const balance = parseFloat(user?.wallet_balance || 0);

    if (balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Verify bank account belongs to user
    const { data: bankAccount, error: bankError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', bank_account_id)
      .eq('user_id', req.user.id)
      .single();

    if (bankError || !bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Generate reference
    const reference = `WD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert([{
        user_id: req.user.id,
        amount,
        bank_account_id,
        reference,
        status: 'pending',
        payment_gateway_provider: 'paystack'
      }])
      .select()
      .single();

    if (withdrawalError) {
      console.error('Withdrawal request error:', withdrawalError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create withdrawal request',
        error: withdrawalError.message
      });
    }

    // Create transaction record
    await supabase
      .from('transactions')
      .insert([{
        user_id: req.user.id,
        type: 'debit',
        category: 'withdrawal',
        amount,
        description: `Withdrawal to ${bankAccount.bank_name} - ${bankAccount.account_number}`,
        reference,
        status: 'pending',
        balance_before: balance,
        balance_after: balance, // Will update on completion
        withdrawal_id: withdrawal.id,
        payment_gateway_provider: 'paystack'
      }]);

    // Deduct from balance immediately (move to pending)
    await supabase
      .from('users')
      .update({
        wallet_balance: balance - amount,
        wallet_pending_balance: parseFloat(user.wallet_pending_balance || 0) + amount
      })
      .eq('id', req.user.id);

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        withdrawal_id: withdrawal.id,
        reference,
        amount,
        bank_account: {
          bank_name: bankAccount.bank_name,
          account_number: bankAccount.account_number,
          account_name: bankAccount.account_name
        },
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting withdrawal',
      error: error.message
    });
  }
};

/**
 * @desc    Get withdrawal history
 * @route   GET /api/wallet/withdrawals
 * @access  Private
 */
exports.getWithdrawals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('withdrawals')
      .select('*, bank_account:bank_accounts(*)', { count: 'exact' })
      .eq('user_id', req.user.id);

    if (status) query = query.eq('status', status);

    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Get withdrawals error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch withdrawals',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching withdrawals',
      error: error.message
    });
  }
};

/**
 * @desc    Add bank account
 * @route   POST /api/wallet/bank-account
 * @access  Private
 */
exports.addBankAccount = async (req, res) => {
  try {
    const { bank_name, bank_code, account_number, account_name } = req.body;

    if (!bank_name || !account_number || !account_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bank name, account number, and account name'
      });
    }

    // Check if this is user's first bank account
    const { data: existingAccounts } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('user_id', req.user.id);

    const isFirst = !existingAccounts || existingAccounts.length === 0;

    // Add bank account
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([{
        user_id: req.user.id,
        bank_name,
        bank_code,
        account_number,
        account_name,
        is_default: isFirst, // First account is default
        is_verified: false // Verify via Paystack in production
      }])
      .select()
      .single();

    if (error) {
      console.error('Add bank account error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add bank account',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data
    });
  } catch (error) {
    console.error('Add bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding bank account',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's bank accounts
 * @route   GET /api/wallet/bank-accounts
 * @access  Private
 */
exports.getBankAccounts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Get bank accounts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bank accounts',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank accounts',
      error: error.message
    });
  }
};

/**
 * @desc    Set default bank account
 * @route   PUT /api/wallet/bank-account/:id/default
 * @access  Private
 */
exports.setDefaultBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify bank account belongs to user
    const { data: bankAccount, error: fetchError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Remove default from all user's accounts
    await supabase
      .from('bank_accounts')
      .update({ is_default: false })
      .eq('user_id', req.user.id);

    // Set this account as default
    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Set default bank account error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to set default bank account',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Default bank account updated',
      data
    });
  } catch (error) {
    console.error('Set default bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default bank account',
      error: error.message
    });
  }
};

/**
 * @desc    Delete bank account
 * @route   DELETE /api/wallet/bank-account/:id
 * @access  Private
 */
exports.deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: bankAccount, error: fetchError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Delete
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete bank account error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete bank account',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bank account',
      error: error.message
    });
  }
};
