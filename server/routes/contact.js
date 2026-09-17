// ==========================================================
// UniMart: Contact & Student Inquiry Routes
// Dispatches student inquiries directly to support.unimart.lk@gmail.com
// ==========================================================
import express from 'express';
import { sendInquiryEmail } from '../services/mailer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'Please fill in all required fields (Name, University Email, Subject, and Message).' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const dispatchResult = await sendInquiryEmail({
      name: name.trim(),
      email: email.trim(),
      category: category || 'general',
      subject: subject.trim(),
      message: message.trim()
    });

    if (!dispatchResult.sent) {
      console.warn('[Contact Route] Mail dispatch returned unsent:', dispatchResult.reason || dispatchResult.error);
    }

    return res.status(200).json({
      success: true,
      message: 'Your inquiry has been successfully dispatched to the UniMart support team (support.unimart.lk@gmail.com). We will review it and reply directly to your university email address.',
      messageId: dispatchResult.messageId
    });
  } catch (err) {
    console.error('Contact inquiry error:', err);
    res.status(500).json({ error: 'Failed to dispatch your inquiry. Please try again or contact support directly.' });
  }
});

export default router;
