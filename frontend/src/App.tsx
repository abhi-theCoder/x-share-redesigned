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

function App() {
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
            </Route>
          </Routes>

        </main>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;