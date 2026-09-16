// ==========================================================
// UniMart: Listings Routes (Academic Hardware & Skills)
// ==========================================================
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { isSupabaseConfigured, supabase, memoryDb } from '../config/db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Get All Listings with multi-criteria filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      type,
      categoryId,
      condition,
      search,
      minPrice,
      maxPrice,
      sort,
      userId,
      status
    } = req.query;

    if (isSupabaseConfigured) {
      let query = supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!user_id(*),
          category:categories(*)
        `);

      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.eq('status', 'active');
      }

      if (type && type !== 'all') {
        query = query.eq('item_type', type);
      }
      if (categoryId) {
        query = query.eq('category_id', parseInt(categoryId, 10));
      }
      if (condition && condition !== 'all') {
        query = query.eq('condition', condition);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
      }

      if (sort === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json(data);
    } else {
      const results = memoryDb.getAllListings({
        type,
        categoryId,
        condition,
        search,
        minPrice,
        maxPrice,
        sort,
        userId
      });
      return res.json(results);
    }
  } catch (error) {
    console.error('Fetch listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
});

// 2. Get Single Listing by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured) {
      const { data: listing, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!user_id(*),
          category:categories(*)
        `)
        .eq('id', id)
        .single();

      if (error || !listing) {
        return res.status(404).json({ error: 'Listing not found.' });
      }

      // Fetch seller other items
      const { data: otherListings } = await supabase
        .from('listings')
        .select('id, title, price, images, item_type, condition')
        .eq('user_id', listing.user_id)
        .neq('id', listing.id)
        .eq('status', 'active')
        .limit(3);

      return res.json({
        ...listing,
        sellerOtherListings: otherListings || []
      });
    } else {
      const listing = memoryDb.getListingById(id);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found.' });
      }
      return res.json(listing);
    }
  } catch (error) {
    console.error('Fetch single listing error:', error);
    res.status(500).json({ error: 'Failed to fetch listing.' });
  }
});

// 3. Create New Listing (Hardware or Skill)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      item_type,
      price,
      price_type,
      condition,
      location,
      images,
      contact_phone
    } = req.body;

    if (!title || !description || !category_id || !item_type || price === undefined) {
      return res.status(400).json({
        error: 'Please fill all required fields: title, description, category, item type, and price.'
      });
    }

    if (!['hardware', 'skill'].includes(item_type)) {
      return res.status(400).json({ error: 'Invalid item type. Must be "hardware" or "skill".' });
    }

    const listingId = uuidv4();
    const newListing = {
      id: listingId,
      user_id: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category_id: parseInt(category_id, 10),
      item_type,
      price: parseFloat(price) || 0.00,
      price_type: price_type || 'fixed',
      condition: item_type === 'hardware' ? (condition || 'used_good') : null,
      location: location?.trim() || 'Faculty of Technology, Rajarata University',
      images: Array.isArray(images) && images.length > 0 ? images : [
        item_type === 'hardware'
          ? 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'active',
      views: 0,
      contact_phone: contact_phone?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('listings')
        .insert([newListing])
        .select(`
          *,
          seller:profiles!user_id(*),
          category:categories(*)
        `)
        .single();

      if (error) throw error;
      return res.status(201).json({ message: 'Listing published successfully!', listing: data });
    } else {
      const created = memoryDb.createListing(newListing);
      return res.status(201).json({ message: 'Listing published successfully!', listing: created });
    }
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing.' });
  }
});

// 4. Update Listing
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category_id,
      price,
      price_type,
      condition,
      location,
      images,
      status
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category_id !== undefined) updates.category_id = parseInt(category_id, 10);
    if (price !== undefined) updates.price = parseFloat(price);
    if (price_type !== undefined) updates.price_type = price_type;
    if (condition !== undefined) updates.condition = condition;
    if (location !== undefined) updates.location = location.trim();
    if (images !== undefined) updates.images = images;
    if (status !== undefined) updates.status = status;
    updates.updated_at = new Date().toISOString();

    if (isSupabaseConfigured) {
      // Check ownership
      const { data: existing } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Listing not found.' });
      }
      if (existing.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to edit this listing.' });
      }

      const { data: updated, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          seller:profiles!user_id(*),
          category:categories(*)
        `)
        .single();

      if (error) throw error;
      return res.json({ message: 'Listing updated successfully!', listing: updated });
    } else {
      const result = memoryDb.updateListing(id, updates, req.user.id);
      if (result === 'FORBIDDEN') {
        return res.status(403).json({ error: 'Unauthorized to edit this listing.' });
      }
      if (!result) {
        return res.status(404).json({ error: 'Listing not found.' });
      }
      return res.json({ message: 'Listing updated successfully!', listing: result });
    }
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing.' });
  }
});

// 5. Delete Listing
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured) {
      const { data: existing } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Listing not found.' });
      }
      if (existing.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to delete this listing.' });
      }

      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ message: 'Listing deleted successfully.' });
    } else {
      const success = memoryDb.deleteListing(id, req.user.id);
      if (success === 'FORBIDDEN') {
        return res.status(403).json({ error: 'Unauthorized to delete this listing.' });
      }
      if (!success) {
        return res.status(404).json({ error: 'Listing not found.' });
      }
      return res.json({ message: 'Listing deleted successfully.' });
    }
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

// 6. Get Listings for a specific User Profile
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!user_id(*),
          category:categories(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(data);
    } else {
      const listings = memoryDb.getAllListings({ userId });
      return res.json(listings);
    }
  } catch (error) {
    console.error('User listings error:', error);
    res.status(500).json({ error: 'Failed to fetch user listings.' });
  }
});

export default router;
