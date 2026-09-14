import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { parseSriLankanUniversityEmail, STATE_UNIVERSITIES_17 } from '../utils/universityDomains';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDomainsList, setShowDomainsList] = useState(false);

  // Live university domain verification
  const emailAnalysis = parseSriLankanUniversityEmail(email);
  const isEmailDomainValid = emailAnalysis.isValid;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your university email and password.');
      return;
    }

    if (!isEmailDomainValid) {
      setError(
        emailAnalysis.error ||
        'Login is strictly restricted to official Sri Lankan state university email domains (@___.___ .ac.lk or @uom.lk).'
      );
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      addToast('Signed in successfully.', 'success');
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
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
          Sign in with your official university student email
        </p>
      </div>

      {/* Login Form Card */}
      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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
            className="w-full py-2 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
          >
            {loading ? 'Checking credentials...' : 'Sign In'}
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
