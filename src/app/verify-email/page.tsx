'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend States
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      // Decode %40 to @ and clean string
      setEmail(decodeURIComponent(emailParam).trim());
    }
  }, [searchParams]);

  // Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess('Account verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Email address is missing from URL.');
      return;
    }

    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccess(data.message || 'A new OTP code has been sent to your email.');
      setTimer(60); // 60s cooldown
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We have sent a 6-digit verification code to <br />
            <span className="font-semibold text-gray-900">{email || 'your email'}</span>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-100 break-words">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-100 break-words">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Enter 6-Digit OTP Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="relative block w-full text-center appearance-none rounded-lg border border-gray-300 px-3 py-3 text-2xl font-bold tracking-[10px] text-gray-900 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200"
              placeholder="000000"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400 transition-all duration-200"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || timer > 0}
              className="font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
            >
              {resendLoading
                ? 'Sending...'
                : timer > 0
                ? `Resend in ${timer}s`
                : 'Resend OTP'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}