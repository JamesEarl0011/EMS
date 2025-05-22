import { useState, useEffect } from "react";
import axios from "../../api/axios";
import ExcelJS from "exceljs";

const GradeManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState("midterm"); // midterm or final
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
      fetchStudentGrades(selectedCourse.edpCode);
    }
  }, [selectedCourse]);

  const fetchStudentGrades = async (edpCode) => {
    setLoading(true);
    try {
      const response = await axios.get(`/teachers/courses/${edpCode}/students`);
      setStudents(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch student grades");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSuccessMessage("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccessMessage("");
  };

  const handleUploadTypeChange = (e) => {
    setUploadType(e.target.value);
  };

  const processExcelFile = async (file) => {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error("No worksheet found in the file");
      }

      const validGrades = [];
      const headers = worksheet.getRow(1).values;

      // Find column indices
      const studentIdCol = headers.findIndex((h) =>
        ["studentid", "student_id", "student id"].includes(
          h?.toString().trim().toLowerCase().replace(/\s+/g, " ")
        )
      );

      const gradeCol = headers.findIndex((h) => {
        const header = h?.toString().trim().toLowerCase().replace(/\s+/g, " ");
        return uploadType === "midterm"
          ? ["midtermgrade", "midterm_grade", "midterm grade"].includes(header)
          : ["finalgrade", "final_grade", "final grade"].includes(header);
      });

      if (studentIdCol === -1 || gradeCol === -1) {
        throw new Error("Required columns not found in the file");
      }

      // Process rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const studentId = row.getCell(studentIdCol).value;
        const grade = row.getCell(gradeCol).value;

        // Skip if studentId or grade is missing
        if (
          !studentId ||
          grade === undefined ||
          grade === null ||
          grade === ""
        ) {
          return;
        }

        // Calculate remarks for final grades
        let remarks = "N/A";
        if (uploadType === "final") {
          const finalGrade = parseFloat(grade);
          if (!isNaN(finalGrade)) {
            remarks = finalGrade > 3.0 ? "Failed" : "Passed";
          }
        }

        validGrades.push({
          studentId: studentId.toString(),
          [uploadType === "midterm" ? "midtermGrade" : "finalGrade"]: grade,
          remarks,
        });
      });

      return validGrades;
    } catch (error) {
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !selectedCourse) return;

    try {
      setLoading(true);

      // Process the Excel file
      const processedGrades = await processExcelFile(file);

      if (processedGrades.length === 0) {
        setError("No valid grades found in the file");
        return;
      }

      // Upload the processed grades using PUT
      await axios.put(
        `/teachers/courses/${selectedCourse.edpCode}/grades/upload`,
        {
          grades: processedGrades,
          gradeType: uploadType,
        }
      );

      setSuccessMessage(
        `${
          uploadType === "midterm" ? "Midterm" : "Final"
        } grades uploaded successfully for ${processedGrades.length} students!`
      );

      // Refresh the student list
      fetchStudentGrades(selectedCourse.edpCode);
    } catch (err) {
      setError(
        "Failed to upload grades file: " + (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, value, type) => {
    const updatedStudents = students.map((student) => {
      if (student.studentId === studentId) {
        const updatedGrades = student.grades.map((grade) => {
          if (grade.edpCode === selectedCourse.edpCode) {
            const updatedGrade = {
              ...grade,
              [type]: value,
            };

            // Calculate remarks based on final grade
            if (type === "finalGrade") {
              if (!value || value === "0") {
                updatedGrade.remarks = "N/A";
              } else {
                const finalGrade = parseFloat(value);
                updatedGrade.remarks = finalGrade > 3.0 ? "Failed" : "Passed";
              }
            }

            return updatedGrade;
          }
          return grade;
        });

        return {
          ...student,
          grades: updatedGrades,
        };
      }
      return student;
    });

    setStudents(updatedStudents);
  };

  const handleSaveGrade = async (studentId, gradeType) => {
    if (!selectedCourse) return;

    const student = students.find((s) => s.studentId === studentId);
    if (!student) return;

    const grade = student.grades.find(
      (g) => g.edpCode === selectedCourse.edpCode
    );
    if (!grade) return;

    try {
      // Get the current values from the grade object
      const gradeData = {
        studentId,
        midtermGrade:
          gradeType === "midtermGrade"
            ? grade.midtermGrade
            : grade.midtermGrade,
        finalGrade:
          gradeType === "finalGrade" ? grade.finalGrade : grade.finalGrade,
        remarks: grade.remarks,
      };

      await axios.put(
        `/teachers/courses/${selectedCourse.edpCode}/grades/${studentId}`,
        gradeData
      );

      setSuccessMessage(`Grade updated successfully for ${studentId}`);
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh the student list to get updated data
      fetchStudentGrades(selectedCourse.edpCode);
    } catch (err) {
      setError(
        `Failed to update grade for ${studentId}: ${
          err.response?.data?.message || err.message
        }`
      );
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="grade-management">
      <div className="dashboard-header">
        <h1>Grade Management</h1>
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
                textAlign: "left",
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
            className="upload-section"
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
              Upload Grades
            </h3>
            <div
              className="upload-controls"
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <select
                value={uploadType}
                onChange={handleUploadTypeChange}
                className="upload-type-select"
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  backgroundColor: "white",
                  minWidth: "150px",
                  color: "#333",
                }}
              >
                <option value="midterm">Midterm Grades</option>
                <option value="final">Final Grades</option>
              </select>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="file-input"
                style={{
                  padding: "8px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  backgroundColor: "white",
                }}
              />
              <button
                onClick={handleFileUpload}
                disabled={!file}
                className="upload-btn"
                style={{
                  padding: "8px 16px",
                  backgroundColor: file ? "#007bff" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: file ? "pointer" : "not-allowed",
                  transition: "background-color 0.2s",
                }}
              >
                Upload
              </button>
            </div>
            <p
              className="upload-note"
              style={{
                marginTop: "10px",
                color: "#6c757d",
                fontSize: "0.9em",
              }}
            >
              Note: The Excel file should have columns for Student ID and Grade.
            </p>
          </div>

          <div
            className="grades-table-container"
            style={{
              overflowX: "auto",
              color: "#333",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#2c3e50" }}>
              Student Grades
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
                className="grades-table"
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
                        textAlign: "left",
                      }}
                    >
                      Student ID
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "left",
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "left",
                      }}
                    >
                      Midterm Grade
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "left",
                      }}
                    >
                      Action
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "left",
                      }}
                    >
                      Final Grade
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "left",
                      }}
                    >
                      Action
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                        textAlign: "left",
                      }}
                    >
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const courseGrade = student.grades[0] || {
                      midtermGrade: null,
                      finalGrade: null,
                      remarks: "",
                    };

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
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={courseGrade.midtermGrade || ""}
                            onChange={(e) =>
                              handleGradeChange(
                                student.studentId,
                                e.target.value,
                                "midtermGrade"
                              )
                            }
                            style={{
                              padding: "6px",
                              border: "1px solid #ced4da",
                              borderRadius: "4px",
                              width: "80px",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            className="save-btn"
                            onClick={() =>
                              handleSaveGrade(student.studentId, "midtermGrade")
                            }
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={courseGrade.finalGrade || ""}
                            onChange={(e) =>
                              handleGradeChange(
                                student.studentId,
                                e.target.value,
                                "finalGrade"
                              )
                            }
                            style={{
                              padding: "6px",
                              border: "1px solid #ced4da",
                              borderRadius: "4px",
                              width: "80px",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            className="save-btn"
                            onClick={() =>
                              handleSaveGrade(student.studentId, "finalGrade")
                            }
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        </td>
                        <td style={{ padding: "12px", color: "#6c757d" }}>
                          {courseGrade.remarks || "N/A"}
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

export default GradeManagement;
