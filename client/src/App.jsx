import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MISAdminDashboard from "./pages/admin/misAdmin/MISAdminDashboard";
import AddStudent from "./pages/admin/misAdmin/AddStudent";
import AddTeacher from "./pages/admin/misAdmin/AddTeacher";
import AddAdmin from "./pages/admin/misAdmin/AddAdmin";
import AccountingAdminDashboard from "./pages/admin/accountingAdmin/AccountingAdminDashboard";
import RegistrarAdminDashboard from "./pages/admin/registrarAdmin/RegistrarAdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import GradeManagement from "./pages/teacher/GradeManagement";
import ClearanceManagement from "./pages/teacher/ClearanceManagement";
import StudentDashboard from "./pages/student/StudentDashboard";
import AddCourseOffering from "./pages/admin/misAdmin/AddCourseOffering";
import CourseOffering from "./pages/admin/misAdmin/CourseOffering";
import "./App.css";


// * Main App component
function App() {
  return (
    <Router>
      <Routes>
        {/* * Public route */}
        <Route path="/" element={<Login />} />

        {/* * Student Routes */}
        <Route
          path="/students/*"
          element={
            // <ProtectedRoute allowedRole="student">
              <Routes>
                <Route path="" element={<StudentDashboard />} />
                <Route path="*" element={<Navigate to="/students" replace />} />
              </Routes>
            // </ProtectedRoute>
          }
        />

        {/* * Teacher Routes */}
        <Route
          path="/teachers/*"
          element={
            // <ProtectedRoute allowedRole="teacher">
              <Routes>
                <Route path="" element={<TeacherDashboard />} />
                <Route
                  path="courses/:edpCode/grades"
                  element={<GradeManagement />}
                />
                <Route
                  path="courses/:edpCode/clearance"
                  element={<ClearanceManagement />}
                />
                <Route path="*" element={<Navigate to="/teachers" replace />} />
              </Routes>
            // </ProtectedRoute>
          }
        />

        {/* * MIS Admin Routes */}
        <Route
          path="/admin/mis/*"
          element={
            // <ProtectedRoute allowedRole="admin" allowedPosition="mis">
              <Routes>
                <Route path="" element={<MISAdminDashboard />} />
                <Route path="users/add-student" element={<AddStudent />} />
                <Route path="users/add-teacher" element={<AddTeacher />} />
                <Route path="users/add-admin" element={<AddAdmin />} />
                <Route path="users/edit-student/:id" element={<AddStudent />} />
                <Route path="users/edit-teacher/:id" element={<AddTeacher />} />
                <Route path="users/edit-admin/:id" element={<AddAdmin />} />
                <Route path="course-offerings" element={<CourseOffering />} />
                <Route
                  path="course-offerings/add"
                  element={<AddCourseOffering />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/admin/mis" replace />}
                />
              </Routes>
            // </ProtectedRoute>
          }
        />

        {/* * Registrar Admin Routes */}
        <Route
          path="/admin/registrar/*"
          element={
            // <ProtectedRoute allowedRole="admin" allowedPosition="registrar">
              <Routes>
                <Route path="" element={<RegistrarAdminDashboard />} />
                <Route
                  path="*"
                  element={<Navigate to="/admin/registrar" replace />}
                />
              </Routes>
            // </ProtectedRoute>
          }
        />

        {/* * Accounting Admin Routes */}
        <Route
          path="/admin/accounting/*"
          element={
            // <ProtectedRoute allowedRole="admin" allowedPosition="accounting">
              <Routes>
                <Route path="" element={<AccountingAdminDashboard />} />
              </Routes>
            // </ProtectedRoute>
          }
        />

        {/* * Catch all route - redirect to appropriate dashboard or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
