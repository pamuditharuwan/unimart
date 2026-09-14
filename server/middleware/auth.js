// ==========================================================
// UniMart: JWT Authentication Middleware
// ==========================================================
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isSupabaseConfigured, supabase, memoryDb } from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'unimart_fallback_secret_key';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
    }

    // Retrieve user profile
    if (isSupabaseConfigured) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !profile) {
        return res.status(401).json({ error: 'User profile not found.' });
      }
      req.user = profile;
    } else {
      const profile = memoryDb.findProfileById(decoded.id);
      if (!profile) {
        return res.status(401).json({ error: 'User profile not found.' });
      }
      req.user = profile;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (isSupabaseConfigured) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.id)
        .single()
        .then(({ data }) => {
          if (data) req.user = data;
          next();
        })
        .catch(() => next());
    } else {
      const profile = memoryDb.findProfileById(decoded.id);
      if (profile) req.user = profile;
      next();
    }
  } catch {
    next();
  }
}
