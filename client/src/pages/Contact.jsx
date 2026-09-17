import React, { useState } from 'react';
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  HelpCircle, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    // Simulate sending message / ticket
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      addToast('Your inquiry has been sent to the UniMart support team!', 'success');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-8 shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                <Users className="w-3.5 h-3.5" />
                Group 05 • Sudo Six
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Contact UniMart Support</h1>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Have questions regarding student verification, academic hardware listings, or peer service offerings? Reach out to our campus development team.
              </p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700 text-xs space-y-2 shrink-0">
              <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Academic Affiliation</div>
              <div className="text-white font-medium">Faculty of Technology</div>
              <div className="text-teal-400">Rajarata University of Sri Lanka</div>
              <div className="text-slate-400 text-[11px]">Skill Development Project I (ICT 1108)</div>
            </div>
          </div>
        </div>

        {/* Main Grid: Form & Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Message Received!</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Thank you for contacting UniMart. A representative from the Group 05 project team will review your inquiry.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: user?.full_name || '',
                      email: user?.email || '',
                      category: 'general',
                      subject: '',
                      message: ''
                    });
                  }}
                  className="mt-4 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Send an Inquiry</h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Fill out the form below and our campus team will get back to you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pamuditha Ruwan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      University Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. itt2024104@tec.rjt.ac.lk"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white"
                    >
                      <option value="general">General Campus Question</option>
                      <option value="verification">Email Verification & OTP Assistance</option>
                      <option value="listing">Hardware / Skill Listing Issue</option>
                      <option value="bug">Bug Report / Technical Support</option>
                      <option value="safety">Campus Exchange Safety Concern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Question about Arduino component listing"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe your question, request, or issue with details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Details & Campus Safety */}
          <div className="space-y-6">
            
            {/* Campus Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                Campus Headquarters
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div>
                  <div className="font-semibold text-slate-800">Faculty Location:</div>
                  <div>Faculty of Technology</div>
                  <div>Rajarata University of Sri Lanka</div>
                  <div>Mihintale, Anuradhapura</div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="font-semibold text-slate-800">Support Mail:</div>
                  <a href="mailto:support.unimart.lk@gmail.com" className="text-teal-600 hover:underline">
                    support.unimart.lk@gmail.com
                  </a>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="font-semibold text-slate-800">Project Supervisor:</div>
                  <div>Mr. Nandika Tennakoon</div>
                  <div className="text-slate-500">Lecturer (Temporary), Dept. of ICT</div>
                  <a href="mailto:nandikat@tec.rjt.ac.lk" className="text-teal-600 hover:underline">
                    nandikat@tec.rjt.ac.lk
                  </a>
                </div>
              </div>
            </div>

            {/* Campus Exchange Policy */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Campus Safety Guideline
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                UniMart strictly enforces **hand-to-hand exchanges** within university premises. Always inspect hardware components or digital deliverable samples in public campus zones such as **FOT Electronics Labs**, the **Main Library Lobby**, or the **Campus Canteen**.
              </p>
            </div>

            {/* Project Team */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                Project Group 05 (Sudo Six)
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• S. H. M. P. R. Sooryarathna (ITT/2024/104)</li>
                <li>• B. G. M. S. S. Gajanayaka (ITT/2024/039)</li>
                <li>• S. M. M. E. W. M. K. Wijerathna (ITT/2024/120)</li>
                <li>• K. R. I. A. Bandara (ITT/2024/019)</li>
                <li>• M. M. R. T. Abeywickrama (ITT/2024/006)</li>
                <li>• R. M. K. Madhushani (ITT/2024/064)</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
