import React, { useState } from "react";
import axios from "../../api";
import {
  FileText,
  Upload,
  X,
} from "lucide-react";

export interface Resource {
  id?: number;
  title: string;
  description: string;
  author: string;
  company: string;
  type: string;
  format: string;
  rating: number;
  file?: File;
  fileUrl?: string;
}

const resourceTypes = [
  { value: "Interview Questions", label: "Interview Questions" },
  { value: "Coding Challenges", label: "Coding Challenges" },
  { value: "Resume Templates", label: "Resume Templates" },
  { value: "Video Tutorials", label: "Video Tutorials" },
  { value: "MCQ Tests", label: "MCQ Tests" },
  { value: "Study Guides", label: "Study Guides" },
  { value: "Cheat Sheets", label: "Cheat Sheets" },
  { value: "Project Ideas", label: "Project Ideas" },
];

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

interface ResourceUploadProps {
  open?: boolean;
  onClose?: () => void;
  onAddResource?: () => void;
}

const ResourceUpload: React.FC<ResourceUploadProps> = ({ open, onClose, onAddResource }) => {
  if (open === false) return null;
  const [formData, setFormData] = useState<Resource>({
    title: "",
    description: "",
    author: "",
    company: "",
    type: "Interview Questions",
    format: "PDF",
    rating: 4.5,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" && { format: formatOptions[value][0] }),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title)
        setFormData((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
        }));
    }
  };

  // ✅ Handle form submit with Axios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.author) {
      alert("Please fill all required fields");
      return;
    }
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare form data for backend
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("author", formData.author);
      data.append("company", formData.company);
      data.append("type", formData.type);
      data.append("format", formData.format);
      data.append("rating", String(formData.rating));
      data.append("file", selectedFile);

      // ✅ Upload to backend
      const res = await axios.post("/api/admin/resources/upload", data, {
        headers: { "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
      });

      alert("✅ Resource uploaded successfully!");
      console.log("Response:", res.data);
      setFormData({
        title: "",
        description: "",
        author: "",
        company: "",
        type: "Interview Questions",
        format: "PDF",
        rating: 4.5,
      });
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
      if (onAddResource) onAddResource();
    }
  };

  const formats = formatOptions[formData.type] || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      )}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Upload a New Resource</h1>
            <p className="text-gray-500 text-sm">
              Share learning materials or useful resources with others.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type & Format */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {resourceTypes.map((t) => (
                  <option key={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format *
              </label>
              <select
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {formats.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., System Design Cheatsheet"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Your name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g., Google, Microsoft"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Brief description of the resource"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>  
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept={
                  formData.format === "PDF"
                    ? ".pdf"
                    : formData.format === "DOCX"
                    ? ".docx"
                    : formData.format === "ZIP"
                    ? ".zip"
                    : formData.format === "Image(PNG, JPG, JPEG)"
                    ? ".png, .jpg, .jpeg"
                    : "PDF"
                }
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">
                  {selectedFile ? selectedFile.name : "Click to upload file"}
                </p>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Upload Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceUpload;