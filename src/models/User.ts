import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string; // Made required
  name?: string;
  email?: string;
  phone?: string;
  customerId?: string;
  subscription: {
    status: 'Free' | 'Premium';
    expiryDate?: Date | null;
    subscriptionId?: string | null;
    periodStartAt?: Date | null;
    periodEndAt?: Date | null;
    cancelAtPeriodEnd: boolean;
  };
  referralCode?: string; // Optional addition for future referral system
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  customerId: {
    type: String,
    sparse: true,
  },
  subscription: {
    status: {
      type: String,
      enum: ['Free', 'Premium'],
      default: 'Free',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    subscriptionId: {
      type: String,
      default: null,
    },
    periodStartAt: {
      type: Date,
      default: null,
    },
    periodEndAt: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  strict: true,
});

// Add an index on walletAddress for faster queries
userSchema.index({ walletAddress: 1 });

// Validate wallet address format (optional, but recommended)
userSchema.path('walletAddress').validate((value: string) => {
  // Basic Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}, 'Invalid wallet address format');

export default mongoose.model<IUser>('User', userSchema);