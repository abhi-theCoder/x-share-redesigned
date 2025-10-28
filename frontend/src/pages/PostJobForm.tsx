// src/pages/PostJobForm.tsx
import React, { useState } from "react";

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
    title: '',
    company: '',
    location: '',
    type: 'Full-time' as "Full-time" | "Internship",
    mode: 'On-site' as "On-site" | "Remote" | "Hybrid",
    experienceYears: 0,
    salaryLPA: 0,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob: JobListing = {
      id: `job-${Date.now()}`,
      title: formData.title,
      company: formData.company,
      location: formData.location,
      type: formData.type,
      mode: formData.mode,
      experienceYears: formData.experienceYears,
      salaryLPA: formData.salaryLPA,
      rating: 4.5,
      description: formData.description,
      applicants: 0,
      createdAt: new Date().toISOString()
    };

    onAddJob(newJob);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      mode: 'On-site',
      experienceYears: 0,
      salaryLPA: 0,
      description: ''
    });
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
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">Post a New Job</h2>
            <button 
              onClick={handleClose}
              className="text-zinc-500 hover:text-zinc-700 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Company *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
                  placeholder="e.g., Google"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
                  placeholder="e.g., Bangalore"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Job Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as "Full-time" | "Internship" }))}
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Work Mode *</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value as "On-site" | "Remote" | "Hybrid" }))}
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Experience (Years) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
                  placeholder="e.g., 2"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Salary (LPA) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.salaryLPA}
                  onChange={(e) => setFormData(prev => ({ ...prev, salaryLPA: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
                  placeholder="e.g., 20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700">Job Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
                placeholder="Describe the job responsibilities, requirements, and benefits..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#32a5d4] text-white rounded-lg hover:bg-black transition transform hover:scale-105 active:scale-95"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJobForm;