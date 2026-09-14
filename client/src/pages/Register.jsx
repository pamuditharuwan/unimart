import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle, 
  GraduationCap, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  KeyRound,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { authApi } from '../services/api';
import { parseSriLankanUniversityEmail, SRI_LANKAN_UNIVERSITIES, STATE_UNIVERSITIES_17 } from '../utils/universityDomains';

const COMMON_FACULTIES = [
  'Faculty of Technology',
  'Faculty of Engineering',
  'Faculty of Information Technology / Computing',
  'Faculty of Applied Sciences',
  'Faculty of Science',
  'Faculty of Management Studies',
  'Faculty of Medicine',
  'Faculty of Agriculture',
  'Faculty of Social Sciences & Humanities',
  'Faculty of Arts',
  'Faculty of Law',
  'Other'
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regId, setRegId] = useState('');
  const [faculty, setFaculty] = useState('Faculty of Technology');
  const [department, setDepartment] = useState(''); // Kept unfilled as requested
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDomainsList, setShowDomainsList] = useState(false);

  // Email confirmation sent state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submittedUni, setSubmittedUni] = useState('');
  const [directActionLink, setDirectActionLink] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [directVerifying, setDirectVerifying] = useState(false);

  // Live domain verification & university extraction
  const emailAnalysis = parseSriLankanUniversityEmail(email);
  const isEmailDomainValid = emailAnalysis.isValid;

  // Real-time password criteria validation
  const passwordRules = {
    hasLength: password.length > 12, // Must exceed 12 characters (at least 13)
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    matches: Boolean(password && confirmPassword && password === confirmPassword)
  };

  const isPasswordValid = 
    passwordRules.hasLength &&
    passwordRules.hasUpper &&
    passwordRules.hasLower &&
    passwordRules.hasNumber &&
    passwordRules.hasSpecial &&
    passwordRules.matches;

  // Auto-fill or adjust faculty if detected from email subdomain
  useEffect(() => {
    if (emailAnalysis.isValid && emailAnalysis.facultyName && emailAnalysis.facultyName !== 'Student Account') {
      const match = COMMON_FACULTIES.find(f => 
        f.toLowerCase().includes(emailAnalysis.facultyName.toLowerCase()) ||
        emailAnalysis.facultyName.toLowerCase().includes(f.toLowerCase())
      );
      if (match) {
        setFaculty(match);
      }
    }
  }, [emailAnalysis.facultyName, emailAnalysis.isValid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !regId || !password || !confirmPassword) {
      setError('Please fill in all required fields marked with *.');
      return;
    }

    if (!isEmailDomainValid) {
      setError(
        emailAnalysis.error ||
        'Only Sri Lankan university student email addresses (@___.___ .ac.lk or @uom.lk) are allowed to register.'
      );
      return;
    }

    if (!passwordRules.hasLength) {
      setError('Password must exceed 12 characters (minimum 13 characters).');
      return;
    }

    if (!passwordRules.hasUpper) {
      setError('Password must include at least one capital letter (A-Z).');
      return;
    }

    if (!passwordRules.hasLower) {
      setError('Password must include at least one simple letter (a-z).');
      return;
    }

    if (!passwordRules.hasNumber) {
      setError('Password must include at least one number (0-9).');
      return;
    }

    if (!passwordRules.hasSpecial) {
      setError('Password must include at least one special character (e.g. !@#$%^&*).');
      return;
    }

    if (!passwordRules.matches) {
      setError('Passwords do not match. Please verify the confirmation password.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        reg_id: regId.trim(),
        faculty,
        department: department.trim(),
        university: emailAnalysis.universityName,
        password
      });

      addToast(`Registration initiated! Please enter your 6-digit verification code.`, 'success');
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, {
        state: {
          emailOtp: res?.emailOtp,
          actionLink: res?.actionLink
        }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail || resending) return;
    setResending(true);
    setResendSuccess('');
    setError('');

    try {
      const res = await authApi.resendConfirmation(submittedEmail);
      setResendSuccess(res.message || `A new verification email was dispatched to ${submittedEmail}.`);
      addToast('Confirmation email resent to your inbox!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!enteredOtp || verifyingOtp) return;
    setVerifyingOtp(true);
    setError('');

    try {
      const res = await authApi.verifyOtp(submittedEmail, enteredOtp);
      addToast(res.message || 'Account activated successfully! Please sign in.', 'success');
      navigate('/login?confirmed=true');
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again or click Direct Verify.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleDirectConfirm = async () => {
    if (!submittedEmail || directVerifying) return;
    setDirectVerifying(true);
    setError('');

    try {
      const res = await authApi.confirmDirect(submittedEmail);
      addToast(res.message || 'Account activated successfully! Please sign in.', 'success');
      navigate('/login?confirmed=true');
    } catch (err) {
      setError(err.message || 'Direct verification failed. Please check your inbox.');
    } finally {
      setDirectVerifying(false);
    }
  };

  // -------------------------------------------------------------
  // Render Check Inbox Confirmation Screen when registered
  // -------------------------------------------------------------
  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-block bg-white p-1 rounded border border-slate-200 shadow-xs mx-auto mb-1">
            <img
              src="/images/unimart-logo.jpg"
              alt="UniMart Logo"
              className="h-16 w-auto object-contain mx-auto"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-sm space-y-5 text-center">
          {/* Animated Mail Icon */}
          <div className="w-16 h-16 bg-teal-50 border-2 border-teal-500/20 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
            <Mail className="w-8 h-8 text-teal-600" />
            <span className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900">Check Your University Inbox</h1>
            <p className="text-xs text-slate-600">
              A verification email has been dispatched to your official student address.
            </p>
          </div>

          {/* Recipient Email Display */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded text-center space-y-1">
            <span className="text-[11px] text-teal-800 font-semibold block uppercase tracking-wide">
              Confirmation Sent To
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-teal-950 block break-all">
              {submittedEmail}
            </span>
            {submittedUni && (
              <span className="text-[10px] text-teal-700 font-medium inline-flex items-center gap-1 mt-1 bg-white/80 px-2 py-0.5 rounded border border-teal-200">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                {submittedUni}
              </span>
            )}
          </div>

          {/* Step-by-Step Instructions */}
          <div className="text-left bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2 text-slate-700">
            <span className="font-semibold text-slate-900 block text-[11px]">
              How to complete activation:
            </span>
            <ol className="space-y-1.5 text-[11px] list-decimal list-inside text-slate-600">
              <li>Log in to your student webmail portal (`{submittedEmail.split('@')[1] || '.ac.lk'}`).</li>
              <li>Open the email from <strong>UniMart</strong> with subject <em>"Confirm your signup"</em>.</li>
              <li>Click the <strong>Confirm Email</strong> button inside to activate your student account.</li>
            </ol>
          </div>

          {/* Instant 1-Click Activation & Direct Verification (Fixes University Spam Gateway Delays) */}
          <div className="p-4 bg-teal-50/80 border-2 border-teal-600/30 rounded-lg text-left space-y-3">
            <div className="flex items-center gap-2 font-bold text-teal-950 text-xs">
              <Zap className="w-4 h-4 text-teal-700" />
              <span>Email Not Arriving in Inbox? Activate Instantly</span>
            </div>
            <p className="text-[11px] text-teal-900/90 leading-relaxed">
              Sri Lankan university email gateways (Microsoft 365 / Google Workspace) and Supabase rate limits may delay or filter automated emails. You can activate your student account immediately without waiting:
            </p>

            {/* Prominent 1-Click Instant Activation Button */}
            <button
              type="button"
              onClick={handleDirectConfirm}
              disabled={directVerifying}
              className="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs rounded-md transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{directVerifying ? 'Activating Student Account...' : '⚡ 1-Click Instant Student Activation'}</span>
            </button>

            {directActionLink && (
              <a
                href={directActionLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-white hover:bg-teal-50 border border-teal-300 text-teal-900 text-center font-semibold text-xs rounded flex items-center justify-center gap-1.5 transition-colors block"
              >
                <span>Open Direct Verification Link</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
              </a>
            )}

            {/* OTP Code Form */}
            <div className="pt-2 border-t border-teal-200/80">
              <span className="text-[10px] text-teal-800 font-semibold block mb-1.5">
                Or enter verification code:
              </span>
              <form onSubmit={handleVerifyOtp} className="flex gap-2">
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-teal-300 rounded font-mono focus:outline-none focus:border-teal-600"
                />
                <button
                  type="submit"
                  disabled={verifyingOtp || !enteredOtp.trim()}
                  className="px-3 py-1.5 bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded transition-colors"
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            </div>
          </div>

          {resendSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2 text-left">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resendSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Link
              to="/login"
              className="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Go to Student Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Resending email...' : 'Resend Confirmation Email'}</span>
            </button>
          </div>

          {/* Hints & Fallback */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <p>
              Please check your <strong>Spam</strong> or <strong>Junk</strong> folder if not visible in your main inbox.
            </p>
            <p>
              Entered the wrong email?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setError('');
                }}
                className="text-teal-700 font-semibold hover:underline"
              >
                Register with a different address
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Default Registration Form
  // -------------------------------------------------------------
  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-block bg-white p-1 rounded border border-slate-200 shadow-xs mx-auto mb-2">
          <img
            src="/images/unimart-logo.jpg"
            alt="UniMart Logo"
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Student Account Registration</h1>
        <p className="text-xs text-slate-500">
          Open to all verified Sri Lankan university students (@___.___ .ac.lk)
        </p>
      </div>

      {/* University Domain Rule Box */}
      <div className="bg-slate-100 border border-slate-300 rounded p-3 text-xs text-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <GraduationCap className="w-4 h-4 text-teal-700" />
            <span>Sri Lankan University Domain Policy</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDomainsList(!showDomainsList)}
            className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
          >
            <span>{showDomainsList ? 'Hide Domains (17)' : 'View All 17 Domains'}</span>
            {showDomainsList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-600">
          UniMart is a verified student community. Registrations are strictly restricted to official Sri Lankan state university email domains matching <code className="bg-white border border-slate-300 px-1.5 py-0.5 rounded font-mono text-teal-800 font-bold">@___.___ .ac.lk</code> or <code className="bg-white border border-slate-300 px-1.5 py-0.5 rounded font-mono text-teal-800 font-bold">@uom.lk</code>.
        </p>

        {showDomainsList ? (
          <div className="bg-white border border-slate-300 rounded p-2.5 max-h-56 overflow-y-auto text-[11px] space-y-1 mt-2">
            <div className="font-semibold text-slate-800 text-[11px] border-b border-slate-200 pb-1 flex justify-between">
              <span>Official State University</span>
              <span>Official Domain</span>
            </div>
            <div className="divide-y divide-slate-100">
              {STATE_UNIVERSITIES_17.map(u => (
                <div key={u.no} className="flex justify-between items-center py-1">
                  <span className="text-slate-800 font-medium">{u.no}. {u.name}</span>
                  <span className="font-mono text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded text-[10px] ml-2 shrink-0 font-bold">
                    {u.domain}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 flex flex-wrap gap-1 font-mono">
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">@student.rjt.ac.lk</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">@eng.pdn.ac.lk</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">@uom.lk</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">@sci.cmb.ac.lk</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">@fot.sjp.ac.lk</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">@stu.kln.ac.lk</span>
          </div>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('already exists') && (
              <Link
                to={`/login?email=${encodeURIComponent(email.trim())}`}
                className="px-3 py-1 bg-[#0d9488] hover:bg-teal-700 text-white font-semibold rounded shrink-0 flex items-center gap-1 transition-colors text-[11px]"
              >
                <span>Log In Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kavindu Perera"
              className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              University Email Address (@___.___ .ac.lk or @uom.lk) *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@student.rjt.ac.lk or name@eng.pdn.ac.lk"
              className={`w-full text-sm px-3 py-2 bg-white border rounded focus:outline-none text-slate-900 ${
                email && !isEmailDomainValid
                  ? 'border-rose-400 focus:border-rose-500'
                  : email && isEmailDomainValid
                  ? 'border-emerald-500 focus:border-emerald-600'
                  : 'border-slate-300 focus:border-[#0d9488]'
              }`}
              required
            />

            {/* Live Domain Analysis Feedback */}
            {email && (
              <div className="mt-1.5">
                {isEmailDomainValid ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[11px] text-emerald-950">
                        {emailAnalysis.universityName}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        Verified {emailAnalysis.facultyName ? `(${emailAnalysis.facultyName})` : 'Academic'} Student Domain &bull; {emailAnalysis.domain}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px] flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      {emailAnalysis.error || 'Must be an official Sri Lankan university email in the format @___.___ .ac.lk'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detected University Display */}
          {isEmailDomainValid && (
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Affiliated Institution</span>
                <span className="font-bold text-slate-800 text-xs">{emailAnalysis.universityName}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Student Reg ID / Index *
              </label>
              <input
                type="text"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                placeholder="e.g. ICT/2024/001"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] font-mono text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Faculty *
              </label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full text-sm px-2 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
              >
                {COMMON_FACULTIES.map(fac => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Department: Kept unfilled by default */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Department of ICT, Dept. of Computer Engineering"
              className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
            />
          </div>

          {/* Password & Confirm Password Section */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Password (must exceed 12 characters) *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••••"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="•••••••••••••"
                className={`w-full text-sm px-3 py-2 bg-white border rounded focus:outline-none text-slate-900 ${
                  confirmPassword && !passwordRules.matches
                    ? 'border-rose-400 focus:border-rose-500'
                    : confirmPassword && passwordRules.matches
                    ? 'border-emerald-500 focus:border-emerald-600'
                    : 'border-slate-300 focus:border-[#0d9488]'
                }`}
                required
              />
            </div>

            {/* Password Requirement Real-Time Indicators */}
            {password && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                <span className="font-semibold text-slate-700 block mb-1">Password Requirements:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${passwordRules.hasLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasLength ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>Exceeds 12 chars ({password.length}/13+)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasUpper ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>Capital letter (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasLower ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>Simple letter (a-z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasNumber ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>At least one number (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.hasSpecial ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>Special character (!@#$...)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordRules.matches ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordRules.matches ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (email && !isEmailDomainValid) || (password && !isPasswordValid)}
            className="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded mt-2 transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Creating account &amp; sending verification...</span>
              </>
            ) : (
              <span>Complete Registration</span>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-700 font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
