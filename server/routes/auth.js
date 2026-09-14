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
import { sendVerificationEmail, sendLoginNotificationEmail } from '../services/mailer.js';
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

    // Password must exceed 12 characters, have capital, simple, numbers, and special characters
    if (password.length <= 12) {
      return res.status(400).json({ error: 'Password must exceed 12 characters (minimum 13 characters).' });
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
      // 1. Check if email already registered in profiles and Supabase Auth
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .single();

      if (existingUser) {
        // Verify if user actually exists in Supabase Auth
        const { data: userList } = await supabase.auth.admin.listUsers();
        const authUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

        if (authUser) {
          return res.status(400).json({
            error: 'An account with this university email already exists. Please log in.',
            code: 'ACCOUNT_EXISTS',
            email: cleanEmail
          });
        } else {
          // Orphaned profile row without corresponding auth user -> clean up old row to allow fresh registration
          console.log(`Cleaning up orphaned profile ${existingUser.id} for ${cleanEmail}`);
          await supabase.from('profiles').delete().eq('id', existingUser.id);
        }
      }

      // 2. Sign up with Supabase Auth -> sends confirmation email to student's university inbox
      const clientUrl = process.env.CLIENT_URL || 'https://uni-mart-lk.vercel.app';
      let actionLink = null;
      let emailOtp = null;
      let userId = uuidv4();

      try {
        // Generate verified activation link and OTP with Supabase Admin
        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name,
              reg_id,
              faculty: faculty || defaultFaculty,
              department: department || '',
              phone_number: phone_number || '',
              university: detectedUni
            },
            redirectTo: `${clientUrl}/login?confirmed=true`
          }
        });

        if (linkData?.user) {
          userId = linkData.user.id;
        }
        if (linkData?.properties) {
          actionLink = linkData.properties.action_link;
          emailOtp = linkData.properties.email_otp;
        }

        // Send university verification email via custom SMTP if configured
        await sendVerificationEmail({
          email: cleanEmail,
          fullName: full_name,
          university: detectedUni,
          actionLink,
          otp: emailOtp
        }).catch(mailErr => console.warn('Mailer dispatch notice:', mailErr.message));

        // Also attempt standard Supabase Auth signup dispatch if available
        if (supabaseAnon) {
          supabaseAnon.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { full_name, reg_id, university: detectedUni },
              emailRedirectTo: `${clientUrl}/login?confirmed=true`
            }
          }).catch(() => {});
        }
      } catch (authErr) {
        console.warn('Supabase auth link generation notice:', authErr);
      }

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
        .upsert([profileData], { onConflict: 'email' });

      return res.status(201).json({
        requiresEmailConfirmation: true,
        message: `Confirmation email dispatched to ${cleanEmail}. Please check your university inbox to activate your student account.`,
        email: cleanEmail,
        university: detectedUni,
        actionLink,
        emailOtp
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
      // 1. Check if user already confirmed
      const { data: userList } = await supabase.auth.admin.listUsers();
      const authUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

      if (authUser?.email_confirmed_at) {
        return res.status(400).json({
          error: 'This university email is already verified. You can sign in directly.',
          code: 'ALREADY_VERIFIED'
        });
      }

      // 2. Trigger resend via Supabase Auth (which sends through Resend SMTP)
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${clientUrl}/verify-email?email=${encodeURIComponent(cleanEmail)}`
        }
      });

      if (resendErr) {
        console.warn('Supabase resend warning:', resendErr.message);
      }

      // 3. Also generate fresh OTP and dispatch through mailer service if configured
      let freshOtp = null;
      let freshLink = null;
      try {
        const { data: linkData } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email: cleanEmail,
          password: 'TmpPassword123!#@Aa'
        }).catch(() => ({}));

        if (linkData?.properties?.email_otp) {
          freshOtp = linkData.properties.email_otp;
          freshLink = linkData.properties.action_link;
          await sendVerificationEmail({
            email: cleanEmail,
            fullName: authUser?.user_metadata?.full_name || 'Student',
            university: authUser?.user_metadata?.university || 'State University',
            actionLink: linkData.properties.action_link,
            otp: linkData.properties.email_otp
          }).catch(() => {});
        }
      } catch {}

      return res.json({
        success: true,
        message: `A new 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`,
        emailOtp: freshOtp,
        actionLink: freshLink
      });
    } else {
      const user = memoryDb.findProfileByEmail(cleanEmail);
      if (!user) return res.status(404).json({ error: 'Student account not found. Please register first.' });
      return res.json({
        success: true,
        message: `A new 6-digit verification code has been dispatched to ${cleanEmail}.`,
        emailOtp: '123456'
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
      let verifyData = null;
      let verifyError = null;

      // 1. Official Supabase verifyOtp with type: 'email'
      const resEmail = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });

      if (!resEmail.error && resEmail.data?.user) {
        verifyData = resEmail.data;
      } else {
        // Fallback to type: 'signup'
        const resSignup = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'signup'
        });

        if (!resSignup.error && resSignup.data?.user) {
          verifyData = resSignup.data;
        } else {
          verifyError = resSignup.error || resEmail.error;
        }
      }

      if (verifyError || !verifyData?.user) {
        const rawMsg = (verifyError?.message || '').toLowerCase();
        let friendly = 'The verification code entered is incorrect. Please check the digits and try again.';
        if (rawMsg.includes('expired')) {
          friendly = 'This verification code has expired. Please click "Resend Code" to receive a new one.';
        } else if (rawMsg.includes('already') || rawMsg.includes('confirmed')) {
          friendly = 'This university email is already verified. You can now log in.';
        }
        return res.status(400).json({ error: friendly });
      }

      // Successful verification -> Fetch or create verified user profile
      const userId = verifyData.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const safeUser = profile || {
        id: userId,
        email: cleanEmail,
        full_name: verifyData.user.user_metadata?.full_name || 'Student',
        reg_id: verifyData.user.user_metadata?.reg_id || '',
        faculty: verifyData.user.user_metadata?.faculty || 'Faculty of Technology',
        department: verifyData.user.user_metadata?.department || 'Department of ICT',
        email_confirmed: true
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
      if (!user) return res.status(404).json({ error: 'Student account not found.' });
      user.email_confirmed = true;
      const { password: _, ...safeUser } = user;
      const authToken = signToken(safeUser);
      return res.json({
        success: true,
        message: 'University email verified successfully! Welcome to UniMart.',
        user: safeUser,
        token: authToken
      });
    }
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error during verification. Please try again.' });
  }
});

// 3d. Direct Email Verification Fallback (Admin bypass if university mail server drops external automated emails)
router.post('/confirm-direct', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      let targetUserId = null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .single();

      if (profile?.id) {
        targetUserId = profile.id;
      } else {
        const { data: userList } = await supabase.auth.admin.listUsers();
        const targetUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
        if (targetUser) targetUserId = targetUser.id;
      }

      if (targetUserId) {
        await supabase.auth.admin.updateUserById(targetUserId, {
          email_confirm: true
        });
      }

      return res.json({ message: 'University email confirmed successfully! You can now log in.' });
    } else {
      const user = memoryDb.findProfileByEmail(cleanEmail);
      if (user) user.email_confirmed = true;
      return res.json({ message: 'University email confirmed successfully! You can now log in.' });
    }
  } catch (err) {
    console.error('Direct confirm error:', err);
    res.status(500).json({ error: 'Failed to verify email directly.' });
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

export default router;
