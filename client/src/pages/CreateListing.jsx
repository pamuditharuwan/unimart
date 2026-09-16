import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { listingsApi, categoriesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const HARDWARE_IMAGE_PRESETS = [
  { name: 'Arduino Uno Kit', url: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg' },
  { name: 'ESP32 IoT Board', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/ESP32.jpg' },
  { name: 'Sensor Bundle', url: 'https://upload.wikimedia.org/wikipedia/commons/2/20/HC_SR04_Ultrasonic_sensor_1480322_3_4_HDR_Enhancer.jpg' },
  { name: 'OLED Display', url: '/images/items/oled-display.jpg' },
  { name: 'Motor Driver', url: '/images/items/l298n-motor-driver.jpg' }
];

const SKILL_IMAGE_PRESETS = [
  { name: 'Web Development', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80' },
  { name: 'Video Editing', url: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'Graphic Design', url: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'Audio Mixing', url: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800' }
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [itemType, setItemType] = useState('hardware'); // 'hardware' | 'skill'
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('fixed');
  const [condition, setCondition] = useState('used_good');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/create-listing');
      return;
    }

    async function loadCats() {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data || []);
        const firstMatching = (data || []).find(c => c.type === 'hardware');
        if (firstMatching) setCategoryId(firstMatching.id);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCats(false);
      }
    }
    loadCats();
  }, [isAuthenticated, navigate]);

  const handleTypeToggle = (newType) => {
    setItemType(newType);
    setIsCustomCategory(false);
    setCustomCategoryName('');
    const firstMatching = categories.find(c => c.type === newType);
    if (firstMatching) setCategoryId(firstMatching.id);

    if (newType === 'skill') {
      setPriceType('per_project');
    } else {
      setPriceType('fixed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill in all required fields marked with *.');
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
      let finalCategoryId = categoryId;
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

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: finalCategoryId,
        item_type: itemType,
        price: parseFloat(price),
        price_type: priceType,
        condition: itemType === 'hardware' ? condition : null,
        location: location.trim(),
        images: [imageUrl.trim()]
      };

      const res = await listingsApi.create(payload);
      addToast('Listing posted successfully!', 'success');
      navigate(`/listings/${res.listing?.id || ''}`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to publish listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === itemType);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Post an Item or Service</h1>
        <p className="text-xs text-slate-500">
          List your hardware component or digital service on the campus marketplace
        </p>
      </div>

      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4 text-xs">
        {/* Step 1: Type Selection */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">
            Listing Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeToggle('hardware')}
              className={`p-2.5 rounded border text-left font-medium ${
                itemType === 'hardware'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="block font-bold">Academic Hardware</span>
              <span className="text-[11px] opacity-80">Arduino, ESP32, sensors, lab tools</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeToggle('skill')}
              className={`p-2.5 rounded border text-left font-medium ${
                itemType === 'skill'
                  ? 'bg-[#0d9488] text-white border-[#0d9488]'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="block font-bold">Student Skill</span>
              <span className="text-[11px] opacity-80">Web design, video editing, poster graphics</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                itemType === 'hardware'
                  ? 'e.g. Arduino Uno R3 with 830-pt Breadboard & Jumper Wires'
                  : 'e.g. Coursework React & Tailwind Web Development'
              }
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
              required
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-800">
                  Category *
                </label>
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
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
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
                <label className="block font-semibold text-slate-800 mb-1">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                >
                  <option value="brand_new">Brand New</option>
                  <option value="used_like_new">Used - Like New</option>
                  <option value="used_good">Used - Good Condition</option>
                  <option value="used_fair">Used - Fair</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Pricing Basis *
                </label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                >
                  <option value="per_project">Per Project</option>
                  <option value="hourly">Hourly</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
            )}
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Price in LKR (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2500"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Campus Pickup Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. FOT Electronics Lab 02, Library Lobby, Canteen"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                required
              />
            </div>
          </div>

          {/* Image & Presets */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-800">
              Image URL *
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900 font-mono"
              required
            />

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500">Quick sample photo presets:</span>
              <div className="flex flex-wrap gap-1">
                {(itemType === 'hardware' ? HARDWARE_IMAGE_PRESETS : SKILL_IMAGE_PRESETS).map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[11px] px-2 py-0.5 rounded border ${
                      imageUrl === preset.url
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {imageUrl && (
              <div className="mt-2 w-28 h-20 border border-slate-300 rounded overflow-hidden bg-slate-100">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Description &amp; Specifications *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, testing state in coursework, included accessories, or service turnaround time..."
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <Link
              to="/browse"
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white rounded font-semibold text-xs"
            >
              {submitting ? 'Posting...' : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
