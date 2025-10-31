const { supabase } = require('../services/supabase.js');


// Fetch all jobs
exports.getJobs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ jobs: data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Fetch job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json({ job: data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};