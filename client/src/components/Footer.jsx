import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Info, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 text-xs border-t border-slate-800 mt-12">
      {/* Campus Guidelines Bar */}
      <div className="bg-[#0b1120] border-b border-slate-800 py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-teal-400">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Campus Rule: Hand-to-hand exchange only on campus. No online payment gateway.</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>Suggested meetups: FOT Electronics Labs, Library Lobby, Canteen.</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Project Details */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-white rounded p-2.5 border border-slate-700 shrink-0">
              <img
                src="/images/unimart-logo.jpg"
                alt="UniMart Logo"
                className="h-28 w-auto object-contain"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <span>UniMart</span>
                <span className="text-[10px] bg-slate-800 text-teal-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                  Group 05
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                A campus marketplace for university students to buy and sell academic hardware components and offer digital services. Campus hand-to-hand exchange only.
              </p>
            </div>
          </div>

          {/* Quick Category Links */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-2">Catalog Sections</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/browse?type=hardware" className="hover:text-teal-400">
                  Academic Hardware (Arduino, ESP32, Modules)
                </Link>
              </li>
              <li>
                <Link to="/browse?categoryId=2" className="hover:text-teal-400">
                  Sensors & Measurement Tools
                </Link>
              </li>
              <li>
                <Link to="/browse?type=skill" className="hover:text-teal-400">
                  Student Digital Services (Web, Graphic, Video, Audio)
                </Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-teal-400">
                  All Active Listings
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="hover:text-teal-400">
                  Post an Item or Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-400">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} UniMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
