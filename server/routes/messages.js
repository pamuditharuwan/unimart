// ==========================================================
// UniMart: Direct In-App Messaging Routes
// ==========================================================
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { isSupabaseConfigured, supabase, memoryDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Get List of Conversations
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*),
          listing:listings(*)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group into unique conversation threads
      const conversationMap = new Map();
      (data || []).forEach(msg => {
        const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
        if (!otherUser) return;

        const otherUserId = otherUser.id;
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            otherUserId,
            otherUser,
            lastMessage: msg,
            listing: msg.listing ? { id: msg.listing.id, title: msg.listing.title, price: msg.listing.price } : null,
            unreadCount: (msg.receiver_id === userId && !msg.is_read) ? 1 : 0
          });
        } else if (msg.receiver_id === userId && !msg.is_read) {
          const entry = conversationMap.get(otherUserId);
          entry.unreadCount = (entry.unreadCount || 0) + 1;
        }
      });

      return res.json(Array.from(conversationMap.values()));
    } else {
      const conversations = memoryDb.getUserConversations(userId);
      return res.json(conversations);
    }
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ error: 'Failed to load conversations.' });
  }
});

// 2. Get Message Thread with a specific user
router.get('/thread/:otherUserId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const { listingId } = req.query;

    if (isSupabaseConfigured) {
      // Mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', userId);

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url, reg_id),
          receiver:profiles!receiver_id(id, full_name, avatar_url, reg_id)
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get other user info
      const { data: otherUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      // Get listing info if provided
      let listing = null;
      if (listingId) {
        const { data: listingData } = await supabase
          .from('listings')
          .select('id, title, price, images, location')
          .eq('id', listingId)
          .single();
        listing = listingData;
      }

      return res.json({
        messages: messages || [],
        otherUser,
        listing
      });
    } else {
      const thread = memoryDb.getMessageThread(userId, otherUserId, listingId);
      return res.json(thread);
    }
  } catch (error) {
    console.error('Message thread error:', error);
    res.status(500).json({ error: 'Failed to load messages.' });
  }
});

// 3. Send a direct message
router.post('/', requireAuth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, listing_id, content } = req.body;

    if (!receiver_id || !content || !content.trim()) {
      return res.status(400).json({ error: 'Receiver ID and non-empty message content are required.' });
    }

    if (receiver_id === senderId) {
      return res.status(400).json({ error: 'You cannot send messages to yourself.' });
    }

    const messageData = {
      id: uuidv4(),
      sender_id: senderId,
      receiver_id,
      listing_id: listing_id || null,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url, reg_id),
          receiver:profiles!receiver_id(id, full_name, avatar_url, reg_id)
        `)
        .single();

      if (error) throw error;
      return res.status(201).json({ message: 'Message sent.', data });
    } else {
      const saved = memoryDb.createMessage(messageData);
      return res.status(201).json({ message: 'Message sent.', data: saved });
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
