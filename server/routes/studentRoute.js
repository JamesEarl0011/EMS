// server/routes/studentRoutes.js
import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getStudentProfile,
  updateStudentAddress,
  updateStudentContact,
  getStudentGrades,
  getStudentClearance,
  getStudentEnrollment,
  createStudentEnrollment,
  getStudentEvaluation,
  getStudentCourses,
  getOfferedCourse,
} from "../controllers/studentController.js";

const router = Router();

// * Student Routes
// ? All routes require student authentication

router.use(protect);
router.use(authorize("student"));

// * Profile Management
// ? Get profile and update address/contact information
router.get("/profile", getStudentProfile);
router.put("/profile/address", updateStudentAddress);
router.put("/profile/contact", updateStudentContact);

// * Academic Records
// ? Get grades, clearance, enrollment, and evaluation
router.get("/grades", getStudentGrades);
router.get("/clearance", getStudentClearance);
router.get("/evaluation", getStudentEvaluation);

// * Enrollment Management
// ? Get current enrollment and create new enrollment
router.get("/enrollment", getStudentEnrollment);
router.post("/enrollment", createStudentEnrollment);

// * Course Management
// ? Get currently enrolled courses
router.get("/courses", getStudentCourses);

// * Course Search
// ? Search for offered courses by EDP code
router.get("/offered-courses/:edpCode", getOfferedCourse);

export default router;
