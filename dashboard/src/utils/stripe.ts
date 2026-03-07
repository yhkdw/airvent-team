import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key from the Stripe dashboard
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51P...'; // Placeholder

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
