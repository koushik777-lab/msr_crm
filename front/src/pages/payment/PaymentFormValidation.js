import * as Yup from "yup";

const PaymentValidationSchema = Yup.object({
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .integer("Amount must be an integer"),
  description: Yup.string()
    .required("Description is required")
    .max(255, "Description must be less than 255 characters"),
  name: Yup.string()
    .required("Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  expiryDate: Yup.date()
    .required("Expiry date is required")
    .min(new Date(), "Expiry date must be in the future"),
  currency: Yup.string()
    .required("Currency is required")
    .oneOf(["INR", "USD"], "Invalid currency type"),
});

export default PaymentValidationSchema;
