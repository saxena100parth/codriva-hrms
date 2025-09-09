import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from '../ui';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

const OTPVerification = ({ email, onVerificationSuccess, onResendOTP, className = '' }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const result = await authAPI.verifyOTP(email, otp);
            toast.success('OTP verified successfully!');
            onVerificationSuccess(result);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        try {
            await onResendOTP();
            setCountdown(60); // 60 seconds cooldown
            toast.success('OTP resent successfully!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
    };

    return (
        <Card className={`max-w-md mx-auto ${className}`}>
            <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Verify Your Email</h3>
                <p className="mt-2 text-sm text-gray-600">
                    We've sent a 6-digit verification code to <strong>{email}</strong>
                </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP
                    </label>
                    <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    loading={loading}
                    className="w-full"
                >
                    Verify OTP
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={resendLoading || countdown > 0}
                    loading={resendLoading}
                >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Button>
            </div>

            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                    Check your spam folder if you don't see the email
                </p>
            </div>
        </Card>
    );
};

export default OTPVerification;
