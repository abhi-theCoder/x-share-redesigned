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
  X,
} from "lucide-react";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  type: "Full-time" | "Internship";
  mode: "On-site" | "Remote" | "Hybrid";
  experienceYears: number;
  salaryLPA: number;
  rating: number;
  applicants: number;
  timeline?: string;
  createdAt?: string;
}

interface PostJobFormProps {
  open: boolean;
  onClose: () => void;
  onAddJob: (job: JobListing) => void;
}

const PostJobForm: React.FC<PostJobFormProps> = ({ open, onClose, onAddJob }) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time" as "Full-time" | "Internship",
    mode: "On-site" as "On-site" | "Remote" | "Hybrid",
    experienceYears: 0,
    salaryLPA: 0,
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token"); // ✅ get from storage

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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201) {
        setSuccessMsg("✅ Job posted successfully!");
        onAddJob(res.data.job); // update parent state
        handleClose();
      }
    } catch (err: any) {
      console.error("Error posting job:", err);
      setErrorMsg(err.response?.data?.message || "Error posting job");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      mode: "On-site",
      experienceYears: 0,
      salaryLPA: 0,
      description: "",
    });
    setErrorMsg("");
    setSuccessMsg("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Create a new job listing to attract top talent
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Company *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, company: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Google"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Bangalore"
                />
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Job Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as "Full-time" | "Internship",
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Work Mode */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  Work Mode *
                </label>
                <select
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mode: e.target.value as "On-site" | "Remote" | "Hybrid",
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceYears: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., 2"
                />
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Salary (LPA) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.salaryLPA}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryLPA: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., 20"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Job Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Describe the job responsibilities, requirements, and benefits..."
              />
            </div>

            {/* Status Messages */}
            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <Briefcase className="w-4 h-4" />
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJobForm;