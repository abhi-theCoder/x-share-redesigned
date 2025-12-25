import React, { useEffect, useState } from "react";
import axios from "../api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Star,
  Calendar,
  User,
  FileText,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useTheme } from "../context/ThemeContext";

// Types
interface Resource {
  id: number;
  title: string;
  description: string;
  author: string;
  company: string;
  type: string;
  format: string;
  downloads: number;
  rating: number;
  total_ratings: number;
  uploaded_at: string;
  file_url?: string;
}

interface RatingStarsProps {
  rating: number;
  tempRating: number;
  setTempRating: (val: number) => void;
}

// --- ⭐ Reusable RatingStars Component ---
const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  tempRating,
  setTempRating,
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex justify-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-8 h-8 cursor-pointer transition-all duration-200 ${star <= (hovered || tempRating || rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
            }`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => setTempRating(star)}
        />
      ))}
    </div>
  );
};

const Resources: React.FC = () => {
  const { theme } = useTheme();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [tempRating, setTempRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const resourceTypes = [
    "All",
    "Interview Questions",
    "Coding Challenges",
    "Resume Templates",
    "Video Tutorials",
  ];

  // --- Fetch all resources ---
  const fetchResources = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(res.data.resources || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  const openRatingModal = (resource: Resource) => {
    setSelectedResource(resource);
    setTempRating(resource.rating || 0);
    setIsModalOpen(true);
  };

  const closeRatingModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
    setTempRating(0);
  };

  // --- ⭐ Submit rating ---
  const handleSubmitRating = async () => {
    if (!selectedResource || !tempRating) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    const token = localStorage.getItem("token");
    setSubmitting(true);

    try {
      const res = await axios.put(
        `/api/resources/${selectedResource.id}/rate`,
        { rating: tempRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.resource;
      setResources((prev) =>
        prev.map((r) => (r.id === selectedResource.id ? updated : r))
      );

      toast.success("Thanks for rating!");
      closeRatingModal();
    } catch (err) {
      console.error("Rating Error:", err);
      toast.error("Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- 📦 Handle download ---
  const handleDownload = async (resource: Resource) => {
    const token = localStorage.getItem("token");
    try {
      // Update download count in backend
      await axios.put(
        `/api/resources/${resource.id}/download`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update count locally
      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id
            ? { ...r, downloads: (r.downloads || 0) + 1 }
            : r
        )
      );

      // Fetch file as Blob to force download
      if (resource.file_url) {
        const response = await fetch(resource.file_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = resource.title || "resource"; // default filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release memory
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download Error:", err);
      toast.error("Failed to download resource.");
    }
  };

  // --- COLORS ---
  // Colors now handled by Tailwind classes based on theme

  if (loading)
    return <div className="text-center mt-20"><Loader /></div>;

  return (
    <div
      className={`min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-transparent' : 'bg-[#EEF2F7]'
        }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Interview{" "}
            <span
              className="bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent"
            >
              Resources
            </span>
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Access curated resources shared by industry experts to ace your interviews.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* --- FILTER SIDEBAR --- */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`rounded-2xl shadow-xl p-6 border transition-all duration-300 ${theme === 'dark'
                ? 'bg-space-900/40 backdrop-blur-md border-white/10 ring-1 ring-white/5'
                : 'bg-white border-gray-100'
                }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Filter Resources
              </h3>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${theme === 'dark'
                  ? 'bg-space-800 border-space-700 text-white focus:ring-brand-cyan'
                  : 'bg-white border-gray-200 text-gray-900 focus:ring-brand-cyan'
                  }`}
              >
                {resourceTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </motion.div>
          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="lg:col-span-3">
            {/* 🔍 Search Bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 shadow-xl ${theme === 'dark'
                  ? 'bg-space-900/40 backdrop-blur-md border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-brand-cyan'
                  }`}
              />
            </div>

            {/* 🧾 Resource Cards */}
            <div className="space-y-6">
              {filteredResources.map((resource, index) => {
                const IconComponent =
                  resource.type === "Video Tutorials" ? Video : FileText;

                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`rounded-2xl shadow-xl p-6 border hover:shadow-2xl transition-all duration-300 ${theme === 'dark'
                      ? 'bg-space-900/40 backdrop-blur-md border-white/10'
                      : 'bg-white border-gray-100'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-cyan to-brand-blue"
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark'
                            ? 'bg-space-800 text-brand-cyan'
                            : 'bg-[#D4EEF9] text-[#0F9BC0]'
                            }`}
                        >
                          {resource.type}
                        </span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className={`ml-1 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {resource.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                      {resource.title}
                    </h3>
                    <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{resource.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="text-gray-500 w-5 h-5" />
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                            {resource.author}
                          </p>
                          <p className="text-sm text-gray-500">
                            {resource.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(resource.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className={`flex justify-between items-center pt-4 border-t mt-4 ${theme === 'dark' ? 'border-space-800' : 'border-gray-100'}`}>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{resource.downloads}</span>
                        </div>
                        <button
                          onClick={() => openRatingModal(resource)}
                          className={`flex items-center space-x-1 font-medium ${theme === 'dark' ? 'text-brand-cyan' : 'text-[#45B5DA]'}`}
                        >
                          <Star className="w-4 h-4" />
                          <span>Rate</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleDownload(resource)}
                        className="px-4 py-2 text-white rounded-lg font-medium shadow-md hover:scale-105 transition-all bg-gradient-to-r from-brand-cyan to-brand-blue"
                      >
                        Download
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Rating Modal */}
      <AnimatePresence>
        {isModalOpen && selectedResource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`p-6 rounded-2xl shadow-2xl w-[350px] relative transition-all duration-300 ${theme === 'dark' ? 'bg-space-900/60 backdrop-blur-xl border border-white/10' : 'bg-white'
                }`}
            >
              <h2 className={`text-xl font-bold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Rate this Resource
              </h2>
              <p className={`text-center mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedResource.title}
              </p>
              <RatingStars
                rating={selectedResource.rating || 0}
                tempRating={tempRating}
                setTempRating={setTempRating}
              />
              <button
                onClick={handleSubmitRating}
                disabled={submitting}
                className={`w-full mt-6 py-2 rounded-lg text-white font-medium transition ${submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-brand-cyan to-brand-blue hover:brightness-110"
                  }`}
              >
                {submitting ? "Submitting..." : "Submit Rating"}
              </button>
              <button
                onClick={closeRatingModal}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-lg"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resources;
