const { supabase } = require('../services/supabase.js');

// Fetch all resources
const getAllResources = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    res.json({ success: true, resources: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Rate resource
const rateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const { data: existing } = await supabase
      .from("resources")
      .select("rating, total_ratings")
      .eq("id", id)
      .single();

    const newTotal = existing.total_ratings + 1;
    const newRating =
      (existing.rating * existing.total_ratings + rating) / newTotal;

    const { data, error } = await supabase
      .from("resources")
      .update({ rating: newRating, total_ratings: newTotal })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, resource: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Increment download count
const incrementDownload = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from("resources")
      .select("downloads")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("resources")
      .update({ downloads: existing.downloads + 1 })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, resource: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllResources,
  rateResource,
  incrementDownload,
};