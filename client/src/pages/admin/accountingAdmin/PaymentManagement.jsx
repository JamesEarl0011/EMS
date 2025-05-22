import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import "./../../../styles/PaymentManagement.css";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updateData, setUpdateData] = useState({
    term: "",
    status: "",
    datePaid: "",
    receiptNumber: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/admin/accounting/payments");
      setPayments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch payments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (payment, term) => {
    setSelectedPayment(payment);
    setUpdateData({
      term,
      status: payment.payments[0][term].status,
      datePaid: payment.payments[0][term].datePaid || "",
      receiptNumber: payment.payments[0][term].receiptNumber || "",
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `/admin/accounting/payments/${selectedPayment.studentId}`,
        {
          schoolYear: selectedPayment.schoolYear,
          semester: selectedPayment.semester,
          term: updateData.term,
          status: updateData.status,
          datePaid: updateData.status === "Paid" ? updateData.datePaid : null,
          receiptNumber:
            updateData.status === "Paid" ? updateData.receiptNumber : null,
        }
      );

      // Update grade access based on payment status
      if (response.data.accessStatus) {
        await axios.put(
          `/admin/accounting/grades/${selectedPayment.studentId}/access`,
          {
            midterms: response.data.accessStatus.midterms,
            finals: response.data.accessStatus.finals,
          }
        );
      }

      await fetchPayments();
      setShowUpdateModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update payment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && payments.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="payment-management">
      <div className="header">
        <h2>Payment Management</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>School Year</th>
              <th>Semester</th>
              <th>Midterm Status</th>
              <th>Midterm Date Paid</th>
              <th>Midterm Action</th>
              <th>Final Status</th>
              <th>Final Date Paid</th>
              <th>Final Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.studentId}</td>
                <td>{payment.schoolYear}</td>
                <td>{payment.semester}</td>
                <td>
                  <span
                    className={`status-${payment.payments[0]?.midterm?.status?.toLowerCase()}`}
                  >
                    {payment.payments[0]?.midterm?.status || "Pending"}
                  </span>
                </td>
                <td>{formatDate(payment.payments[0]?.midterm?.datePaid)}</td>
                <td>
                  <button
                    className="update-btn"
                    onClick={() => handleUpdateClick(payment, "midterm")}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <span
                    className={`status-${payment.payments[0]?.final?.status?.toLowerCase()}`}
                  >
                    {payment.payments[0]?.final?.status || "Pending"}
                  </span>
                </td>
                <td>{formatDate(payment.payments[0]?.final?.datePaid)}</td>
                <td>
                  <button
                    className="update-btn"
                    onClick={() => handleUpdateClick(payment, "final")}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Payment Modal */}
      {showUpdateModal && selectedPayment && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              Update {updateData.term === "midterm" ? "Midterm" : "Final"}{" "}
              Payment
            </h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={updateData.status}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, status: e.target.value })
                  }
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {updateData.status === "Paid" && (
                <>
                  <div className="form-group">
                    <label>Date Paid:</label>
                    <input
                      type="date"
                      value={updateData.datePaid}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          datePaid: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Receipt Number:</label>
                    <input
                      type="text"
                      value={updateData.receiptNumber}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          receiptNumber: e.target.value,
                        })
                      }
                      required
                      placeholder="Enter receipt number"
                    />
                  </div>
                </>
              )}

              {error && <p className="error-message">{error}</p>}

              <div className="modal-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
