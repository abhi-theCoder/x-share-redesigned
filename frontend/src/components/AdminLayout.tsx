import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ViewOrUpdateExperiences from "../pages/admin/ViewOrUpdateExperiences";
import AdminDashboard from "../pages/admin/AdminDashboard";
// You can import additional pages here (JobUpload, ResourcesUpload, etc.)
import JobUpload from "../pages/admin/JobUpload";
import ResourceUpload from "../pages/admin/resourceUpload";
import ManageJobs from "../pages/admin/ManageJobs";
import ManageResources from "../pages/admin/ManageResources";

const AdminLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<string>("Dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "Dashboard":
        return <AdminDashboard />;
      case "Experiences":
        return <ViewOrUpdateExperiences />;
      case "Manage Jobs":
        return <ManageJobs />;
      case "Job Upload":
        return <JobUpload />;
      case "Manage Resources":
        return <ManageResources />;
      case "Resources Upload":
        return <ResourceUpload />;
      default:
        return <ViewOrUpdateExperiences />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
    </div>
  );
};

export default AdminLayout;
