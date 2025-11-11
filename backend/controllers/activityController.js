const { supabase } = require('../services/supabase.js');
const dayjs = require('dayjs');

/**
 * @desc Fetch all activities (last 1 year)
 * @route GET /api/activity
 */
const getActivityData = async (req, res) => {
  try {
    const userId = req.userId;
    const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('date', oneYearAgo)
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching activity:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Add or increment activity count
 * @route POST /api/activity/add
 */
const addActivity = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, increment = 1 } = req.body;

    // Check if activity exists for this user on that date
    const { data: existing, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      const updatedCount = existing.num_of_activities + increment;
      const { data: updated, error: updateError } = await supabase
        .from('activities')
        .update({ num_of_activities: updatedCount })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      res.json({ message: 'Activity updated', data: updated });
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('activities')
        .insert([{ user_id: userId, date, num_of_activities: increment }])
        .select()
        .single();

      if (insertError) throw insertError;
      res.json({ message: 'Activity created', data: inserted });
    }
  } catch (err) {
    console.error('Error adding activity:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


//Get Public Activity Data
const getPublicActivityData = async (req, res) => {
  try {
    const {userId} = req.params;
    const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('date', oneYearAgo)
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching activity:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


module.exports = { getActivityData, addActivity, getPublicActivityData };