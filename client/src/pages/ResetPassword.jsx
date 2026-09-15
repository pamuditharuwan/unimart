import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import { useToast } from '../components/Toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const queryEmail = searchParams.get('email') || '';
  const queryToken = searchParams.get('token') || searchParams.get('code') || '';

  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState(
    queryToken && queryToken.length === 6 ? queryToken.split('') : ['', '', '', '', '', '']
  );
  const [accessToken, setAccessToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Extract hash parameters from Supabase recovery redirect URL (e.g. #access_token=...&type=recovery)
  useEffect(() => {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = hashParams.get('access_token');
      const type = hashParams.get('type');
      if (token && type === 'recovery') {
        setAccessToken(token);
      }
    }
  }, []);

  // OTP digit handling
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otp];
    if (cleanVal.length > 1) {
      // Pasted full OTP code
      const pasted = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const nextIdx = Math.min(cleanVal.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = otp.join('');
  const hasValidToken = Boolean(accessToken || fullOtp.length === 6);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!accessToken && fullOtp.length !== 6) {
      setError('Please enter the 6-digit recovery code sent to your university inbox.');
      return;
    }

    if (!accessToken && !email) {
      setError('Please enter your university email address.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        email: email.trim(),
        token: fullOtp,
        newPassword,
        accessToken: accessToken || undefined
      });

      setSuccess(true);
      addToast(res.message || 'Password reset successfully!', 'success');

      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email.trim())}&reset=true`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your recovery code or request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-block bg-white p-1 rounded border border-slate-200 shadow-xs mx-auto mb-2">
          <img
            src="/images/unimart-logo.jpg"
            alt="UniMart Logo"
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Set New Password</h1>
        <p className="text-xs text-slate-500">
          Create a secure new password for your UniMart student account.
        </p>
      </div>

      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-900">Password Reset Successful!</h3>
            <p className="text-xs text-emerald-700">
              Your password has been updated. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* If not authenticated via email link, require email and 6-digit OTP */}
            {!accessToken && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    University Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@student.rjt.ac.lk"
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-800">
                      6-Digit Recovery Code
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-teal-700 hover:underline"
                    >
                      Need a new code?
                    </Link>
                  </div>
                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-10 h-11 text-center font-mono text-lg font-bold border rounded focus:outline-none transition-colors ${
                          digit
                            ? 'border-teal-600 bg-teal-50/40 text-teal-900'
                            : 'border-slate-300 bg-white text-slate-900 focus:border-[#0d9488]'
                        }`}
                        required
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {accessToken && (
              <div className="p-2.5 bg-teal-50 border border-teal-200 rounded text-teal-900 text-xs flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Verified recovery link authenticated. Please enter your new password below.</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-sm pl-3 pr-9 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={`w-full text-sm pl-3 pr-9 py-2 bg-white border rounded focus:outline-none text-slate-900 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-rose-400 focus:border-rose-500'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : 'border-slate-300 focus:border-[#0d9488]'
                  }`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-rose-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword || (!accessToken && fullOtp.length !== 6)}
              className="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password &amp; Sign In</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-slate-100 text-center text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-teal-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
