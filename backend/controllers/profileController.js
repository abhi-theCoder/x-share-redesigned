const { supabase } = require('../services/supabase.js');

async function getProfile(req, res) {
  const userId = req.userId; // Assuming userId is set by an auth middleware

  try {
    // Fetch user details from the 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return res.status(404).json({ message: 'User not found.' });
      }
      throw userError;
    }

    // ✅ Remove sensitive fields
    if (userData?.password) {
      delete userData.password;
    }

    // ✅ Build stats dynamically from DB columns
    const stats = [
      { label: 'Total Points', value: userData.points || 0, icon: 'Star', color: 'from-yellow-400 to-yellow-600' },
      { label: 'Contributions', value: userData.total_contributions || 0, icon: 'BookOpen', color: 'from-blue-400 to-blue-600' },
      { label: 'Questions Asked', value: userData.questions_asked || 0, icon: 'MessageCircle', color: 'from-green-400 to-green-600' },
      { label: 'Likes Received', value: userData.likes_received || 0, icon: 'Heart', color: 'from-red-400 to-red-600' },
    ];

    // ✅ Example: Fetch recent activity (if you create a table `activities`)
    let recentActivity = [];
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('id, type, title, points, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!activityError && activityData) {
      recentActivity = activityData.map(act => ({
        id: act.id,
        type: act.type,
        title: act.title,
        points: act.points > 0 ? `+${act.points}` : act.points,
        timeAgo: new Date(act.created_at).toLocaleDateString(),
      }));
    }

    // ✅ Example: Fetch achievements (if you create a table `achievements`)
    let achievements = [];
    const { data: achievementData, error: achievementError } = await supabase
      .from('achievements')
      .select('title, description, icon, earned')
      .eq('user_id', userId);

    if (!achievementError && achievementData) {
      achievements = achievementData;
    }

    const profileData = {
      ...userData,
      stats,
      recentActivity,
      achievements,
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * Update user profile data.
 */
async function updateProfile(req, res) {
  const userId = req.userId; // Assuming userId is set by an auth middleware
  const { name, role, company, location, bio } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, role, company, location, bio })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Profile updated successfully.', data });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

//To share profile publicly
async function getPublicProfile(req, res) {
  const {userId} = req.params; // Assuming userId is set by an auth middleware

  try {
    // Fetch user details from the 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return res.status(404).json({ message: 'User not found.' });
      }
      throw userError;
    }

    // ✅ Remove sensitive fields
    if (userData?.password) {
      delete userData.password;
    }

    // ✅ Build stats dynamically from DB columns
    const stats = [
      { label: 'Total Points', value: userData.points || 0, icon: 'Star', color: 'from-yellow-400 to-yellow-600' },
      { label: 'Contributions', value: userData.total_contributions || 0, icon: 'BookOpen', color: 'from-blue-400 to-blue-600' },
      { label: 'Questions Asked', value: userData.questions_asked || 0, icon: 'MessageCircle', color: 'from-green-400 to-green-600' },
      { label: 'Likes Received', value: userData.likes_received || 0, icon: 'Heart', color: 'from-red-400 to-red-600' },
    ];

    // ✅ Example: Fetch recent activity (if you create a table `activities`)
    let recentActivity = [];
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('id, type, title, points, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!activityError && activityData) {
      recentActivity = activityData.map(act => ({
        id: act.id,
        type: act.type,
        title: act.title,
        points: act.points > 0 ? `+${act.points}` : act.points,
        timeAgo: new Date(act.created_at).toLocaleDateString(),
      }));
    }

    // ✅ Example: Fetch achievements (if you create a table `achievements`)
    let achievements = [];
    const { data: achievementData, error: achievementError } = await supabase
      .from('achievements')
      .select('title, description, icon, earned')
      .eq('user_id', userId);

    if (!achievementError && achievementData) {
      achievements = achievementData;
    }

    const profileData = {
      ...userData,
      stats,
      recentActivity,
      achievements,
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = { getProfile, updateProfile, getPublicProfile };