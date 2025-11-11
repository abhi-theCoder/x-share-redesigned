const {supabase} = require('../../services/supabase');

// Upload new job details
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      mode,
      experienceYears,
      salaryLPA,
      rating,
      description,
      url,
    } = req.body;

    // Basic validation
    if (!title || !company || !location || !type || !mode || !description || !url) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          title,
          company,
          location,
          type,
          mode,
          experienceYears,
          salaryLPA,
          rating,
          description,
          url,
          created_at: new Date()
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'Job uploaded successfully!', job: data[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading job', error: error.message });
  }
};

// ✅ Update a job by ID
exports.updateJob = async (req, res) => {
    console.log("object")
  const { id } = req.params;
  const {
    title,
    company,
    location,
    type,
    mode,
    experienceYears,
    salaryLPA,
    rating,
    description,
  } = req.body;

  try {
    // check job exists
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    // update job
    const { data, error } = await supabase
      .from("jobs")
      .update({
        title,
        company,
        location,
        type,
        mode,
        experienceYears,
        salaryLPA,
        rating,
        description,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return res.status(200).json({
      message: "✅ Job updated successfully",
      job: data[0],
    });
  } catch (error) {
    console.error("Error updating job:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};