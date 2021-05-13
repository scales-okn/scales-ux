import * as yup from "yup";

export const createUserValidationSchema = yup.object({
  email: yup.string().email().required(),
  password: yup
    .string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
    )
    .required(),
});

export const loginUserValidationSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

// TODO: Implement the rest of the resources validation
