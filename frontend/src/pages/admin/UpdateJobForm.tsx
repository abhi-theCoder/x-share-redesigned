import React, { useState, useEffect } from "react";
import axios from "../../api";
import { Briefcase, X } from "lucide-react";
import { JobListing } from "./PostJobForm";

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
  const [formData, setFormData] = useState(job);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setFormData(job);
  }, [job]);

  if (!open || !formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`/api/admin/jobs/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setMsg("✅ Job updated successfully!");
        onUpdate(res.data.job);
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      setMsg(error.response?.data?.message || "Error updating job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Update Job
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 border rounded"
            placeholder="Job Title"
            required
          />
          <input
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className="w-full p-2 border rounded"
            placeholder="Company"
            required
          />
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full p-2 border rounded"
            placeholder="Location"
            required
          />
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Job Description"
            required
          />

          {msg && <p className="text-sm text-blue-600">{msg}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded ${
                loading && "opacity-70"
              }`}
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