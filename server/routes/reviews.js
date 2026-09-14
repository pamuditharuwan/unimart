// ==========================================================
// UniMart: Reviews & 5-Star Rating System Routes
// ==========================================================
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { isSupabaseConfigured, supabase, memoryDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id(id, full_name, avatar_url, reg_id, faculty),
          listing:listings(id, title)
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(data);
    } else {
      const reviews = memoryDb.getReviewsForUser(userId);
      return res.json(reviews);
    }
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// 2. Submit a Review & Rating
router.post('/', requireAuth, async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { reviewee_id, listing_id, rating, comment } = req.body;

    if (!reviewee_id || !rating || !comment || !comment.trim()) {
      return res.status(400).json({ error: 'Please provide reviewee, star rating (1-5), and feedback comment.' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5 stars.' });
    }

    if (reviewerId === reviewee_id) {
      return res.status(400).json({ error: 'You cannot write a review for yourself.' });
    }

    const reviewData = {
      id: uuidv4(),
      reviewer_id: reviewerId,
      reviewee_id,
      listing_id: listing_id || null,
      rating: numRating,
      comment: comment.trim(),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      // Insert review
      const { data: inserted, error: insertError } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Recalculate average rating
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', reviewee_id);

      if (allReviews && allReviews.length > 0) {
        const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const avg = parseFloat((sum / allReviews.length).toFixed(2));

        await supabase
          .from('profiles')
          .update({
            rating_avg: avg,
            rating_count: allReviews.length
          })
          .eq('id', reviewee_id);
      }

      return res.status(201).json({ message: 'Review submitted successfully!', review: inserted });
    } else {
      const created = memoryDb.createReview(reviewData);
      return res.status(201).json({ message: 'Review submitted successfully!', review: created });
    }
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

export default router;
