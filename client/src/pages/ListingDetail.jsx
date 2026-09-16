import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Eye,
  Star,
  MessageSquare,
  Phone,
  Info,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { listingsApi, messagesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Message form state
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setError(null);
      try {
        const data = await listingsApi.getById(id);
        setListing(data);
        setMessageText(`Hi ${data.seller?.full_name?.split(' ')[0] || 'there'}, is this "${data.title}" still available? Can we meet on campus?`);
      } catch (err) {
        console.error('Failed to load listing:', err);
        setError('Listing not found or has been removed.');
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  const isOwner = user && listing && user.id === listing.user_id;
  const isHardware = listing?.item_type === 'hardware';

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsApi.delete(listing.id);
      addToast('Listing deleted successfully.', 'success');
      navigate('/browse');
    } catch (err) {
      addToast(err.message || 'Failed to delete listing.', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/listings/${listing.id}`);
      return;
    }
    if (!messageText.trim()) return;

    setSendingMessage(true);
    try {
      await messagesApi.send({
        receiver_id: listing.user_id,
        listing_id: listing.id,
        content: messageText.trim()
      });
      addToast('Message sent! Opening conversation...', 'success');
      navigate(`/messages?otherUserId=${listing.user_id}&listingId=${listing.id}`);
    } catch (err) {
      addToast(err.message || 'Failed to send message.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatPrice = (price, priceType) => {
    const formatted = new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(price).replace('LKR', 'Rs.');

    if (priceType === 'hourly') return `${formatted} / hour`;
    if (priceType === 'per_project') return `${formatted} / project`;
    if (priceType === 'negotiable') return `${formatted} (Negotiable)`;
    return formatted;
  };

  const formatCondition = (cond) => {
    switch (cond) {
      case 'brand_new': return 'Brand New';
      case 'used_like_new': return 'Used - Like New';
      case 'used_good': return 'Used - Good';
      case 'used_fair': return 'Used - Fair';
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-slate-500">
        Loading listing details...
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This item could not be retrieved.'}</p>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] text-white text-xs font-semibold rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const imageSrc = listing.images?.[0] || (
    isHardware
      ? 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg'
      : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-teal-700">Home</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-teal-700">Catalog</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Photo & Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-slate-300 rounded overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[16/10] bg-slate-100 border-b border-slate-200">
              <img
                src={imageSrc}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                {isHardware ? (
                  <span className="bg-[#0f172a] text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    Hardware
                  </span>
                ) : (
                  <span className="bg-[#0d9488] text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    Skill Service
                  </span>
                )}
                {isHardware && listing.condition && (
                  <span className="bg-white text-slate-800 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-300">
                    {formatCondition(listing.condition)}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Price */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                    {listing.category?.name || 'Category'}
                  </span>
                  <h1 className="text-lg font-bold text-slate-900 leading-snug">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      {listing.views || 1} views
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-300 rounded p-2.5 sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block">Student Price</span>
                  <span className="text-lg font-bold text-slate-900 block">
                    {formatPrice(listing.price, listing.price_type)}
                  </span>
                </div>
              </div>
            </div>

            {/* Campus Meetup Spot */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span className="font-semibold">Campus Exchange Spot:</span>
                <span>{listing.location || 'Faculty of Technology'}</span>
              </div>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Listing
                </button>
              )}
            </div>

            {/* Description */}
            <div className="p-4 space-y-2 text-xs">
              <h2 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Description &amp; Specifications
              </h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-slate-100 border border-slate-300 rounded p-3 text-xs text-slate-700 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Safety &amp; Handover Reminder:</span>
              <span className="text-slate-600">
                Always meet on campus (e.g. FOT Labs, Library, Canteen). Inspect or test the hardware together before exchanging cash. UniMart does not handle online payments.
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Student Seller Info & Messaging */}
        <div className="space-y-4">
          {/* Seller Card */}
          <div className="bg-white border border-slate-300 rounded p-4 text-xs space-y-3">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
              Seller Information
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">
                {listing.seller?.full_name ? listing.seller.full_name.charAt(0) : 'S'}
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {listing.seller?.full_name || 'RJT Student'}
                </span>
                <span className="text-slate-500 font-mono text-[11px] block">
                  {listing.seller?.reg_id || 'Student ID'}
                </span>
                <span className="text-slate-500 text-[11px] block">
                  {listing.seller?.department || 'Department of ICT'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-600">Student Peer Rating:</span>
              <div className="flex items-center gap-1 font-bold text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{listing.seller?.rating_avg ? Number(listing.seller.rating_avg).toFixed(1) : '5.0'} / 5.0</span>
              </div>
            </div>

            {listing.seller?.bio && (
              <p className="text-slate-600 italic border-l-2 border-slate-300 pl-2">
                "{listing.seller.bio}"
              </p>
            )}

            {/* Contact Phone */}
            {listing.contact_phone && (
              <div className="flex items-center gap-2 p-2 bg-teal-50 border border-teal-200 rounded">
                <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <div>
                  <span className="text-teal-800 font-semibold block">Contact Number</span>
                  <a
                    href={`tel:${listing.contact_phone}`}
                    className="text-teal-700 hover:text-teal-900 hover:underline font-mono"
                  >
                    {listing.contact_phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Direct Messaging Box */}
          {!isOwner && (
            <div className="bg-white border border-slate-300 rounded p-4 text-xs space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                <span>Message Seller</span>
              </div>

              <p className="text-slate-600 text-[11px]">
                Send a direct message to arrange an on-campus meeting:
              </p>

              <form onSubmit={handleSendMessage} className="space-y-2">
                <textarea
                  rows="3"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                  required
                />

                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="w-full py-1.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded text-xs"
                >
                  {sendingMessage ? 'Sending message...' : 'Send Campus Message'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
