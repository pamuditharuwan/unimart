import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsApi, categoriesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [itemType, setItemType] = useState('hardware');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('fixed');
  const [condition, setCondition] = useState('used_good');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) {
        navigate(`/login?redirect=/edit-listing/${id}`);
        return;
      }

      try {
        const [cats, listingData] = await Promise.all([
          categoriesApi.getAll(),
          listingsApi.getById(id)
        ]);

        if (listingData.user_id !== user.id) {
          addToast('You do not have permission to edit this listing.', 'error');
          navigate(`/listings/${id}`);
          return;
        }

        setCategories(cats || []);
        setTitle(listingData.title || '');
        setCategoryId(listingData.category_id || '');
        setItemType(listingData.item_type || 'hardware');
        setPrice(listingData.price || '');
        setPriceType(listingData.price_type || 'fixed');
        setCondition(listingData.condition || 'used_good');
        setLocation(listingData.location || '');
        setImageUrl(listingData.images?.[0] || '');
        setDescription(listingData.description || '');
        setStatus(listingData.status || 'active');
      } catch (err) {
        console.error('Failed to load listing for edit:', err);
        setError('Failed to retrieve listing details.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isAuthenticated, user, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill all required fields.');
      return;
    }

    if (isCustomCategory && !customCategoryName.trim()) {
      setError('Please enter your custom category name.');
      return;
    }

    if (!isCustomCategory && !categoryId) {
      setError('Please select a category for your listing.');
      return;
    }

    setSubmitting(true);
    try {
      let finalCategoryId = parseInt(categoryId, 10);
      if (isCustomCategory && customCategoryName.trim()) {
        const createdCat = await categoriesApi.create({
          name: customCategoryName.trim(),
          type: itemType
        });
        if (createdCat?.id) {
          finalCategoryId = createdCat.id;
          setCategories(prev => {
            if (prev.some(c => c.id === createdCat.id)) return prev;
            return [...prev, createdCat];
          });
        }
      }

      const updates = {
        title: title.trim(),
        description: description.trim(),
        category_id: finalCategoryId,
        price: parseFloat(price),
        price_type: priceType,
        condition: itemType === 'hardware' ? condition : null,
        location: location.trim(),
        images: [imageUrl.trim()],
        status
      };

      await listingsApi.update(id, updates);
      addToast('Listing updated successfully.', 'success');
      navigate(`/listings/${id}`);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsApi.delete(id);
      addToast('Listing deleted successfully.', 'success');
      navigate('/browse');
    } catch (err) {
      addToast(err.message || 'Failed to delete listing.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-xs text-slate-500">
        Loading listing details...
      </div>
    );
  }

  const filteredCategories = categories.filter((c) => c.type === itemType);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/listings/${id}`}
            className="text-xs text-teal-700 hover:underline flex items-center gap-1 mb-1 font-semibold"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Listing
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Edit Listing</h1>
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>

      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Status setting */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <label className="block font-semibold text-slate-800 mb-1">Status</label>
            <div className="flex flex-wrap gap-3">
              {[
                { val: 'active', label: 'Active (Available)' },
                { val: 'reserved', label: 'Reserved' },
                { val: 'sold', label: 'Sold / Completed' }
              ].map((s) => (
                <label key={s.val} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s.val}
                    checked={status === s.val}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-teal-600 focus:ring-0"
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-[#0d9488]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-800">Category *</label>
                {!isCustomCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(true);
                      setCategoryId('__custom__');
                    }}
                    className="text-[11px] text-teal-700 hover:text-teal-800 hover:underline font-semibold cursor-pointer"
                  >
                    + Add Custom Category
                  </button>
                )}
              </div>

              {!isCustomCategory ? (
                <select
                  value={categoryId}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCategory(true);
                      setCategoryId('__custom__');
                    } else {
                      setCategoryId(e.target.value);
                    }
                  }}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-[#0d9488]"
                  required
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="__custom__">✨ + Add Custom Category / Text...</option>
                </select>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder={
                        itemType === 'hardware'
                          ? 'e.g. Embedded Linux & SBCs, Drone Components'
                          : 'e.g. Mobile App Dev, UI/UX Design, Tutoring'
                      }
                      className="w-full text-xs p-2 bg-white border border-teal-500 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 shadow-xs"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        const firstMatching = categories.find(c => c.type === itemType);
                        if (firstMatching) setCategoryId(firstMatching.id);
                      }}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-medium rounded whitespace-nowrap cursor-pointer transition-colors"
                      title="Back to standard categories"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-[10px] text-teal-700">
                    This custom category will be added to the university catalog and visible in search filters.
                  </p>
                </div>
              )}
            </div>

            {itemType === 'hardware' ? (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-[#0d9488]"
                >
                  <option value="brand_new">Brand New</option>
                  <option value="used_like_new">Used - Like New</option>
                  <option value="used_good">Used - Good</option>
                  <option value="used_fair">Used - Fair</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Pricing Model</label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-[#0d9488]"
                >
                  <option value="per_project">Per Project</option>
                  <option value="hourly">Hourly</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Price (Rs.) *</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-[#0d9488]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Campus Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-[#0d9488]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none focus:border-[#0d9488]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 leading-relaxed focus:outline-none focus:border-[#0d9488]"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Link
              to={`/listings/${id}`}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white rounded font-semibold"
            >
              {submitting ? 'Saving...' : 'Update Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
