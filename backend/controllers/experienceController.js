const { supabase } = require('../services/supabase.js');

const POINTS_PER_EXPERIENCE = 50;

async function shareExperience(req, res) {
  const userId = req.userId; // Get user ID from the JWT payload added by the middleware
  const experienceData = req.body;
  console.log(req.body);
  try {
    // Save the new experience to a 'experiences' table
    const { data: newExperience, error: insertError } = await supabase
      .from('experiences')
      .insert([{
        ...experienceData,
        user_id: userId,
        status: 'pending', // New experiences are pending approval
        upvotes: 0,
        downvotes: 0,
        comments_count: 0,
        user_voted: null // No votes yet
      }])
      .select();

    if (insertError) {
      throw insertError;
    }

    // 2️⃣ Fetch user's total points
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newPoints = (userData.points || 0) + POINTS_PER_EXPERIENCE;

    // 3️⃣ Update user's total points
    const { error: updateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);

    if (updateError) throw updateError;

    // 4️⃣ Check if an activity already exists for today
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    const { data: existingActivity, error: fetchActivityError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .eq('type', 'share_experience')
      .single();

    if (fetchActivityError && fetchActivityError.code !== 'PGRST116') {
      // PGRST116 = No rows found
      throw fetchActivityError;
    }

    if (existingActivity) {
      // 5️⃣ Update existing activity (increment points and count)
      const { error: updateActivityError } = await supabase
        .from('activities')
        .update({
          points: existingActivity.points + POINTS_PER_EXPERIENCE,
          num_of_activities: existingActivity.num_of_activities + 1,
        })
        .eq('id', existingActivity.id);

      if (updateActivityError) throw updateActivityError;

    } else {
      // 6️⃣ Insert new activity record for today
      const { error: insertActivityError } = await supabase
        .from('activities')
        .insert([{
          user_id: userId,
          type: 'share_experience',
          title: newExperience[0]?.title || 'Experience Shared',
          points: POINTS_PER_EXPERIENCE,
          num_of_activities: 1,
          date: today
        }]);

      if (insertActivityError) throw insertActivityError;
    }

    res.status(201).json({
      message: 'Experience shared successfully!',
      experience: newExperience[0],
      pointsEarned: POINTS_PER_EXPERIENCE,
      newTotalPoints: newPoints
    });
  } catch (error) {
    console.error('Error sharing experience:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

async function getExperiences(req, res) {
  try {
    // Select all fields from the 'experiences' table (*) and join with the 'users' table
    // to get all of its fields (*) using the foreign key relationship.
    const { data: experiences, error } = await supabase
      .from('experiences')
      .select('*, users(*)')
      .eq('status', 'approved'); // Only fetch approved experiences
      
    if (error) {
      throw error;
    }

    res.status(200).json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// controllers/experienceController.js
// Existing getSingleExperience function (completed previously)
async function getSingleExperience(req, res) {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*, users(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Experience not found.' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error in getSingleExperience:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// New function to get all comments for a specific experience
async function getComments(req, res) {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(name)') // Join with users to get the commenter's name
      .eq('experience_id', id)
      .order('created_at', { ascending: true }); // Order by date

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error in getComments:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// New function to add a comment
async function addComment(req, res) {
  const { id } = req.params;
  const { userId, commentText } = req.body;
  try {
    // Insert the new comment into the comments table
    const { data: newComment, error: commentError } = await supabase
      .from('comments')
      .insert({ experience_id: id, user_id: userId, comment_text: commentText })
      .select();

    if (commentError) {
      console.error('Error adding comment:', commentError);
      return res.status(500).json({ message: 'Failed to add comment.' });
    }

    // Increment the comments_count in the experiences table
    const { data: updatedExperience, error: updateError } = await supabase
      .from('experiences')
      .update({ comments_count: (await supabase.from('experiences').select('comments_count').eq('id', id).single()).data.comments_count + 1 })
      .eq('id', id)
      .select();
    
    if (updateError) {
      console.error('Error updating comments count:', updateError);
    }
    
    res.status(201).json(newComment[0]);
  } catch (err) {
    console.error('Error in addComment:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// New function to handle voting (upvotes and downvotes)
// New function to handle voting (upvotes and downvotes)
async function handleVote(req, res) {
  const { id } = req.params;
  const { userId, voteType } = req.body;
  
  try {
    const { data: experience, error: fetchError } = await supabase
      .from('experiences')
      .select('upvotes, downvotes, user_voted')
      .eq('id', id)
      .single();

    if (fetchError || !experience) {
      console.error('Error fetching experience for voting:', fetchError);
      return res.status(404).json({ message: 'Experience not found.' });
    }

    let upvotes = experience.upvotes;
    let downvotes = experience.downvotes;
    const userVoted = experience.user_voted; // The current vote status from the database

    let updatedExperience = {};
    let newVoteStatus = null; // The new status to be saved

    // Determine the new vote status based on the user's action
    if (voteType === 'upvote') {
      if (userVoted === 'upvote') {
        // User is un-voting an upvote
        upvotes -= 1;
        newVoteStatus = null;
      } else {
        // User is upvoting or changing from a downvote
        upvotes += 1;
        if (userVoted === 'downvote') {
          downvotes -= 1;
        }
        newVoteStatus = 'upvote';
      }
    } else if (voteType === 'downvote') {
      if (userVoted === 'downvote') {
        // User is un-voting a downvote
        downvotes -= 1;
        newVoteStatus = null;
      } else {
        // User is downvoting or changing from an upvote
        downvotes += 1;
        if (userVoted === 'upvote') {
          upvotes -= 1;
        }
        newVoteStatus = 'downvote';
      }
    }

    // Prepare the update payload for Supabase
    updatedExperience.upvotes = upvotes;
    updatedExperience.downvotes = downvotes;
    // Map the new status to the database field name
    updatedExperience.user_voted = newVoteStatus;

    const { data, error } = await supabase
      .from('experiences')
      .update(updatedExperience)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vote:', error);
      return res.status(500).json({ message: 'Failed to update vote.' });
    }

    // Map the database response to the frontend's expected format
    const responseData = {
      ...data,
      userVote: data.user_voted,
    };

    res.status(200).json(responseData);

  } catch (err) {
    console.error('Error in handleVote:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// You must export all functions you want to use in your routes
module.exports = { shareExperience, getExperiences, getSingleExperience, getComments, addComment, handleVote };