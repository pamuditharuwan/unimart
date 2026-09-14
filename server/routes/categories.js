// ==========================================================
// UniMart: Categories Routes
// ==========================================================
import express from 'express';
import { isSupabaseConfigured, supabase, memoryDb } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id');

      if (error) throw error;
      return res.json(data);
    } else {
      return res.json(memoryDb.getCategories());
    }
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

export default router;
