import React, { useState, useEffect } from "react";
import axios from "../../api";
import {
  Briefcase,
  Building,
  MapPin,
  Clock,
  GraduationCap,
  DollarSign,
  FileText,
  Link,
  X,
  Laptop, // Icon for Work Mode
  CheckCircle, // For success message
  AlertCircle // For error message
} from "lucide-react";
import { JobListing } from "./JobUpload"; // Assuming JobListing now includes workMode and jobURL

// Extend JobListing to ensure new fields are available, with appropriate defaults
interface UpdateJobFormProps {
  open: boolean;
  job: JobListing | null;
  onClose: () => void;
  onUpdate: (updatedJob: JobListing) => void;
}

const UpdateJobForm: React.FC<UpdateJobFormProps> = ({
  open,
  job,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<JobListing | null>(job); // State can be null initially
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    // Ensure default values for new fields if the existing job doesn't have them
    if (job) {
      setFormData({
        ...job,
        mode: job.mode || "On-site", // Default to On-site if not present
        url: job.url || "",
        // Assuming experienceYears corresponds to Experience (Years) as a number
        experienceYears: job.experienceYears || 0, // Default to 0 years
        salaryLPA: job.salaryLPA || 0, // Default to 0 LPA
      });
    } else {
      setFormData(null);
    }
  }, [job]);

  if (!open || !formData) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setMsgType("");

    // Basic validation
    if (!formData.title || !formData.company || !formData.location || !formData.type || !formData.mode || !formData.description || !formData.url) {
      setMsg("Please fill in all required fields.");
      setMsgType("error");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`/api/admin/jobs/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setMsg("✅ Job updated successfully!");
        setMsgType("success");
        onUpdate(res.data.job);
        // Optionally close after a short delay or let user close manually
        // setTimeout(onClose, 2000);
      }
    } catch (error: any) {
      console.error("Error updating job:", error);
      setMsg(error.response?.data?.message || "Error updating job. Please try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
            <Briefcase className="w-7 h-7 text-indigo-600 mr-3" />
            Update Job Listing
          </h2>
          <p className="text-gray-600 text-sm">
            Modify this job listing to attract top talent.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Briefcase className="w-4 h-4 mr-1 text-gray-500" />
                Job Title <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Building className="w-4 h-4 mr-1 text-gray-500" />
                Company <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="e.g., Google"
                required
              />
            </div>
          </div>

          {/* Location, Job Type, Work Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                Location <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="e.g., Bangalore or Remote"
                required
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                Job Type <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              >
                <option value="">Select Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Laptop className="w-4 h-4 mr-1 text-gray-500" />
                Work Mode <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              >
                <option value="">Select Work Mode</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Experience & Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <GraduationCap className="w-4 h-4 mr-1 text-gray-500" />
                Experience (Years) <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                id="experienceYears"
                name="experienceYears"
                value={formData.experienceYears || 0}
                onChange={handleNumberChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="salaryLPA" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                Salary (LPA) <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                id="salaryLPA"
                name="salaryLPA"
                value={formData.salaryLPA || 0}
                onChange={handleNumberChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="0"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-gray-500" />
              Job Description <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
              rows={5}
              placeholder="Describe the job responsibilities, requirements, and benefits..."
              required
            />
          </div>

          {/* Job URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Link className="w-4 h-4 mr-1 text-gray-500" />
              Job URL <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g., https://company.com/careers/job-id"
              required
            />
          </div>

          {/* Message Display */}
          {msg && (
            <div
              className={`flex items-center p-3 rounded-md text-sm ${
                msgType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {msgType === "success" ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              {msg}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className={`px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ${
                loading && "opacity-70 cursor-not-allowed"
              }`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateJobForm;