import { useState, useEffect } from "react";
import axios from "../../api/axios";

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  // Fetch assigned courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/teachers/courses");
        setCourses(response.data);
        setError(null);
      } catch (error) {
        setError("Failed to fetch courses");
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // Format schedule for display
  const formatSchedule = (schedule) => {
    if (!schedule) return "N/A";
    if (typeof schedule === "string") return schedule;
    return `${schedule.day || ""} ${schedule.time || ""}`.trim() || "N/A";
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="courses-management">
      <div className="dashboard-header">
        <h1>My Courses</h1>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.edpCode} className="course-card">
            <div className="course-header">
              <h3>{course.courseCode}</h3>
              <p>{course.courseName}</p>
            </div>
            <div className="course-details">
              <div className="course-detail-item">
                <label>EDP Code</label>
                <span>{course.edpCode}</span>
              </div>
              <div className="course-detail-item">
                <label>Section</label>
                <span>{course.section}</span>
              </div>
              <div className="course-detail-item">
                <label>Schedule</label>
                <span>{formatSchedule(course.schedule)}</span>
              </div>
              <div className="course-detail-item">
                <label>Room</label>
                <span>{course.schedule?.room || "N/A"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesManagement;
