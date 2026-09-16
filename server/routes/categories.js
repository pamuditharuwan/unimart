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

router.post('/', async (req, res) => {
  try {
    const { name, type, icon, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanType = type === 'skill' ? 'skill' : 'hardware';
    const catIcon = icon || (cleanType === 'hardware' ? 'Cpu' : 'Code');
    const catDesc = description || `Custom ${cleanType} category for ${cleanName}`;

    if (isSupabaseConfigured) {
      // Check if category already exists by slug or name
      const { data: existing } = await supabase
        .from('categories')
        .select('*')
        .or(`name.ilike.${cleanName},slug.eq.${slug}`)
        .maybeSingle();

      if (existing) {
        return res.json(existing);
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: cleanName,
          slug,
          type: cleanType,
          icon: catIcon,
          description: catDesc
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    } else {
      const newCat = memoryDb.addCategory({
        name: cleanName,
        type: cleanType,
        icon: catIcon,
        description: catDesc
      });
      return res.status(201).json(newCat);
    }
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

export default router;
