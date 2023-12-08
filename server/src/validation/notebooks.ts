import * as yup from "yup";
import { notebookVisibilityValues } from "../models/Notebook";

export const createNotebookValidationSchema = yup.object({
  title: yup.string().required(),
  collaborators: yup.array(),
  sharedWith: yup.array(),
  contents: yup.string(),
  visibility: yup.mixed().oneOf(notebookVisibilityValues),
});
