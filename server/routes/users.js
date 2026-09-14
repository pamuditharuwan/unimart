// ==========================================================
// UniMart: User Profile Routes
// ==========================================================
import express from 'express';
import { isSupabaseConfigured, supabase, memoryDb } from '../config/db.js';

const router = express.Router();

// 1. Get Public Student Profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, reg_id, faculty, department, bio, avatar_url, phone_number, rating_avg, rating_count, created_at')
        .eq('id', id)
        .single();

      if (error || !profile) {
        return res.status(404).json({ error: 'Student profile not found.' });
      }

      // Count active listings
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('status', 'active');

      return res.json({
        ...profile,
        activeListingsCount: count || 0
      });
    } else {
      const profile = memoryDb.findProfileById(id);
      if (!profile) {
        return res.status(404).json({ error: 'Student profile not found.' });
      }
      const activeListingsCount = memoryDb.listings.filter(l => l.user_id === id && l.status === 'active').length;

      return res.json({
        ...profile,
        activeListingsCount
      });
    }
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ error: 'Failed to fetch student profile.' });
  }
});

export default router;
