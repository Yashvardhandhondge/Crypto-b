import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';


export class AuthController {
  static generateToken(user: any) {
    return jwt.sign(
      { _id: user._id?.toString() },
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
      
      if (user) {
        const token = AuthController.generateToken(user);
        res.status(200).json({ 
          message: 'User already exists',
          token,
          user
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
          periodEndAt: null
        }
      });
      
      await user.save();

      const token = AuthController.generateToken(user);

      res.status(201).json({ 
        message: 'User created successfully',
        token,
        user 
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }
}