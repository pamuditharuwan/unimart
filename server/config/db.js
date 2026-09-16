// ==========================================================
// UniMart: Database Adapter (Supabase + In-Memory Fallback)
// ==========================================================
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

// Node 20 WebSocket polyfill for Supabase Realtime
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}
import {
  INITIAL_CATEGORIES,
  INITIAL_PROFILES,
  INITIAL_LISTINGS,
  INITIAL_MESSAGES,
  INITIAL_REVIEWS
} from './constants.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://onfqyksljrdzpebqzvty.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnF5a3NsanJkenBlYnF6dnR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM3ODE3OCwiZXhwIjoyMTA0OTU0MTc4fQ.FsczHAQU6jTf05xbPRp19Qg7JQDfsoCv0M2xkf0ulZU';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (isSupabaseConfigured) {
  console.log('✅ Connected to Supabase Cloud Database');
} else {
  console.log('⚡ Running in Local In-Memory Database Mode (Seeded with Rajarata University ICT data)');
}

// In-Memory Data Store (Used when Supabase is not configured)
class MemoryDatabase {
  constructor() {
    this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    this.profiles = JSON.parse(JSON.stringify(INITIAL_PROFILES));
    this.listings = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
    this.messages = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
    this.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
  }

  // Profile methods
  findProfileByEmail(email) {
    return this.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  }

  findProfileById(id) {
    const profile = this.profiles.find(p => p.id === id);
    if (!profile) return null;
    const { password, ...safeProfile } = profile;
    return safeProfile;
  }

  createProfile(profileData) {
    this.profiles.push(profileData);
    const { password, ...safeProfile } = profileData;
    return safeProfile;
  }

  updateProfile(id, updates) {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.profiles[idx] = { ...this.profiles[idx], ...updates, updated_at: new Date().toISOString() };
    const { password, ...safeProfile } = this.profiles[idx];
    return safeProfile;
  }

