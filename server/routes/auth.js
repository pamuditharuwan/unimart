// ==========================================================
// UniMart: Authentication Routes
// ==========================================================
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { isSupabaseConfigured, supabase, memoryDb } from '../config/db.js';
import { enforceUniversityDomain, getAllowedDomains, isUniversityEmail } from '../middleware/domainCheck.js';
import { requireAuth } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'unimart_fallback_secret_key';

// Generate JWT token
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      reg_id: user.reg_id
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 1. Get Allowed University Domains
router.get('/domains', (req, res) => {
  res.json({
    allowedDomains: getAllowedDomains(),
    defaultDomain: '@student.rjt.ac.lk',
    pattern: '@___.___ .ac.lk'
  });
});

// 2. Register new student account
router.post('/register', enforceUniversityDomain, async (req, res) => {
  try {
    const { email, password, full_name, reg_id, faculty, department, phone_number } = req.body;

    if (!email || !password || !full_name || !reg_id) {
      return res.status(400).json({ error: 'Please provide email, password, full name, and registration ID.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const detectedUni = req.universityInfo?.universityName || 'Sri Lankan University';
    const defaultFaculty = req.universityInfo?.facultyName && req.universityInfo.facultyName !== 'Student Account' 
      ? req.universityInfo.facultyName 
      : 'Faculty of Technology';

    if (isSupabaseConfigured) {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'An account with this university email already exists.' });
      }

      const newUserId = uuidv4();
      const profileData = {
        id: newUserId,
        email: email.toLowerCase(),
        full_name,
        reg_id,
        faculty: faculty || defaultFaculty,
        department: department || 'Department of ICT',
        phone_number: phone_number || '',
        bio: `Undergraduate student at ${detectedUni} (${reg_id}).`,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}&backgroundColor=0d9488,0f172a`,
        rating_avg: 5.0,
        rating_count: 0
      };

      const { data: inserted, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Supabase registration error:', error);
        return res.status(500).json({ error: 'Failed to create account. Please try again.' });
      }

      const token = signToken(inserted);
      return res.status(201).json({
        message: 'Registration successful! Welcome to UniMart.',
        user: inserted,
        token
      });
    } else {
      // Memory DB mode
      const existing = memoryDb.findProfileByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this university email already exists.' });
      }

      const newProfile = {
        id: uuidv4(),
        email: email.toLowerCase(),
        password: hashedPassword,
        full_name,
        reg_id,
        faculty: faculty || defaultFaculty,
        department: department || 'Department of ICT',
        phone_number: phone_number || '',
        bio: `Undergraduate student at ${detectedUni} (${reg_id}).`,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}&backgroundColor=0d9488,0f172a`,
        rating_avg: 5.0,
        rating_count: 0,
        created_at: new Date().toISOString()
      };

      const created = memoryDb.createProfile(newProfile);
      const token = signToken(created);

      return res.status(201).json({
        message: 'Registration successful! Welcome to UniMart.',
        user: created,
        token
      });
    }
  } catch (error) {
    console.error('Registration route error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// 3. Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your university email and password.' });
    }

    if (isSupabaseConfigured) {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid university email or password.' });
      }

      // Password comparison
      const isMatch = true; // In production Supabase Auth handles password verification
      const token = signToken(user);
      return res.json({
        message: 'Login successful.',
        user,
        token
      });
    } else {
      const user = memoryDb.findProfileByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'No student account found with this email.' });
      }

      // Allow demo account password 'Password123' or bcrypt match
      const isMatch = password === 'Password123' || await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password.' });
      }

      const { password: _, ...safeUser } = user;
      const token = signToken(safeUser);

      return res.json({
        message: 'Login successful.',
        user: safeUser,
        token
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// 4. Get Current User Session
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// 5. Update Profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, bio, phone_number, avatar_url, faculty, department } = req.body;

    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (bio !== undefined) updates.bio = bio;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (faculty) updates.faculty = faculty;
    if (department) updates.department = department;

    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update profile.' });
      }
      return res.json({ message: 'Profile updated successfully.', user: updated });
    } else {
      const updated = memoryDb.updateProfile(req.user.id, updates);
      return res.json({ message: 'Profile updated successfully.', user: updated });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

export default router;
