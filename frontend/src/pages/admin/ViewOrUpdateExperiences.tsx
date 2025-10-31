import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginRequired from '../../components/LoginRequired';
import axios from '../../api'; // Assuming this is your configured axios instance

import {
  ThumbsUp,
  ThumbsDown,
  Edit2,
  CheckCircle,
  XCircle,
  FileText,
  Code,
  Users,
  Info,
  ChevronDown,
  Clock, // Added icon for date/time
  MapPin, // Added icon for location
  User, // Added icon for user details
} from 'lucide-react';

// --- Type Definitions ---
// UPDATED: Extended the interface to include all fields from the backend data structure
interface Experience {
  id: string | number; // ID can be string or number
  // FE Type: 'interview' covers 'job', 'internship', 'interview' from BE
  type: 'interview' | 'hackathon'; 
  status: 'pending' | 'approved' | 'rejected';
  
  // Mapped fields for UI display
  title: string; // Maps to BE 'role'
  company: string;
  details: string; // Maps to BE 'overall_experience'
  
  // Backend detailed fields (all 'detto' named fields)
  date: string; // The date of the experience
  location: string;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  is_bookmarked: boolean;
  user_voted: 'upvote' | 'downvote' | null;
  
  role: string; // Explicitly keep 'role' for a cleaner data structure
  
  // Array fields
  hr_questions: string[];
  technical_questions: string[];
  selection_rounds: string[];
  
  preparation_tips: string;
  work_culture: string;
  
  created_at: string;
  updated_at: string;
  
  // Fields from the joined 'users' table
  users: {
    id: number;
    username?: string | null; 
    name: string | null;
    bio: string | null;
    role: string | null;
    email: string | null;
  };
  
  // Admin-related fields
  reviewedBy?: string;
  reviewedAt?: string;
}

type Submission = Experience;

// --- API Endpoints ---
const API_ROUTES = {
  FETCH_EXPERIENCES: '/api/admin/experiences',
  UPDATE_STATUS: (id: string | number) => `/api/admin/experience/${id}/status`, 
  UPDATE_DATA: (id: string | number) => `/api/admin/experience/${id}`,
  FETCH_PROFILE: '/api/profile',
};

