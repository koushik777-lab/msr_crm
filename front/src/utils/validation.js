import * as yup from "yup";
export const addAgentValidation = (isEdit) => {
  return yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Email is not valid")
      .required("Email is required"),
    phoneNumber: yup
      .string()
      .required("Phone is required")
      .min(10, "Phone number must be at least 10 characters")
      .max(10, "Phone number must be at most 10 characters"),
    password: isEdit
      ? yup.string().min(8, "Password must be at least 8 characters")
      : yup
          .string()
          .required("Password is required")
          .min(8, "Password must be at least 8 characters"),
    emailPassword: isEdit
      ? yup.string().min(8, "Password must be at least 8 characters")
      : yup
          .string()
          .required("Password is required")
          .min(8, "Password must be at least 8 characters"),
    newPassword:
      isEdit &&
      yup.string().min(8, "New Password must be at least 8 characters"),
    newEmailPassword:
      isEdit &&
      yup.string().min(8, "New Password must be at least 8 characters"),
  });
};
