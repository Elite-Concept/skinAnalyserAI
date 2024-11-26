import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Microscope, ArrowLeft } from 'lucide-react';
import { plans } from '../lib/stripe';
import { useAuth } from '../contexts/AuthContext';
import { useCheckout } from '../hooks/useCheckout';
import PricingCard from '../components/pricing/PricingCard';
import ErrorAlert from '../components/pricing/ErrorAlert';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { initiateCheckout, isLoading, error, clearError } = useCheckout();
  const [loadingPlanId, setLoadingPlanId] = React.useState<string | undefined>();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      setLoadingPlanId(planId);
      await initiateCheckout(planId, user.uid);
    } catch (error) {
      // Error is already handled by useCheckout
    } finally {
      setLoadingPlanId(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Microscope className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">SkinAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Start with a free trial, no credit card required
          </p>
        </div>

        {error && <ErrorAlert message={error} onDismiss={clearError} />}

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              isLoading={isLoading}
              loadingPlanId={loadingPlanId}
            />
          ))}
        </div>
      </main>
    </div>
  );
}