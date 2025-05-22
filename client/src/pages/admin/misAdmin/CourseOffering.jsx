import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios.js";
import "../../../styles/CourseOffering.css";

const CourseOffering = () => {
  // * State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [studentId, setStudentId] = useState("");

  // * Current school year and semester
  const currentYear = new Date().getFullYear();
  const [schoolYear, setSchoolYear] = useState(
    `${currentYear}-${currentYear + 1}`
  );
  const [semester, setSemester] = useState(1);

  const tableBodyRef = useRef(null);

  // * Handle school year change
  const handleSchoolYearChange = (e) => {
    setSchoolYear(e.target.value);
  };

  // * Handle semester change
  const handleSemesterChange = (e) => {
    setSemester(parseInt(e.target.value));
  };

  // * Format day pattern for display
  const formatDayPattern = (pattern) => {
    if (!pattern) return "-";
    const dayPatterns = [
      { value: "MWF", label: "Monday, Wednesday, Friday" },
      { value: "TTh", label: "Tuesday, Thursday" },
      { value: "TThSat", label: "Tuesday, Thursday, Saturday" },
      { value: "MW", label: "Monday, Wednesday" },
      { value: "M", label: "Monday" },
      { value: "T", label: "Tuesday" },
      { value: "W", label: "Wednesday" },
      { value: "Th", label: "Thursday" },
      { value: "F", label: "Friday" },
      { value: "Sat", label: "Saturday" },
      { value: "Sun", label: "Sunday" },
      {
        value: "M-S",
        label: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday",
      },
      { value: "M-F", label: "Monday, Tuesday, Wednesday, Thursday, Friday" },
    ];
    const foundPattern = dayPatterns.find((d) => d.value === pattern);
    return foundPattern ? foundPattern.label : pattern;
  };

  // * Handle edit course
  const handleEdit = (course) => {
    setSelectedCourse(course);
    setShowEnrollModal(false);
  };

  // * Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // * Fetch all offered courses
  const fetchCourses = async () => {
    try {
      const response = await api.get("/admin/mis/courses/offered");
      setCourses(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // * Handle student enrollment
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post(
        `/admin/mis/courses/offered/${selectedCourse.edpCode}/enroll`,
        {
          studentId,
          midtermGrade: 0,
          finalGrade: 0,
          remarks: "N/A",
        }
      );

      setShowEnrollModal(false);
      setStudentId("");
      await fetchCourses(); // Refresh the course list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll student");
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom when courses are updated
  useEffect(() => {
    if (tableBodyRef.current) {
      const scrollToBottom = () => {
        tableBodyRef.current.scrollTop = tableBodyRef.current.scrollHeight;
      };
      requestAnimationFrame(scrollToBottom);
    }
  }, [courses]);

  if (loading && courses.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="course-offering">
      <div className="header">
        <h2>Course Offerings</h2>
        <Link to="/admin/mis/course-offerings/add" className="add-button">
          Add New Course Offering
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="course-offering-content">
        {/* Current School Year and Semester */}
        <div className="school-year-selector">
          <div className="filter-group">
            <label>School Year:</label>
            <input
              type="text"
              value={schoolYear}
              onChange={handleSchoolYearChange}
              placeholder="e.g., 2023-2024"
            />
          </div>

          <div className="filter-group">
            <label>Semester:</label>
            <select value={semester} onChange={handleSemesterChange}>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
            </select>
          </div>
        </div>

        {/* Existing Course Offerings */}
        <div className="existing-offerings-section">
          <h3>Existing Course Offerings</h3>
          <table className="courses-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>EDP Code</th>
                <th>Schedule</th>
                <th>Room</th>
                <th>Instructor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody ref={tableBodyRef}>
              {courses.map((course) => (
                <tr key={course.edpCode}>
                  <td>{course.courseCode}</td>
                  <td>{course.edpCode}</td>
                  <td>
                    {formatDayPattern(course.schedule?.day)}{" "}
                    {course.schedule?.time}
                  </td>
                  <td>{course.schedule?.room}</td>
                  <td>{course.teacherAssigned}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </button>
                    <button
                      className="enroll-btn"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowEnrollModal(true);
                      }}
                    >
                      Enroll Student
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enroll Student Modal */}
        {showEnrollModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Enroll Student</h2>
              <form onSubmit={handleEnrollStudent}>
                <div className="form-group">
                  <label>Student ID:</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter student ID"
                    required
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="modal-buttons">
                  <button type="submit" disabled={loading}>
                    {loading ? "Enrolling..." : "Enroll Student"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOffering;
