import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Confetti from '../components/Confetti';

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-shop-bg">
      <Confetti />
      <Header />

      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-shop-deliverable flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-shop-display text-3xl font-bold text-shop-text mb-2">
          Order Placed!
        </h1>
        <p className="text-shop-highlight text-sm max-w-xs mb-8">
          Your order is confirmed and we're getting it ready. You'll receive it in 15–20 minutes.
        </p>

        <div className="flex gap-3">
          <Link
            to="/my-orders"
            className="bg-shop-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-shop-primary-dark transition"
          >
            Track Order
          </Link>
          <Link
            to="/store"
            className="border border-shop-highlight/20 text-shop-text px-6 py-2.5 rounded-full font-semibold text-sm hover:border-shop-primary transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}