const ViewOrUpdateExperiences = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentStatus, setCurrentStatus] = useState<Submission['status']>('pending');
  const [currentType, setCurrentType] = useState<Submission['type']>('interview');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // UPDATED: Use partial type for editedData for flexibility, but Submission for state
  const [editedData, setEditedData] = useState<Partial<Submission> | null>(null); 
  const [isSaving, setIsSaving] = useState(false);

  // Filter submissions based on current state
  const filteredSubmissions = submissions.filter(
    (sub) => sub.status === currentStatus && sub.type === currentType
  );

  // --- Data Fetching Logic ---

  const fetchExperiences = useCallback(async () => {
    try {
      const response = await axios.get(API_ROUTES.FETCH_EXPERIENCES, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      console.log(response)
      const fetchedExperiences: Submission[] = response.data.map((exp: any): Submission => {
          // 1. Determine the FE type based on BE type
          let feType: Submission['type'];
          if (exp.type === 'hackathon') {
              feType = 'hackathon';
          } else {
              // Group 'internship', 'job', and future 'interview' types under 'interview'
              feType = 'interview';
          }
          
          return {
              // UPDATED: Spread all backend fields first
              ...exp,
              // Map backend fields to frontend props
              id: String(exp.id), // Ensure ID is a string for stability
              title: exp.role || 'N/A Role', // Using 'role' for title
              details: exp.overall_experience || exp.description || 'No detailed experience provided.', // Using 'overall_experience'
              
              // Use the mapped type
              type: feType, 

              // Ensure array fields are handled (even if null/undefined from BE)
              hr_questions: exp.hr_questions || [],
              technical_questions: exp.technical_questions || [],
              selection_rounds: exp.selection_rounds || [],

              // User details mapping
              users: {
                ...exp.users,
                name: exp.users?.name || 'Unknown Author',
                // Keep the 'name' field correct as per your interface definition
              },

              // Ensure required fields have fallbacks
              company: exp.company || 'N/A',
              date: exp.date || 'N/A',
              location: exp.location || 'N/A',
              preparation_tips: exp.preparation_tips || 'None provided.',
              work_culture: exp.work_culture || 'None provided.',

              // Explicit status check
              status: exp.status as Submission['status'],
          };
      });

      setSubmissions(fetchedExperiences);
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
      if (!error) {
        setError('Failed to load submissions data.');
      }
    }
  }, [error]); // Removed fetchExperiences from dependencies to avoid potential infinite loops

  // Combined fetch for profile and initial data
  useEffect(() => {
    const initAdminPage = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not authenticated.');
          setLoading(false);
          return;
        }

        // 1. Check Access
        const profileResponse = await axios.get(API_ROUTES.FETCH_PROFILE, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { role } = profileResponse.data;
        if (role === 'admin') {
          setHasAccess(true);
          // 2. Fetch Data only if access is granted
          await fetchExperiences();
        } else {
          setHasAccess(false);
          setError('Access Denied: You do not have permission to view this page.');
        }
      } catch (err) {
        console.error('Admin page initialization failed:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
            setError('User not authenticated.');
        } else {
            setError('Failed to load data or check profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    initAdminPage();
  }, [fetchExperiences]);


  // --- Status Update Handlers (API Calls) ---

  const updateSubmissionStatus = async (id: string | number, newStatus: Submission['status']) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      // CORRECTED: Use the API_ROUTES helper function to correctly embed the ID
      await axios.put(
        API_ROUTES.UPDATE_STATUS(id), 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistically update UI
      const reviewedAt = new Date().toISOString();

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === id
            ? {
                ...sub,
                status: newStatus,
                reviewedBy: 'Admin',
                reviewedAt: newStatus === 'pending' ? undefined : reviewedAt,
              }
            : sub
        )
      );

      setSelectedSubmission((prev) =>
        prev?.id === id
          ? {
              ...prev,
              status: newStatus,
              reviewedBy: 'Admin',
              reviewedAt: newStatus === 'pending' ? undefined : reviewedAt,
            }
          : null
      );
      
    } catch (err) {
      console.error(`Failed to update status to ${newStatus}:`, err);
      alert(`Error updating status: ${axios.isAxiosError(err) ? err.response?.data?.message : 'Network error'}`);
      await fetchExperiences();
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = (id: string | number) => updateSubmissionStatus(id, 'approved');
  const handleReject = (id: string | number) => updateSubmissionStatus(id, 'rejected');
  const handleRevert = (id: string | number) => updateSubmissionStatus(id, 'pending');

  // --- Data Edit Handlers (API Calls) ---

  const handleEdit = (submission: Submission) => {
    setIsEditing(true);
    // Include all editable fields in the initial state
    setEditedData({ 
        ...submission,
        // Map FE title/details back to BE role/overall_experience for the editor
        role: submission.role, 
        overall_experience: submission.details,
    });
  };

  const handleSave = async () => {
    if (!editedData || !editedData.id) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare the payload: Send all relevant, potentially updated fields
      const updatePayload = {
        role: editedData.role || editedData.title, // Use role from editedData state
        overall_experience: editedData.overall_experience || editedData.details, // Use overall_experience from editedData state
        company: editedData.company,
        location: editedData.location,
        preparation_tips: editedData.preparation_tips,
        work_culture: editedData.work_culture,
        date: editedData.date,
        hr_questions: editedData.hr_questions,
        technical_questions: editedData.technical_questions,
        selection_rounds: editedData.selection_rounds,
      };

      // CORRECTED: Use the API_ROUTES helper function to correctly embed the ID
      const response = await axios.put(
        API_ROUTES.UPDATE_DATA(editedData.id),
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedBackendData = response.data.updatedExperience || response.data; // Handle potential different response structures

      // Create the new submission object, merging with existing data and mapping back
      const newSubmission: Submission = {
        ...(selectedSubmission as Submission), // Start with the currently selected submission data
        ...updatedBackendData, // Overwrite with all returned fields (includes status, user, etc.)
        
        // Map returned backend fields back to frontend props
        id: String(updatedBackendData.id || editedData.id),
        title: updatedBackendData.role || updatedBackendData.subject || updatedBackendData.title || 'N/A Role',
        details: updatedBackendData.overall_experience || updatedBackendData.description || updatedBackendData.details || 'No detailed experience provided.',
        company: updatedBackendData.company || 'N/A',
        
        // Re-ensure FE type mapping
        type: (updatedBackendData.type === 'hackathon' ? 'hackathon' : 'interview') as Submission['type'],
      };


      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === newSubmission.id ? newSubmission : sub))
      );
      
      setSelectedSubmission(newSubmission);
      setIsEditing(false);
      setEditedData(null);
      
    } catch (err) {
      console.error('Failed to save changes:', err);
      alert(`Error saving changes: ${axios.isAxiosError(err) ? err.response?.data?.message : 'Network error'}`);
      await fetchExperiences();
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => (prev ? { ...prev, [name]: value } : null));
  };
  
  // New handler for array fields (HR/Tech Questions, Rounds)
  const handleArrayChange = (name: string, value: string) => {
    const arrayValue = value.split('\n').filter(item => item.trim() !== '');
    setEditedData((prev) => (prev ? { ...prev, [name]: arrayValue } : null));
  };


  // --- Render Functions ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-slate-500">
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // Handle different error states and restricted access
  if (error === 'User not authenticated.') {
    return <LoginRequired />;
  }

  if (error === 'Access Denied: You do not have permission to view this page.' || !hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-700 p-8 text-center rounded-lg shadow-inner">
        <div className="max-w-md mx-auto">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-lg">{error}</p>
          <p className="mt-4 text-sm text-red-500">Please log in with an authorized account to continue.</p>
        </div>
      </div>
    );
  }

  const renderDetailsPanel = () => {
    return (
      <AnimatePresence mode="wait">
        {selectedSubmission ? (
          <motion.div
            key={selectedSubmission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full text-left p-4 md:p-6"
          >
            {isEditing && editedData ? (
              // Edit Form
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Edit Submission</h2>
                
                {/* Editable Fields for Role, Company, Location, Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role (Title)</label>
                        <input
                            type="text"
                            name="role" // Now binding to 'role'
                            value={editedData.role || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <input
                            type="text"
                            name="company"
                            value={editedData.company || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={editedData.location || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Experience Date</label>
                        <input
                            type="date"
                            name="date"
                            value={editedData.date?.split('T')[0] || ''} // Format date for input
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>
                
                {/* Overall Experience / Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Overall Experience (Details)</label>
                  <textarea
                    name="overall_experience" // Now binding to 'overall_experience'
                    value={editedData.overall_experience || editedData.details || ''}
                    onChange={handleChange}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Preparation Tips */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preparation Tips</label>
                  <textarea
                    name="preparation_tips"
                    value={editedData.preparation_tips || ''}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Work Culture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Culture</label>
                  <textarea
                    name="work_culture"
                    value={editedData.work_culture || ''}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Array Fields (Questions/Rounds) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Selection Rounds (one per line)</label>
                        <textarea
                            name="selection_rounds"
                            value={(editedData.selection_rounds || []).join('\n')}
                            onChange={(e) => handleArrayChange('selection_rounds', e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Technical Questions (one per line)</label>
                        <textarea
                            name="technical_questions"
                            value={(editedData.technical_questions || []).join('\n')}
                            onChange={(e) => handleArrayChange('technical_questions', e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">HR Questions (one per line)</label>
                        <textarea
                            name="hr_questions"
                            value={(editedData.hr_questions || []).join('\n')}
                            onChange={(e) => handleArrayChange('hr_questions', e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-colors duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Read-only Details View
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                    {selectedSubmission.title}
                  </h2>
                  <div
                    className={`px-3 py-1 text-sm rounded-full font-medium ${
                      selectedSubmission.status === 'approved'
                        ? 'bg-green-100 text-green-600'
                        : selectedSubmission.status === 'rejected'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {selectedSubmission.status.charAt(0).toUpperCase() +
                      selectedSubmission.status.slice(1)}
                  </div>
                </div>
                
                {/* Core Submission Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-6 border-b pb-4">
                    <p className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-semibold">By:</span> {selectedSubmission.users.name || 'N/A'}
                    </p>
                    <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-semibold">Location:</span> {selectedSubmission.location}
                    </p>
                    <p className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-semibold">Experience Date:</span> {new Date(selectedSubmission.date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center">
                        <span className="font-semibold">Type:</span> {selectedSubmission.type}
                    </p>
                    <p className="flex items-center">
                        <span className="font-semibold">Company:</span>{' '}
                        {selectedSubmission.company === 'N/A' ? 'Not Applicable' : selectedSubmission.company}
                    </p>
                </div>

                {/* Engagement Metrics (New Fields) */}
                <div className="flex gap-4 mb-6">
                    <div className="flex items-center text-green-600 font-semibold">
                        <ThumbsUp className="w-4 h-4 mr-1" /> {selectedSubmission.upvotes}
                    </div>
                    <div className="flex items-center text-red-600 font-semibold">
                        <ThumbsDown className="w-4 h-4 mr-1" /> {selectedSubmission.downvotes}
                    </div>
                    <div className="flex items-center text-slate-600 font-semibold">
                        <Users className="w-4 h-4 mr-1" /> {selectedSubmission.comments_count} Comments
                    </div>
                </div>

                <div className="border-t pt-4 border-gray-200 space-y-6">
                    {/* Overall Experience */}
                    <section>
                        <h3 className="text-lg font-bold mb-2 text-slate-700">Overall Experience</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {selectedSubmission.details}
                        </p>
                    </section>

                    {/* Work Culture */}
                    <section>
                        <h3 className="text-lg font-bold mb-2 text-slate-700">Work Culture</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {selectedSubmission.work_culture}
                        </p>
                    </section>
                    
                    {/* Preparation Tips */}
                    <section>
                        <h3 className="text-lg font-bold mb-2 text-slate-700">Preparation Tips</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {selectedSubmission.preparation_tips}
                        </p>
                    </section>

                    {/* Detailed Round/Question Data */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <section>
                            <h4 className="font-semibold text-md mb-2 text-slate-700">Selection Rounds</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                {selectedSubmission.selection_rounds.length > 0 ? (
                                    selectedSubmission.selection_rounds.map((round, index) => <li key={index}>{round}</li>)
                                ) : (
                                    <li className="text-slate-400">None provided.</li>
                                )}
                            </ul>
                        </section>
                        <section>
                            <h4 className="font-semibold text-md mb-2 text-slate-700">Technical Questions</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                {selectedSubmission.technical_questions.length > 0 ? (
                                    selectedSubmission.technical_questions.map((q, index) => <li key={index}>{q}</li>)
                                ) : (
                                    <li className="text-slate-400">None provided.</li>
                                )}
                            </ul>
                        </section>
                        <section>
                            <h4 className="font-semibold text-md mb-2 text-slate-700">HR Questions</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                {selectedSubmission.hr_questions.length > 0 ? (
                                    selectedSubmission.hr_questions.map((q, index) => <li key={index}>{q}</li>)
                                ) : (
                                    <li className="text-slate-400">None provided.</li>
                                )}
                            </ul>
                        </section>
                    </div>

                    {/* Admin Review Info */}
                    {(selectedSubmission.status === 'approved' || selectedSubmission.status === 'rejected') && (
                        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-slate-500">
                            <p>
                                <span className="font-semibold">Reviewed By:</span>{' '}
                                {selectedSubmission.reviewedBy || 'Admin'}
                            </p>
                            <p>
                                <span className="font-semibold">Reviewed On:</span>{' '}
                                {selectedSubmission.reviewedAt ? new Date(selectedSubmission.reviewedAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedSubmission.id)}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors duration-200 disabled:bg-green-300 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" /> {isSaving ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedSubmission.id)}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors duration-200 disabled:bg-red-300 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-5 h-5 mr-2" /> {isSaving ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  )}
                  {/* Add a Revert button for approved or rejected submissions */}
                  {(selectedSubmission.status === 'approved' || selectedSubmission.status === 'rejected') && (
                    <button
                      onClick={() => handleRevert(selectedSubmission.id)}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Info className="w-5 h-5 mr-2" /> {isSaving ? 'Processing...' : 'Revert to Pending'}
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(selectedSubmission)}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    <Edit2 className="w-5 h-5 mr-2" /> Edit
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center text-slate-500 p-6 md:p-8"
          >
            <div className="flex justify-center mb-4">
              <Info className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-lg font-semibold">Select a submission to view details</p>
            <p className="text-sm mt-2">
              Use the filters on the left to navigate through pending and reviewed content.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-slate-600">Review and manage community submissions</p>
        </header>

        {/* Main Content Area */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-xl border border-gray-200"
          >
            <div className="space-y-6">
              {/* Filter by Status */}
              <div>
                <h2 className="text-xl font-bold mb-3 text-slate-800 flex items-center">
                  <ChevronDown className="w-5 h-5 mr-2 text-slate-500" /> Status
                </h2>
                <div className="flex flex-wrap gap-2 md:gap-3 text-sm md:text-base">
                  {['pending', 'approved', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setCurrentStatus(status as Submission['status']);
                        setSelectedSubmission(null);
                        setIsEditing(false);
                      }}
                      className={`filter-btn px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                        currentStatus === status
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submission Type */}
              <div>
                <h2 className="text-xl font-bold mb-3 text-slate-800 flex items-center">
                  <ChevronDown className="w-5 h-5 mr-2 text-slate-500" /> Type
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {['interview', 'hackathon'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setCurrentType(type as Submission['type']);
                        setSelectedSubmission(null);
                        setIsEditing(false);
                      }}
                      className={`type-btn p-4 rounded-xl font-semibold transition-all duration-200 flex flex-col items-center justify-center ${
                        currentType === type
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                          : 'bg-gray-100 text-slate-600 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {type === 'interview' ? (
                        <FileText className="w-6 h-6 mb-1" />
                      ) : (
                        <Code className="w-6 h-6 mb-1" />
                      )}
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submission List */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-slate-500" /> Submissions ({filteredSubmissions.length})
                </h2>
                <AnimatePresence>
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setIsEditing(false);
                        }}
                        className={`submission-card bg-white p-4 rounded-xl shadow-sm border-2 transition-all duration-150 transform hover:scale-[1.02] cursor-pointer ${
                          selectedSubmission?.id === sub.id
                            ? 'border-blue-500 ring-4 ring-blue-100'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <h3 className="font-semibold text-slate-800">{sub.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          By: <span className="font-medium">{sub.users.name}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Submitted on: {new Date(sub.created_at).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <motion.p
                      key="no-submissions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center text-slate-400 py-6"
                    >
                      No submissions found for this filter.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200 flex items-start justify-center min-h-[500px]"
          >
            {renderDetailsPanel()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ViewOrUpdateExperiences;