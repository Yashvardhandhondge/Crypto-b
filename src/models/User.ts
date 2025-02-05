import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress?: string;
  name?: string;
  email?: string;
  phone?: string;
  customerId?: string;
  subscription: {
    status: 'Free' | 'Premium';
    expiryDate?: Date;
    subscriptionId?: string;
    periodStartAt?: Date;
    periodEndAt?: Date;
    cancelAtPeriodEnd: boolean;
  };
  customer_ident?: string;
  guest?: boolean;
  organisation_id?: string;
  is_deleted?: boolean;
  payments_count?: number;
  last_payment_date?: Date;
}

const userSchema = new Schema({
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  customerId: {
    type: String,
    sparse: true
  },
  subscription: {
    status: {
      type: String,
      enum: ['Free', 'Premium'],
      default: 'Free',
    },
    expiryDate: {
      type: Date,
    },
    subscriptionId: {
      type: String,
    },
    periodStartAt: {
      type: Date,
    },
    periodEndAt: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  customer_ident: String,
  guest: Boolean,
  organisation_id: String,
  is_deleted: Boolean,
  payments_count: Number,
  last_payment_date: Date,
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', userSchema);