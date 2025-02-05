import express from 'express';
import { AuthController } from '../controllers/authController';
import BoomFiService from '../services/BoomFiService';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);

// Webhook route for subscription updates
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    
    // Validate webhook (you might want to add signature verification)
    const result = await BoomFiService.handleWebhook(payload);
    
    if (result) {
      res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      res.status(400).json({ message: 'Failed to process webhook' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Internal server error processing webhook' });
  }
});

export default router;