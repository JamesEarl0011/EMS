import { useState, useEffect } from "react";
import axios from "../../api/axios";

const ClearanceManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch teacher's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/teachers/courses");
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch courses");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch students when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchStudentClearances(selectedCourse.edpCode);
    }
  }, [selectedCourse]);

  const fetchStudentClearances = async (edpCode) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/teachers/courses/${edpCode}/clearance`
      );
      setStudents(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch student clearances");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSuccessMessage("");
  };

  const handleClearanceAction = async (studentId) => {
    if (!selectedCourse) return;

    const student = students.find((s) => s.studentId === studentId);
    if (!student) return;

    const clearance = student.clearances.find(
      (c) => c.courseCode === selectedCourse.edpCode
    );
    if (!clearance) return;

    try {
      // Toggle between Cleared and Pending
      const newStatus = clearance.status === "Cleared" ? "Pending" : "Cleared";
      const remarks =
        newStatus === "Cleared" ? "Cleared by teacher" : "Pending review";

      await axios.put(
        `/teachers/courses/${selectedCourse.edpCode}/clearance/${studentId}`,
        {
          status: newStatus,
          remarks,
        }
      );

      setSuccessMessage(
        `Clearance ${newStatus.toLowerCase()} for ${studentId}`
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh the student list
      fetchStudentClearances(selectedCourse.edpCode);
    } catch (err) {
      setError(`Failed to update clearance for ${studentId}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="clearance-management">
      <div className="dashboard-header">
        <h1>Clearance Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="course-selection">
        <h2>Select a Course</h2>
        <div
          className="courses-list"
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            padding: "10px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
          }}
        >
          {courses.map((course) => (
            <button
              key={course.edpCode}
              className={`course-select-btn ${
                selectedCourse?.edpCode === course.edpCode ? "active" : ""
              }`}
              onClick={() => handleCourseSelect(course)}
              style={{
                width: "10%",
                marginBottom: "8px",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor:
                  selectedCourse?.edpCode === course.edpCode
                    ? "#e3f2fd"
                    : "white",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                color: "#333",
              }}
            >
              <span className="course-code" style={{ fontWeight: "bold" }}>
                {course.courseCode}
              </span>
              <span className="course-name" style={{ color: "#666" }}>
                {course.courseName}
              </span>
              <span
                className="course-details"
                style={{ fontSize: "0.9em", color: "#888" }}
              >
                {course.section} • {course.schedule?.day}{" "}
                {course.schedule?.time}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedCourse && (
        <div
          className="content-section"
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            color: "#333",
          }}
        >
          <div
            className="clearance-status"
            style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
              color: "#333",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#2c3e50" }}>
              Clearance Status
            </h3>
            {loading ? (
              <div
                className="loading"
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#6c757d",
                }}
              >
                Loading student data...
              </div>
            ) : (
              <table
                className="clearance-table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "center",
                      }}
                    >
                      Student ID
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "center",
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "center",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "center",
                      }}
                    >
                      Remarks
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "center",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const clearance = student.clearances.find(
                      (c) => c.courseCode === selectedCourse.edpCode
                    );

                    return (
                      <tr
                        key={student.studentId}
                        style={{
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        <td style={{ padding: "12px" }}>{student.studentId}</td>
                        <td style={{ padding: "12px" }}>{student.name}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            className={`status-badge ${
                              clearance?.status?.toLowerCase() || "pending"
                            }`}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              backgroundColor:
                                clearance?.status === "Cleared"
                                  ? "#28a745"
                                  : "#ffc107",
                              color: "white",
                              fontSize: "0.9em",
                            }}
                          >
                            {clearance?.status || "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: "#6c757d" }}>
                          {clearance?.remarks || "No remarks"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            className="action-btn"
                            onClick={() =>
                              handleClearanceAction(student.studentId)
                            }
                            style={{
                              padding: "6px 12px",
                              backgroundColor:
                                clearance?.status === "Cleared"
                                  ? "#dc3545"
                                  : "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            {clearance?.status === "Cleared"
                              ? "Revoke"
                              : "Clear"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearanceManagement;
