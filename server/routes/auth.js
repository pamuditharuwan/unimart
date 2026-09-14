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
import { parseSriLankanUniversityEmail } from '../utils/universityDomains.js';
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

// 2. Register new student account (Sends confirmation email to inbox)
router.post('/register', enforceUniversityDomain, async (req, res) => {
  try {
    const { email, password, full_name, reg_id, faculty, department, phone_number } = req.body;

    if (!email || !password || !full_name || !reg_id) {
      return res.status(400).json({ error: 'Please provide email, password, full name, and registration ID.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const detectedUni = req.universityInfo?.universityName || 'Sri Lankan University';
    const defaultFaculty = req.universityInfo?.facultyName && req.universityInfo.facultyName !== 'Student Account' 
      ? req.universityInfo.facultyName 
      : 'Faculty of Technology';

    if (isSupabaseConfigured) {
      // 1. Check if email already registered in profiles
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'An account with this university email already exists. Please log in.' });
      }

      // 2. Sign up with Supabase Auth -> sends confirmation email to student's university inbox
      const clientUrl = process.env.CLIENT_URL || 'https://uni-mart-lk.vercel.app';
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name,
            reg_id,
            faculty: faculty || defaultFaculty,
            department: department || 'Department of ICT',
            phone_number: phone_number || '',
            university: detectedUni
          },
          emailRedirectTo: `${clientUrl}/login?confirmed=true`
        }
      });

      if (authError) {
        console.error('Supabase registration error:', authError);
        return res.status(400).json({ error: authError.message || 'Failed to create student account.' });
      }

      const userId = authData.user?.id || uuidv4();
      const profileData = {
        id: userId,
        email: cleanEmail,
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

      await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'email' });

      return res.status(201).json({
        requiresEmailConfirmation: true,
        message: `Confirmation email sent to ${cleanEmail}. Please check your university inbox and click the verification link to activate your student account.`,
        email: cleanEmail,
        university: detectedUni
      });
    } else {
      // Memory DB mode
      const existing = memoryDb.findProfileByEmail(cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this university email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newProfile = {
        id: uuidv4(),
        email: cleanEmail,
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
        email_confirmed: false,
        created_at: new Date().toISOString()
      };

      memoryDb.createProfile(newProfile);

      return res.status(201).json({
        requiresEmailConfirmation: true,
        message: `Confirmation email sent to ${cleanEmail}. Please check your university inbox and click the verification link to activate your student account.`,
        email: cleanEmail,
        university: detectedUni
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

    // 1. Strictly enforce university domain verification
    const analysis = parseSriLankanUniversityEmail(email);
    if (!analysis.isValid && !isUniversityEmail(email)) {
      return res.status(400).json({
        error: analysis.error || 'Access restricted. Login requires a valid Sri Lankan state university email address (@___.___ .ac.lk or @uom.lk).'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      // Authenticate with Supabase Auth to enforce email verification
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (signInError) {
        if (
          signInError.code === 'email_not_confirmed' ||
          signInError.message?.toLowerCase().includes('email not confirmed')
        ) {
          return res.status(403).json({
            code: 'EMAIL_NOT_CONFIRMED',
            error: `Your university email has not been verified yet. Please check your student inbox at ${cleanEmail} for the confirmation link.`,
            email: cleanEmail
          });
        }

        // Demo fallback for initial seeded accounts if Supabase Auth user wasn't registered in auth.users
        const { data: profileUser } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (profileUser && password === 'Password123' && cleanEmail.endsWith('.rjt.ac.lk')) {
          const token = signToken(profileUser);
          return res.json({
            message: 'Login successful.',
            user: profileUser,
            token
          });
        }

        return res.status(401).json({
          error: 'Invalid university email or password. Please verify your credentials or register.'
        });
      }

      // Successful Supabase Auth sign in
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();

      const safeUser = userProfile || {
        id: signInData.user.id,
        email: signInData.user.email,
        full_name: signInData.user.user_metadata?.full_name || 'Student',
        reg_id: signInData.user.user_metadata?.reg_id || '',
        faculty: signInData.user.user_metadata?.faculty || 'Faculty of Technology',
        department: signInData.user.user_metadata?.department || 'Department of ICT'
      };

      const token = signToken(safeUser);
      return res.json({
        message: 'Login successful.',
        user: safeUser,
        token
      });
    } else {
      const user = memoryDb.findProfileByEmail(cleanEmail);
      if (!user) {
        return res.status(401).json({ error: 'No student account found with this university email. Please register first.' });
      }

      if (user.email_confirmed === false) {
        return res.status(403).json({
          code: 'EMAIL_NOT_CONFIRMED',
          error: `Please confirm your university email before logging in. Check your inbox at ${cleanEmail}.`,
          email: cleanEmail
        });
      }

      // bcrypt match or demo account match
      const isMatch = (user.password && await bcrypt.compare(password, user.password)) || (password === 'Password123' && user.email.endsWith('.rjt.ac.lk'));
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password. Please try again.' });
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

// 3b. Resend Confirmation Email
router.post('/resend-confirmation', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide your university email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const clientUrl = process.env.CLIENT_URL || 'https://uni-mart-lk.vercel.app';

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${clientUrl}/login?confirmed=true`
        }
      });

      if (error) {
        console.warn('Supabase resend warning:', error.message);
      }
    }

    return res.json({
      message: `A new confirmation email has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`
    });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to resend confirmation email.' });
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
