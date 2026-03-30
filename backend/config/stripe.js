import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

let stripe;

export const configStripe = () => {
	if (!stripe) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error('STRIPE_SECRET_KEY is missing');
		}

		stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
	}

	return stripe;
};
