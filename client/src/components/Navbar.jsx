import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Cpu,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    logout();
    addToast('You have been logged out successfully.', 'info');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40">
      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 py-1 text-white hover:text-slate-200"
          >
            <div className="bg-white rounded p-0.5 border border-slate-700 flex items-center justify-center shrink-0">
              <img
                src="/images/unimart-logo.jpg"
                alt="UniMart Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-normal leading-none block">UniMart</span>
              <p className="text-[11px] text-slate-400 leading-tight">Student Marketplace</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              to="/"
              className={`px-2.5 py-1.5 rounded text-sm ${
                isActive('/') ? 'bg-slate-800 text-teal-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Home
            </Link>
            <Link
              to="/browse?type=hardware"
              className={`px-2.5 py-1.5 rounded text-sm ${
                location.pathname === '/browse' && location.search.includes('type=hardware')
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Academic Hardware
            </Link>
            <Link
              to="/browse?type=skill"
              className={`px-2.5 py-1.5 rounded text-sm ${
                location.pathname === '/browse' && location.search.includes('type=skill')
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Student Skills
            </Link>
            <Link
              to="/browse"
              className={`px-2.5 py-1.5 rounded text-sm ${
                isActive('/browse') && !location.search
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Items
            </Link>
            {isAuthenticated && (
              <Link
                to="/messages"
                className={`px-2.5 py-1.5 rounded text-sm flex items-center gap-1 ${
                  isActive('/messages') ? 'bg-slate-800 text-teal-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Messages</span>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to={isAuthenticated ? '/create-listing' : '/login?redirect=/create-listing'}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-[#0d9488] hover:bg-teal-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post an Item</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-slate-800 text-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-700 border border-teal-500 overflow-hidden flex items-center justify-center font-bold text-[10px] text-teal-300">
                    {user?.full_name ? user.full_name.charAt(0) : 'S'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block truncate max-w-[100px]">
                      {user?.full_name?.split(' ')[0] || 'Student'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {user?.reg_id || 'RJT'}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogoutClick}
                  title="Log out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 text-slate-300 hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to={isAuthenticated ? '/create-listing' : '/login?redirect=/create-listing'}
              className="px-2.5 py-1 text-xs rounded bg-[#0d9488] text-white font-medium"
            >
              + Post
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0f172a] px-4 py-3 space-y-2 text-sm">
          {isAuthenticated && (
            <div className="p-2 bg-slate-800 rounded mb-2 text-xs">
              <span className="font-bold text-white block">{user?.full_name}</span>
              <span className="text-slate-400 font-mono">{user?.reg_id} &bull; {user?.email}</span>
            </div>
          )}

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-teal-400"
          >
            Home
          </Link>
          <Link
            to="/browse?type=hardware"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-teal-400"
          >
            Academic Hardware & Prototyping
          </Link>
          <Link
            to="/browse?type=skill"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-teal-400"
          >
            Student Skills & Services
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-slate-300 hover:text-teal-400"
          >
            Browse All Items
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/create-listing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-teal-400 font-medium"
              >
                + Post an Item
              </Link>
              <Link
                to="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-300 hover:text-white"
              >
                Messages
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-slate-300 hover:text-white"
              >
                My Profile & Listings
              </Link>
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left py-1.5 text-rose-400"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-1.5 rounded bg-slate-800 text-white text-xs"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-1.5 rounded bg-[#0d9488] text-white text-xs font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 rounded-lg max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">Confirm Log Out</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to sign out of <span className="font-semibold text-slate-800">{user?.full_name || 'your student account'}</span>? You will need your credentials to sign in again.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Yes, Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
