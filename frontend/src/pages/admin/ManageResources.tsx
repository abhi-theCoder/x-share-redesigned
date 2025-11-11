import React, { useEffect, useState } from "react";
import axios from "../../api";
import {
  FileText,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Save,
  X,
} from "lucide-react";

interface Resource {
  id: number;
  title: string;
  description: string;
  author: string;
  company: string;
  type: string;
  format: string;
  file_url: string;
  created_at?: string;
}

const formatOptions: Record<string, string[]> = {
  "Interview Questions": ["PDF", "DOCX", "ZIP", "Image(PNG, JPG, JPEG)"],
  "Coding Challenges": ["PDF", "DOCX", "ZIP", "Image(PNG, JPG, JPEG)"],
  "Resume Templates": ["PDF", "DOCX", "ZIP", "Image(PNG, JPG, JPEG)"],
  "Video Tutorials": ["MP4", "MOV", "AVI"],
  "MCQ Tests": ["PDF", "DOCX", "ZIP", "Image(PNG, JPG, JPEG)"],
  "Study Guides": ["PDF", "DOCX", "ZIP", "Image(PNG, JPG, JPEG)"],
  "Cheat Sheets": ["PDF", "DOCX", "ZIP", "Image(PNG, JPG, JPEG)"],
  "Project Ideas": ["PDF", "DOCX", "ZIP", "Image(PNG, JPG, JPEG)"],
};

const ManageResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all resources
  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/resources", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setResources(res.data.resources || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await axios.delete(`/api/admin/resources/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setResources((prev) => prev.filter((r) => r.id !== id));
      alert("✅ Resource deleted successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete resource");
    }
  };

  const startEdit = (res: Resource) => {
    setEditing(res);
    setSelectedFile(null);
  };
  const cancelEdit = () => {
    setEditing(null);
    setSelectedFile(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editing) return;
    const { name, value } = e.target;

    // If type changes, reset format
    if (name === "type") {
      setEditing({ ...editing, type: value, format: "" });
    } else {
      setEditing({ ...editing, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  // Save
  const handleSave = async () => {
    if (!editing) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", editing.title);
      formData.append("description", editing.description);
      formData.append("author", editing.author);
      formData.append("company", editing.company);
      formData.append("type", editing.type);
      formData.append("format", editing.format);
      if (selectedFile) formData.append("file", selectedFile);

      const res = await axios.put(`/api/admin/resources/${editing.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setResources((prev) =>
        prev.map((r) => (r.id === editing.id ? res.data.resource : r))
      );
      setEditing(null);
      alert("✅ Resource updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update resource");
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic accept file type
  const getAcceptForFormat = (format: string) => {
    switch (format) {
      case "PDF":
        return ".pdf";
      case "DOCX":
        return ".docx";
      case "ZIP":
        return ".zip";
      case "Image(PNG, JPG, JPEG)":
        return ".png,.jpg,.jpeg";
      case "MP4":
        return ".mp4";
      case "MOV":
        return ".mov";
      case "AVI":
        return ".avi";
      default:
        return "*";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-semibold">Manage Resources</h1>
          </div>
          <button
            onClick={fetchResources}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-500 mt-3">Fetching resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <p className="text-center text-gray-500">No resources found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-700">
                  <th className="p-3">Title</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">File</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{r.title}</td>
                    <td className="p-3">{r.author}</td>
                    <td className="p-3">{r.company}</td>
                    <td className="p-3">{r.type}</td>
                    <td className="p-3">{r.format}</td>
                    <td className="p-3">
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" /> View
                      </a>
                    </td>
                    <td className="p-3 flex gap-3">
                      <button onClick={() => startEdit(r)} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📝 Edit Modal */}
        {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                Edit Resource
                <button onClick={cancelEdit}>
                <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
            </h2>

            <form
                onSubmit={(e) => {
                e.preventDefault();
                handleSave();
                }}
                className="grid grid-cols-2 gap-4"
            >
                <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                    type="text"
                    name="title"
                    value={editing.title}
                    onChange={handleChange}
                    required
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                </div>

                <div>
                <label className="block text-sm font-medium mb-1">Author *</label>
                <input
                    type="text"
                    name="author"
                    value={editing.author}
                    onChange={handleChange}
                    required
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                </div>

                <div>
                <label className="block text-sm font-medium mb-1">Company *</label>
                <input
                    type="text"
                    name="company"
                    value={editing.company}
                    onChange={handleChange}
                    required
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                </div>

                <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                    name="type"
                    value={editing.type}
                    onChange={handleChange}
                    required
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Type</option>
                    {Object.keys(formatOptions).map((t) => (
                    <option key={t} value={t}>
                        {t}
                    </option>
                    ))}
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium mb-1">Format *</label>
                <select
                    name="format"
                    value={editing.format}
                    onChange={(e) => {
                    handleChange(e);
                    setSelectedFile(null); // reset file if format changes
                    }}
                    required
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!editing.type}
                >
                    <option value="">Select Format</option>
                    {editing.type &&
                    formatOptions[editing.type].map((fmt) => (
                        <option key={fmt} value={fmt}>
                        {fmt}
                        </option>
                    ))}
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium mb-1">Replace File *</label>
                <input
                    type="file"
                    accept={getAcceptForFormat(editing.format)}
                    onChange={handleFileChange}
                    required
                    className="border border-gray-300 rounded-lg p-2 w-full"
                />
                </div>

                <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                    name="description"
                    value={editing.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
                </div>

                <div className="col-span-2 flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                    <Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
                </div>
            </form>
            </div>
        </div>
        )}

    </div>
  );
};

export default ManageResources;
