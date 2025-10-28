import express from 'express';
import { initiateStkPush, handleMpesaCallback, queryTransactionStatus } from '../controllers/MpesaController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   POST /api/mpesa/stkpush
 * @desc    Initiate M-Pesa STK Push (Protected)
 */
router.post('/stkpush', protect, initiateStkPush);

/**
 * @route   POST /api/mpesa/callback
 * @desc    Safaricom callback (Public)
 */
router.post('/callback', handleMpesaCallback);

/**
 * @route   POST /api/mpesa/query
 * @desc    Query transaction status (Protected)
 */
router.post('/query', protect, queryTransactionStatus);

export default router;
