import React, { useState } from 'react';
import { Card, Button, Input } from '../ui';
import { LoadingSpinner } from '../common';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

const MobileLogin = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }

    setLoading(true);
    try {
      await authAPI.mobileLogin(mobileNumber);
      setStep('otp');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.verifyOTP(mobileNumber, otp);
      onSuccess(result);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      await authAPI.resendOTP(mobileNumber);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast.success('OTP resent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('mobile');
      setOtp('');
      setCountdown(0);
    } else if (onBack) {
      onBack();
    }
  };

  if (step === 'mobile') {
    return (
      <Card className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mobile Login</h2>
          <p className="text-gray-600 mt-2">
            Enter your mobile number to receive an OTP
          </p>
        </div>

        <form onSubmit={handleMobileSubmit} className="space-y-4">
          <Input
            label="Mobile Number"
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter your mobile number"
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Send OTP'}
          </Button>

          {onBack && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
        </form>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Enter OTP</h2>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit code to your email
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Mobile: {mobileNumber}
        </p>
      </div>

      <form onSubmit={handleOTPSubmit} className="space-y-4">
        <Input
          label="OTP Code"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Verify OTP'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0 || loading}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleBack}
        >
          Back to Mobile Number
        </Button>
      </form>
    </Card>
  );
};

export default MobileLogin;
