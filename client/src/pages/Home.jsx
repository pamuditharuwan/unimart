import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Cpu,
  Wrench,
  Info,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { listingsApi, categoriesApi } from '../services/api';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [hardwareListings, setHardwareListings] = useState([]);
  const [skillListings, setSkillListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, hw, skills] = await Promise.all([
          categoriesApi.getAll(),
          listingsApi.getAll({ type: 'hardware' }),
          listingsApi.getAll({ type: 'skill' })
        ]);
        setCategories(cats || []);
        setHardwareListings((hw || []).slice(0, 4));
        setSkillListings((skills || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Student Project Header Banner */}
      <div className="bg-[#0f172a] text-white p-6 rounded border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-normal text-white">
            UniMart &ndash; Rajarata University Student Marketplace
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            A simple campus platform for Faculty of Technology undergraduates to buy and sell used lab hardware (Arduino, ESP32, sensors) and offer digital services (web design, video editing, poster layouts). All exchanges happen directly on campus between verified students.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Arduino, sensors, video editing, web design..."
                  className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 text-sm rounded border border-slate-300 focus:outline-none focus:border-[#0d9488]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0d9488] hover:bg-teal-700 text-white text-sm font-semibold rounded shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <Link
              to="/browse?type=hardware"
              className="bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 px-3 py-1.5 rounded"
            >
              Browse Hardware Items &rarr;
            </Link>
            <Link
              to="/browse?type=skill"
              className="bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 px-3 py-1.5 rounded"
            >
              Browse Student Skills &rarr;
            </Link>
            <Link
              to="/create-listing"
              className="bg-[#0d9488] hover:bg-teal-700 text-white font-medium px-3 py-1.5 rounded inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Post a Listing
            </Link>
          </div>
        </div>

        <div className="hidden md:block shrink-0 bg-white p-2.5 rounded border border-slate-700 shadow-sm">
          <img
            src="/images/unimart-logo.jpg"
            alt="UniMart Logo"
            className="h-32 w-auto object-contain"
          />
        </div>
      </div>

      {/* Practical Campus Guidelines Notice */}
      <div className="bg-white border border-slate-300 rounded p-4 text-xs text-slate-700">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
          <Info className="w-4 h-4 text-teal-700" />
          <span>How Campus Exchange Works</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="border border-slate-200 bg-slate-50 p-2.5 rounded">
            <span className="font-bold text-slate-900 block mb-1">1. Verified Accounts</span>
            <span className="text-slate-600">Only students with university email addresses (@___.___ .ac.lk) can register.</span>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-2.5 rounded">
            <span className="font-bold text-slate-900 block mb-1">2. Single Catalog</span>
            <span className="text-slate-600">Every student account can both browse items and post new listings.</span>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-2.5 rounded">
            <span className="font-bold text-slate-900 block mb-1">3. Meet on Campus</span>
            <span className="text-slate-600">No delivery fees or online payments. Meet at FOT labs, library, or canteen.</span>
          </div>
        </div>
      </div>

      {/* Two Core Categories Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hardware Pillar */}
        <div className="bg-white border border-slate-300 rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Category 01</span>
              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300">
                Hardware
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Academic Hardware &amp; Prototyping
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Components used in electronics and embedded systems labs. Arduino Uno boards, ESP32 NodeMCU, ultrasonic distance sensors, DHT22 modules, motor drivers, breadboards, and jumpers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">For lab coursework &amp; mini-projects</span>
            <Link
              to="/browse?type=hardware"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              Browse Hardware &rarr;
            </Link>
          </div>
        </div>

        {/* Skills Pillar */}
        <div className="bg-white border border-slate-300 rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Category 02</span>
              <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-200">
                Digital Skills
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Student Digital Skills &amp; Services
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Technical freelance services offered by IT undergraduates: React/HTML web development, Figma UI mockups, IEEE project presentation video editing, audio noise reduction, and event posters.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Direct peer-to-peer collaboration</span>
            <Link
              to="/browse?type=skill"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              Browse Skills &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Hardware Listings Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Academic Hardware Listings</h2>
            <p className="text-xs text-slate-500">Lab equipment and electronic components available on campus</p>
          </div>
          <Link
            to="/browse?type=hardware"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            View all hardware ({hardwareListings.length}+) &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading listings...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {hardwareListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>

      {/* Digital Skills Listings Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Skills &amp; Services</h2>
            <p className="text-xs text-slate-500">Design, development, and media services offered by undergraduates</p>
          </div>
          <Link
            to="/browse?type=skill"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            View all skills ({skillListings.length}+) &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading listings...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {skillListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>

      {/* About UniMart Info Box */}
      <div className="bg-slate-100 border border-slate-300 rounded p-4 text-xs text-slate-600">
        <h3 className="font-bold text-slate-800 text-xs mb-1">About UniMart</h3>
        <p className="leading-relaxed">
          UniMart is a student marketplace built by <strong>Group 05</strong>. Key features include university email domain verification, a campus-only hand-to-hand exchange model (no online payment gateways), direct peer ratings, and a unified account system for buyers and sellers.
        </p>
      </div>
    </div>
  );
}
