import User from '../models/User';
import * as dotenv from 'dotenv';
import axios from 'axios';
// import { error } from 'console';
dotenv.config();





class BoomFiService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    //@ts-ignore
    this.apiKey = process.env.BOOMFI_API_KEY;
    //@ts-ignore
    this.apiUrl = process.env.BOOMFI_API_URL;
  }

  async handleWebhook(payload: any) {
    try {
      console.log('Webhook payload:', payload);
      
      const { event, customer, cancel_at_period_end } = payload;
      const { wallet_address, email, name } = customer;

      let user = await User.findOne({ walletAddress: wallet_address });
      
      if (!user) {
        user = new User({
          walletAddress: wallet_address,
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
      }

    
      user.customerId = customer.id;
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = customer.phone || user.phone;

      switch (event) {
        case 'Invoice.Updated':
          if (payload.payment_status === 'Succeeded') {
            const { invoice_items } = payload;
            const subscriptionDetails = invoice_items[0];
            
            user.subscription = {
              ...user.subscription,
              status: 'Premium',
              subscriptionId: subscriptionDetails.subscription.id,
              periodStartAt: new Date(subscriptionDetails.period_start_at),
              periodEndAt: new Date(subscriptionDetails.period_end_at),
              expiryDate: new Date(subscriptionDetails.period_end_at),
              cancelAtPeriodEnd: false
            };
          }
          break;

        case 'Subscription.Updated':
          if (cancel_at_period_end !== undefined) {
            user.subscription.cancelAtPeriodEnd = cancel_at_period_end;
            if (cancel_at_period_end) {
              console.log('Subscription scheduled for cancellation at period end');
            }
          }
          break;

        case 'Subscription.Canceled':
          user.subscription = {
            status: 'Free',
            expiryDate: undefined,
            subscriptionId: undefined,
            periodStartAt: undefined,
            periodEndAt: undefined,
            cancelAtPeriodEnd: false
          };
          break;

        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      await user.save();
      return true;
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  async validateSubscription(walletAddress: string): Promise<boolean> {
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) return false;

      const now = new Date();
      if (
        user.subscription.status === 'Premium' && 
        user.subscription.expiryDate &&
        !user.subscription.cancelAtPeriodEnd
      ) {
        return now < user.subscription.expiryDate;
      }
      
      return false;
    } catch (error) {
      console.error('Error validating subscription:', error);
      return false;
    }
  }

  async listCustomers() {
    try {
      const response = await axios.get(`${this.apiUrl}/v1/customers`, {
        headers: {
          'x-api-key': `${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Customers fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return {
        success: false,
        error: 'Failed to fetch customers',
        message: error.response?.data?.message || error.message
      };
    }
  }

  async getCustomerByWallet(customerId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/v1/customers/${customerId}`, {
        headers: {
          'x-api-key': `${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Customer fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching customer:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to fetch customer',
        message: error.response?.data?.message || error.message
      };
    }
  }

  async getCustomerSubscriptions(customerId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/v1/subscriptions`, {
        headers: {
          'x-api-key': `${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          customer_id: customerId
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Subscriptions fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to fetch subscriptions',
        message: error.response?.data?.message || error.message
      };
    }
  }
}

export default new BoomFiService();