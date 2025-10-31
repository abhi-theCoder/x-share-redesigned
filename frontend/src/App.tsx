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
import Admin from './pages/admin';
import JobPortal from './pages/JobPortal';
import PrivateRoute from './components/privateRoute';
import TemplateBasic from './templatess/TemplateBasic';
import TemplateModern from './templatess/TemplateModern';
import PostJobForm from './pages/admin/postJobForm';
import ResourceUpload from './pages/admin/resourceUpload';
import ViewJobs from './pages/admin/ViewJobs';
import UpdateJobForm from './pages/admin/UpdateJobForm';

function App() {
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
      { name: "React", level: "Expert", type: "Technical" },
      { name: "React", level: "Expert", type: "Technical" },
      { name: "React", level: "Expert", type: "Technical" }
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <Header />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/qa" element={<QAndA />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/jobs" element={<JobPortal />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/share-experience" element={<ShareExperiencePage/>} />
              <Route path="/experiences/:id" element={<ExperienceDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/rewards" element={<Rewards/>} />
              <Route path="/resume-builder" element={<ResumeBuilder/>} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/view-jobs" element={<ViewJobs />} />
              <Route path="/admin/update-job/:id" element={<UpdateJobForm open={true} job={null} onClose={() => {}} onUpdate={() => {}} />} />
              <Route path="/admin/post-jobs" element={<PostJobForm open={true} onClose={() => {}} onAddJob={() => {}} />} />
              <Route path="/admin/resource-upload" element={<ResourceUpload open={true} onClose={() => {}} onAddResource={() => {}} />} />
            </Route>


             {/* Testing routes */}
            {/* ✅ Testing Template Route */}
            <Route path="/template-basic" element={<TemplateBasic data={dummyData} sectionOrder={sectionOrder} allSections={allSections}/>}/>
            <Route path="/template-modern" element={<TemplateModern data={dummyData} sectionOrder={sectionOrder} allSections={allSections}/>}/>
          </Routes>

           
        </main>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;