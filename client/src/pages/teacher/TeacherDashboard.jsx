import { useState } from "react";
import "../../styles/AdminDashboard.css"; // Using the same CSS as MISAdminDashboard
import CoursesManagement from "./CoursesManagement";
import GradeManagement from "./GradeManagement";
import ClearanceManagement from "./ClearanceManagement";

const TeacherDashboard = () => {
  // * State for active tab
  const [activeTab, setActiveTab] = useState("courses");

  // * Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // * Render active component based on tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "courses":
        return <CoursesManagement />;
      case "grades":
        return <GradeManagement />;
      case "clearance":
        return <ClearanceManagement />;
      default:
        return <CoursesManagement />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* * Sidebar */}
      <div className="sidebar">
        <h2>Teacher Dashboard</h2>
        <nav className="admin-nav-container">
          <button
            className={`admin-nav-button ${
              activeTab === "courses" ? "active" : ""
            }`}
            onClick={() => setActiveTab("courses")}
          >
            My Courses
          </button>
          <button
            className={`admin-nav-button ${
              activeTab === "grades" ? "active" : ""
            }`}
            onClick={() => setActiveTab("grades")}
          >
            Grade Management
          </button>
          <button
            className={`admin-nav-button ${
              activeTab === "clearance" ? "active" : ""
            }`}
            onClick={() => setActiveTab("clearance")}
          >
            Clearance Management
          </button>
          <button className="admin-nav-button logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>

      {/* * Main content area */}
      <div className="admin-main-content">
        <div className="content-container">{renderActiveComponent()}</div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
