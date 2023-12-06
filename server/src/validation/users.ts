import * as yup from "yup";

export const createUserValidationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  usage: yup.string().max(255, "Must be maximum 255 characters.").required("Usage Field is required"),
  password: yup
    .string()
    .matches(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/, "Password must contain at least 8 characters, one uppercase, one number and one special case character")
    .required(),
  notifyOnNewRingVersion: yup.boolean(),
});

export const loginUserValidationSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});