  deleteProfile(id) {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.profiles.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Listings methods
  getAllListings({ type, categoryId, condition, search, minPrice, maxPrice, sort, userId } = {}) {
    let results = [...this.listings];

    if (type && type !== 'all') {
      results = results.filter(item => item.item_type === type);
    }
    if (categoryId) {
      results = results.filter(item => item.category_id === parseInt(categoryId, 10));
    }
    if (condition && condition !== 'all') {
      results = results.filter(item => item.condition === condition);
    }
    if (userId) {
      results = results.filter(item => item.user_id === userId);
    }
    if (minPrice !== undefined && minPrice !== '') {
      results = results.filter(item => item.price >= parseFloat(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      results = results.filter(item => item.price <= parseFloat(maxPrice));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }

    // Attach user profile & category info to each listing
    const enriched = results.map(listing => {
      const profile = this.findProfileById(listing.user_id);
      const category = this.categories.find(c => c.id === listing.category_id);
      return {
        ...listing,
        seller: profile,
        category: category || { name: 'General', type: listing.item_type }
      };
    });

    // Sorting
    if (sort === 'price_asc') {
      enriched.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      enriched.sort((a, b) => b.price - a.price);
    } else {
      // default: newest first
      enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return enriched;
  }

  getListingById(id) {
    const listing = this.listings.find(item => item.id === id);
    if (!listing) return null;
    // increment views
    listing.views = (listing.views || 0) + 1;

    const profile = this.findProfileById(listing.user_id);
    const category = this.categories.find(c => c.id === listing.category_id);

    // Get seller's other active listings
    const sellerOtherListings = this.listings
      .filter(l => l.user_id === listing.user_id && l.id !== listing.id && l.status === 'active')
      .slice(0, 3);

    return {
      ...listing,
      seller: profile,
      category: category || { name: 'General', type: listing.item_type },
      sellerOtherListings
    };
  }

  createListing(listingData) {
    this.listings.unshift(listingData);
    return this.getListingById(listingData.id);
  }

  updateListing(id, updates, userId) {
    const idx = this.listings.findIndex(l => l.id === id);
    if (idx === -1) return null;
    if (this.listings[idx].user_id !== userId) return 'FORBIDDEN';
    this.listings[idx] = { ...this.listings[idx], ...updates, updated_at: new Date().toISOString() };
    return this.getListingById(id);
  }

  deleteListing(id, userId) {
    const idx = this.listings.findIndex(l => l.id === id);
    if (idx === -1) return false;
    if (this.listings[idx].user_id !== userId) return 'FORBIDDEN';
    this.listings.splice(idx, 1);
    return true;
  }

  // Categories
  getCategories() {
    return this.categories;
  }

  addCategory(categoryData) {
    const cleanName = (categoryData.name || '').trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = this.categories.find(c => c.name.toLowerCase() === cleanName.toLowerCase() || c.slug === slug);
    if (existing) return existing;

    const newId = this.categories.length ? Math.max(...this.categories.map(c => c.id)) + 1 : 1;
    const newCat = {
      id: newId,
      name: cleanName,
      slug,
      type: categoryData.type || 'hardware',
      icon: categoryData.icon || (categoryData.type === 'skill' ? 'Code' : 'Cpu'),
      description: categoryData.description || `Custom ${categoryData.type || 'academic'} category for ${cleanName}`
    };
    this.categories.push(newCat);
    return newCat;
  }

  // Messages
  getUserConversations(userId) {
    const userMessages = this.messages.filter(
      m => m.sender_id === userId || m.receiver_id === userId
    );

    // Group by other student
    const conversationMap = new Map();

    userMessages.forEach(msg => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const existing = conversationMap.get(otherUserId);

      if (!existing || new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
        conversationMap.set(otherUserId, {
          otherUserId,
          lastMessage: msg,
          unreadCount: (msg.receiver_id === userId && !msg.is_read) ? 1 : 0
        });
      } else if (msg.receiver_id === userId && !msg.is_read) {
        existing.unreadCount = (existing.unreadCount || 0) + 1;
      }
    });

    return Array.from(conversationMap.values()).map(conv => {
      const otherUser = this.findProfileById(conv.otherUserId);
      const listing = conv.lastMessage.listing_id
        ? this.listings.find(l => l.id === conv.lastMessage.listing_id)
        : null;

      return {
        ...conv,
        otherUser,
        listing: listing ? { id: listing.id, title: listing.title, price: listing.price, image: listing.images[0] } : null
      };
    }).sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));
  }

  getMessageThread(userId, otherUserId, listingId = null) {
    const thread = this.messages.filter(m =>
      (m.sender_id === userId && m.receiver_id === otherUserId) ||
      (m.sender_id === otherUserId && m.receiver_id === userId)
    );

    // Mark messages from other user as read
    thread.forEach(m => {
      if (m.receiver_id === userId) {
        m.is_read = true;
      }
    });

    thread.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const otherUser = this.findProfileById(otherUserId);
    const listing = listingId ? this.listings.find(l => l.id === listingId) : null;

    return {
      messages: thread,
      otherUser,
      listing: listing ? { id: listing.id, title: listing.title, price: listing.price, image: listing.images[0], location: listing.location } : null
    };
  }

  createMessage(messageData) {
    this.messages.push(messageData);
    return messageData;
  }

  // Reviews
  getReviewsForUser(userId) {
    const userReviews = this.reviews
      .filter(r => r.reviewee_id === userId)
      .map(r => {
        const reviewer = this.findProfileById(r.reviewer_id);
        const listing = r.listing_id ? this.listings.find(l => l.id === r.listing_id) : null;
        return {
          ...r,
          reviewer,
          listingTitle: listing?.title || 'Campus Exchange'
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return userReviews;
  }

  createReview(reviewData) {
    this.reviews.push(reviewData);

    // Recalculate average rating for reviewee
    const allUserReviews = this.reviews.filter(r => r.reviewee_id === reviewData.reviewee_id);
    const sum = allUserReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = parseFloat((sum / allUserReviews.length).toFixed(2));

    const profileIdx = this.profiles.findIndex(p => p.id === reviewData.reviewee_id);
    if (profileIdx !== -1) {
      this.profiles[profileIdx].rating_avg = avg;
      this.profiles[profileIdx].rating_count = allUserReviews.length;
    }

    return reviewData;
  }
}

export const memoryDb = new MemoryDatabase();
