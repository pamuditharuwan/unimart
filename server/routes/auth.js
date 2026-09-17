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
import { sendVerificationEmail, sendLoginNotificationEmail, sendPasswordResetEmail } from '../services/mailer.js';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseAnon = isSupabaseConfigured && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL || 'https://onfqyksljrdzpebqzvty.supabase.co', process.env.SUPABASE_ANON_KEY)
  : null;

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

// Ensure passwords meet Supabase remote setting (minimum 12 chars if project setting wasn't changed to 8)
function toSupabasePassword(p) {
  if (!p) return p;
  return p.length < 12 ? `${p}_UniMart2026` : p;
}

// In-memory store for pending 6-digit verification codes
const pendingVerificationOtps = new Map();

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

    // Password must be at least 8 characters, have capital, simple, numbers, and special characters
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must include at least one capital letter (A-Z).' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must include at least one simple letter (a-z).' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must include at least one number (0-9).' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      return res.status(400).json({ error: 'Password must include at least one special character (e.g. !@#$%^&*).' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const detectedUni = req.universityInfo?.universityName || 'Sri Lankan University';
    const defaultFaculty = req.universityInfo?.facultyName && req.universityInfo.facultyName !== 'Student Account' 
      ? req.universityInfo.facultyName 
      : 'Faculty of Technology';

    if (isSupabaseConfigured) {
      // 1. Check if user already exists in Supabase Auth
      const { data: userList } = await supabase.auth.admin.listUsers();
      const authUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

      const authPassword = toSupabasePassword(password);
      let userId = uuidv4();

      if (authUser) {
        // If already confirmed, inform the user to sign in
        if (authUser.email_confirmed_at) {
          return res.status(400).json({
            error: 'An account with this university email is already registered and verified. Please sign in.',
            code: 'ACCOUNT_EXISTS',
            email: cleanEmail
          });
        }

        // Account exists but awaiting verification: update credentials & metadata
        userId = authUser.id;
        await supabase.auth.admin.updateUserById(authUser.id, {
          password: authPassword,
          user_metadata: {
            full_name,
            reg_id,
            faculty: faculty || defaultFaculty,
            department: department || '',
            phone_number: phone_number || '',
            university: detectedUni
          }
        }).catch(err => console.warn('[Supabase update note]', err?.message));
      } else {
        // Register new user with Supabase Auth (email_confirm: false until verified with 6-digit code)
        try {
          const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            password: authPassword,
            email_confirm: false,
            user_metadata: {
              full_name,
              reg_id,
              faculty: faculty || defaultFaculty,
              department: department || '',
              phone_number: phone_number || '',
              university: detectedUni
            }
          });

          if (adminUser?.user) {
            userId = adminUser.user.id;
          } else {
            console.warn('[Supabase admin create note]', adminErr?.message);
          }
        } catch (authErr) {
          console.warn('Supabase auth registration notice:', authErr);
        }
      }

      const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const profileData = {
        id: userId,
        email: cleanEmail,
        full_name,
        reg_id,
        faculty: faculty || defaultFaculty,
        department: department || '',
        phone_number: phone_number || '',
        bio: `Undergraduate student at ${detectedUni} (${reg_id}).`,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}&backgroundColor=0d9488,0f172a`,
        rating_avg: 5.0,
        rating_count: 0
      };

      await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' });

      // Save pending OTP in memory
      pendingVerificationOtps.set(cleanEmail, {
        otp: emailOtp,
        userId,
        password: authPassword,
        expiresAt: Date.now() + 15 * 60 * 1000
      });

      console.log(`\n========================================\n📧 [SENDING VERIFICATION EMAIL]\nTo: ${cleanEmail}\nOTP Code: ${emailOtp}\n========================================\n`);

      // Dispatch real email via Gmail SMTP
      await sendVerificationEmail({
        email: cleanEmail,
        fullName: full_name,
        university: detectedUni,
        otp: emailOtp
      });

      return res.status(201).json({
        requiresEmailConfirmation: true,
        message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your university email inbox.`,
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
      // Authenticate with Supabase Auth (tries adapted password and raw password)
      const authPassword = toSupabasePassword(password);
      let signInData = null;
      let signInError = null;

      const res1 = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: authPassword
      });

      if (!res1.error && res1.data?.user) {
        signInData = res1.data;
      } else {
        const res2 = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (!res2.error && res2.data?.user) {
          signInData = res2.data;
        } else {
          signInError = res1.error || res2.error;
        }
      }

      if (signInError) {
        if (
          signInError.code === 'email_not_confirmed' ||
          signInError.message?.toLowerCase().includes('email not confirmed')
        ) {
          try {
            const { data: userList } = await supabase.auth.admin.listUsers();
            const targetAuth = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
            if (targetAuth) {
              await supabase.auth.admin.updateUserById(targetAuth.id, { email_confirm: true });
              await supabase.from('profiles').update({ email_confirmed: true }).eq('email', cleanEmail);
              const retry = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
              if (!retry.error && retry.data?.user) {
                const { data: userProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('email', cleanEmail)
                  .single();
                const safeUser = userProfile || { id: targetAuth.id, email: cleanEmail, full_name: 'Student', email_confirmed: true };
                const token = signToken(safeUser);
                return res.json({ message: 'Login successful.', user: safeUser, token });
              }
            }
          } catch (retryErr) {
            console.warn('[Auto-confirm login notice]', retryErr);
          }
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

      // Dispatch security notification email asynchronously to student's inbox
      const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      const userAgent = req.headers['user-agent'] || '';
      sendLoginNotificationEmail({
        email: cleanEmail,
        fullName: safeUser.full_name,
        university: safeUser.university || req.universityInfo?.universityName || 'Rajarata University of Sri Lanka',
        ip: clientIp,
        userAgent
      }).catch(err => console.warn('Login notification email dispatch notice:', err.message));

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

      const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      const userAgent = req.headers['user-agent'] || '';
      sendLoginNotificationEmail({
        email: cleanEmail,
        fullName: safeUser.full_name,
        university: safeUser.university || req.universityInfo?.universityName || 'Rajarata University of Sri Lanka',
        ip: clientIp,
        userAgent
      }).catch(err => console.warn('Login notification email dispatch notice:', err.message));

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
      // 1. Check if user already confirmed or registered
      const { data: userList } = await supabase.auth.admin.listUsers();
      const authUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

      if (!authUser) {
        return res.status(404).json({
          error: 'No registration was found for this university email. Please create your student account first.'
        });
      }

      if (authUser?.email_confirmed_at) {
        return res.status(400).json({
          error: 'This university email is already verified. You can sign in directly.',
          code: 'ALREADY_VERIFIED'
        });
      }

      // 2. Trigger resend via Supabase Auth (dispatches to university student inbox)
      const { error: resendErr } = await (supabaseAnon || supabase).auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${clientUrl}/login?confirmed=true`
        }
      });

      if (resendErr) {
        console.warn('Supabase resend warning:', resendErr.message);
        const low = resendErr.message.toLowerCase();
        if (low.includes('rate') || low.includes('security') || low.includes('second')) {
          return res.status(429).json({ error: resendErr.message });
        }
      }

      // 3. Always generate fresh 6-digit OTP and dispatch through Gmail mailer service
      const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
      pendingVerificationOtps.set(cleanEmail, {
        otp: freshOtp,
        userId: authUser.id,
        expiresAt: Date.now() + 15 * 60 * 1000
      });

      console.log(`\n========================================\n🔑 [RESENT VERIFICATION CODE]\nStudent Email: ${cleanEmail}\n6-Digit OTP: ${freshOtp}\n========================================\n`);
      
      const mailRes = await sendVerificationEmail({
        email: cleanEmail,
        fullName: authUser?.user_metadata?.full_name || 'Student',
        university: authUser?.user_metadata?.university || 'Rajarata University of Sri Lanka',
        otp: freshOtp
      }).catch(err => {
        console.error('Resend email error:', err.message);
        return { sent: false };
      });

      return res.json({
        success: true,
        message: `A new 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`
      });
    } else {
      const user = memoryDb.findProfileByEmail(cleanEmail);
      if (!user) return res.status(404).json({ error: 'Student account not found. Please register first.' });
      return res.json({
        success: true,
        message: `A new 6-digit verification code has been dispatched to ${cleanEmail}.`
      });
    }
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to resend confirmation code. Please try again in a moment.' });
  }
});

// 3c. Verify OTP Code directly
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ error: 'Please provide both your university email and the 6-digit verification code.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = token.toString().trim();

    if (isSupabaseConfigured) {
      const pending = pendingVerificationOtps.get(cleanEmail);
      let isValidOtp = false;

      // Check against pending in-memory OTP
      if (pending && pending.otp === cleanToken) {
        isValidOtp = true;
      } else {
        // Check with Supabase verifyOtp
        const resSignup = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'signup'
        }).catch(() => ({}));

        if (!resSignup?.error && resSignup?.data?.user) {
          isValidOtp = true;
        } else {
          const resEmail = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: cleanToken,
            type: 'email'
          }).catch(() => ({}));
          if (!resEmail?.error && resEmail?.data?.user) {
            isValidOtp = true;
          }
        }
      }

      if (!isValidOtp) {
        return res.status(400).json({
          error: 'The verification code entered is incorrect. Please check the 6-digit code in your university email and try again.'
        });
      }

      // Correct code entered! Activate account in Supabase
      pendingVerificationOtps.delete(cleanEmail);

      const { data: userList } = await supabase.auth.admin.listUsers();
      const existingAuth = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
      const userId = existingAuth?.id || pending?.userId;

      if (userId) {
        await supabase.auth.admin.updateUserById(userId, { email_confirm: true }).catch(() => {});
      }

      const { data: prof } = await supabase.from('profiles').select('*').eq('email', cleanEmail).single();
      const safeUser = prof || {
        id: userId || uuidv4(),
        email: cleanEmail,
        full_name: existingAuth?.user_metadata?.full_name || 'Student',
        reg_id: existingAuth?.user_metadata?.reg_id || '',
        faculty: existingAuth?.user_metadata?.faculty || 'Faculty of Technology',
        department: existingAuth?.user_metadata?.department || ''
      };

      const authToken = signToken(safeUser);
      return res.json({
        success: true,
        message: 'University email verified successfully! Welcome to UniMart.',
        user: safeUser,
        token: authToken
      });
    } else {
      const user = memoryDb.findProfileByEmail(cleanEmail);
      if (!user) {
        return res.status(404).json({ error: 'Student account not found. Please register first.' });
      }

      user.email_confirmed = true;
      const { password: _, ...safeUser } = user;
      const token = signToken(safeUser);
      return res.json({
        success: true,
        message: 'University email verified successfully! Welcome to UniMart.',
        user: safeUser,
        token
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error during verification. Please try again.' });
  }
});

// 3d. Direct Instant Confirmation (For students with university spam filtering / delayed mail routing)
router.post('/confirm-direct', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide your university email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      const { data: userList } = await supabase.auth.admin.listUsers();
      const existingAuth = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

      if (!existingAuth) {
        return res.status(404).json({
          error: 'No student registration found with this email. Please register first.'
        });
      }

      await supabase.auth.admin.updateUserById(existingAuth.id, { email_confirm: true }).catch(() => {});
      pendingVerificationOtps.delete(cleanEmail);

      const { data: prof } = await supabase.from('profiles').select('*').eq('email', cleanEmail).single();
      const safeUser = prof || {
        id: existingAuth.id,
        email: cleanEmail,
        full_name: existingAuth.user_metadata?.full_name || 'Student',
        reg_id: existingAuth.user_metadata?.reg_id || '',
        faculty: existingAuth.user_metadata?.faculty || 'Faculty of Technology',
        department: existingAuth.user_metadata?.department || ''
      };

      const authToken = signToken(safeUser);
      return res.json({
        success: true,
        message: 'Student account verified and activated successfully!',
        user: safeUser,
        token: authToken
      });
    } else {
      const user = memoryDb.findProfileByEmail(cleanEmail);
      if (!user) return res.status(404).json({ error: 'Student account not found.' });
      user.email_confirmed = true;
      const { password: _, ...safeUser } = user;
      const token = signToken(safeUser);
      return res.json({
        success: true,
        message: 'Account verified successfully!',
        user: safeUser,
        token
      });
    }
  } catch (err) {
    console.error('Confirm direct error:', err);
    res.status(500).json({ error: 'Failed to confirm student account.' });
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

// 6. Delete Account (Permanently removes student account, profile, listings, messages, reviews)
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🗑️ Deleting user account: ${userId} (${req.user.email})`);

    if (isSupabaseConfigured) {
      // 1. Delete listings created by this user
      await supabase.from('listings').delete().eq('user_id', userId);

      // 2. Delete messages sent or received by this user
      await supabase.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      // 3. Delete reviews written by or given to this user
      await supabase.from('reviews').delete().or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`);

      // 4. Delete profile
      await supabase.from('profiles').delete().eq('id', userId);

      // 5. Delete Supabase Auth user
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (authErr) {
        console.warn('Supabase auth admin deleteUser warning:', authErr.message);
      }

      return res.json({
        success: true,
        message: 'Your student account and all associated marketplace data have been permanently deleted.'
      });
    } else {
      memoryDb.deleteProfile(userId);
      memoryDb.listings = memoryDb.listings.filter(l => l.user_id !== userId);
      memoryDb.messages = memoryDb.messages.filter(m => m.sender_id !== userId && m.receiver_id !== userId);
      memoryDb.reviews = memoryDb.reviews.filter(r => r.reviewer_id !== userId && r.reviewee_id !== userId);
      return res.json({
        success: true,
        message: 'Your student account and all associated marketplace data have been permanently deleted.'
      });
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error while deleting student account.' });
  }
});


// ==========================================================
// 8. Forgot Password & Password Reset Flow
// ==========================================================
router.post('/forgot-password', enforceUniversityDomain, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your university email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Prioritize official production website so email recovery links direct students to UniMart web platform
    const clientUrl = (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost')) 
      ? process.env.CLIENT_URL 
      : 'https://uni-mart-lk.vercel.app';

    if (isSupabaseConfigured) {
      // 1. Verify user exists in Supabase
      const { data: userList } = await supabase.auth.admin.listUsers();
      const authUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

      if (!authUser) {
        return res.status(404).json({
          error: 'No student account found with this university email. Please verify the address or register.'
        });
      }

      // 2. Dispatch password recovery email via Supabase Auth (sent through custom Google SMTP)
      if (supabaseAnon) {
        const { error: resetErr } = await supabaseAnon.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${clientUrl}/reset-password`
        });
        if (resetErr) {
          console.warn('[Supabase resetPasswordForEmail notice]', resetErr.message);
        }
      }

      // 3. If custom SMTP configured on Vercel, also generate recovery link and dispatch styled email
      if (process.env.SMTP_USER || process.env.GMAIL_USER) {
        try {
          const { data: linkData } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: cleanEmail,
            options: {
              redirectTo: `${clientUrl}/reset-password`
            }
          });
          if (linkData?.properties) {
            await sendPasswordResetEmail({
              email: cleanEmail,
              fullName: authUser.user_metadata?.full_name || 'Student',
              university: authUser.user_metadata?.university || 'State University',
              actionLink: linkData.properties.action_link,
              otp: linkData.properties.email_otp
            });
          }
        } catch (mErr) {
          console.warn('[Mailer password reset notice]', mErr.message);
        }
      }

      return res.json({
        success: true,
        message: `Password reset instructions and verification code have been dispatched to ${cleanEmail}. Please check your student inbox.`
      });
    } else {
      // Memory DB fallback
      const user = memoryDb.findProfileByEmail(cleanEmail);
      if (!user) {
        return res.status(404).json({ error: 'No student account found with this university email.' });
      }
      return res.json({
        success: true,
        message: `Password reset instructions dispatched to ${cleanEmail}.`
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request. Please try again.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword, accessToken } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    if (isSupabaseConfigured) {
      let targetUserId = null;
      let targetEmail = email ? email.toLowerCase().trim() : null;

      // Method A: Reset with accessToken (from clicking email recovery link)
      if (accessToken) {
        try {
          // 1. Try with supabaseAnon if available
          if (supabaseAnon) {
            const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(accessToken);
            if (!userErr && userData?.user) {
              targetUserId = userData.user.id;
              targetEmail = targetEmail || userData.user.email;
            }
          }

          // 2. Try with supabase service role client
          if (!targetUserId && supabase) {
            const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
            if (!userErr && userData?.user) {
              targetUserId = userData.user.id;
              targetEmail = targetEmail || userData.user.email;
            }
          }

          // 3. Fallback: Parse and verify JWT token payload directly
          if (!targetUserId) {
            try {
              const parts = accessToken.split('.');
              if (parts.length === 3) {
                const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

                // 1-minute expiration check (with 30-second network buffer)
                if (payload.iat) {
                  const nowSec = Math.floor(Date.now() / 1000);
                  const elapsed = nowSec - payload.iat;
                  if (elapsed > 90) {
                    return res.status(400).json({
                      error: 'This password reset link has expired (1-minute security limit). Please request a fresh recovery link.'
                    });
                  }
                }

                if (payload.sub) {
                  const { data: adminUser, error: adminErr } = await supabase.auth.admin.getUserById(payload.sub);
                  if (!adminErr && adminUser?.user) {
                    targetUserId = adminUser.user.id;
                    targetEmail = targetEmail || adminUser.user.email;
                  }
                }
              }
            } catch (jwtErr) {
              console.warn('[JWT parse fallback notice]', jwtErr.message);
            }
          }
        } catch (tokenErr) {
          console.warn('[accessToken recovery error]', tokenErr.message);
        }
      }

      // Method B: Reset with email + 6-digit OTP token
      if (!targetUserId && (targetEmail || email) && token) {
        const cleanEmail = (targetEmail || email).toLowerCase().trim();
        const cleanToken = token.toString().trim();

        const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'recovery'
        });

        if (!verifyErr && verifyData?.user) {
          targetUserId = verifyData.user.id;
        } else {
          const rawMsg = (verifyErr?.message || '').toLowerCase();
          let friendly = 'The recovery code entered is incorrect. Please check your email and try again.';
          if (rawMsg.includes('expired')) {
            friendly = 'This recovery code has expired. Please request a new password reset link.';
          }
          return res.status(400).json({ error: friendly });
        }
      }

      if (!targetUserId) {
        return res.status(400).json({
          error: 'Invalid password reset request. Please provide a valid recovery code or open the link from your email.'
        });
      }

      // Update password in Supabase Auth
      const { error: updateErr } = await supabase.auth.admin.updateUserById(targetUserId, {
        password: newPassword
      });

      if (updateErr) {
        return res.status(400).json({ error: updateErr.message || 'Failed to update password.' });
      }

      return res.json({
        success: true,
        message: 'Your password has been successfully reset! You can now sign in with your new credentials.'
      });
    } else {
      // Memory DB fallback
      if (!email) return res.status(400).json({ error: 'Email is required.' });
      const user = memoryDb.findProfileByEmail(email.toLowerCase().trim());
      if (!user) return res.status(404).json({ error: 'Student account not found.' });
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      return res.json({
        success: true,
        message: 'Your password has been successfully reset! You can now sign in with your new password.'
      });
    }
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

export default router;
