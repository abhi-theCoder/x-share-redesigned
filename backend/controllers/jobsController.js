const { supabase } = require('../services/supabase.js');


// Fetch all jobs with pagination & search
exports.getJobs = async (req, res) => {
  try {
    // --- Extract query params ---
    const page = parseInt(req.query.page) || 1;          // default 1
    const limit = parseInt(req.query.limit) || 10;       // default 10
    const search = req.query.search ? req.query.search.trim() : "";

    const offset = (page - 1) * limit;

    // --- Base query ---
    let query = supabase
      .from("jobs")
      .select("*", { count: "exact" }) // includes total count for pagination
      .order("created_at", { ascending: false });

    // --- Apply search ---
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,company.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    // --- Apply pagination ---
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // --- Total pages ---
    const totalPages = Math.ceil((count || 0) / limit);

    res.status(200).json({
      jobs: data,
      pagination: {
        currentPage: page,
        totalPages,
        totalJobs: count,
        limit,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching jobs", error: error.message });
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