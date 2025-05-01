import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51RJBIYQQPeV5YOEbdigXxvZz3hGFRoOLAlwJkhYZ4J9cokxBzH9nQsMBLLmFKlWyYpTyHj3GzsBNo6s7VsxKtz7Z00guZvG1LB');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [donationError, setDonationError] = useState('');
  const [donationSuccess, setDonationSuccess] = useState(false);

  const handleAmountChange = (event) => {
    setDonationAmount(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setDonationError('Please enter a valid donation amount.');
      return;
    }

    setIsDonating(true);
    setDonationError('');

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        console.log('[PaymentMethod error]', error);
        setDonationError(error.message);
        setIsDonating(false);
        return;
      }

      console.log('[PaymentMethod]', paymentMethod);

      const response = await fetch('http://localhost:5001/api/donate', { // Updated URL to your backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(donationAmount) * 100, // Amount in cents
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDonationSuccess(true);
        setDonationAmount('');
        setTimeout(() => setDonationSuccess(false), 3000);
      } else {
        setDonationError(data.error || 'An error occurred while processing your donation.');
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      setDonationError('Failed to process donation. Please try again later.');
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="bg-gray-700 rounded-md shadow-md p-6 w-full max-w-md">
      <h3 className="text-xl font-semibold mb-4 text-pink-300">Make a Donation</h3>

      <div className="mb-4">
        <label htmlFor="donationAmount" className="block text-gray-400 text-sm font-bold mb-2">
          Donation Amount (USD):
        </label>
        <input
          type="number"
          id="donationAmount"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-600"
          value={donationAmount}
          onChange={handleAmountChange}
          placeholder="Enter amount"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-400 text-sm font-bold mb-2">
          Payment Information:
        </label>
        <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-600">
          <CardElement options={{ style: { base: { color: '#fff' } } }} />
        </div>
      </div>

      {donationError && <div className="text-red-500 mb-4">{donationError}</div>}

      <button
        onClick={handleSubmit}
        className={`bg-pink-500 hover:bg-pink-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isDonating ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isDonating || !stripe || !elements}
      >
        {isDonating ? 'Processing...' : 'Donate Now'}
      </button>

      {donationSuccess && (
        <div className="mt-4 text-green-400">
          Thank you for your generous donation!
        </div>
      )}
    </div>
  );
};

const FeedbackForm = ({ onSubmit, onCancel }) => {
  const [feedbackText, setFeedbackText] = useState('');

  const handleChange = (event) => {
    setFeedbackText(event.target.value);
  };

  const handleSubmit = () => {
    if (feedbackText.trim()) {
      onSubmit(feedbackText);
      setFeedbackText('');
    } else {
      alert('Please enter your feedback.');
    }
  };

  return (
    <div className="bg-gray-700 rounded-md shadow-md p-6 mt-4 w-full max-w-md">
      <h4 className="text-lg font-semibold mb-2 text-pink-300">Share Your Feedback</h4>
      <textarea
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-600 mb-3"
        rows="4"
        placeholder="Enter your feedback and suggestions here..."
        value={feedbackText}
        onChange={handleChange}
      />
      <div className="flex justify-end">
        <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
          Cancel
        </button>
        <button onClick={handleSubmit} className="bg-pink-500 hover:bg-pink-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

function Support() {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const platformUrl = window.location.href; // Or your specific platform URL
  const feedbackEmail = 'feedback@feelingai.com'; // Replace with your feedback email
  const feedbackFormUrl = ''; // Optionally, a URL to a feedback form

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out the Feeling AI Platform!',
        url: platformUrl,
      }).then(() => console.log('Shared successfully.'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      alert(`Copy this link to share: ${platformUrl}`);
    }
  };

  const handleFeedbackButtonClick = () => {
    if (feedbackFormUrl) {
      window.open(feedbackFormUrl, '_blank');
    } else if (feedbackEmail) {
      window.location.href = `mailto:${feedbackEmail}?subject=Feeling AI Platform Feedback`;
    } else {
      // If neither email nor external form is set, show the internal form
      setShowFeedbackForm(true);
    }
  };

  const handleFeedbackSubmit = (feedback) => {
    // In a real application, you would send this feedback to your backend
    console.log('Feedback submitted:', feedback);
    setShowFeedbackForm(false);
    alert('Thank you for your feedback!'); // Simple confirmation for this example
    // You might want to show a more user-friendly message
  };

  const handleFeedbackCancel = () => {
    setShowFeedbackForm(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-gray-300 p-6">
      <h2 className="text-3xl font-bold mb-6 text-pink-400">Support the Platform</h2>
      <p className="mb-4 text-center text-gray-400">
        Your support helps us maintain and improve the Feeling AI Platform. Thank you!
      </p>

      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>

      {/* Other Support Options */}
      <div className="mt-8 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4 text-pink-300">Other Ways to Support</h3>
        <ul className="list-disc list-inside text-gray-400">
          <li>
            <button onClick={handleShare} className="text-blue-400 hover:underline">
              Share the platform with friends
            </button>
          </li>
          <li>
            <button onClick={handleFeedbackButtonClick} className="text-blue-400 hover:underline">
              Provide feedback and suggestions
            </button>
          </li>
          {/* Add more support options as needed */}
        </ul>

        {showFeedbackForm && (
          <FeedbackForm onSubmit={handleFeedbackSubmit} onCancel={handleFeedbackCancel} />
        )}
      </div>
    </div>
  );
}

export default Support;