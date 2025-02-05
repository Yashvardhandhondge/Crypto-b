import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import BoomFiService from '../services/BoomFiService';

// Define a type for subscription status
interface SubscriptionStatusResponse {
  status: 'Free' | 'Premium';
  cancelAtPeriodEnd: boolean;
}

export class AuthController {
  static generateToken(user: any, subscriptionStatus: 'Free' | 'Premium') {
    return jwt.sign(
      { 
        _id: user._id?.toString(), 
        walletAddress: user.walletAddress,
        subscriptionStatus 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        res.status(400).json({ message: 'Wallet address is required' });
        return;
      }

      // Check if user already exists
      let user = await User.findOne({ walletAddress });
      
      // Get subscription status with explicit type
      const subscriptionStatus: SubscriptionStatusResponse = await BoomFiService.getSubscriptionStatus(walletAddress);

      if (user) {
        const token = AuthController.generateToken(user, subscriptionStatus.status);
        res.status(200).json({ 
          message: 'User already exists',
          token,
          user: {
            ...user.toObject(),
            subscription: {
              status: subscriptionStatus.status,
              cancelAtPeriodEnd: subscriptionStatus.cancelAtPeriodEnd
            }
          }
        });
        return;
      }

      // Create new user with initial state
      user = new User({
        walletAddress,
        name: '',
        email: '',
        phone: '',
        customerId: '',
        subscription: {
          status: 'Free',
          expiryDate: null,
          subscriptionId: null,
          periodStartAt: null,
          periodEndAt: null,
          cancelAtPeriodEnd: false
        }
      });
      
      await user.save();

      const token = AuthController.generateToken(user, 'Free');

      res.status(201).json({ 
        message: 'User created successfully',
        token,
        user: {
          ...user.toObject(),
          subscription: {
            status: 'Free',
            cancelAtPeriodEnd: false
          }
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }
}