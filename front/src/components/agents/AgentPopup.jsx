import { TextField, useForkRef } from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import MyInput from "../MyInput";
import { addAgentValidation } from "../../utils/validation";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AddAgentPopup({ onClose, onSave, isEdit, agentData }) {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      emailPassword: "",
      phoneNumber: "",
      name: "",
      cancelledLeads: 0,
      newPassword: "",
      newEmailPassword: "",
    },
    onSubmit: (values, actions) => {
      onSave(values, actions);
    },
    validationSchema: addAgentValidation(isEdit),
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleSubmit,
    handleChange,
    isSubmitting,
  } = formik;

  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const toggleShowEmailPassword = () => setShowEmailPassword((prev) => !prev);
  const toggleShowLoginPassword = () => setShowLoginPassword((prev) => !prev);

  useEffect(() => {
    if (isEdit) {
      formik.setValues({ ...agentData, password: "" });
    }
  }, [isEdit, agentData]);
  return (
    <div className="fixed inset-0 bg-black/50   top-0 right-0 left-0 bottom-0 z-[50] flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative text-black">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isEdit ? "Update" : "Add"} Agent
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <MyInput
                label={"Agent Name"}
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && errors.name ? errors.name : null}
                helperText={touched.name && errors.name ? errors.name : null}

                // required
              />
            </div>
            <div>
              <MyInput
                label={"Phone Number"}
                type="text"
                name="phoneNumber"
                value={values.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.phoneNumber && errors.phoneNumber
                    ? errors.phoneNumber
                    : null
                }
                helperText={
                  touched.phoneNumber && errors.phoneNumber
                    ? errors.phoneNumber
                    : null
                }

                // required
              />
            </div>
            <div>
              <MyInput
                label={"Email"}
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email ? errors.email : null}
                helperText={touched.email && errors.email ? errors.email : null}

                // required
              />
            </div>
            {/* <div>
            <MyInput
              label={"Cancelled Leads"}
              type="number"
              name="cancelledLeads"
              value={values.cancelledLeads}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.cancelledLeads && errors.cancelledLeads
                  ? errors.cancelledLeads
                  : null
              }
              helperText={
                touched.cancelledLeads && errors.cancelledLeads
                  ? errors.cancelledLeads
                  : null
              }

              // required
            />
          </div> */}
            <div>
              {/* <label className="block text-gray-700 mb-1">Cancel Leads</label> */}
              <MyInput
                label={"Login Password"}
                type={showLoginPassword ? "text" : "password"}
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.password && errors.password ? errors.password : null
                }
                helperText={
                  touched.password && errors.password ? errors.password : null
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showLoginPassword ? "Hide password" : "Show password"
                        }
                        onClick={toggleShowLoginPassword}
                        edge="end"
                        size="medium"
                      >
                        {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}

                // required
              />
            </div>

            {/* {isEdit && (
              <div>
                <MyInput
                  label={"New Login Password"}
                  type="password"
                  name="newPassword"
                  value={values.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.newPassword && errors.newPassword
                      ? errors.newPassword
                      : null
                  }
                  helperText={
                    touched.newPassword && errors.newPassword
                      ? errors.newPassword
                      : null
                  }

                  // required
                />
              </div>
            )} */}
          </div>
          {/* Email Password */}

          <div className="grid grid-cols-2 gap-4 mt-10">
            <MyInput
              label={"Email Password"}
              type={showEmailPassword ? "text" : "password"}
              name="emailPassword"
              value={values.emailPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.emailPassword && errors.emailPassword
                  ? errors.emailPassword
                  : null
              }
              helperText={
                touched.emailPassword && errors.emailPassword
                  ? errors.emailPassword
                  : null
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showEmailPassword ? "Hide password" : "Show password"
                      }
                      onClick={toggleShowEmailPassword}
                      edge="end"
                      size="medium"
                    >
                      {showEmailPassword ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              // required
            />
            {/* {isEdit && (
              <div>
                <MyInput
                  label={"New Email Password"}
                  type="password"
                  name="newEmailPassword"
                  value={values.newEmailPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.newEmailPassword && errors.newEmailPassword
                      ? errors.newEmailPassword
                      : null
                  }
                  helperText={
                    touched.newEmailPassword && errors.newEmailPassword
                      ? errors.newEmailPassword
                      : null
                  }
                />
              </div>
            )} */}
          </div>
          <div className="col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 disabled:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:cursor-not-allowed cursor-pointer`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
