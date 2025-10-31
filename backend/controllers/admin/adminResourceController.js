const { StorageService } = require("../../services/storageService.js");
const {supabase} = require('../../services/supabase');

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

// Upload resource
const uploadResource = async (req, res) => {
  try {
    const { title, description, author, company, type, format } = req.body;
    const file = req.file;

    const { fileUrl, filePath } = await StorageService.uploadFile(file);

    const { data, error } = await supabase
      .from("resources")
      .insert([
        {
          title,
          description,
          author,
          company,
          type,
          format,
          file_url: fileUrl,
          file_path: filePath, // optional but useful for deletion
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, resource: data });
  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✏️ Update resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, author, company, type, format } = req.body;
    const file = req.file;

    let updatedFields = {
      title,
      description,
      author,
      company,
      type,
      format,
    };

    // if a new file is uploaded, replace it
    if (file) {
      // get old resource to delete old file
      const { data: oldResource, error: fetchErr } = await supabase
        .from("resources")
        .select("file_path")
        .eq("id", id)
        .single();

      if (fetchErr) throw fetchErr;

      // delete old file from storage
      if (oldResource?.file_path) {
        await StorageService.deleteFile(oldResource.file_path);
      }

      // upload new file
      const { fileUrl, filePath } = await StorageService.uploadFile(file);
      updatedFields.file_url = fileUrl;
      updatedFields.file_path = filePath;
    }

    const { data, error } = await supabase
      .from("resources")
      .update(updatedFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, resource: data });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🗑️ Delete resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    // fetch resource to delete file
    const { data: resource, error: fetchErr } = await supabase
      .from("resources")
      .select("file_path")
      .eq("id", id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // delete file from storage
    if (resource.file_path) {
      await StorageService.deleteFile(resource.file_path);
    }

    // delete row from database
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) throw error;

    res.json({ success: true, message: "Resource deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
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
  uploadResource,
  updateResource,
  deleteResource,
  rateResource,
  incrementDownload,
};