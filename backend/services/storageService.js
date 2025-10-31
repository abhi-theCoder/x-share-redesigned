const { supabase } = require("./supabase");
const BUCKET = process.env.SUPABASE_BUCKET;

exports.StorageService = {
  async uploadFile(file) {
    if (!file) throw new Error("File missing");
    
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_"); // replaces spaces/symbols with underscores
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
    const filePath = `resources/${uniqueName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return {
      fileName: uniqueName,
      filePath,
      fileUrl: publicUrl,
    };
  },

  async deleteFile(filePath) {
    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (error) throw error;
    return true;
  },
};