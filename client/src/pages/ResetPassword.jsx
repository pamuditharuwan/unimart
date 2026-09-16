import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  KeyRound, 
  ArrowLeft,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { authApi } from '../services/api';
import { useToast } from '../components/Toast';

// Safely decode base64 JWT payload in browser
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.warn('[JWT parse warning]', err);
    return null;
  }
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const queryEmail = searchParams.get('email') || '';
  const queryToken = searchParams.get('token') || searchParams.get('code') || '';
  const queryTime = searchParams.get('timeRemaining');

  const [email, setEmail] = useState(queryEmail);
  const [studentName, setStudentName] = useState('');
  const [studentUni, setStudentUni] = useState('');
  const [otp, setOtp] = useState(
    queryToken && queryToken.length === 6 ? queryToken.split('') : ['', '', '', '', '', '']
  );
  const [accessToken, setAccessToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1-minute (60 seconds) security window countdown
  const [countdown, setCountdown] = useState(() => {
    if (queryTime && !isNaN(parseInt(queryTime, 10))) {
      return Math.max(0, parseInt(queryTime, 10));
    }
    return 60;
  });
  const [isExpired, setIsExpired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Extract hash parameters from Supabase recovery redirect URL
  // e.g. #access_token=...&expires_at=...&type=recovery
  useEffect(() => {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (token) {
        setAccessToken(token);
        const payload = decodeJwt(token);
        if (payload) {
          if (payload.email) setEmail(payload.email);
          if (payload.user_metadata?.full_name) setStudentName(payload.user_metadata.full_name);
          if (payload.user_metadata?.university) setStudentUni(payload.user_metadata.university);

          // Calculate remaining seconds if iat is present
          if (payload.iat) {
            const nowSec = Math.floor(Date.now() / 1000);
            const elapsed = nowSec - payload.iat;
            const remaining = Math.max(0, 60 - elapsed);
            setCountdown(remaining);
            if (remaining <= 0) {
              setIsExpired(true);
            }
          }
        }
      }
    }
  }, []);

  // 1-minute countdown timer interval
  useEffect(() => {
    if (countdown <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // OTP digit handling
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otp];
    if (cleanVal.length > 1) {
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

  // Real-time password criteria validation (minimum 8 characters)
  const passwordRules = {
    hasLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword),
    matches: Boolean(newPassword && confirmPassword && newPassword === confirmPassword)
  };

  const isPasswordValid = 
    passwordRules.hasLength &&
    passwordRules.hasUpper &&
    passwordRules.hasLower &&
    passwordRules.hasNumber &&
    passwordRules.hasSpecial &&
    passwordRules.matches;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isExpired || countdown <= 0) {
      setError('This password reset session has expired (1-minute security limit). Please request a new recovery link or PIN.');
      return;
    }

    if (!accessToken && fullOtp.length !== 6) {
      setError('Please enter the 6-digit recovery code sent to your university student email.');
      return;
    }

    if (!accessToken && !email) {
      setError('Please enter your university email address.');
      return;
    }

    if (!passwordRules.hasLength) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (!passwordRules.hasUpper) {
      setError('New password must include at least one capital letter (A-Z).');
      return;
    }

    if (!passwordRules.hasLower) {
      setError('New password must include at least one simple letter (a-z).');
      return;
    }

    if (!passwordRules.hasNumber) {
      setError('New password must include at least one number (0-9).');
      return;
    }

    if (!passwordRules.hasSpecial) {
      setError('New password must include at least one special character (e.g. !@#$%^&*).');
      return;
    }

    if (!passwordRules.matches) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        email: email ? email.trim() : undefined,
        token: fullOtp || undefined,
        newPassword,
        accessToken: accessToken || undefined
      });

      setSuccess(true);
      addToast(res.message || 'Password reset successfully! Redirecting to login...', 'success');

      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email ? email.trim() : '')}&reset=true`);
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
          Create a secure password (minimum 8 characters) for your UniMart account.
        </p>
      </div>

      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4">
        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* 1-Minute Expiration Countdown Window */}
        {!success && (
          countdown > 0 ? (
            <div className="p-3 bg-teal-50/90 border border-teal-200 rounded text-teal-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-teal-900">
                  <Clock className="w-4 h-4 text-teal-600 animate-pulse" />
                  <span>Security Window Active</span>
                </div>
                <span className="font-mono font-bold text-xs text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded border border-teal-300">
                  {formatTime(countdown)} remaining
                </span>
              </div>
              <div className="w-full bg-teal-200/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(countdown / 60) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-teal-700 leading-relaxed">
                For campus account security, password recovery links and PINs expire in <strong>1 minute (60s)</strong>.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded text-rose-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Recovery Link &amp; PIN Expired (1-Minute Limit Reached)</span>
              </div>
              <p className="text-[11.5px] text-rose-700 leading-relaxed">
                Your 1-minute password reset security window has elapsed. For your safety, expired reset sessions cannot be processed.
              </p>
              <div className="pt-1">
                <Link
                  to={`/forgot-password?email=${encodeURIComponent(email || '')}`}
                  className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Request Fresh Recovery Link / Code</span>
                </Link>
              </div>
            </div>
          )
        )}

        {/* Success Message */}
        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-900">Password Reset Successful!</h3>
            <p className="text-xs text-emerald-700">
              Your password has been updated securely. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Authenticated via email link badge */}
            {accessToken && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded text-teal-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-800">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Verified Recovery Link Authenticated</span>
                </div>
                <p className="text-[11.5px] text-teal-700">
                  {studentName ? (
                    <>Account: <strong>{studentName}</strong> ({email})</>
                  ) : (
                    <>Account: <strong>{email}</strong></>
                  )}
                </p>
              </div>
            )}

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
                    disabled={isExpired}
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
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
                        disabled={isExpired}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-10 h-11 text-center font-mono text-lg font-bold border rounded focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400 ${
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

            {/* New Password (minimum 8 characters) */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                New Password (minimum 8 characters) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  disabled={isExpired}
                  className="w-full text-sm pl-3 pr-9 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                  required
                  minLength={8}
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
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  disabled={isExpired}
                  className={`w-full text-sm pl-3 pr-9 py-2 bg-white border rounded focus:outline-none text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 ${
                    confirmPassword && !passwordRules.matches
                      ? 'border-rose-400 focus:border-rose-500'
                      : confirmPassword && passwordRules.matches
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : 'border-slate-300 focus:border-[#0d9488]'
                  }`}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !passwordRules.matches && (
                <p className="text-[11px] text-rose-600 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Password Requirement Indicators */}
            {newPassword && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                <span className="font-semibold text-slate-700 block mb-1">Password Requirements:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${passwordRules.hasLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>At least 8 chars ({newPassword.length}/8+)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>1 Capital Letter (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasLower ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>1 Simple Letter (a-z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>1 Number (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>1 Special Character (!@#$)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.matches ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.matches ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isExpired || !isPasswordValid || (!accessToken && fullOtp.length !== 6)}
              className="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : isExpired ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Session Expired — Request New Link</span>
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
