import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Info, GraduationCap, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
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
  const [department, setDepartment] = useState('Department of ICT');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDomainsList, setShowDomainsList] = useState(false);

  // Live domain verification & university extraction
  const emailAnalysis = parseSriLankanUniversityEmail(email);
  const isEmailDomainValid = emailAnalysis.isValid;

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

    if (!fullName || !email || !regId || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isEmailDomainValid) {
      setError(emailAnalysis.error || 'Only Sri Lankan university student email addresses (@___.___ .ac.lk) are allowed to register.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        reg_id: regId.trim(),
        faculty,
        department,
        university: emailAnalysis.universityName,
        password
      });

      addToast(`Welcome to UniMart! Verified as a student of ${emailAnalysis.universityName}.`, 'success');
      navigate('/browse');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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
              University Email Address (@___.___ .ac.lk) *
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

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Password (min 6 characters) *
            </label>
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
            className="w-full py-2 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded mt-2"
          >
            {loading ? 'Creating account...' : 'Complete Registration'}
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
