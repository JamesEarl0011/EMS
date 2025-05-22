import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";
import "../../../styles/UserForms.css";

const AddStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    isActive: true,
    studentId: "",
    studentInfo: {
      programCode: "",
      yearEnrolled: new Date().getFullYear().toString(),
      yearLevel: 1,
      demographicProfile: {
        gender: "male",
        dateOfBirth: "",
        personWithDisability: false,
        civilStatus: "",
        placeOfBirth: "",
        religion: "",
        parents: [
          { role: "", name: "" },
          { role: "", name: "" },
        ],
        address: [
          {
            provinceAddress: "",
            cityAddress: "",
          },
        ],
        contactInformation: [
          {
            mobileNumber: "",
            landLineNumber: "",
          },
        ],
        supportingStudies: "parents",
        isEmployed: false,
        company: {
          name: "",
          address: "",
        },
        educationalBackground: [
          {
            elementary: "",
            secondary: "",
            isTransferree: false,
            college: {
              name: "",
              lastSemesterAttended: 0,
              course: "",
              dateGraduated: "",
              extraCurricularActivities: "",
            },
          },
        ],
        otherInformation: "",
      },
    },
  });

  useEffect(() => {
    if (id) {
      // Fetch user data if in edit mode
      const fetchUser = async () => {
        try {
          const response = await api.get(`/admin/mis/users/${id}`);
          const userData = response.data;

          // Ensure all required fields are present
          if (!userData || !userData.role) {
            throw new Error("Invalid user data received");
          }

          // Set form data with default values for missing fields
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "student",
            isActive: userData.isActive ?? true,
            studentId: userData.studentId || "",
            studentInfo: {
              programCode: userData.studentInfo?.programCode || "",
              yearEnrolled:
                userData.studentInfo?.yearEnrolled ||
                new Date().getFullYear().toString(),
              yearLevel: userData.studentInfo?.yearLevel || 1,
              demographicProfile: {
                gender:
                  userData.studentInfo?.demographicProfile?.gender || "male",
                dateOfBirth:
                  userData.studentInfo?.demographicProfile?.dateOfBirth || "",
                personWithDisability:
                  userData.studentInfo?.demographicProfile
                    ?.personWithDisability || false,
                civilStatus:
                  userData.studentInfo?.demographicProfile?.civilStatus || "",
                placeOfBirth:
                  userData.studentInfo?.demographicProfile?.placeOfBirth || "",
                religion:
                  userData.studentInfo?.demographicProfile?.religion || "",
                parents: userData.studentInfo?.demographicProfile?.parents || [
                  { role: "", name: "" },
                  { role: "", name: "" },
                ],
                address: userData.studentInfo?.demographicProfile?.address || [
                  {
                    provinceAddress: "",
                    cityAddress: "",
                  },
                ],
                contactInformation: userData.studentInfo?.demographicProfile
                  ?.contactInformation || [
                  {
                    mobileNumber: "",
                    landLineNumber: "",
                  },
                ],
                supportingStudies:
                  userData.studentInfo?.demographicProfile?.supportingStudies ||
                  "parents",
                isEmployed:
                  userData.studentInfo?.demographicProfile?.isEmployed || false,
                company: userData.studentInfo?.demographicProfile?.company || {
                  name: "",
                  address: "",
                },
                educationalBackground: userData.studentInfo?.demographicProfile
                  ?.educationalBackground || [
                  {
                    elementary: "",
                    secondary: "",
                    isTransferree: false,
                    college: {
                      name: "",
                      lastSemesterAttended: 0,
                      course: "",
                      dateGraduated: "",
                      extraCurricularActivities: "",
                    },
                  },
                ],
                otherInformation:
                  userData.studentInfo?.demographicProfile?.otherInformation ||
                  "",
              },
            },
          });
        } catch (err) {
          setError(
            err.response?.data?.message || "Failed to fetch student data"
          );
          console.error("Error fetching student:", err);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;

        // Handle array indices in the path
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // Check if the key includes array index
          if (key.includes("[") && key.includes("]")) {
            const arrayKey = key.split("[")[0];
            const index = parseInt(key.split("[")[1].split("]")[0]);

            if (!current[arrayKey]) {
              current[arrayKey] = [];
            }
            if (!current[arrayKey][index]) {
              current[arrayKey][index] = {};
            }
            current[arrayKey] = [...current[arrayKey]];
            current = current[arrayKey][index];
          } else {
            if (!current[key]) {
              current[key] = {};
            }
            current[key] = { ...current[key] };
            current = current[key];
          }
        }

        // Handle boolean values
        const finalValue =
          value === "true" ? true : value === "false" ? false : value;

        // Set the final value
        const lastKey = keys[keys.length - 1];
        if (lastKey.includes("[") && lastKey.includes("]")) {
          const arrayKey = lastKey.split("[")[0];
          const index = parseInt(lastKey.split("[")[1].split("]")[0]);
          if (!current[arrayKey]) {
            current[arrayKey] = [];
          }
          current[arrayKey] = [...current[arrayKey]];
          current[arrayKey][index] = finalValue;
        } else {
          current[lastKey] = finalValue;
        }

        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Add this function to process the parents array before submission
  const processParentsArray = (parentsData) => {
    // Filter out any parent entries with role "none" or empty role
    return parentsData.filter(
      (parent) => parent.role && parent.role !== "none" && parent.role !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Process the form data
      const processedFormData = {
        name: formData.name,
        email: formData.email,
        password: id ? undefined : "UC@new123",
        role: "student",
        isActive: true,
        studentId: formData.studentId,
        studentInfo: {
          programCode: formData.studentInfo.programCode,
          yearEnrolled: formData.studentInfo.yearEnrolled,
          yearLevel: Number(formData.studentInfo.yearLevel),
          demographicProfile: {
            gender: formData.studentInfo.demographicProfile.gender,
            dateOfBirth: formData.studentInfo.demographicProfile.dateOfBirth,
            civilStatus: formData.studentInfo.demographicProfile.civilStatus,
            placeOfBirth: formData.studentInfo.demographicProfile.placeOfBirth,
            religion: formData.studentInfo.demographicProfile.religion,
            // Process parents array to remove invalid entries
            parents: processParentsArray(
              formData.studentInfo.demographicProfile.parents
            ),
            address: [
              {
                provinceAddress:
                  formData.studentInfo.demographicProfile.address[0]
                    .provinceAddress,
                cityAddress:
                  formData.studentInfo.demographicProfile.address[0]
                    .cityAddress,
              },
            ],
            contactInformation: [
              {
                emailAddress: formData.email,
                mobileNumber:
                  formData.studentInfo.demographicProfile.contactInformation[0]
                    .mobileNumber,
                landLineNumber:
                  formData.studentInfo.demographicProfile.contactInformation[0]
                    .landLineNumber || "",
              },
            ],
            supportingStudies:
              formData.studentInfo.demographicProfile.supportingStudies,
            isEmployed: Boolean(
              formData.studentInfo.demographicProfile.isEmployed
            ),
            company: {
              name: formData.studentInfo.demographicProfile.company.name || "",
              address:
                formData.studentInfo.demographicProfile.company.address || "",
            },
            educationalBackground: [
              {
                elementary:
                  formData.studentInfo.demographicProfile
                    .educationalBackground[0].elementary,
                secondary:
                  formData.studentInfo.demographicProfile
                    .educationalBackground[0].secondary,
                isTransferree: Boolean(
                  formData.studentInfo.demographicProfile
                    .educationalBackground[0].isTransferree
                ),
                college: {
                  name:
                    formData.studentInfo.demographicProfile
                      .educationalBackground[0].college.name || "",
                  course:
                    formData.studentInfo.demographicProfile
                      .educationalBackground[0].college.course || "",
                  lastSemesterAttended:
                    formData.studentInfo.demographicProfile
                      .educationalBackground[0].college.lastSemesterAttended ||
                    0,
                  dateGraduated:
                    formData.studentInfo.demographicProfile
                      .educationalBackground[0].college.dateGraduated || "",
                  extraCurricularActivities:
                    formData.studentInfo.demographicProfile
                      .educationalBackground[0].college
                      .extraCurricularActivities || "",
                },
              },
            ],
            otherInformation:
              formData.studentInfo.demographicProfile.otherInformation || "",
          },
        },
      };

      console.log("Submitting data:", processedFormData);

      if (id) {
        await api.put(`/admin/mis/users/${id}`, processedFormData);
      } else {
        await api.post("/admin/mis/users", processedFormData);
      }
      navigate("/admin/mis/users");
    } catch (err) {
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message ||
          `Failed to ${id ? "update" : "create"} student`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-user-form-page">
      <div className="add-user-header">
        <h2>{id ? "Edit" : "Add New"} Student</h2>
        <button
          className="back-button"
          onClick={() => navigate("/admin/mis/users")}
        >
          Back to Users
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="user-form two-column">
        {/* Left Column - Basic Information */}
        <div className="user-form-column">
          <div className="user-form-section">
            <div className="user-form-section-title">Basic Information</div>
            <div className="user-form-group">
              <label htmlFor="studentId">Student ID</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                placeholder="Enter student ID"
              />
            </div>
            <div className="user-form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="user-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="user-form-group">
              <label htmlFor="studentInfo.programCode">Program Code</label>
              <input
                type="text"
                id="studentInfo.programCode"
                name="studentInfo.programCode"
                value={formData.studentInfo.programCode}
                onChange={handleChange}
                required
                placeholder="Enter program code"
              />
            </div>
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="studentInfo.yearEnrolled">Year Enrolled</label>
                <input
                  type="text"
                  id="studentInfo.yearEnrolled"
                  name="studentInfo.yearEnrolled"
                  value={formData.studentInfo.yearEnrolled}
                  onChange={handleChange}
                  required
                  placeholder="Enter year enrolled"
                />
              </div>
              <div className="user-form-group">
                <label htmlFor="studentInfo.yearLevel">Year Level</label>
                <select
                  id="studentInfo.yearLevel"
                  name="studentInfo.yearLevel"
                  value={formData.studentInfo.yearLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          <div className="user-form-section">
            <div className="user-form-section-title">Personal Information</div>
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.gender">
                  Gender
                </label>
                <select
                  id="studentInfo.demographicProfile.gender"
                  name="studentInfo.demographicProfile.gender"
                  value={formData.studentInfo.demographicProfile.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.dateOfBirth">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="studentInfo.demographicProfile.dateOfBirth"
                  name="studentInfo.demographicProfile.dateOfBirth"
                  value={formData.studentInfo.demographicProfile.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.civilStatus">
                  Civil Status
                </label>
                <input
                  type="text"
                  id="studentInfo.demographicProfile.civilStatus"
                  name="studentInfo.demographicProfile.civilStatus"
                  value={formData.studentInfo.demographicProfile.civilStatus}
                  onChange={handleChange}
                  placeholder="Enter civil status"
                />
              </div>
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.religion">
                  Religion
                </label>
                <input
                  type="text"
                  id="studentInfo.demographicProfile.religion"
                  name="studentInfo.demographicProfile.religion"
                  value={formData.studentInfo.demographicProfile.religion}
                  onChange={handleChange}
                  placeholder="Enter religion"
                />
              </div>
            </div>
            <div className="user-form-group">
              <label htmlFor="studentInfo.demographicProfile.placeOfBirth">
                Place of Birth
              </label>
              <input
                type="text"
                id="studentInfo.demographicProfile.placeOfBirth"
                name="studentInfo.demographicProfile.placeOfBirth"
                value={formData.studentInfo.demographicProfile.placeOfBirth}
                onChange={handleChange}
                placeholder="Enter place of birth"
              />
            </div>
          </div>

          <div className="user-form-section">
            <div className="user-form-section-title">Parents Information</div>
            <div className="user-form-group">
              <label htmlFor="studentInfo.demographicProfile.parents[0].role">
                Parent/Guardian 1 Role
              </label>
              <select
                id="studentInfo.demographicProfile.parents[0].role"
                name="studentInfo.demographicProfile.parents[0].role"
                value={formData.studentInfo.demographicProfile.parents[0].role}
                onChange={handleChange}
              >
                <option value="">Select Role (Optional)</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
              </select>
            </div>
            <div className="user-form-group">
              <label htmlFor="studentInfo.demographicProfile.parents[0].name">
                Parent/Guardian 1 Name
              </label>
              <input
                type="text"
                id="studentInfo.demographicProfile.parents[0].name"
                name="studentInfo.demographicProfile.parents[0].name"
                value={formData.studentInfo.demographicProfile.parents[0].name}
                onChange={handleChange}
                placeholder="Enter name"
                disabled={
                  !formData.studentInfo.demographicProfile.parents[0].role
                }
              />
            </div>
            <div className="user-form-group">
              <label htmlFor="studentInfo.demographicProfile.parents[1].role">
                Parent/Guardian 2 Role
              </label>
              <select
                id="studentInfo.demographicProfile.parents[1].role"
                name="studentInfo.demographicProfile.parents[1].role"
                value={formData.studentInfo.demographicProfile.parents[1].role}
                onChange={handleChange}
                disabled={
                  !formData.studentInfo.demographicProfile.parents[0].role
                }
              >
                <option value="">Select Role (Optional)</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
              </select>
            </div>
            <div className="user-form-group">
              <label htmlFor="studentInfo.demographicProfile.parents[1].name">
                Parent/Guardian 2 Name
              </label>
              <input
                type="text"
                id="studentInfo.demographicProfile.parents[1].name"
                name="studentInfo.demographicProfile.parents[1].name"
                value={formData.studentInfo.demographicProfile.parents[1].name}
                onChange={handleChange}
                placeholder="Enter name"
                disabled={
                  !formData.studentInfo.demographicProfile.parents[0].role
                }
              />
            </div>
          </div>
        </div>

        {/* Right Column - Additional Information */}
        <div className="user-form-column">
          <div className="user-form-section">
            <div className="user-form-section-title">Contact Information</div>
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.contactInformation[0].mobileNumber">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="studentInfo.demographicProfile.contactInformation[0].mobileNumber"
                  name="studentInfo.demographicProfile.contactInformation[0].mobileNumber"
                  value={
                    formData.studentInfo.demographicProfile
                      .contactInformation[0].mobileNumber
                  }
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.address[0].provinceAddress">
                  Province
                </label>
                <input
                  type="text"
                  id="studentInfo.demographicProfile.address[0].provinceAddress"
                  name="studentInfo.demographicProfile.address[0].provinceAddress"
                  value={
                    formData.studentInfo.demographicProfile.address[0]
                      .provinceAddress
                  }
                  onChange={handleChange}
                  placeholder="Enter province"
                />
              </div>
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.address[0].cityAddress">
                  City
                </label>
                <input
                  type="text"
                  id="studentInfo.demographicProfile.address[0].cityAddress"
                  name="studentInfo.demographicProfile.address[0].cityAddress"
                  value={
                    formData.studentInfo.demographicProfile.address[0]
                      .cityAddress
                  }
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>
            </div>
          </div>

          <div className="user-form-section">
            <div className="user-form-section-title">
              Educational Background
            </div>
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.educationalBackground[0].elementary">
                  Elementary School
                </label>
                <input
                  type="text"
                  id="studentInfo.demographicProfile.educationalBackground[0].elementary"
                  name="studentInfo.demographicProfile.educationalBackground[0].elementary"
                  value={
                    formData.studentInfo.demographicProfile
                      .educationalBackground[0].elementary
                  }
                  onChange={handleChange}
                  placeholder="Enter elementary school"
                />
              </div>
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.educationalBackground[0].secondary">
                  Secondary School
                </label>
                <input
                  type="text"
                  id="studentInfo.demographicProfile.educationalBackground[0].secondary"
                  name="studentInfo.demographicProfile.educationalBackground[0].secondary"
                  value={
                    formData.studentInfo.demographicProfile
                      .educationalBackground[0].secondary
                  }
                  onChange={handleChange}
                  placeholder="Enter secondary school"
                />
              </div>
            </div>
            <div className="user-form-group">
              <label htmlFor="studentInfo.demographicProfile.educationalBackground[0].isTransferree">
                Transferee Status
              </label>
              <select
                id="studentInfo.demographicProfile.educationalBackground[0].isTransferree"
                name="studentInfo.demographicProfile.educationalBackground[0].isTransferree"
                value={
                  formData.studentInfo.demographicProfile
                    .educationalBackground[0].isTransferree
                }
                onChange={handleChange}
              >
                <option value={false}>Not a Transferee</option>
                <option value={true}>Transferee</option>
              </select>
            </div>
            {formData.studentInfo.demographicProfile.educationalBackground[0]
              .isTransferree && (
              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="studentInfo.demographicProfile.educationalBackground[0].college.name">
                    Previous College
                  </label>
                  <input
                    type="text"
                    id="studentInfo.demographicProfile.educationalBackground[0].college.name"
                    name="studentInfo.demographicProfile.educationalBackground[0].college.name"
                    value={
                      formData.studentInfo.demographicProfile
                        .educationalBackground[0].college.name
                    }
                    onChange={handleChange}
                    placeholder="Enter previous college"
                  />
                </div>
                <div className="user-form-group">
                  <label htmlFor="studentInfo.demographicProfile.educationalBackground[0].college.course">
                    Previous Course
                  </label>
                  <input
                    type="text"
                    id="studentInfo.demographicProfile.educationalBackground[0].college.course"
                    name="studentInfo.demographicProfile.educationalBackground[0].college.course"
                    value={
                      formData.studentInfo.demographicProfile
                        .educationalBackground[0].college.course
                    }
                    onChange={handleChange}
                    placeholder="Enter previous course"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="user-form-section">
            <div className="user-form-section-title">Additional Details</div>
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.supportingStudies">
                  Supporting Studies
                </label>
                <select
                  id="studentInfo.demographicProfile.supportingStudies"
                  name="studentInfo.demographicProfile.supportingStudies"
                  value={
                    formData.studentInfo.demographicProfile.supportingStudies
                  }
                  onChange={handleChange}
                >
                  <option value="parents">Parents</option>
                  <option value="self support">Self Support</option>
                  <option value="part self">Part Self</option>
                  <option value="gov't / private business">
                    Gov't / Private Business
                  </option>
                  <option value="university scholarship">
                    University Scholarship
                  </option>
                </select>
              </div>
              <div className="user-form-group">
                <label htmlFor="studentInfo.demographicProfile.isEmployed">
                  Employment Status
                </label>
                <select
                  id="studentInfo.demographicProfile.isEmployed"
                  name="studentInfo.demographicProfile.isEmployed"
                  value={formData.studentInfo.demographicProfile.isEmployed}
                  onChange={handleChange}
                >
                  <option value={false}>Not Employed</option>
                  <option value={true}>Employed</option>
                </select>
              </div>
            </div>
            {formData.studentInfo.demographicProfile.isEmployed && (
              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="studentInfo.demographicProfile.company.name">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="studentInfo.demographicProfile.company.name"
                    name="studentInfo.demographicProfile.company.name"
                    value={formData.studentInfo.demographicProfile.company.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="user-form-group">
                  <label htmlFor="studentInfo.demographicProfile.company.address">
                    Company Address
                  </label>
                  <input
                    type="text"
                    id="studentInfo.demographicProfile.company.address"
                    name="studentInfo.demographicProfile.company.address"
                    value={
                      formData.studentInfo.demographicProfile.company.address
                    }
                    onChange={handleChange}
                    placeholder="Enter company address"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Buttons */}
        <div className="user-form-buttons">
          {" "}
          <button
            type="button"
            onClick={() => navigate("/admin/mis/users")}
            className="cancel-button"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-button">
            {loading
              ? id
                ? "Updating..."
                : "Creating..."
              : id
              ? "Update Student"
              : "Create Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
