import * as Yup from "yup";
import moment from "moment";

const PaymentValidationSchema = Yup.object({
  amount: Yup.string().required("Amount is required"),
  description: Yup.string().required("Description is required"),
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  expiryDate: Yup.date()
    .required("Expiry date is required")
    .min(
      moment().add(1, "days").format("YYYY-MM-DD"),
      "Expiry date must be at least tomorrow",
    ),
});

export default PaymentValidationSchema;
