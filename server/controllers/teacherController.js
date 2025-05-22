// * Teacher Controller
// @ file: Handles all teacher-related operations

import { User } from "../models/User.js";
import TeacherGrade from "../models/TeacherGrade.js";
import OfferedCourse from "../models/OfferedCourse.js";
import Clearance from "../models/Clearance.js";
import Grade from "../models/Grade.js";

// * Course Management Controllers

// ? Get teacher's assigned courses
export const getAssignedCourses = async (req, res) => {
  try {
    const courses = await OfferedCourse.find({
      teacherAssigned: req.user.facultyId,
    });

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No assigned courses found" });
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// * Grade Management Controllers

// ? Get students with grades for a specific course
export const getCourseStudentsWithGrades = async (req, res) => {
  try {
    const { edpCode } = req.params;

    // * Verify if teacher is assigned to this course
    const course = await OfferedCourse.findOne({
      edpCode,
      teacherAssigned: req.user.facultyId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not assigned to teacher" });
    }

    // * Get all students who have this course in their grades array
    const gradeRecords = await Grade.find({
      "grades.edpCode": edpCode,
    });

    // * Get user details for each student
    const students = await Promise.all(
      gradeRecords.map(async (gradeRecord) => {
        const user = await User.findOne({ studentId: gradeRecord.studentId });
        const courseGrade = gradeRecord.grades.find(
          (g) => g.edpCode === edpCode
        );

        return {
          studentId: gradeRecord.studentId,
          name: user?.name || "Unknown",
          grades: [courseGrade],
        };
      })
    );

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Upload grades for a specific course
export const uploadGrades = async (req, res) => {
  try {
    const { edpCode } = req.params;
    const { term, grades } = req.body;

    // * Verify if teacher is assigned to this course
    const course = await OfferedCourse.findOne({
      edpCode,
      teacherAssigned: req.user.facultyId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not assigned to teacher" });
    }

    // * Create or update grade entry
    const teacherGrade = await TeacherGrade.findOneAndUpdate(
      {
        teacher: req.user.facultyId,
        edpCode,
        term,
      },
      {
        teacher: req.user.facultyId,
        edpCode,
        term,
        grades,
        updatedAt: Date.now(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Grades uploaded successfully", teacherGrade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Upload grades from file
export const uploadGradesFromFile = async (req, res) => {
  try {
    const { edpCode } = req.params;
    const { grades, gradeType } = req.body;

    // * Verify if teacher is assigned to this course
    const course = await OfferedCourse.findOne({
      edpCode,
      teacherAssigned: req.user.facultyId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not assigned to teacher" });
    }

    // * Update grades for each student
    for (const gradeData of grades) {
      const { studentId, midtermGrade, finalGrade, remarks } = gradeData;

      // Update the grade in the student's grades array
      await Grade.findOneAndUpdate(
        {
          studentId,
          "grades.edpCode": edpCode,
        },
        {
          $set: {
            [`grades.$.${
              gradeType === "midterm" ? "midtermGrade" : "finalGrade"
            }`]: gradeType === "midterm" ? midtermGrade : finalGrade,
            "grades.$.remarks": remarks,
          },
        },
        { new: true }
      );
    }

    res.json({
      message: "Grades uploaded successfully from file",
      count: grades.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// * Clearance Management Controllers

// ? Get students with clearance for a specific course
export const getCourseStudentsWithClearance = async (req, res) => {
  try {
    const { edpCode } = req.params;

    // * Verify if teacher is assigned to this course
    const course = await OfferedCourse.findOne({
      edpCode,
      teacherAssigned: req.user.facultyId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not assigned to teacher" });
    }

    // * Get all students who have this course in their clearances array
    const clearanceRecords = await Clearance.find({
      "clearances.courseCode": edpCode,
    });

    // * Get user details for each student
    const students = await Promise.all(
      clearanceRecords.map(async (clearanceRecord) => {
        const user = await User.findOne({
          studentId: clearanceRecord.studentId,
        });
        const courseClearance = clearanceRecord.clearances.find(
          (c) => c.courseCode === edpCode
        );

        return {
          studentId: clearanceRecord.studentId,
          name: user?.name || "Unknown",
          clearances: [courseClearance],
        };
      })
    );

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Update student's clearance status
export const updateClearanceStatus = async (req, res) => {
  try {
    const { edpCode, studentId } = req.params;
    const { status, remarks } = req.body;

    // * Verify if teacher is assigned to this course
    const course = await OfferedCourse.findOne({
      edpCode,
      teacherAssigned: req.user.facultyId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not assigned to teacher" });
    }

    // * Update clearance status
    const clearance = await Clearance.findOneAndUpdate(
      {
        studentId,
        "clearances.courseCode": edpCode,
      },
      {
        $set: {
          "clearances.$.status": status,
          "clearances.$.remarks": remarks,
        },
      },
      { new: true }
    );

    if (!clearance) {
      return res.status(404).json({ message: "Clearance record not found" });
    }

    res.json({ message: "Clearance status updated successfully", clearance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Update individual student grade
export const updateStudentGrade = async (req, res) => {
  try {
    const { edpCode, studentId } = req.params;
    const { midtermGrade, finalGrade, remarks } = req.body;

    // * Verify if teacher is assigned to this course
    const course = await OfferedCourse.findOne({
      edpCode,
      teacherAssigned: req.user.facultyId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not assigned to teacher" });
    }

    // * Update the grade in the student's grades array
    const grade = await Grade.findOneAndUpdate(
      {
        studentId,
        "grades.edpCode": edpCode,
      },
      {
        $set: {
          "grades.$.midtermGrade": midtermGrade,
          "grades.$.finalGrade": finalGrade,
          "grades.$.remarks": remarks,
        },
      },
      { new: true }
    );

    if (!grade) {
      return res.status(404).json({ message: "Grade record not found" });
    }

    res.json({ message: "Grade updated successfully", grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
