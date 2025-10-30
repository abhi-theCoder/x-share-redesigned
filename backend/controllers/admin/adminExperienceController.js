const {supabase} = require('../../services/supabase.js');

// 🧠 Controller: Fetch all experiences with user details
async function getExperiences(req, res) {
  try {
    // Select all fields from the 'experiences' table (*) and join with the 'users' table
    // to get all of its fields (*) using the foreign key relationship.
    const { data: experiences, error } = await supabase
      .from('experiences')
      .select('*, users(*)');

    if (error) {
      throw error;
    }

    res.status(200).json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

//change status of experience to approved, rejected or revert to pending if its approved or rejected

async function updateExperienceStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['approved', 'rejected', 'pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    // Step 1: Update experience status
    const { data: experience, error } = await supabase
      .from('experiences')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating experience status:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found.' });
    }

    // Step 2: Fetch user
    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('points')
      .eq('id', experience.user_id)
      .single();

    if (userFetchError || !user) {
      console.error('Error fetching user points:', userFetchError);
      return res.status(500).json({ message: 'Failed to fetch user data.' });
    }
    
    let newPoints = user.points;

    // Step 3: Adjust points based on status
    if (status === 'approved') {
      newPoints += 50;
    } else if (status === 'pending') {
      newPoints -= 50;
    }

    // Step 4: Update user points
    const { error: updatePointsError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', experience.user_id);

    if (updatePointsError) {
      console.error('Error updating user points:', updatePointsError);
    }

    // Step 5: Send final response
    res.status(200).json({
      message: 'Experience status updated successfully.',
      experience,
      updatedPoints: newPoints,
    });
  } catch (err) {
    console.error('Error in updateExperienceStatus:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// 🧠 Controller: Update experience data (for admin or owner)
async function updateExperienceData(req, res) {
  const { id } = req.params; // Experience ID
  const updatedFields = req.body; // Updated data fields

  if (!id) {
    return res.status(400).json({ message: 'Experience ID is required.' });
  }

  // Optional: Prevent malicious updates to protected fields
  const disallowedFields = ['id', 'user_id', 'created_at', 'upvotes', 'downvotes', 'comments_count'];
  for (const field of disallowedFields) {
    if (field in updatedFields) {
      delete updatedFields[field];
    }
  }

  try {
    // 📝 Update the experience record
    const { data, error } = await supabase
      .from('experiences')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating experience data:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Experience not found.' });
    }

    res.status(200).json({
      message: 'Experience data updated successfully.',
      updatedExperience: data,
    });
  } catch (err) {
    console.error('Error in updateExperienceData:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  updateExperienceStatus,
  updateExperienceData,
  getExperiences
};
