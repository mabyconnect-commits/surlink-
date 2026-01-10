const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getBalance,
  getTransactions,
  fundWallet,
  requestWithdrawal,
  getWithdrawals,
  addBankAccount,
  getBankAccounts,
  setDefaultBankAccount,
  deleteBankAccount
} = require('../controllers/walletController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Wallet routes
router.get('/balance', getBalance);
router.get('/transactions', getTransactions);
router.post('/fund', fundWallet);

// Withdrawal routes
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);

// Bank account routes
router.post('/bank-account', addBankAccount);
router.get('/bank-accounts', getBankAccounts);
router.put('/bank-account/:id/default', setDefaultBankAccount);
router.delete('/bank-account/:id', deleteBankAccount);

module.exports = router;
