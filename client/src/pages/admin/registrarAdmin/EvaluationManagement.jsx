import { useState, useEffect } from "react";
import axios from "../../../api/axios";
import "../../../styles/EvaluationManagement.css";

const EvaluationManagement = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // * Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get("/admin/registrar/students");
      setStudents(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch students");
      console.error(err);
    }
  };

  // * Fetch student evaluation
  const fetchEvaluation = async (studentId) => {
    try {
      const response = await axios.get(
        `/admin/registrar/evaluations/${studentId}`
      );
      setSelectedStudent(response.data);
      setShowModal(true);
      setError(null);
    } catch (err) {
      setError("Failed to fetch student evaluation");
      console.error(err);
    }
  };

  // * Group courses by year and semester
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

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="evaluation-management">
      <div className="dashboard-header">
        <h1>Evaluation Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Program Code</th>
              <th>Curriculum Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.studentId}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.studentInfo?.programCode}</td>
                <td>{student.studentInfo?.yearEnrolled}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => fetchEvaluation(student.studentId)}
                  >
                    View Evaluation
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Evaluation Modal */}
      {showModal && selectedStudent && (
        <div className="modal">
          <div className="modal-content evaluation-content">
            <div className="modal-header">
              <h2>Student Evaluation</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setSelectedStudent(null);
                }}
              >
                ×
              </button>
            </div>

            {/* Student Info Header */}
            <div className="student-info-header">
              <div className="info-item">
                <label>Student ID:</label>
                <span>{selectedStudent.studentId}</span>
              </div>
              <div className="info-item">
                <label>Name:</label>
                <span>{selectedStudent.studentName}</span>
              </div>
              <div className="info-item">
                <label>Curriculum Year:</label>
                <span>{selectedStudent.yearEnrolled}</span>
              </div>
            </div>

            {/* Course Tables */}
            {selectedStudent.courses && (
              <div className="course-tables-container">
                {Object.entries(
                  groupCoursesByYearAndSemester(selectedStudent.courses)
                ).map(([year, semesters]) => (
                  <div key={year} className="year-section">
                    <h3>{year} Year</h3>
                    <div className="semester-tables">
                      {/* First Semester Table */}
                      <div className="semester-table">
                        <h4>First Semester</h4>
                        <table>
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

                      {/* Second Semester Table */}
                      <div className="semester-table">
                        <h4>Second Semester</h4>
                        <table>
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationManagement;
