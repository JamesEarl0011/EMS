import { useState, useEffect } from "react";
import axios from "../../api/axios";
import "../../styles/AdminDashboard.css";

const StudentDashboard = () => {
  // * State for active tab
  const [activeTab, setActiveTab] = useState("profile");
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [clearance, setClearance] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchResults, setSearchResults] = useState({});

  // * Fetch student profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/auth/me");
        setStudentData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch profile", err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // * Fetch grades when grades tab is active
  useEffect(() => {
    if (activeTab === "grades" && studentData?.studentId) {
      const fetchGrades = async () => {
        try {
          const response = await axios.get(
            `/students/grades?studentId=${studentData.studentId}`
          );
          setGrades(response.data.grades || []); // Access the grades array from response
        } catch (err) {
          setError("Failed to fetch grades", err);
        }
      };
      fetchGrades();
    }
  }, [activeTab, studentData]);

  // * Fetch clearance when clearance tab is active
  useEffect(() => {
    if (activeTab === "clearance" && studentData?.studentId) {
      const fetchClearance = async () => {
        try {
          const response = await axios.get(
            `/students/clearance?studentId=${studentData.studentId}`
          );
          setClearance(response.data.clearances || []); // Access the clearances array from response
        } catch (err) {
          setError("Failed to fetch clearance", err);
        }
      };
      fetchClearance();
    }
  }, [activeTab, studentData]);

  // * Fetch evaluation when evaluation tab is active
  useEffect(() => {
    if (activeTab === "evaluation" && studentData?.studentId) {
      const fetchEvaluation = async () => {
        try {
          const response = await axios.get(
            `/students/evaluation?studentId=${studentData.studentId}`
          );
          setEvaluation(response.data);
        } catch (err) {
          setError("Failed to fetch evaluation", err);
        }
      };
      fetchEvaluation();
    }
  }, [activeTab, studentData]);

  // * Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // * Handle course search
  const handleCourseSearch = async (edpCode, index) => {
    try {
      const response = await axios.get(`/students/offered-courses/${edpCode}`);
      setSearchResults((prev) => ({
        ...prev,
        [index]: response.data,
      }));
    } catch (err) {
      setError("Failed to fetch course details");
      setSearchResults((prev) => ({
        ...prev,
        [index]: null,
      }));
    }
  };

  // * Add new course input
  const addNewCourse = () => {
    setEnrolledCourses((prev) => [
      ...prev,
      { edpCode: "", index: prev.length },
    ]);
  };

  // * Remove course input
  const removeCourse = (index) => {
    setEnrolledCourses((prev) =>
      prev.filter((course) => course.index !== index)
    );
    setSearchResults((prev) => {
      const newResults = { ...prev };
      delete newResults[index];
      return newResults;
    });
  };

  // * Handle enrollment submission
  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    if (!studentData?.studentId) {
      setError("Student ID not found");
      return;
    }

    const formData = new FormData(e.target);
    const enrollmentData = {
      studentId: studentData.studentId,
      semester: parseInt(formData.get("semester")),
      yearLevel: parseInt(formData.get("yearLevel")),
      courses: enrolledCourses.map((course) => ({
        edpCode: course.edpCode,
      })),
    };

    try {
      await axios.post(`/students/enrollment`, enrollmentData);
      setError(null);
      setEnrolledCourses([]);
      setSearchResults({});
      alert("Enrollment submitted successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit enrollment");
    }
  };

  // * Render the active component based on selected tab
  const renderActiveComponent = () => {
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    switch (activeTab) {
      case "profile":
        return (
          <div className="content-section">
            <div className="dashboard-header">
              <h1>My Profile</h1>
            </div>
            {studentData && (
              <div className="profile-info">
                <div className="info-group">
                  <label>Student ID:</label>
                  <span>{studentData.studentId}</span>
                </div>
                <div className="info-group">
                  <label>Name:</label>
                  <span>{studentData.name}</span>
                </div>
                <div className="info-group">
                  <label>Contact Information:</label>
                  <span>
                    {studentData.contactInformation || "Not provided"}
                  </span>
                </div>
                <div className="info-group">
                  <label>Address:</label>
                  <span>{studentData.address || "Not provided"}</span>
                </div>
              </div>
            )}
          </div>
        );

      case "grades":
        return (
          <div className="content-section">
            <div className="dashboard-header">
              <h1>My Grades</h1>
            </div>
            {Array.isArray(grades) && grades.length > 0 ? (
              <div className="table-container">
                <table className="courses-table">
                  <thead>
                    <tr>
                      <th>EDP Code</th>
                      <th>Midterm Grade</th>
                      <th>Final Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade._id}>
                        <td>{grade.edpCode}</td>
                        <td>{grade.midtermGrade || "---"}</td>
                        <td>{grade.finalGrade || "---"}</td>
                        <td>{grade.remarks || "---"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No grades available</p>
            )}
            {Array.isArray(grades) &&
              grades.length > 0 &&
              !grades.some(
                (g) => g.midtermGrade !== null || g.finalGrade !== null
              ) && (
                <div className="error-message">
                  Grade access restricted, Tuition payments need to be done
                </div>
              )}
          </div>
        );

      case "clearance":
        return (
          <div className="content-section">
            <div className="dashboard-header">
              <h1>Clearance Status</h1>
            </div>
            {Array.isArray(clearance) && clearance.length > 0 ? (
              <div className="table-container">
                <table className="courses-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Teacher ID</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clearance.map((item) => (
                      <tr key={item._id}>
                        <td>{item.courseCode}</td>
                        <td>{item.teacherId}</td>
                        <td>
                          <span
                            className={`status-badge ${item.status?.toLowerCase()}`}
                          >
                            {item.status || "Pending"}
                          </span>
                        </td>
                        <td>{item.remarks || "---"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No clearance records available</p>
            )}
          </div>
        );

      case "evaluation":
        return (
          <div className="content-section">
            <div className="dashboard-header">
              <h1>Academic Evaluation</h1>
            </div>
            {evaluation ? (
              <div className="evaluation-content">
                {evaluation.courses && (
                  <div className="course-tables-container">
                    {Object.entries(
                      groupCoursesByYearAndSemester(evaluation.courses)
                    ).map(([year, semesters]) => (
                      <div key={year} className="year-section">
                        <h3>{year} Year</h3>
                        <div className="semester-tables">
                          <div className="semester-table">
                            <h4>First Semester</h4>
                            <div className="table-container">
                              <table className="courses-table">
                                <thead>
                                  <tr>
                                    <th>Course Code</th>
                                    <th>Grade</th>
                                    <th>Remarks</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {semesters.firstSem.map((course) => (
                                    <tr key={course.courseCode}>
                                      <td>{course.courseCode}</td>
                                      <td>{course.grade}</td>
                                      <td>{course.remarks}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="semester-table">
                            <h4>Second Semester</h4>
                            <div className="table-container">
                              <table className="courses-table">
                                <thead>
                                  <tr>
                                    <th>Course Code</th>
                                    <th>Grade</th>
                                    <th>Remarks</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {semesters.secondSem.map((course) => (
                                    <tr key={course.courseCode}>
                                      <td>{course.courseCode}</td>
                                      <td>{course.grade}</td>
                                      <td>{course.remarks}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p>No evaluation data available</p>
            )}
          </div>
        );

      case "enrollment":
        return (
          <div className="content-section">
            <div className="dashboard-header">
              <h1>Course Enrollment</h1>
            </div>
            <form onSubmit={handleEnrollmentSubmit} className="user-form">
              <div className="user-form-group">
                <label htmlFor="semester">Semester:</label>
                <select name="semester" id="semester" required>
                  <option value="">Select Semester</option>
                  <option value="1">First Semester</option>
                  <option value="2">Second Semester</option>
                </select>
              </div>

              <div className="user-form-group">
                <label htmlFor="yearLevel">Year Level:</label>
                <select name="yearLevel" id="yearLevel" required>
                  <option value="">Select Year Level</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div>

              <div className="courses-section">
                <label>Courses to Enroll:</label>
                {enrolledCourses.map((course, idx) => (
                  <div key={course.index} className="course-input-group">
                    <div className="search-group">
                      <button
                        type="button"
                        className="search-btn"
                        onClick={() =>
                          handleCourseSearch(course.edpCode, course.index)
                        }
                      >
                        Search
                      </button>
                      <input
                        type="text"
                        value={course.edpCode}
                        onChange={(e) => {
                          const newCourses = [...enrolledCourses];
                          newCourses[idx].edpCode = e.target.value;
                          setEnrolledCourses(newCourses);
                        }}
                        placeholder="Enter EDP Code"
                        pattern="^[0-9]+$"
                        title="Please enter a valid EDP code"
                        required
                      />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeCourse(course.index)}
                      >
                        Remove
                      </button>
                    </div>
                    {searchResults[course.index] && (
                      <div className="course-details">
                        <p>
                          <strong>Course Code:</strong>{" "}
                          {searchResults[course.index].courseCode}
                        </p>
                        <p>
                          <strong>Schedule:</strong>{" "}
                          {searchResults[course.index].schedule.day}{" "}
                          {searchResults[course.index].schedule.time}
                        </p>
                        <p>
                          <strong>Room:</strong>{" "}
                          {searchResults[course.index].schedule.room}
                        </p>
                        <p>
                          <strong>Teacher:</strong>{" "}
                          {searchResults[course.index].teacherAssigned}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-course-btn"
                  onClick={addNewCourse}
                >
                  Add Another Course
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="edit-btn">
                Submit Enrollment
              </button>
            </form>
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  // * Helper function to group courses by year and semester
  const groupCoursesByYearAndSemester = (courses) => {
    const grouped = {};
    courses.forEach((course) => {
      const year = course.yearOffered;
      const semester = course.semesterOffered;

      if (!grouped[year]) {
        grouped[year] = {
          firstSem: [],
          secondSem: [],
        };
      }

      if (semester === 1) {
        grouped[year].firstSem.push(course);
      } else {
        grouped[year].secondSem.push(course);
      }
    });
    return grouped;
  };

  return (
    <div className="admin-dashboard">
      {/* * Sidebar */}
      <div className="sidebar">
        <h2>Student Dashboard</h2>
        <nav className="admin-nav-container">
          <button
            className={`admin-nav-button ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </button>

          <button
            className={`admin-nav-button ${
              activeTab === "grades" ? "active" : ""
            }`}
            onClick={() => setActiveTab("grades")}
          >
            My Grades
          </button>

          <button
            className={`admin-nav-button ${
              activeTab === "clearance" ? "active" : ""
            }`}
            onClick={() => setActiveTab("clearance")}
          >
            Clearance Status
          </button>

          <button
            className={`admin-nav-button ${
              activeTab === "enrollment" ? "active" : ""
            }`}
            onClick={() => setActiveTab("enrollment")}
          >
            Enrollment
          </button>

          <button
            className={`admin-nav-button ${
              activeTab === "evaluation" ? "active" : ""
            }`}
            onClick={() => setActiveTab("evaluation")}
          >
            Evaluation
          </button>

          <button className="admin-nav-button logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>

      {/* * Main content area */}
      <div className="admin-main-content">{renderActiveComponent()}</div>
    </div>
  );
};

export default StudentDashboard;
