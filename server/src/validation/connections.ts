import * as yup from "yup";

export const createConnectionSchema = yup.object({
  email: yup.string().email(),
  note: yup.string(),
});
