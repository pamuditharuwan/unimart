import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';

export default function ListingCard({ listing }) {
  const isHardware = listing.item_type === 'hardware';

  // Format price
  const formatPrice = (price, priceType) => {
    const formatted = new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(price).replace('LKR', 'Rs.');

    if (priceType === 'hourly') return `${formatted} / hr`;
    if (priceType === 'per_project') return `${formatted} / project`;
    if (priceType === 'negotiable') return `${formatted} (Neg.)`;
    return formatted;
  };

  const formatCondition = (cond) => {
    switch (cond) {
      case 'brand_new': return 'New';
      case 'used_like_new': return 'Used - Like New';
      case 'used_good': return 'Used - Good';
      case 'used_fair': return 'Used';
      default: return null;
    }
  };

  const imageSrc = listing.images?.[0] || (
    isHardware
      ? 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg'
      : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'
  );

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden flex flex-col h-full hover:border-[#0d9488]"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] bg-slate-100 border-b border-slate-200 overflow-hidden">
        <img
          src={imageSrc}
          alt={listing.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = isHardware
              ? 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg'
              : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Solid Tags */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {isHardware ? (
            <span className="bg-slate-900 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
              Hardware
            </span>
          ) : (
            <span className="bg-[#0d9488] text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
              Skill
            </span>
          )}

          {isHardware && listing.condition && (
            <span className="bg-white text-slate-800 text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-300">
              {formatCondition(listing.condition)}
            </span>
          )}
        </div>

        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
            <span className="bg-rose-700 text-white text-xs font-bold px-2 py-0.5 rounded uppercase">
              Sold / Closed
            </span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-teal-800 font-semibold uppercase tracking-wider mb-0.5">
            {listing.category?.name || (isHardware ? 'Hardware' : 'Digital Skill')}
          </p>

          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
            {listing.title}
          </h3>

          <div className="mt-2 text-sm font-bold text-slate-900">
            {formatPrice(listing.price, listing.price_type)}
          </div>
        </div>

        {/* Card Footer: Location & Student */}
        <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-1 text-[11px] truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{listing.location || 'Faculty of Technology'}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="font-medium text-slate-700 truncate max-w-[120px]">
              {listing.seller?.full_name || 'Student'}
            </span>
            <div className="flex items-center gap-0.5 text-amber-700 font-semibold">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{listing.seller?.rating_avg ? Number(listing.seller.rating_avg).toFixed(1) : '5.0'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
