// * Registrar Admin Controller
// @ file: Handles all registrar admin operations

import Evaluation from "../models/Evaluation.js";
import { User } from "../models/User.js";

// * Student Management Controllers

// ? Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("studentId name studentInfo")
      .lean();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// * Evaluation Management Controllers

// ? Get student evaluation
export const getStudentEvaluation = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student information
    const student = await User.findOne({ studentId })
      .select("name studentInfo")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get evaluation
    const evaluation = await Evaluation.findOne({ studentId });

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Combine student info with evaluation data
    const response = {
      ...evaluation.toObject(),
      studentName: student.name,
      yearEnrolled: student.studentInfo?.yearEnrolled,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ? Update student evaluation
export const updateStudentEvaluation = async (req, res) => {
  try {
    const { studentId } = req.params;
    const evaluationData = req.body;

    const evaluation = await Evaluation.findOneAndUpdate(
      { studentId },
      evaluationData,
      { new: true, upsert: true }
    );

    res.json({
      message: "Evaluation updated successfully",
      evaluation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
