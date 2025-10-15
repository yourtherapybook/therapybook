import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, 
  CreditCard, 
  Shield, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  Minus,
  Info,
  Heart,
  Star,
  Calendar,
  MessageCircle,
  Wallet,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle,
  User,
  Clock,
  TrendingUp
} from 'lucide-react';

const Booking: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionCount, setSessionCount] = useState(12);
  const [donationAmount, setDonationAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const sessionPrice = 40;
  const baseTotal = sessionCount * sessionPrice;
  const finalTotal = baseTotal + donationAmount;

  const steps = [
    { id: 1, name: 'Confirm Package', description: 'Review your selection' },
    { id: 2, name: 'Payment', description: 'Secure checkout' },
    { id: 3, name: 'Dashboard', description: 'Start your journey' }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'paypal', name: 'PayPal', icon: Wallet },
    { id: 'sepa', name: 'SEPA Direct Debit', icon: CreditCard },
    { id: 'apple', name: 'Apple Pay', icon: Wallet }
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    
    if (selectedPaymentMethod === 'card') {
      if (!formData.cardNumber) errors.cardNumber = 'Card number is required';
      if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) errors.cvv = 'CVV is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        setShowSuccess(true);
        setCurrentStep(3);
      } else {
        setShowError(true);
      }
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              currentStep >= step.id 
                ? 'bg-primary-500 border-primary-500 text-white' 
                : 'border-neutral-300 text-neutral-500'
            }`}>
              {currentStep > step.id ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{step.id}</span>
              )}
            </div>
            <div className="ml-3 hidden sm:block">
              <div className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-primary-600' : 'text-neutral-500'
              }`}>
                {step.name}
              </div>
              <div className="text-xs text-neutral-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`hidden sm:block w-16 h-0.5 mx-4 transition-colors duration-300 ${
                currentStep > step.id ? 'bg-primary-500' : 'bg-neutral-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile progress bar */}
      <div className="sm:hidden">
        <div className="flex justify-between text-xs text-neutral-600 mb-2">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round((currentStep / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Component implementations continue...
  // (Rest of the component code would be here, but truncated for brevity)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Component content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar />
        {/* Rest of component JSX */}
      </div>
    </div>
  );
};

export default Booking;