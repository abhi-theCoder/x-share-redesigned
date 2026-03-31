const { supabase } = require('../services/supabase.js');

// Get all questions
const getQuestions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        users:user_id (id, name, avatar_url),
        question_comments(
          *,
          users:user_id (id, name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching questions:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Post a new question
const postQuestion = async (req, res) => {
  try {
    const {question, tags } = req.body;
    // console.log(req)
    user_id = req.userId;
    console.log(user_id)
    const { data, error } = await supabase
      .from('questions')
      .insert([{ user_id, question, tags }])
       .select('*, users:user_id(id,name,avatar_url)')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error posting question:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Add a comment to a question
const addComment = async (req, res) => {
  try {
    const { question_id, comment } = req.body;
    const user_id = req.userId;
    
    if (!question_id || !comment) {
      return res.status(400).json({ error: "Missing question_id or comment text" });
    }

    const { data: newComment, error: insertError } = await supabase
      .from('question_comments')
      .insert([{ question_id, user_id, comment }])
      .select('*, users:user_id(id,name,avatar_url)')
      .single();

    if (insertError) throw insertError;

    // Optional: Increment a comment count on the question if the column exists
    await supabase.rpc('increment_question_comment_count', { q_id: question_id });

    res.json(newComment);
  } catch (err) {
    console.error('Error adding comment:', err.message);
    res.status(500).json({ error: "Failed to add comment. Please try again." });
  }
};

// Handle Voting for questions (Defensive approach)
const handleVoteQuestion = async (req, res) => {
  const { id } = req.params;
  const { voteType } = req.body;
  const userId = req.userId;

  try {
    // 1. Fetch current question data
    const { data: q, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !q) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    let upvotes = q.upvotes || 0;
    let downvotes = q.downvotes || 0;
    let totalVotes = q.votes || 0;
    const userVoted = q.user_voted;

    let updateData = {};
    let newVoteStatus = null;

    // Logic for splitting into up/down vs single vote count
    if (voteType === 'upvote') {
      if (userVoted === 'upvote') {
        upvotes = Math.max(0, upvotes - 1);
        totalVotes -= 1;
        newVoteStatus = null;
      } else {
        upvotes += 1;
        totalVotes += 1;
        if (userVoted === 'downvote') {
           downvotes = Math.max(0, downvotes - 1);
           totalVotes += 1; // Since we changed from -1 to +1
        }
        newVoteStatus = 'upvote';
      }
    } else if (voteType === 'downvote') {
      if (userVoted === 'downvote') {
        downvotes = Math.max(0, downvotes - 1);
        totalVotes += 1;
        newVoteStatus = null;
      } else {
        downvotes += 1;
        totalVotes -= 1;
        if (userVoted === 'upvote') {
          upvotes = Math.max(0, upvotes - 1);
          totalVotes -= 1; // Since we changed from +1 to -1
        }
        newVoteStatus = 'downvote';
      }
    }

    // Determine which columns to update based on what exists in the table row
    if ('upvotes' in q) updateData.upvotes = upvotes;
    if ('downvotes' in q) updateData.downvotes = downvotes;
    if ('votes' in q) updateData.votes = totalVotes;
    if ('user_voted' in q) updateData.user_voted = newVoteStatus;

    const { data: updated, error: updateError } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      ...updated,
      userVote: updated.user_voted,
      // Ensure frontend gets values even if columns don't exist
      upvotes: updated.upvotes ?? (updated.votes > 0 ? updated.votes : 0),
      downvotes: updated.downvotes ?? (updated.votes < 0 ? Math.abs(updated.votes) : 0),
    });

  } catch (err) {
    console.error('Error in handleVoteQuestion:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { getQuestions, postQuestion, addComment, handleVoteQuestion };