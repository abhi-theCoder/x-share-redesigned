import React, { useEffect, useState } from "react";
import axios from "../../api";
import { Pencil, Trash2 } from "lucide-react";
import UpdateJobForm from "./UpdateJobForm";
import { JobListing } from "./PostJobForm";

const ViewJobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("/api/admin/jobs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`/api/admin/jobs/${id}`, {
       headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdate = (updatedJob: JobListing) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Jobs</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
            <p className="text-sm">{job.location}</p>
            <div className="flex justify-between mt-3">
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setOpenEdit(true);
                }}
                className="flex items-center gap-1 text-blue-600 text-sm"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => deleteJob(job.id)}
                className="flex items-center gap-1 text-red-600 text-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <UpdateJobForm
        open={openEdit}
        job={selectedJob}
        onClose={() => setOpenEdit(false)}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ViewJobs;
