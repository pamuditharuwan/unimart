import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Calendar,
  Edit,
  MessageSquare,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { usersApi, listingsApi, reviewsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ListingCard from '../components/ListingCard';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
  const { addToast } = useToast();

  const queryUserId = searchParams.get('userId');
  const isOwnProfile = !queryUserId || (currentUser && currentUser.id === queryUserId);
  const targetUserId = queryUserId || currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'reviews'
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Submit Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!targetUserId && !isAuthenticated) {
      navigate('/login');
      return;
    }

    async function loadProfileData() {
      setLoading(true);
      try {
        const [profileData, userListings, userReviews] = await Promise.all([
          usersApi.getProfile(targetUserId),
          listingsApi.getByUser(targetUserId),
          reviewsApi.getByUser(targetUserId)
        ]);

        setProfile(profileData);
        setListings(userListings || []);
        setReviews(userReviews || []);

        if (profileData) {
          setEditBio(profileData.bio || '');
          setEditPhone(profileData.phone_number || '');
          setEditDept(profileData.department || 'Department of ICT');
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (targetUserId) {
      loadProfileData();
    }
  }, [targetUserId, isAuthenticated, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        bio: editBio.trim(),
        phone_number: editPhone.trim(),
        department: editDept.trim()
      });
      setProfile((prev) => ({
        ...prev,
        bio: editBio.trim(),
        phone_number: editPhone.trim(),
        department: editDept.trim()
      }));
      addToast('Profile updated.', 'success');
      setEditModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      await reviewsApi.create({
        reviewee_id: targetUserId,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      addToast('Review submitted.', 'success');
      setReviewModalOpen(false);
      setReviewComment('');

      const updatedReviews = await reviewsApi.getByUser(targetUserId);
      setReviews(updatedReviews || []);
      const updatedProfile = await usersApi.getProfile(targetUserId);
      setProfile(updatedProfile);
    } catch (err) {
      addToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-slate-500">
        Loading student profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-2">
        <p className="font-bold text-sm text-slate-900">Student Profile Not Found</p>
        <Link to="/browse" className="text-xs text-teal-700 underline font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Card */}
      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-800 text-teal-300 flex items-center justify-center font-bold text-xl shrink-0">
              {profile.full_name ? profile.full_name.charAt(0) : 'S'}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{profile.full_name}</h1>
                <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-teal-200">
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-teal-800 font-mono font-semibold">{profile.reg_id}</p>
              <p className="text-xs text-slate-600">
                {profile.department} &bull; {profile.faculty}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                {profile.phone_number && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phone_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-left sm:text-right w-full sm:w-auto">
              <div className="flex items-center gap-1 font-bold text-amber-700 sm:justify-end text-sm">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{profile.rating_avg ? Number(profile.rating_avg).toFixed(1) : '5.0'} / 5.0</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {profile.rating_count || 0} peer reviews
              </span>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-3 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold rounded"
              >
                Edit Profile Info
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={`/messages?otherUserId=${profile.id}`}
                  className="px-3 py-1.5 bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold rounded flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </Link>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded hover:bg-slate-50"
                >
                  Rate Student
                </button>
              </div>
            )}
          </div>
        </div>

        {profile.bio && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-700 block mb-1">Bio:</span>
            <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-300 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-3 py-2 text-xs font-bold border-b-2 ${
            activeTab === 'listings'
              ? 'border-[#0d9488] text-[#0d9488]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-3 py-2 text-xs font-bold border-b-2 ${
            activeTab === 'reviews'
              ? 'border-[#0d9488] text-[#0d9488]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Peer Reviews ({reviews.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'listings' ? (
        listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-300 rounded p-8 text-center text-xs text-slate-500">
            No active listings found for this student.
          </div>
        )
      ) : (
        reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-slate-300 rounded p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.reviewer?.full_name || 'Student Peer'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rev.reviewer?.reg_id}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-700 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-300 rounded p-8 text-center text-xs text-slate-500">
            No peer reviews yet.
          </div>
        )
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded p-6 max-w-md w-full text-xs space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="font-bold text-slate-900 text-sm">Edit Profile Information</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-500 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#0d9488]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#0d9488]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Short Bio</label>
                <textarea
                  rows="3"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Briefly describe what hardware you work with or services you provide..."
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-1.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded p-6 max-w-md w-full text-xs space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="font-bold text-slate-900 text-sm">Leave a Peer Review</h2>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-500 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Rating (1 to 5 Stars)</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#0d9488]"
                >
                  <option value={5}>5 Stars &ndash; Excellent</option>
                  <option value={4}>4 Stars &ndash; Very Good</option>
                  <option value={3}>3 Stars &ndash; Good / Average</option>
                  <option value={2}>2 Stars &ndash; Fair</option>
                  <option value={1}>1 Star &ndash; Poor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Comment</label>
                <textarea
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your campus exchange experience..."
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#0d9488]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-1.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
