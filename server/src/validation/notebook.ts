import * as yup from "yup";

export const createNotebookValidationSchema = yup.object({
  title: yup.string().required(),
  userId: yup.string().required(),
  collaborators: yup.array(),
  contents: yup.string(),
  visibility: yup.string(),
});
