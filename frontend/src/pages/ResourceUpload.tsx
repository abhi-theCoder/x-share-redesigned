// src/pages/ResourceUpload.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, FileText, Video, FileQuestion, FileCode, Upload } from 'lucide-react';

export interface Resource {
  id?: number;
  title: string;
  description: string;
  author: string;
  company: string;
  type: string;
  format: string;
  rating: number;
  // For file upload (will be used when backend is ready)
  file?: File;
  fileUrl?: string;
}

interface ResourceUploadProps {
  open: boolean;
  onClose: () => void;
  onAddResource: (resource: Resource) => void;
}

// Resource type options with icons
const resourceTypes = [
  { value: 'Interview Questions', label: 'Interview Questions', icon: FileQuestion },
  { value: 'Coding Challenges', label: 'Coding Challenges', icon: FileCode },
  { value: 'Resume Templates', label: 'Resume Templates', icon: FileText },
  { value: 'Video Tutorials', label: 'Video Tutorials', icon: Video },
  { value: 'MCQ Tests', label: 'MCQ Tests', icon: FileQuestion },
  { value: 'Study Guides', label: 'Study Guides', icon: FileText },
  { value: 'Cheat Sheets', label: 'Cheat Sheets', icon: FileText },
  { value: 'Project Ideas', label: 'Project Ideas', icon: FileCode },
];

// Format options based on type
const formatOptions: { [key: string]: string[] } = {
  'Interview Questions': ['PDF', 'DOCX', 'TXT', 'Markdown'],
  'Coding Challenges': ['PDF', 'DOCX', 'ZIP', 'GitHub'],
  'Resume Templates': ['DOCX', 'PDF', 'PSD', 'Figma'],
  'Video Tutorials': ['MP4', 'YouTube', 'Vimeo', 'Link'],
  'MCQ Tests': ['PDF', 'DOCX', 'Online Quiz', 'JSON'],
  'Study Guides': ['PDF', 'DOCX', 'Notion', 'Markdown'],
  'Cheat Sheets': ['PDF', 'PNG', 'JPEG', 'Markdown'],
  'Project Ideas': ['PDF', 'DOCX', 'Markdown', 'GitHub'],
};

const ResourceUpload: React.FC<ResourceUploadProps> = ({ open, onClose, onAddResource }) => {
  const [formData, setFormData] = useState<Resource>({
    title: '',
    description: '',
    author: '',
    company: '',
    type: 'Interview Questions',
    format: 'PDF',
    rating: 4.5,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [additionalLinks, setAdditionalLinks] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['Interview']);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        author: '',
        company: '',
        type: 'Interview Questions',
        format: 'PDF',
        rating: 4.5,
      });
      setSelectedFile(null);
      setFileUrl('');
      setAdditionalLinks(['']);
      setTags(['Interview']);
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset format when type changes
      ...(name === 'type' && { format: formatOptions[value]?.[0] || 'PDF' })
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleAddLink = () => {
    setAdditionalLinks(prev => [...prev, '']);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...additionalLinks];
    newLinks[index] = value;
    setAdditionalLinks(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    setAdditionalLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!tags.includes(newTag)) {
        setTags(prev => [...prev, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.author) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const resourceToAdd: Resource = {
      ...formData,
      // For now, we'll use the file URL or a placeholder
      fileUrl: fileUrl || (selectedFile ? URL.createObjectURL(selectedFile) : undefined),
      file: selectedFile || undefined,
    };

    onAddResource(resourceToAdd);
    setIsSubmitting(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentFormatOptions = formatOptions[formData.type] || ['PDF'];

  // Color theme matching Resources page
  const primaryAccentColor = '#45B5DA';
  const secondaryAccentColor = '#0F9BC0';
  const lightElementColor = '#D4EEF9';

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(to bottom right, ${primaryAccentColor}, ${secondaryAccentColor})` }}
                >
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Upload Resource</h2>
                  <p className="text-gray-600 text-sm">Share valuable resources with the community</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Resource Type and Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Resource Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resource Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                      required
                    >
                      {resourceTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format *
                    </label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                      required
                    >
                      {currentFormatOptions.map(format => (
                        <option key={format} value={format}>{format}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title and Author */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., System Design Interview Questions 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="e.g., John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                      required
                    />
                  </div>
                </div>

                {/* Company and Rating */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Company/Background *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g., Ex-Google, Senior Engineer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality Rating
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                    >
                      {[4.5, 4.0, 4.8, 4.9, 5.0].map(rating => (
                        <option key={rating} value={rating}>{rating} Stars</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe what this resource contains, who it's for, and why it's valuable..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none"
                    style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                    required
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-200 hover:border-blue-400">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.docx,.txt,.md,.zip,.mp4"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        PDF, DOCX, TXT, MD, ZIP, MP4 up to 50MB
                      </p>
                    </label>
                  </div>
                </div>

                {/* File URL (Alternative to upload) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or provide resource URL
                  </label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://example.com/resource.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                  />
                </div>

                {/* Additional Links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Links
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="flex items-center space-x-1 text-sm"
                      style={{ color: primaryAccentColor }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Link</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {additionalLinks.map((link, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleLinkChange(index, e.target.value)}
                          placeholder="https://example.com/additional-resource"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                          style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                        />
                        {additionalLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className="px-3 py-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: lightElementColor, color: secondaryAccentColor }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type a tag and press Enter..."
                    onKeyPress={handleAddTag}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ '--tw-ring-color': primaryAccentColor } as React.CSSProperties}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    style={{
                      background: `linear-gradient(to right, ${primaryAccentColor}, ${secondaryAccentColor})`,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Resource</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResourceUpload;