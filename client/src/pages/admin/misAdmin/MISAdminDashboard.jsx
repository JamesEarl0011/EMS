import { useState } from "react";
import "../../../styles/AdminDashboard.css";
import UserManagement from "./UserManagement";
import DepartmentManagement from "./DepartmentManagement";
import CourseManagement from "./CourseManagement";
import CourseOffering from "./CourseOffering";

const MISAdminDashboard = () => {
  // * State for active tab
  const [activeTab, setActiveTab] = useState("users");

  // * Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // * Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // * Render active component based on tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "offerings":
        return <CourseOffering />;
      case "departments":
        return <DepartmentManagement />;
      case "courses":
        return <CourseManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* * Sidebar */}
      <div className="sidebar">
        <h2>MIS Admin</h2>
        <nav className="admin-nav-container">
          <button
            className={`admin-nav-button ${
              activeTab === "users" ? "active" : ""
            }`}
            onClick={() => handleTabChange("users")}
          >
            User Management
          </button>
          <button
            className={`admin-nav-button ${
              activeTab === "offerings" ? "active" : ""
            }`}
            onClick={() => handleTabChange("offerings")}
          >
            Course Offerings
          </button>
          <button
            className={`admin-nav-button ${
              activeTab === "departments" ? "active" : ""
            }`}
            onClick={() => handleTabChange("departments")}
          >
            Department Management
          </button>
          <button
            className={`admin-nav-button ${
              activeTab === "courses" ? "active" : ""
            }`}
            onClick={() => handleTabChange("courses")}
          >
            Course Management
          </button>
          <button className="admin-nav-button logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>

      {/* * Main content area */}
      <div className="admin-main-content">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default MISAdminDashboard;
