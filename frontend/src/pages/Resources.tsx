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
          className={`w-8 h-8 cursor-pointer transition-all duration-200 ${
            star <= (hovered || tempRating || rating)
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
  const primaryAccentColor = "#45B5DA";
  const secondaryAccentColor = "#0F9BC0";
  const mainBackgroundColor = "#EEF2F7";
  const cardBackgroundColor = "#FFFFFF";
  const lightElementColor = "#D4EEF9";
  const customFocusStyle = { "--tw-ring-color": primaryAccentColor } as React.CSSProperties;

  if (loading)
    return <div className="text-center mt-20">Loading resources...</div>;

  return (
    <div
      className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: mainBackgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Interview{" "}
            <span
              style={{
                background: `linear-gradient(to right, ${primaryAccentColor}, ${secondaryAccentColor})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Resources
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              className="rounded-2xl shadow-lg p-6 border border-gray-100"
              style={{ backgroundColor: cardBackgroundColor }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Filter Resources
              </h3>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={customFocusStyle}
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
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm"
                style={customFocusStyle}
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
                    className="rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                    style={{ backgroundColor: cardBackgroundColor }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(to bottom right, ${primaryAccentColor}, ${secondaryAccentColor})`,
                          }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: lightElementColor,
                            color: secondaryAccentColor,
                          }}
                        >
                          {resource.type}
                        </span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-600">
                          {resource.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{resource.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="text-gray-500 w-5 h-5" />
                        <div>
                          <p className="font-medium text-gray-800">
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

                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{resource.downloads}</span>
                        </div>
                        <button
                          onClick={() => openRatingModal(resource)}
                          style={{ color: primaryAccentColor }}
                          className="flex items-center space-x-1 font-medium"
                        >
                          <Star className="w-4 h-4" />
                          <span>Rate</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleDownload(resource)}
                        className="px-4 py-2 text-white rounded-lg font-medium shadow-md hover:scale-105 transition-all"
                        style={{
                          background: `linear-gradient(to right, ${primaryAccentColor}, ${secondaryAccentColor})`,
                        }}
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
              className="bg-white p-6 rounded-2xl shadow-lg w-[350px] relative"
            >
              <h2 className="text-xl font-bold text-center mb-2 text-gray-800">
                Rate this Resource
              </h2>
              <p className="text-gray-600 text-center mb-4">
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
                className={`w-full mt-6 py-2 rounded-lg text-white font-medium transition ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
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
