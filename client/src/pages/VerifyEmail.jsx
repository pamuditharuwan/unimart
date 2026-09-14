// ==========================================================
// UniMart: Email Verification Page (/verify-email)
// Official Supabase Auth 6-Digit OTP Verification Flow
// ==========================================================
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Edit2,
  Lock,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { authApi } from '../services/api';
import { parseSriLankanUniversityEmail } from '../utils/universityDomains';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, verifyOtp } = useAuth();
  const { addToast } = useToast();

  const queryEmail = searchParams.get('email') || user?.email || '';
  const [email, setEmail] = useState(queryEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!queryEmail);
  const [newEmailInput, setNewEmailInput] = useState(queryEmail);

  // 6 separate digit boxes for OTP (user must type the code received in email inbox)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Resend Countdown Timer (60s cooldown to prevent spam)
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // University domain validation for displayed email
  const emailAnalysis = parseSriLankanUniversityEmail(email);

  // If already authenticated and verified, redirect to home
  useEffect(() => {
    if (isAuthenticated && user && user.email_confirmed !== false && !success) {
      // User is already verified
      const timer = setTimeout(() => {
        navigate('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate, success]);

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus the first empty input on mount
  useEffect(() => {
    if (!isEditingEmail && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isEditingEmail]);

  // Handle single digit input
  const handleChange = (index, value) => {
    // Only allow numeric input
    const cleanVal = value.replace(/\D/g, '');

    // If empty (user deleted)
    if (!cleanVal) {
      const updated = [...otp];
      updated[index] = '';
      setOtp(updated);
      return;
    }

    // If user pasted or typed multiple digits
    if (cleanVal.length > 1) {
      handlePasteValue(cleanVal, index);
      return;
    }

    // Single digit entry
    const updated = [...otp];
    updated[index] = cleanVal;
    setOtp(updated);
    setError('');

    // Automatically move to the next box if available
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Helper for pasting multiple digits
  const handlePasteValue = (pastedText, startIndex = 0) => {
    const digitsOnly = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!digitsOnly) return;

    const updated = [...otp];
    for (let i = 0; i < digitsOnly.length; i++) {
      if (startIndex + i < 6) {
        updated[startIndex + i] = digitsOnly[i];
      }
    }
    setOtp(updated);
    setError('');

    // Focus the next empty box or the last box
    const nextEmptyIndex = updated.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  // Handle paste event directly on input
  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePasteValue(pastedData, index);
  };

  // Handle Backspace and arrow navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Current box is already empty, move to previous and delete
        const updated = [...otp];
        updated[index - 1] = '';
        setOtp(updated);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const updated = [...otp];
        updated[index] = '';
        setOtp(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Submit OTP for Supabase Auth verification
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (!email) {
      setError('Please provide your university email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call Supabase OTP verification
      const res = await (verifyOtp ? verifyOtp(email.trim(), code) : authApi.verifyOtp(email.trim(), code));

      setSuccess(true);
      addToast(res.message || 'Email verified successfully! Welcome to UniMart.', 'success');

      // Short delay for smooth success transition before dashboard redirect
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.warn('Verification error:', err);
      const raw = (err.message || '').toLowerCase();
      if (raw.includes('expired')) {
        setError('This verification code has expired. Please click "Resend Code" below to receive a new one.');
      } else if (raw.includes('invalid') || raw.includes('token')) {
        setError('The verification code is incorrect. Please check your inbox and enter the 6 digits again.');
      } else if (raw.includes('already') || raw.includes('confirmed')) {
        setError('This email is already verified. Redirecting you to login...');
        setTimeout(() => navigate('/login?confirmed=true'), 1500);
      } else {
        setError('Unable to verify code at this time. Please check your internet connection or request a new code.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend code functionality
  const handleResendCode = async () => {
    if (countdown > 0 || resending || !email) return;

    setResending(true);
    setError('');
    setResendMessage('');

    try {
      const res = await authApi.resendConfirmation(email.trim());
      setResendMessage(res.message || `A fresh 6-digit code has been sent to ${email.trim()}.`);
      setCountdown(60); // Reset 60s cooldown
      addToast('Verification code resent!', 'info');
    } catch (err) {
      setError(err.message || 'Failed to resend verification code. Please try again in a few moments.');
    } finally {
      setResending(false);
    }
  };

  // Change email handler
  const handleSaveEmailChange = (e) => {
    e.preventDefault();
    const clean = newEmailInput.trim();
    if (!clean) {
      setError('Please enter a valid university email address.');
      return;
    }

    const check = parseSriLankanUniversityEmail(clean);
    if (!check.isValid) {
      setError(check.error || 'Must be an official Sri Lankan university email (@___.___ .ac.lk or @uom.lk).');
      return;
    }

    setEmail(clean);
    setIsEditingEmail(false);
    setError('');
    setCountdown(0); // Allow immediate resend to new address
    // Clear OTP inputs
    setOtp(['', '', '', '', '', '']);
    addToast(`Email updated to ${clean}. Click "Resend Code" to receive your code.`, 'info');
  };

  const isComplete = otp.every((digit) => digit.trim() !== '');

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link to="/" className="inline-block bg-white p-1 rounded-md border border-slate-200 shadow-xs hover:border-teal-500 transition-colors">
          <img
            src="/images/unimart-logo.jpg"
            alt="UniMart Logo"
            className="h-14 w-auto object-contain mx-auto"
          />
        </Link>
        <div className="flex items-center justify-center gap-1.5 text-xs text-teal-800 font-semibold pt-1">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Verified Student Marketplace</span>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
        {/* Animated Icon */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="w-16 h-16 bg-teal-50 border-2 border-teal-500/30 rounded-full flex items-center justify-center text-teal-700 shadow-inner">
            {success ? (
              <CheckCircle2 className="w-8 h-8 text-teal-600 animate-bounce" />
            ) : (
              <Mail className="w-8 h-8 text-teal-600" />
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full shadow-xs">
            <Lock className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {success ? 'Email Verified Successfully!' : 'Verify your email'}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {success
              ? 'Your student account is now fully active. Redirecting you to UniMart...'
              : "We've sent a 6-digit verification code to your official university inbox."}
          </p>
        </div>

        {/* Recipient Email & Change Email Option */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Verification Sent To
            </span>
            {!isEditingEmail && !success && (
              <button
                type="button"
                onClick={() => {
                  setNewEmailInput(email);
                  setIsEditingEmail(true);
                }}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Change</span>
              </button>
            )}
          </div>

          {isEditingEmail ? (
            <form onSubmit={handleSaveEmailChange} className="space-y-2 pt-1">
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="your.reg@student.uni.ac.lk"
                className="w-full text-xs p-2 bg-white border border-teal-400 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                autoFocus
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(false)}
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#0d9488] hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Save Email
                </button>
              </div>
            </form>
          ) : (
            <div>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 block break-all">
                {email || 'No email provided'}
              </span>
              {emailAnalysis.isValid && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-teal-800 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{emailAnalysis.universityName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success State Notification */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-3 text-left animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">Account Activated!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Redirecting you to the UniMart student marketplace...
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5 text-left animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Resend Success Notification */}
        {resendMessage && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-xs flex items-start gap-2.5 text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
            <span className="leading-relaxed">{resendMessage}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6-Digit OTP Box Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 text-left">
                Enter 6-digit verification code:
              </label>
              <div className="flex justify-between gap-1.5 sm:gap-2.5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => handlePaste(e, index)}
                    aria-label={`Verification code digit ${index + 1}`}
                    disabled={loading || success}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-lg border bg-white transition-all outline-none ${
                      digit
                        ? 'border-teal-600 text-teal-950 bg-teal-50/30 ring-1 ring-teal-500'
                        : 'border-slate-300 text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Verify Email Button */}
            <button
              type="submit"
              disabled={loading || !isComplete}
              className="w-full py-3 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Resend Code Section with Countdown */}
        {!success && (
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-600">
            <span className="text-[11px] text-slate-500">
              Didn't receive the email in your student inbox?
            </span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0 || resending || !email}
              className="font-semibold text-teal-700 hover:text-teal-900 disabled:text-slate-400 disabled:hover:text-slate-400 flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>
                {resending
                  ? 'Sending new code...'
                  : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : 'Resend Code'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Helpful Campus Mail Advice */}
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-2">
        <span className="font-semibold text-slate-800 block text-[11px]">
          Tips for university email delivery:
        </span>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
          <li>Check your university webmail (Microsoft 365 Outlook or Google Workspace).</li>
          <li>Look in your <strong>Junk</strong> or <strong>Spam</strong> folder if not in primary inbox.</li>
          <li>The email subject is: <strong>"Confirm your signup"</strong> or <strong>"Verify Your University Email"</strong>.</li>
        </ul>
        <div className="pt-2 text-center">
          <Link to="/login" className="text-teal-700 hover:underline font-semibold text-[11px]">
            Already verified? Return to Student Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
