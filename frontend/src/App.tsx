import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Experiences from './pages/Experiences';
import QAndA from './pages/QAndA';
import Resources from './pages/Resources';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Footer from './components/Footer';
import ShareExperiencePage from './pages/Share-experience';
import ExperienceDetail from './pages/ExperienceDetail';
import Rewards from './pages/rewards';
import ResumeBuilder from './pages/resume-builder';
import Admin from './pages/admin/ViewOrUpdateExperiences';
import JobPortal from './pages/JobPortal';
import PrivateRoute from './components/privateRoute';
import TemplateBasic from './templates/TemplateBasic';
import TemplateModern from './templates/TemplateModern';
import PostJobForm from './pages/admin/JobUpload';
import ResourceUpload from './pages/admin/resourceUpload';
import ViewJobs from './pages/admin/ManageJobs';
import UpdateJobForm from './pages/admin/UpdateJobForm';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/adminRoute';
import Unauthorized from './pages/admin/Unauthorized';
import PublicUserProfilePage from './pages/PublicUserProfilePage';

import ShootingStars from './components/ShootingStars';
import { useTheme } from './context/ThemeContext';
import { useEffect } from 'react';

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    // Handle Supabase OAuth hash fragment (Common in production if redirect configuration is slightly off)
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('type=recovery'))) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        // Use environment variable for backend URL, falling back to local for development
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
        // Send token to backend to process and finalize login
        window.location.href = `${backendUrl}/api/auth/social/process-token?access_token=${accessToken}`;
      }
    }
  }, []);

  const dummyData = {
    personal: {
      name: "John Doe",
      title: "Software Developer",
      email: "john@gmail.com",
      phone: "+91 99999 99999",
      location: "Delhi",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "",
      portfolio: ""
    },
    summary: "A passionate developer with React experience.",
    experience: [
      { id: "1", title: "Frontend Dev", company: "ABC Tech", startDate: "2022-01-01", endDate: "2023-05-01", description: "Worked on React apps." }
    ],
    education: [
      { id: "1", degree: "B.Tech CSE", institution: "NIT Delhi", city: "Delhi", startDate: "2018-01-01", endDate: "2022-01-01" }
    ],
    skills: [
      { name: "React", level: "Expert" as const, type: "Technical" as const },
      { name: "Node.js", level: "Expert" as const, type: "Technical" as const },
      { name: "Typescript", level: "Intermediate" as const, type: "Technical" as const }
    ],
    projects: [],
    certifications: [],
    achievements: [],
    interests: "Coding, Travel"
  };

  const sectionOrder = ["summary", "experience", "education", "skills", "interests"];
  const allSections: any[] = []; // Not required for testing

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-500 relative ${theme === 'dark' ? 'bg-[#030014] text-white' : 'bg-gradient-to-br from-orange-50 via-white to-green-50 text-gray-900'
        }`}>
        {theme === 'dark' && <ShootingStars />}
        <Header />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/qa" element={<QAndA />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/jobs" element={<JobPortal />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/share-experience" element={<ShareExperiencePage />} />
              <Route path="/experiences/:id" element={<ExperienceDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/resources" element={<Resources />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />} />
              <Route path="/admin/view-jobs" element={<ViewJobs />} />
              <Route path="/admin/update-job/:id" element={<UpdateJobForm open={true} job={null} onClose={() => { }} onUpdate={() => { }} />} />
              <Route path="/admin/post-jobs" element={<PostJobForm open={true} onClose={() => { }} onAddJob={() => { }} />} />
              <Route path="/admin/resource-upload" element={<ResourceUpload open={true} onClose={() => { }} onAddResource={() => { }} />} />
            </Route>

            {/* unauthorize */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Testing routes */}
            {/* ✅ Testing Template Route */}
            <Route path='/profile/:userId' element={<PublicUserProfilePage />}></Route>
            <Route path="/template-basic" element={<TemplateBasic data={dummyData} sectionOrder={sectionOrder} allSections={allSections} />} />
            <Route path="/template-modern" element={<TemplateModern data={dummyData} sectionOrder={sectionOrder} allSections={allSections} />} />
          </Routes>


        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;