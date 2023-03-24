import * as yup from "yup";

export const createFeedbackValidationSchema = yup.object({
  body: yup.string().required(),
});
