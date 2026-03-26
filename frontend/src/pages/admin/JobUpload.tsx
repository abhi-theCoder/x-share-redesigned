import React, { useState } from "react";

import axios from "../../api";
import {
  Briefcase,
  Building,
  MapPin,
  Clock,
  Monitor,
  User,
  DollarSign,
  FileText,
  Link,
  X,
} from "lucide-react";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  type: "Full-time" | "Internship";
  mode: "On-site" | "Remote" | "Hybrid";
  experienceYears: number;
  salaryLPA: number;
  rating: number;
  applicants: number;
  timeline?: string;
  createdAt?: string;
}

interface JobUploadProps {
  open?: boolean;
  onClose?: () => void;
  onAddJob?: () => void;
}

const JobUpload: React.FC<JobUploadProps> = ({ open, onClose, onAddJob }) => {
  if (open === false) return null;
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time" as "Full-time" | "Internship",
    mode: "On-site" as "On-site" | "Remote" | "Hybrid",
    experienceYears: 0,
    salaryLPA: 0,
    description: "",
    url: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let url = formData.url.trim();

    // ✅ Automatically prepend https:// if missing
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    // ✅ Validate final URL
    const urlPattern =
      /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[\w-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

    if (!urlPattern.test(url)) {
      setLoading(false);
      setMessage({
        type: "error",
        text: "❌ Please enter a valid job URL (e.g., https://company.com/careers/job-id)",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/admin/jobs",
        {
          title: formData.title,
          company: formData.company,
          location: formData.location,
          type: formData.type,
          mode: formData.mode,
          experienceYears: formData.experienceYears,
          salaryLPA: formData.salaryLPA,
          rating: 4.5,
          description: formData.description,
          url,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        setMessage({ type: "success", text: "✅ Job posted successfully!" });
        setFormData({
          title: "",
          company: "",
          location: "",
          type: "Full-time",
          mode: "On-site",
          experienceYears: 0,
          salaryLPA: 0,
          description: "",
          url: "",
        });
      }
    } catch (err: any) {
      console.error("Error posting job:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "❌ Error posting job",
      });
    } finally {
      setLoading(false);
      if (onAddJob) onAddJob();
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow p-6 mt-6 relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      )}
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 text-sm">Create a job listing to attract top talent.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title & Company */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" /> Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
              placeholder="e.g., Software Engineer"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /> Company *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
              placeholder="e.g., Google"
            />
          </div>
        </div>

        {/* Location, Type, Mode */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Location *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
              placeholder="e.g., Bangalore"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Job Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as "Full-time" | "Internship" })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
            >
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-600" /> Work Mode *
            </label>
            <select
              value={formData.mode}
              onChange={(e) =>
                setFormData({ ...formData, mode: e.target.value as "On-site" | "Remote" | "Hybrid" })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
            >
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Experience & Salary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Experience (Years) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.experienceYears}
              onChange={(e) =>
                setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
              placeholder="e.g., 2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" /> Salary (LPA) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.salaryLPA}
              onChange={(e) =>
                setFormData({ ...formData, salaryLPA: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
              placeholder="e.g., 15"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Job Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
            placeholder="Describe the job responsibilities, requirements, and benefits..."
          />
        </div>
        {/* Job URL */}
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Link className="w-4 h-4 text-blue-600" /> Job URL *
          </label>
          <input
            type="text"
            required
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
            placeholder="e.g., https://company.com/careers/job-id"
          />
        </div>
        {/* Status message */}
        {message && (
          <p
            className={`text-sm ${
              message.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobUpload;
