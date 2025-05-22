// server/routes/teacherRoutes.js
import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAssignedCourses,
  getCourseStudentsWithGrades,
  uploadGrades,
  uploadGradesFromFile,
  getCourseStudentsWithClearance,
  updateClearanceStatus,
  updateStudentGrade,
} from "../controllers/teacherController.js";

const router = Router();

// * Teacher Routes
// ? All routes require teacher authentication

router.use(protect);
router.use(authorize("teacher"));

// * Course Management
// ? Get all assigned courses
router.get("/courses", getAssignedCourses);

// * Grade Management
// ? Get students with grades for a specific course
router.get("/courses/:edpCode/students", getCourseStudentsWithGrades);
// ? Upload grades manually or via file
router.post("/courses/:edpCode/grades", uploadGrades);
router.post("/courses/:edpCode/grades/upload", uploadGradesFromFile);
// ? Update grades from file (PUT)
router.put("/courses/:edpCode/grades/upload", uploadGradesFromFile);
// ? Update individual student grade
router.put("/courses/:edpCode/grades/:studentId", updateStudentGrade);

// * Clearance Management
// ? Get students with clearance for a specific course
router.get("/courses/:edpCode/clearance", getCourseStudentsWithClearance);
router.put("/courses/:edpCode/clearance/:studentId", updateClearanceStatus);

export default router;
