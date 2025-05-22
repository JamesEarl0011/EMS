// * Student Controller
// @ file: Handles all student-related operations

import { User } from "../models/User.js";
import Grade from "../models/Grade.js";
import Clearance from "../models/Clearance.js";
import Enrollment from "../models/Enrollment.js";
import Evaluation from "../models/Evaluation.js";
import OfferedCourse from "../models/OfferedCourse.js";

// * Profile Management Controllers

// ? Get student's profile information
export const getStudentProfile = async (req, res) => {
  try {
    // ! req.user is set by the auth middleware
    const student = await User.findOne({
      studentId: req.user.studentId,
    }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Update student's address information
export const updateStudentAddress = async (req, res) => {
  try {
    const { provinceAddress, cityAddress } = req.body;

    const student = await User.findOne({ studentId: req.user.studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // * Update the first address or create if none exists
    if (!student.studentInfo.demographicProfile.address) {
      student.studentInfo.demographicProfile.address = [];
    }

    if (student.studentInfo.demographicProfile.address.length === 0) {
      student.studentInfo.demographicProfile.address.push({
        provinceAddress,
        cityAddress,
      });
    } else {
      student.studentInfo.demographicProfile.address[0] = {
        provinceAddress,
        cityAddress,
      };
    }

    await student.save();
    res.json({ message: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Update student's contact information
export const updateStudentContact = async (req, res) => {
  try {
    const { emailAddress, mobileNumber, landLineNumber } = req.body;

    const student = await User.findOne({ studentId: req.user.studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // * Update the first contact info or create if none exists
    if (!student.studentInfo.demographicProfile.contactInformation) {
      student.studentInfo.demographicProfile.contactInformation = [];
    }

    if (
      student.studentInfo.demographicProfile.contactInformation.length === 0
    ) {
      student.studentInfo.demographicProfile.contactInformation.push({
        emailAddress,
        mobileNumber,
        landLineNumber,
      });
    } else {
      student.studentInfo.demographicProfile.contactInformation[0] = {
        emailAddress,
        mobileNumber,
        landLineNumber,
      };
    }

    await student.save();
    res.json({ message: "Contact information updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// * Academic Information Controllers

// ? Get student's grades
export const getStudentGrades = async (req, res) => {
  try {
    const grades = await Grade.findOne({ studentId: req.user.studentId });

    if (!grades) {
      return res.status(404).json({ message: "No grades found" });
    }

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Get student's clearance status
export const getStudentClearance = async (req, res) => {
  try {
    const clearance = await Clearance.findOne({
      studentId: req.user.studentId,
    });

    if (!clearance) {
      return res.status(404).json({ message: "No clearance record found" });
    }

    res.json(clearance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// * Enrollment Controllers

// ? Get student's enrollment information
export const getStudentEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.user.studentId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "No enrollment record found" });
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Create new enrollment for student
export const createStudentEnrollment = async (req, res) => {
  try {
    const { studentId, semester, yearLevel, courses } = req.body;

    // * Validate required fields
    if (!studentId || !semester || !yearLevel || !courses || !courses.length) {
      return res.status(400).json({
        message:
          "Missing required fields: studentId, semester, yearLevel, and courses are required",
      });
    }

    // * Check if student already has an enrollment
    const existingEnrollment = await Enrollment.findOne({
      studentId: studentId,
      status: { $in: ["Pending", "Approved"] },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "Student already has a pending or approved enrollment",
      });
    }

    // * Validate that all courses exist
    const edpCodes = courses.map((course) => course.edpCode);
    const existingCourses = await OfferedCourse.find({
      edpCode: { $in: edpCodes },
    });

    if (existingCourses.length !== edpCodes.length) {
      return res.status(400).json({
        message: "One or more courses do not exist",
      });
    }

    // * Create new enrollment
    const enrollment = new Enrollment({
      studentId,
      semester,
      yearLevel,
      courses: courses.map((course) => ({ edpCode: course.edpCode })),
      status: "Pending",
    });

    await enrollment.save();
    res.status(201).json({
      message: "Enrollment created successfully",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Get student's evaluation
export const getStudentEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      studentId: req.user.studentId,
    });

    if (!evaluation) {
      return res.status(404).json({ message: "No evaluation record found" });
    }

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Get student's current courses
export const getStudentCourses = async (req, res) => {
  try {
    // * Get student's current enrollment
    const enrollment = await Enrollment.findOne({
      studentId: req.user.studentId,
      status: "Approved",
    });

    if (!enrollment) {
      return res.status(404).json({ message: "No active enrollment found" });
    }

    // * Get details of enrolled courses
    const courseDetails = await OfferedCourse.find({
      edpCode: { $in: enrollment.courses.map((c) => c.edpCode) },
    });

    res.json(courseDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Search for offered course by EDP code
export const getOfferedCourse = async (req, res) => {
  try {
    const { edpCode } = req.params;

    // * Find the offered course
    const offeredCourse = await OfferedCourse.findOne({ edpCode });

    if (!offeredCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // * Return course details
    res.json({
      edpCode: offeredCourse.edpCode,
      courseCode: offeredCourse.courseCode,
      courseName: offeredCourse.courseName,
      schedule: offeredCourse.schedule,
      teacherAssigned: offeredCourse.teacherAssigned,
      units: offeredCourse.units,
      maxStudents: offeredCourse.maxStudents,
      currentEnrolled: offeredCourse.currentEnrolled,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
