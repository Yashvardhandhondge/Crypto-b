import express from 'express';
import { AuthController } from '../controllers/authController';


const router = express.Router();

// Public routes
router.post('/register', AuthController.register);

// router.post('/wallet/connect', auth, AuthController.connectWallet);

export default router;