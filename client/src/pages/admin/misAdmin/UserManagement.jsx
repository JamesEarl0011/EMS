import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "../../../styles/UserManagement.css";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/mis/users");
      setUsers(response.data);
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch users";
      setError(errorMsg);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      // Get the correct ID based on user role
      const userId =
        user.role === "student"
          ? user.studentId
          : user.role === "teacher"
          ? user.facultyId
          : user.adminId;

      await api.delete(`/admin/mis/users/${userId}`);
      setError(""); // Clear any previous errors
      await fetchUsers(); // Refresh the list after successful deletion
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete user";
      setError(errorMsg);
      console.error("Error deleting user:", err);
    }
  };

  const handleEdit = (user) => {
    if (!user || !user.role) {
      setError("Invalid user data");
      return;
    }

    try {
      let editPath = "";
      let userId = "";

      switch (user.role) {
        case "student":
          if (!user.studentId) {
            throw new Error("Student ID not found");
          }
          userId = user.studentId;
          editPath = "edit-student";
          break;
        case "teacher":
          if (!user.facultyId) {
            throw new Error("Faculty ID not found");
          }
          userId = user.facultyId;
          editPath = "edit-teacher";
          break;
        case "admin":
          if (!user.adminId) {
            throw new Error("Admin ID not found");
          }
          userId = user.adminId;
          editPath = "edit-admin";
          break;
        default:
          throw new Error("Invalid user role");
      }

      navigate(`/admin/mis/users/${editPath}/${userId}`);
    } catch (err) {
      setError(err.message || "Failed to edit user");
      console.error("Error navigating to edit page:", err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-management">
      <div className="dashboard-header">
        <h1>User Management</h1>
        <div className="user-add-buttons">
          <button
            className="add-button"
            onClick={() => navigate("/admin/mis/users/add-student")}
          >
            Add Student
          </button>
          <button
            className="add-button"
            onClick={() => navigate("/admin/mis/users/add-teacher")}
          >
            Add Teacher
          </button>
          <button
            className="add-button"
            onClick={() => navigate("/admin/mis/users/add-admin")}
          >
            Add Admin
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.studentId || user.facultyId || user.adminId}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {user.role === "admin"
                    ? `${user.role} (${user.adminInfo?.position})`
                    : user.role}
                </td>
                <td>{user.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(user)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
