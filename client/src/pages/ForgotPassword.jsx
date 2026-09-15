import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, AlertCircle, CheckCircle, ShieldAlert, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';
import { useToast } from '../components/Toast';
import { parseSriLankanUniversityEmail } from '../utils/universityDomains';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const emailAnalysis = parseSriLankanUniversityEmail(email);
  const isEmailDomainValid = emailAnalysis.isValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    if (!isEmailDomainValid) {
      setError(emailAnalysis.error || 'Password recovery is restricted to official Sri Lankan university student emails.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccessMessage(res.message || `Password reset instructions dispatched to ${email.trim()}.`);
      addToast('Password recovery code dispatched! Check your university inbox.', 'success');
      setCountdown(60);

      // Start countdown timer
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to dispatch password recovery email. Please check the email and try again.');
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
        <h1 className="text-xl font-bold text-slate-900">Forgot Your Password?</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Enter your university student email and we'll send you recovery instructions with a 6-digit code.
        </p>
      </div>

      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Recovery Instructions Dispatched!</span>
              </div>
              <p className="text-emerald-700 leading-relaxed text-[11.5px]">
                {successMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`)}
              className="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Enter 6-Digit Code &amp; Reset Password</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || countdown > 0}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : "Didn't receive email? Resend"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                University Student Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@student.rjt.ac.lk"
                  className={`w-full text-sm pl-9 pr-3 py-2 bg-white border rounded focus:outline-none text-slate-900 ${
                    email && !isEmailDomainValid
                      ? 'border-rose-400 focus:border-rose-500'
                      : email && isEmailDomainValid
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : 'border-slate-300 focus:border-[#0d9488]'
                  }`}
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Live Domain Feedback */}
              {email && (
                <div className="mt-1.5">
                  {isEmailDomainValid ? (
                    <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-medium">
                        {emailAnalysis.universityName}
                      </span>
                    </div>
                  ) : (
                    <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        {emailAnalysis.error || 'Must be an official Sri Lankan state university email.'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !email || !isEmailDomainValid}
              className="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking account &amp; sending...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Send Recovery Instructions</span>
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
            <span>Remembered your password? Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
