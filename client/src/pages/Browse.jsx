import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import { listingsApi, categoriesApi } from '../services/api';
import ListingCard from '../components/ListingCard';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // UI state
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync URL searchParams to local state when URL changes
  useEffect(() => {
    if (searchParams.get('type')) setType(searchParams.get('type'));
    if (searchParams.get('categoryId')) setCategoryId(searchParams.get('categoryId'));
    if (searchParams.get('condition')) setCondition(searchParams.get('condition'));
    if (searchParams.get('search')) setSearchQuery(searchParams.get('search'));
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCats() {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCats();
  }, []);

  // Fetch listings when filters change
  useEffect(() => {
    async function fetchFilteredListings() {
      setLoading(true);
      try {
        const params = {
          type: type !== 'all' ? type : undefined,
          categoryId: categoryId || undefined,
          condition: (type === 'hardware' && condition !== 'all') ? condition : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort: sort !== 'newest' ? sort : undefined,
          search: searchQuery.trim() || undefined
        };

        const data = await listingsApi.getAll(params);
        setListings(data || []);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredListings();
  }, [type, categoryId, condition, minPrice, maxPrice, sort, searchQuery]);

  const handleResetFilters = () => {
    setType('all');
    setCategoryId('');
    setCondition('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchQuery('');
    setSearchParams({});
  };

  const filteredCategories = categories.filter((cat) => {
    if (type === 'all') return true;
    return cat.type === type;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Campus Catalog</h1>
          <p className="text-xs text-slate-500">
            Hardware items &amp; student services available on campus
          </p>
        </div>

        {/* Type Toggle Tabs */}
        <div className="flex items-center gap-1 border border-slate-300 rounded p-1 bg-white">
          <button
            onClick={() => {
              setType('all');
              setCategoryId('');
            }}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              type === 'all'
                ? 'bg-[#0f172a] text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => {
              setType('hardware');
              setCategoryId('');
            }}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              type === 'hardware'
                ? 'bg-[#0f172a] text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Academic Hardware
          </button>
          <button
            onClick={() => {
              setType('skill');
              setCategoryId('');
              setCondition('all');
            }}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              type === 'skill'
                ? 'bg-[#0d9488] text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Student Skills
          </button>
        </div>
      </div>

      {/* Search Bar & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keyword (e.g. Arduino, ESP32, Video)..."
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#0d9488]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700"
          >
            <Filter className="w-3.5 h-3.5 inline mr-1" />
            Filters {mobileFilterOpen ? '(Open)' : ''}
          </button>

          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-medium text-slate-800"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog with Filter Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Filter Sidebar */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block md:col-span-1 bg-white border border-slate-300 rounded p-4 space-y-4 text-xs`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Filter Items
            </span>
            <button
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-teal-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-800">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#0d9488]"
            >
              <option value="">All Categories</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter (Hardware only) */}
          {type !== 'skill' && (
            <div className="space-y-1">
              <label className="block font-semibold text-slate-800">Condition</label>
              <div className="space-y-1 text-slate-700">
                {[
                  { value: 'all', label: 'All Conditions' },
                  { value: 'brand_new', label: 'Brand New' },
                  { value: 'used_like_new', label: 'Used - Like New' },
                  { value: 'used_good', label: 'Used - Good' }
                ].map((c) => (
                  <label key={c.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={c.value}
                      checked={condition === c.value}
                      onChange={(e) => setCondition(e.target.value)}
                      className="text-teal-600 focus:ring-0"
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-800">Price Range (Rs.)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488]"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488]"
              />
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading campus listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white border border-slate-300 rounded p-8 text-center text-xs space-y-2">
              <p className="font-bold text-slate-800">No matching listings found.</p>
              <p className="text-slate-500">Try adjusting your search terms or resetting filters.</p>
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 bg-[#0d9488] text-white font-medium rounded text-xs mt-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-3 font-medium">
                Showing {listings.length} item{listings.length === 1 ? '' : 's'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
