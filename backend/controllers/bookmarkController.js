// controllers/bookmarkController.js
const { supabase } = require('../services/supabase.js');

// --- helper functions ---
const getUserBookmarks = async (userId) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('experience_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(b => b.experience_id);
};

const addUserBookmark = async (userId, experienceId) => {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, experience_id: experienceId });

  if (error) throw error;
  return true;
};

const removeUserBookmark = async (userId, experienceId) => {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('experience_id', experienceId);

  if (error) throw error;
  return true;
};

const getUserBookmarkedExperiences = async (userId) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      experience:experience_id (
        *,
        users ( name )
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase query error:', error);
    throw error;
  }

  // The join returns an array of objects like { experience: { ...full_experience_data } }
  // We map over this to return a clean array of experience objects.
  return data.map(item => item.experience);
};

// --- Express route handlers ---
const getBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const bookmarks = await getUserBookmarks(userId);
    return res.json(bookmarks.map(id => ({ experienceId: id })));
  } catch (error) {
    console.error('Error fetching bookmarks:', error.message);
    return res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

const getBookmarkedExperiences = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const experiences = await getUserBookmarkedExperiences(userId);
    return res.json(experiences);
  } catch (error) {
    console.error('Error fetching bookmarked experiences:', error.message);
    return res.status(500).json({ error: 'Failed to fetch bookmarked experiences' });
  }
};

const addBookmark = async (req, res) => {
  try {
    const userId = req.userId;
    const { experienceId } = req.body;
    if (!userId || !experienceId) return res.status(400).json({ error: 'Missing fields' });

    await addUserBookmark(userId, experienceId);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error adding bookmark:', error.message);
    return res.status(500).json({ error: 'Failed to add bookmark' });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const { experienceId } = req.body;
    const userId = req.userId;
    if (!userId || !experienceId) return res.status(400).json({ error: 'Missing fields' });

    await removeUserBookmark(userId, experienceId);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error.message);
    return res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};

module.exports = { getBookmarks, addBookmark, removeBookmark, getBookmarkedExperiences };