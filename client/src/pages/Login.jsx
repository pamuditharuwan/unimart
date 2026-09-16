import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  RefreshCw, 
  CheckCircle2,
  LogOut,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { authApi } from '../services/api';
import { parseSriLankanUniversityEmail, STATE_UNIVERSITIES_17 } from '../utils/universityDomains';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const isConfirmedParam = searchParams.get('confirmed') === 'true';
  const initialEmail = searchParams.get('email') || '';
  const { login, logout, user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [showDomainsList, setShowDomainsList] = useState(false);

  // Live university domain verification
  const emailAnalysis = parseSriLankanUniversityEmail(email);
  const isEmailDomainValid = emailAnalysis.isValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnconfirmed(false);
    setResendSuccess('');

    if (!email || !password) {
      setError('Please enter your university email and password.');
      return;
    }

    if (!isEmailDomainValid) {
      const msg = emailAnalysis.error || 'Login is strictly restricted to official Sri Lankan state university email domains (@___.___ .ac.lk or @uom.lk).';
      setError(msg);
      addToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      addToast(`Signed in successfully! Welcome back, ${res.user?.full_name || 'Student'}.`, 'success');
      navigate(redirectPath);
    } catch (err) {
      const errMsg = err.message || '';
      setError(errMsg || 'Invalid email or password. Please try again.');
      addToast(errMsg || 'Invalid credentials.', 'error');
      
      if (
        errMsg.toLowerCase().includes('not verified') ||
        errMsg.toLowerCase().includes('not confirmed') ||
        errMsg.toLowerCase().includes('inbox')
      ) {
        setIsUnconfirmed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setResendSuccess('');

    try {
      const res = await authApi.resendConfirmation(email.trim());
      setResendSuccess(res.message || `A new verification email was dispatched to ${email}.`);
      addToast('Confirmation email resent to your inbox!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-block bg-white p-1 rounded border border-slate-200 shadow-xs mx-auto mb-2">
          <img
            src="/images/unimart-logo.jpg"
            alt="UniMart Logo"
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Student Portal Login</h1>
        <p className="text-xs text-slate-500">
          Sign in with your official university student credentials
        </p>
      </div>

      {/* Confirmation Success Banner */}
      {isConfirmedParam && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">Email Verified Successfully!</span>
            <span className="text-[11px] text-emerald-700">
              Your university student account is now activated. Please enter your password to sign in.
            </span>
          </div>
        </div>
      )}

      {/* Active Session Card */}
      {isAuthenticated && user && (
        <div className="bg-teal-50/80 border border-teal-200 rounded p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0d9488] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user.full_name ? user.full_name.charAt(0) : 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Active Student Session</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 truncate">{user.full_name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-teal-200/60">
            <button
              type="button"
              onClick={() => navigate(redirectPath)}
              className="flex-1 py-1.5 bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Go to Marketplace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                addToast('You have been logged out. You can now sign in with a different account.', 'info');
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium rounded flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3 text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Login Form Card */}
      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>

            {isUnconfirmed && (
              <div className="pt-2 border-t border-rose-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[11px] text-rose-700 font-medium">Account not activated yet?</span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(email)}`}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] rounded transition-colors"
                  >
                    Verify Email
                  </Link>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-[11px] rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Sending...' : 'Resend Email'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{resendSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              University Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@student.rjt.ac.lk or name@cmb.ac.lk"
              className={`w-full text-sm px-3 py-2 bg-white border rounded focus:outline-none text-slate-900 ${
                email && !isEmailDomainValid
                  ? 'border-rose-400 focus:border-rose-500'
                  : email && isEmailDomainValid
                  ? 'border-emerald-500 focus:border-emerald-600'
                  : 'border-slate-300 focus:border-[#0d9488]'
              }`}
              required
            />

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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-800">
                Password
              </label>
              <Link
                to={`/forgot-password${email && isEmailDomainValid ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-[11px] text-teal-700 hover:text-teal-800 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || (email && !isEmailDomainValid)}
            className="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking credentials...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="text-teal-700 font-semibold hover:underline">
              Register here
            </Link>
          </p>

          <button
            type="button"
            onClick={() => setShowDomainsList(!showDomainsList)}
            className="text-[11px] text-slate-500 hover:text-teal-700 flex items-center justify-center gap-1 mx-auto"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Supported State Universities (17)</span>
            {showDomainsList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDomainsList && (
            <div className="text-left bg-slate-50 border border-slate-200 rounded p-2.5 max-h-48 overflow-y-auto text-[11px] space-y-1">
              <div className="font-semibold text-slate-800 mb-1 text-[11px]">
                Official State Universities &amp; Domains:
              </div>
              <div className="space-y-0.5">
                {STATE_UNIVERSITIES_17.map(u => (
                  <div key={u.no} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700">{u.no}. {u.name}</span>
                    <span className="font-mono text-teal-700 font-medium ml-2 shrink-0">{u.domain}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
